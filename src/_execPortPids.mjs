import cp from 'child_process'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import isestr from './isestr.mjs'
import iseint from './iseint.mjs'
import execSpawnError from './_execSpawnError.mjs'
import execThrownMsg from './_execThrownMsg.mjs'
import getTrace from './getTrace.mjs'
import optVal from './_optVal.mjs'


//本檔為execProcessPortPids與execProcessPortPidsSync共用之內部模組(不由index匯出): 輸入讀取、子指令之組成、輸出解析、判定流程與執行子指令之預設函數, 兩版共用同一套規則
//監聽列之判定: TCP、本地埠相符、遠端位址為萬用位址且遠端埠為0、PID>0; 不依狀態欄(Windows 11 26300＋KB5127936實測狀態值錯誤為0、netstat因而整列漏列, 狀態文字亦隨語系)
//Windows之資料來源與耗時: netstat -ano約數百毫秒, 但可能整列漏列故其查無不採信; 確認用PowerShell呼叫作業系統之GetExtendedTcpTable(Reflection.Emit動態定義P/Invoke, 不編譯C#、不產生暫存檔), 耗時為PowerShell啟動加一次查表, 不到1秒且不隨連線數明顯增加, 系統忙碌時亦無編譯階段之拖累; Reflection.Emit或API失敗(如受限語言模式)時退回Get-NetTCPConnection -LocalPort, 其耗時隨系統內TCP連線數增加(連線數千至上萬時十數秒, 可能超過逾時而得失敗)


//TIMEOUT_DEF, 每個子指令之預設逾時毫秒數
let TIMEOUT_DEF = 10000

//RULE_TIMEOUT, opt.timeout為opt類參數: 有效數字且為大於0之計時毫秒(isenum, gt: 0, use: 'timer', 可帶小數; 交給spawnSync之timeout), 非預期(含Infinity、超過上限、0、負數)改用預設TIMEOUT_DEF, 不夾至上限; 小數無條件進位為整數
let RULE_TIMEOUT = { fn: 'execProcessPortPids', name: 'opt.timeout', kind: 'enum', chk: { gt: 0, use: 'timer' } }

//MAX_BUFFER, 子指令stdout之上限位元組數; netstat於大量連線(TIME_WAIT)時輸出可達數MB, 超過視為失敗(ENOBUFS)而非截斷
let MAX_BUFFER = 64 * 1024 * 1024

//WILD_HOSTS, 遠端萬用位址: 監聽中之socket無對端, netstat顯示0.0.0.0:0或[::]:0, Get-NetTCPConnection顯示0.0.0.0或::; 作業系統API(GetExtendedTcpTable)輸出之位址形式為IPAddress.ToString(), 同為0.0.0.0或::
//  僅綁定而未listen之socket: Get-NetTCPConnection會列(遠端0.0.0.0:0), netstat與GetExtendedTcpTable不列(實測); 另Get-NetTCPConnection於Windows 11 build 26300實測會對已連線之本地埠另報一筆遠端為0.0.0.0或::、埠0之列(State為空、Bound、Closed、FinWait1等, 該埠實際無監聽者: netstat無監聽列、對其connect得ECONNREFUSED), 故退回路徑可能把對外連線之本地埠判為被監聽
let WILD_HOSTS = ['0.0.0.0', '::', '[::]', '*']

//PS_BEGIN, PS_END, PS_ERR, PS_VIA, PowerShell腳本輸出之標記, 缺開始或結束標記即視為輸出無法解析(未執行完、被截斷或混入其他輸出); PS_VIA為開始標記之前的一行`WSEMI-PORTPIDS-VIA api|cmdlet`, 標示資料來源為作業系統API或退回之Get-NetTCPConnection, 解析時略過(供診斷與測試)
let PS_BEGIN = 'WSEMI-PORTPIDS-BEGIN'
let PS_END = 'WSEMI-PORTPIDS-END'
let PS_ERR = 'WSEMI-PORTPIDS-ERR'
let PS_VIA = 'WSEMI-PORTPIDS-VIA'

//MSG_PORT, 埠號不合法之訊息
let MSG_PORT = 'port is not an integer between 1 and 65535'


//splitHostPort, 以最後一個冒號切出位址與埠(IPv6位址含冒號與zone id亦適用), 埠須為數字或*, 否則回null
function splitHostPort(s) {
    let i = s.lastIndexOf(':')
    if (i <= 0) {
        return null
    }
    let host = s.slice(0, i)
    let port = s.slice(i + 1)
    if (port !== '*' && !/^\d+$/.test(port)) {
        return null
    }
    return { host, port }
}


//isWildRemote, 遠端為萬用位址且遠端埠為0(*為未指定之埠)
function isWildRemote(host, port) {
    return WILD_HOSTS.includes(host) && (port === '*' || Number(port) === 0)
}


//addPid, 只收大於0之安全整數(PID 0為系統閒置程序, TIME_WAIT等無擁有者之列為0)
function addPid(set, s) {
    if (!/^\d+$/.test(s)) {
        return
    }
    let n = Number(s)
    if (n > 0 && Number.isSafeInteger(n)) {
        set.add(n)
    }
}


//sortPids, 去重後由小到大
function sortPids(set) {
    return [...set].sort((a, b) => a - b)
}


/**
 * 解析`netstat -ano`之輸出，取本地埠為port之監聽列PID
 *
 * 欄位依空白切開: 第1欄協定、第2欄本地位址、第3欄遠端位址、最後一欄PID，狀態欄(可能缺漏、錯誤或為在地化文字)不使用；
 * 輸出內完全沒有TCP或UDP列(含表頭以外皆亂碼、空輸出)視為無法解析
 *
 * @param {String} text 輸入netstat -ano之輸出字串
 * @param {Number} port 輸入埠號整數
 * @returns {Object} 回傳{ ok, pids }，ok為false代表無法解析(pids為null)，否則pids為PID數字陣列(去重、由小到大，可為空陣列)
 */
function parseNetstat(text, port) {
    let pids = new Set()
    let nRow = 0
    let sp = String(port)
    for (let line of text.split(/\r?\n/)) {
        let cols = line.trim().split(/\s+/)
        if (cols.length < 4) {
            continue
        }
        let proto = cols[0].toUpperCase()
        if (proto !== 'TCP' && proto !== 'UDP') {
            continue
        }
        let local = splitHostPort(cols[1])
        if (local === null) {
            continue
        }
        nRow++
        if (proto !== 'TCP') {
            continue
        }
        let remote = splitHostPort(cols[2])
        if (remote === null) {
            continue
        }
        if (local.port !== sp) {
            continue
        }
        if (!isWildRemote(remote.host, remote.port)) {
            continue
        }
        let spid = cols[cols.length - 1]
        if (!/^\d+$/.test(spid)) {
            //相符之監聽列而PID欄不合, 該列之擁有者不明, 整份輸出不採信(轉查備援), 不靜默略過而得部分結果
            return { ok: false, pids: null }
        }
        addPid(pids, spid)
    }
    if (nRow === 0) {
        return { ok: false, pids: null }
    }
    return { ok: true, pids: sortPids(pids) }
}


//PS_API, 查TCP連線表之PowerShell片段(Windows PowerShell 5.1含Server 2016; 純ASCII; 以$want代入埠號)
//  以System.Reflection.Emit動態定義P/Invoke(DefinePInvokeMethod)呼叫iphlpapi.dll之GetExtendedTcpTable, 不編譯C#: 免啟動csc(系統忙碌時編譯遠慢於查詢本身)、不產生暫存檔(Add-Type被逾時強制結束時會在%TEMP%遺留編譯檔); 表於PowerShell內解析
//  分別取IPv4(AF_INET=2)與IPv6(AF_INET6=23)之表(table class 5=TCP_TABLE_OWNER_PID_ALL, 含所有狀態之列, 不依狀態值), 只輸出本地埠相符之列`R <本地埠> <遠端位址> <遠端埠> <PID>`
//  須設PreserveSig: 否則P/Invoke把回傳值當HRESULT, 回傳值被丟棄而恆得0(實測: 第一次呼叫實為122, 未設時$r為0), 重取走不到、整體因$buf為空而退回Get-NetTCPConnection; 若回傳值為負(NTSTATUS等)則直接拋例外
//  列迴圈成本(合成表實測): 1千列約4毫秒、1.2萬列約20毫秒、5萬列約70毫秒, 故以byte[]索引逐列過濾即可, 不另以IL或編譯加速
//  表之列數於兩次呼叫之間可能增加: 回122即以回報之大小加4096位元組重取(最多16次), 其餘非0錯誤一律拋錯(整體退回Get-NetTCPConnection, 不以單一位址族之結果代替)
//  列的位元組配置(Windows SDK之MIB_TCPROW_OWNER_PID、MIB_TCP6ROW_OWNER_PID; 表頭為4位元組之dwNumEntries, 列自位移4起):
//    IPv4列24位元組: dwState@0, dwLocalAddr@4, dwLocalPort@8, dwRemoteAddr@12, dwRemotePort@16, dwOwningPid@20
//    IPv6列56位元組: ucLocalAddr[16]@0, dwLocalScopeId@16, dwLocalPort@20, ucRemoteAddr[16]@24, dwRemoteScopeId@40, dwRemotePort@44, dwState@48, dwOwningPid@52
//  埠為網路位元組序(big-endian)存於DWORD之低16位元: 記憶體中位移+0為高位元組、+1為低位元組, 故以byte0 * 256 + byte1取值; 位址亦為網路位元組序之位元組陣列, 逐位元組交給IPAddress, 不可當整數; PID為小端DWORD
let PS_API = [
    `  $M = [Runtime.InteropServices.Marshal]`,
    `  $tb = [AppDomain]::CurrentDomain.DefineDynamicAssembly((New-Object Reflection.AssemblyName 'WsemiPortPids'), 'Run').DefineDynamicModule('WsemiPortPids').DefineType('WsemiPortPidsApi', 'Public,Class')`,
    `  $mi = $tb.DefinePInvokeMethod('GetExtendedTcpTable', 'iphlpapi.dll', 'Public,Static,PinvokeImpl', 'Standard', [uint32], [Type[]]@([IntPtr], [int].MakeByRefType(), [bool], [int], [int], [int]), 'Winapi', 'Auto')`,
    `  $mi.SetImplementationFlags($mi.GetMethodImplementationFlags() -bor [Reflection.MethodImplAttributes]::PreserveSig)`,
    `  $api = $tb.CreateType()`,
    `  $hi = $want -shr 8; $lo = $want -band 255`,
    `  $rows = New-Object 'Collections.Generic.List[string]'`,
    `  foreach ($af in 2, 23) {`,
    `    if ($af -eq 23) { $rs, $oLp, $oRa, $oRp, $oPid, $la = 56, 20, 24, 44, 52, 16 } else { $rs, $oLp, $oRa, $oRp, $oPid, $la = 24, 8, 12, 16, 20, 4 }`,
    `    $size = 0; $alloc = 0; $buf = [IntPtr]::Zero; $r = 0`,
    `    try {`,
    `      for ($k = 0; $k -lt 16; $k++) {`,
    `        $r = $api::GetExtendedTcpTable($buf, [ref]$size, $false, $af, 5, 0)`,
    `        if ($r -ne 122) { break }`,
    `        if ($buf -ne [IntPtr]::Zero) { $M::FreeHGlobal($buf); $buf = [IntPtr]::Zero }`,
    `        $alloc = $size + 4096; $size = $alloc`,
    `        $buf = $M::AllocHGlobal($alloc)`,
    `      }`,
    `      if ($r -ne 0 -or $buf -eq [IntPtr]::Zero) { throw "table $af err $r" }`,
    `      $cnt = $M::ReadInt32($buf); $len = 4 + $cnt * $rs`,
    `      if ($cnt -lt 0 -or $len -gt $alloc) { throw "table $af size" }`,
    `      $b = New-Object byte[] $len`,
    `      $M::Copy($buf, $b, 0, $len)`,
    `    }`,
    `    finally { if ($buf -ne [IntPtr]::Zero) { $M::FreeHGlobal($buf) } }`,
    `    for ($o = 4; $o -lt $len; $o += $rs) {`,
    `      if ($b[$o + $oLp] -ne $hi -or $b[$o + $oLp + 1] -ne $lo) { continue }`,
    `      $ra = New-Object Net.IPAddress (,[byte[]]$b[($o + $oRa)..($o + $oRa + $la - 1)])`,
    `      $rows.Add('R ' + $want + ' ' + $ra + ' ' + ($b[$o + $oRp] * 256 + $b[$o + $oRp + 1]) + ' ' + [BitConverter]::ToUInt32($b, $o + $oPid))`,
    `    }`,
    `  }`,
    `  $via = 'api'`,
].join('\n')


/**
 * 產生查詢指定本地埠之PowerShell腳本，只輸出數值與位址等ASCII欄位(避開字碼頁)，不以狀態篩選
 *
 * 資料來源與耗時：優先以System.Reflection.Emit動態定義P/Invoke，呼叫作業系統之GetExtendedTcpTable(IPv4與IPv6各取一次，只輸出本地埠相符之列)，表於PowerShell內解析；不編譯C#、不產生暫存檔，耗時約為PowerShell啟動加一次查表(不到1秒)，不隨系統連線數明顯增加，系統忙碌時亦無編譯階段之拖累；Reflection.Emit或該API失敗(如受限語言模式下被擋、API回非預期之錯誤碼)時退回`Get-NetTCPConnection -LocalPort`，其耗時隨系統內TCP連線數增加(連線數千至上萬時可達十數秒)。兩條路徑輸出同一格式，以開始標記前之`WSEMI-PORTPIDS-VIA api|cmdlet`標示實際走哪一條(解析時略過)
 *
 * 退回路徑查無連線時Get-NetTCPConnection拋CmdletizationQuery_NotFound_LocalPort，視為查無；其餘錯誤(含指令不存在CommandNotFoundException，其Category亦為ObjectNotFound，故以FullyQualifiedErrorId分辨)輸出錯誤識別碼並以離開碼3結束
 *
 * 輸出用Write-Output而非[Console]::Out.WriteLine，後者於受限語言模式(Constrained Language Mode)被擋
 *
 * @param {Number} port 輸入埠號整數
 * @returns {String} 回傳腳本字串
 */
function buildPsScript(port) {
    return [
        `$ErrorActionPreference = 'Stop'`,
        `$ProgressPreference = 'SilentlyContinue'`,
        `$want = ${port}`,
        `$rows = @()`,
        `$via = 'cmdlet'`,
        `try {`,
        PS_API,
        `}`,
        `catch {`,
        `    $rows = @()`,
        `}`,
        `if ($via -ne 'api') {`,
        `    $conns = @()`,
        `    try {`,
        `        $conns = @(Get-NetTCPConnection -LocalPort ${port} -ErrorAction Stop)`,
        `    }`,
        `    catch {`,
        `        if ($_.FullyQualifiedErrorId -notlike 'CmdletizationQuery_NotFound_LocalPort*') {`,
        `            Write-Output ('${PS_ERR} ' + $_.FullyQualifiedErrorId)`,
        `            exit 3`,
        `        }`,
        `    }`,
        `    foreach ($r in $conns) {`,
        `        $rows += ('R ' + [string]$r.LocalPort + ' ' + [string]$r.RemoteAddress + ' ' + [string]$r.RemotePort + ' ' + [string]$r.OwningProcess)`,
        `    }`,
        `}`,
        `Write-Output ('${PS_VIA} ' + $via)`,
        `Write-Output '${PS_BEGIN}'`,
        `foreach ($s in $rows) {`,
        `    Write-Output $s`,
        `}`,
        `Write-Output '${PS_END}'`,
        `exit 0`,
    ].join('\n')
}


/**
 * 解析buildPsScript之腳本輸出，取本地埠為port之監聽列PID
 *
 * 須有開始與結束標記，其間每個非空行須為`R <本地埠> <遠端位址> <遠端埠> <PID>`，否則視為無法解析；開始標記之前的行(含`WSEMI-PORTPIDS-VIA api|cmdlet`)略過。遠端位址可為IPv4點分、IPv6(含壓縮與`::ffff:`對映形)或Get-NetTCPConnection顯示之字串，只有0.0.0.0與::且遠端埠0之列成立為監聽列
 *
 * @param {String} text 輸入腳本之stdout字串
 * @param {Number} port 輸入埠號整數
 * @returns {Object} 回傳{ ok, pids }，ok為false代表無法解析(pids為null)，否則pids為PID數字陣列(去重、由小到大，可為空陣列)
 */
function parsePs(text, port) {
    let lines = text.split(/\r?\n/).map((s) => s.trim())
    let ib = lines.indexOf(PS_BEGIN)
    if (ib < 0) {
        return { ok: false, pids: null }
    }
    let ie = lines.indexOf(PS_END, ib + 1)
    if (ie < 0) {
        return { ok: false, pids: null }
    }
    let pids = new Set()
    for (let k = ib + 1; k < ie; k++) {
        let s = lines[k]
        if (s === '') {
            continue
        }
        let m = /^R (\d+) (\S+) (\d+) (\d+)$/.exec(s)
        if (m === null) {
            return { ok: false, pids: null }
        }
        if (Number(m[1]) !== port) {
            continue
        }
        if (!isWildRemote(m[2], m[3])) {
            continue
        }
        addPid(pids, m[4])
    }
    return { ok: true, pids: sortPids(pids) }
}


//psErrId, 取腳本輸出之錯誤識別碼, 無則回空字串
function psErrId(text) {
    for (let s of text.split(/\r?\n/)) {
        s = s.trim()
        if (s.indexOf(`${PS_ERR} `) === 0) {
            return s.slice(PS_ERR.length + 1).trim()
        }
    }
    return ''
}


/**
 * 解析`lsof -t`之輸出(每行一個PID)
 *
 * 含非數字之字詞視為無法解析
 *
 * @param {String} text 輸入lsof之stdout字串
 * @returns {Object} 回傳{ ok, pids }，ok為false代表無法解析(pids為null)，否則pids為PID數字陣列(去重、由小到大，可為空陣列)
 */
function parseLsof(text) {
    let pids = new Set()
    for (let t of text.split(/\s+/)) {
        if (t === '') {
            continue
        }
        if (!/^\d+$/.test(t)) {
            return { ok: false, pids: null }
        }
        addPid(pids, t)
    }
    return { ok: true, pids: sortPids(pids) }
}


//getSysRoot, Windows系統資料夾, 執行檔以絕對路徑呼叫, 不依PATH; 於入口讀取一次, 同一次查詢之各子指令用同一值
function getSysRoot() {
    let v = process.env.SystemRoot
    return isestr(v) ? v : 'C:\\Windows'
}


/**
 * 組成子指令
 *
 * @param {String} src 輸入資料來源字串，可為'netstat'、'powershell'、'lsof'
 * @param {Number} port 輸入埠號整數
 * @param {String} sysRoot 輸入Windows系統資料夾(入口讀取之%SystemRoot%)
 * @returns {Object} 回傳{ prog, args }
 */
function buildCmd(src, port, sysRoot) {
    if (src === 'netstat') {
        //不加-p TCP: 該參數只列IPv4, 會漏掉以::監聽者
        return { prog: `${sysRoot}\\System32\\netstat.exe`, args: ['-ano'] }
    }
    if (src === 'powershell') {
        //以-EncodedCommand(UTF-16LE之base64)傳腳本, 免命令列引號之跳脫
        let b64 = Buffer.from(buildPsScript(port), 'utf16le').toString('base64')
        return { prog: `${sysRoot}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`, args: ['-NoProfile', '-NonInteractive', '-EncodedCommand', b64] }
    }
    return { prog: 'lsof', args: ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'] }
}


//mkErr, 預設執行函數之逾時與輸出過大, 與spawnSync之error同形(code為ETIMEDOUT、ENOBUFS)
function mkErr(prog, code) {
    let e = new Error(`spawn ${prog} ${code}`)
    e.code = code
    return e
}


/**
 * 非同步版之預設執行函數，回傳與child_process.spawnSync同形之結果
 *
 * 隱藏視窗、不經shell、stdin不開啟；逾時或stdout超過上限即強制結束子程序(SIGKILL，netstat與powershell不另建子程序)，error之code為ETIMEDOUT或ENOBUFS；本函數不reject
 *
 * @param {String} prog 輸入執行檔
 * @param {Array} args 輸入參數陣列
 * @param {Object} o 輸入設定物件
 * @param {Number} o.timeout 輸入逾時毫秒數
 * @param {Number} o.maxBuffer 輸入stdout上限位元組數
 * @returns {Promise} 回傳Promise，resolve回傳{ status, stdout, error }，status為離開碼數字(因訊號結束或未執行至結束者為null)，stdout為latin1解碼之字串，error為無法啟動、逾時或輸出過大之Error物件，否則為null
 */
function runCmd(prog, args, o) {
    return new Promise((resolve) => {
        let done = false
        let timer = null
        let child = null
        let fin = (r) => {
            if (done) {
                return
            }
            done = true
            if (timer !== null) {
                clearTimeout(timer)
            }
            resolve(r)
        }
        //kill, 一律於fin之後呼叫: child.kill失敗(非ESRCH)時node同步發出error, 其處理器見done即返回, 不遞迴
        let kill = () => {
            try {
                child.kill('SIGKILL')
            }
            catch (err) {}
        }
        try {
            child = cp.spawn(prog, args, { windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'] })
        }
        catch (err) {
            fin({ status: null, stdout: '', error: err })
            return
        }

        //error, 須於存取stdout與stderr前監聽(EMFILE、ENFILE時node不建立stdio即於nextTick發出error)
        child.on('error', (err) => {
            if (done) {
                return
            }
            fin({ status: null, stdout: '', error: err })
            kill()
        })

        //onStreamErr, stdio串流之錯誤(罕見)轉為失敗, 不成為未捕捉例外
        let onStreamErr = (err) => {
            if (done) {
                return
            }
            fin({ status: null, stdout: '', error: err })
            kill()
        }

        let chunks = []
        let size = 0
        if (child.stdout) {
            child.stdout.on('error', onStreamErr)
            child.stdout.on('data', (b) => {
                if (done) {
                    return
                }
                size += b.length
                if (size > o.maxBuffer) {
                    fin({ status: null, stdout: '', error: mkErr(prog, 'ENOBUFS') })
                    kill()
                    return
                }
                chunks.push(b)
            })
        }
        if (child.stderr) {
            child.stderr.on('error', onStreamErr)
            child.stderr.on('data', () => {}) //不使用stderr(PowerShell之進度訊息等), 須讀走避免子程序因管道滿而卡住
        }

        timer = setTimeout(() => {
            timer = null
            fin({ status: null, stdout: '', error: mkErr(prog, 'ETIMEDOUT') })
            kill()
        }, o.timeout)

        child.on('close', (code) => {
            fin({ status: typeof code === 'number' ? code : null, stdout: Buffer.concat(chunks).toString('latin1'), error: null })
        })
    })
}


/**
 * 同步版之預設執行函數(child_process.spawnSync)，回傳{ status, stdout, error }
 *
 * 隱藏視窗、不經shell、stdin不開啟；逾時或輸出超過上限時spawnSync強制結束子程序(SIGKILL)，error之code為ETIMEDOUT或ENOBUFS；同步拋錯轉為error，本函數不拋錯
 *
 * @param {String} prog 輸入執行檔
 * @param {Array} args 輸入參數陣列
 * @param {Object} o 輸入設定物件
 * @param {Number} o.timeout 輸入逾時毫秒數
 * @param {Number} o.maxBuffer 輸入輸出上限位元組數
 * @returns {Object} 回傳{ status, stdout, error }，同runCmd
 */
function runCmdSync(prog, args, o) {
    try {
        let r = cp.spawnSync(prog, args, { windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'], timeout: o.timeout, killSignal: 'SIGKILL', maxBuffer: o.maxBuffer })
        return {
            status: typeof r.status === 'number' ? r.status : null,
            stdout: r.stdout ? r.stdout.toString('latin1') : '',
            error: r.error ? r.error : null,
        }
    }
    catch (err) {
        return { status: null, stdout: '', error: err }
    }
}


/**
 * 讀取輸入，opt之讀取與判型一律於try內(getter拋錯、已撤銷之Proxy以失敗訊息回報，不拋錯)
 *
 * @param {*} port 輸入埠號
 * @param {*} opt 輸入設定物件
 * @param {Function} execDef 輸入預設執行函數
 * @returns {Object} 回傳{ err }(opt不可讀，err為訊息字串)或{ err: null, port, cfg }，port為埠號整數，不合法時為null；cfg為{ timeout, useBoth, platform, exec, trace, sysRoot }
 */
function readInput(port, opt, execDef) {
    let cfg = null
    try {
        let v

        //timeout, 每個子指令之逾時, 有效則取Number(v), 非預期(含非正數、Infinity、超出計時器上限)為預設值且不夾至上限, 小數無條件進位為整數(spawnSync之timeout須為整數, 非整數即拋ERR_OUT_OF_RANGE; 有效值至多2147483647, 進位後不超過上限)
        v = get(opt, 'timeout')
        let timeout = Math.ceil(optVal(v, TIMEOUT_DEF, RULE_TIMEOUT, opt))

        //useBoth
        v = get(opt, 'useBoth')
        let useBoth = isbol(v) ? v : false

        //platform
        v = get(opt, 'platform')
        let platform = isestr(v) ? v : process.platform

        //exec, 回調於入口判型一次
        v = get(opt, 'exec')
        let exec = isfun(v) ? v : execDef

        //trace, 觀察回調(opt.onTrace), 置於其餘選項之讀取之後
        let trace = getTrace(opt)

        //sysRoot, 同一次查詢之各子指令用同一值(非同步版之第2個子指令於微任務後才組成, 不得再讀環境變數)
        let sysRoot = getSysRoot()

        cfg = { timeout, useBoth, platform, exec, trace, sysRoot }
    }
    catch (err) {
        return { err: `opt is not readable: ${execThrownMsg(execSpawnError(err), err)}` }
    }

    //port, 必須參數(無預設): 須為有效整數且為埠號(iseint, use: 'port', 1~65535, 數字字串亦可, 去頭尾空白後取值); 非預期(含包裝物件、小數、0、超出範圍、Infinity、'0x50'、非數字、不可讀之值)為null, 由呼叫端依原通道回報(非同步版reject、同步版回傳null)
    //  iseint對被檢測值永不拋錯、不呼叫其任何方法、不解包包裝物件, 判定與取值(Number(port))為同一值
    let n = null
    if (iseint(port, { use: 'port' })) {
        n = Number(port)
    }

    return { err: null, port: n, cfg }
}


//failOf, 子指令之失敗結果
function failOf(reason, code, detail) {
    return { ok: false, reason, code, pids: null, detail }
}


/**
 * 判定子指令之結果: 無法啟動、逾時、非預期之離開碼、輸出無法解析皆為失敗；成功者解析出PID
 *
 * netstat與powershell須離開碼0；lsof查無監聽者時以離開碼1結束，0與1皆為正常
 *
 * @param {String} src 輸入資料來源字串
 * @param {*} res 輸入執行函數之結果{ status, stdout, error }
 * @param {Number} port 輸入埠號整數
 * @param {Number} timeout 輸入逾時毫秒數
 * @returns {Object} 回傳{ ok, reason, code, pids, detail }，reason為'ok'、'timeout'、'error'、'code'、'parse'、'exec'，code為離開碼數字或null，pids為PID數字陣列(失敗為null)，detail為訊息用之說明字串
 */
function classify(src, res, port, timeout) {
    try {
        if (res === null || typeof res !== 'object') {
            return failOf('exec', null, 'exec failed: result is not an object')
        }
        let error = res.error
        let status = res.status
        let stdout = res.stdout
        if (error !== null && error !== undefined) {
            let e = execSpawnError(error)
            if (e.code === 'ETIMEDOUT') {
                return failOf('timeout', null, `timeout[${timeout}ms]`)
            }
            return failOf('error', null, `error[${e.code}]: ${e.message}`)
        }
        let text = ''
        if (Buffer.isBuffer(stdout)) {
            text = stdout.toString('latin1')
        }
        else if (typeof stdout === 'string') {
            text = stdout
        }
        else if (stdout !== null && stdout !== undefined) {
            return failOf('exec', null, 'exec failed: stdout is not a string')
        }
        let code = typeof status === 'number' ? status : null
        let bStatus = (src === 'lsof') ? (code === 0 || code === 1) : (code === 0)
        if (!bStatus) {
            let detail = `code[${code}]`
            if (src === 'powershell') {
                let id = psErrId(text)
                if (id !== '') {
                    detail += `: ${id}`
                }
            }
            return failOf('code', code, detail)
        }
        let p = null
        if (src === 'netstat') {
            p = parseNetstat(text, port)
        }
        else if (src === 'powershell') {
            p = parsePs(text, port)
        }
        else {
            p = parseLsof(text)
        }
        if (!p.ok) {
            return failOf('parse', code, 'unparseable output')
        }
        return { ok: true, reason: 'ok', code, pids: p.pids, detail: p.pids.length > 0 ? `found ${p.pids.length}` : 'none' }
    }
    catch (err) {
        return failOf('exec', null, `exec failed: ${execThrownMsg(execSpawnError(err), err)}`)
    }
}


//classifyThrown, 執行函數拋錯(或非同步版之rejection)
function classifyThrown(err) {
    return failOf('exec', null, `exec failed: ${execThrownMsg(execSpawnError(err), err)}`)
}


//union, 聯集後去重排序
function union(a, b) {
    return sortPids(new Set([...a, ...b]))
}


/**
 * 判定流程(兩版共用)，以generator逐一交出要執行之資料來源，接收classify之結果，最後回傳{ ok, src, pids, msg }
 *
 * Windows: 先netstat，查到即採用(useBoth為true時仍續查)；netstat查無或失敗時以PowerShell(作業系統API GetExtendedTcpTable，其失敗時退回Get-NetTCPConnection，見buildPsScript；對本流程而言同為'powershell'來源)確認，其查無才判無人；
 * 因netstat之查無不採信(系統回報之狀態錯誤時整列漏列)，netstat之失敗與查無同樣轉查PowerShell，最終之查無以其結果為準；PowerShell查詢失敗即整體失敗；
 * useBoth為true時兩者皆查並取聯集，PowerShell查詢失敗即整體失敗(不以netstat之部分結果代替)。
 * 其他平台: lsof，失敗即整體失敗
 *
 * @param {Number} port 輸入埠號整數
 * @param {String} platform 輸入作業系統字串
 * @param {Boolean} useBoth 輸入Windows下是否兩者皆查
 */
function* plan(port, platform, useBoth) {
    if (platform === 'win32') {
        let ns = yield 'netstat'
        let bNs = ns.ok && ns.pids.length > 0
        if (bNs && !useBoth) {
            return { ok: true, src: 'netstat', pids: ns.pids, msg: '' }
        }
        let ps = yield 'powershell'
        if (ps.ok) {
            return { ok: true, src: bNs ? 'netstat+powershell' : 'powershell', pids: union(bNs ? ns.pids : [], ps.pids), msg: '' }
        }
        let dNs = (ns.ok && !bNs) ? 'none(not trusted alone)' : ns.detail
        return { ok: false, src: null, pids: null, msg: `port[${port}] listener query failed: netstat ${dNs}, powershell ${ps.detail}` }
    }
    let ls = yield 'lsof'
    if (ls.ok) {
        return { ok: true, src: 'lsof', pids: ls.pids, msg: '' }
    }
    return { ok: false, src: null, pids: null, msg: `port[${port}] listener query failed: lsof ${ls.detail}` }
}


//traceRun, traceResult, traceSettle, 觀察回調之事件(兩版共用同一組欄位)
function traceRun(trace, src, timeout) {
    if (trace) {
        trace('run', { src, timeout })
    }
}
function traceResult(trace, src, c) {
    if (trace) {
        trace('result', { src, ok: c.ok, reason: c.reason, code: c.code, count: c.ok ? c.pids.length : null })
    }
}
function traceSettle(trace, r, reason) {
    if (trace) {
        trace('settle', { ok: r.ok, reason, src: r.src, count: r.ok ? r.pids.length : null, msg: r.msg })
    }
}


let kit = {
    TIMEOUT_DEF,
    MAX_BUFFER,
    MSG_PORT,
    parseNetstat,
    buildPsScript,
    parsePs,
    parseLsof,
    buildCmd,
    runCmd,
    runCmdSync,
    readInput,
    classify,
    classifyThrown,
    plan,
    traceRun,
    traceResult,
    traceSettle,
}


export default kit
