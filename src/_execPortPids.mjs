import cp from 'child_process'
import get from 'lodash-es/get.js'
import cst from './_const.mjs'
import isbol from './isbol.mjs'
import isfun from './isfun.mjs'
import isnum from './isnum.mjs'
import isestr from './isestr.mjs'
import ispint from './ispint.mjs'
import execSpawnError from './_execSpawnError.mjs'
import execThrownMsg from './_execThrownMsg.mjs'
import getTrace from './getTrace.mjs'


//本檔為execProcessPortPids與execProcessPortPidsSync共用之內部模組(不由index匯出): 輸入讀取、子指令之組成、輸出解析、判定流程與執行子指令之預設函數, 兩版共用同一套規則
//監聽列之判定: TCP、本地埠相符、遠端位址為萬用位址且遠端埠為0、PID>0; 不依狀態欄(Windows 11 26300＋KB5127936實測狀態值錯誤為0、netstat因而整列漏列, 狀態文字亦隨語系)


//TIMEOUT_DEF, 每個子指令之預設逾時毫秒數
let TIMEOUT_DEF = 10000

//MAX_BUFFER, 子指令stdout之上限位元組數; netstat於大量連線(TIME_WAIT)時輸出可達數MB, 超過視為失敗(ENOBUFS)而非截斷
let MAX_BUFFER = 64 * 1024 * 1024

//WILD_HOSTS, 遠端萬用位址: 監聽中(或僅綁定)之socket無對端, netstat顯示0.0.0.0:0或[::]:0, Get-NetTCPConnection顯示0.0.0.0或::
let WILD_HOSTS = ['0.0.0.0', '::', '[::]', '*']

//PS_BEGIN, PS_END, PS_ERR, PowerShell腳本輸出之標記, 缺標記即視為輸出無法解析(未執行完、被截斷或混入其他輸出)
let PS_BEGIN = 'WSEMI-PORTPIDS-BEGIN'
let PS_END = 'WSEMI-PORTPIDS-END'
let PS_ERR = 'WSEMI-PORTPIDS-ERR'

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


/**
 * 產生查詢指定本地埠之PowerShell腳本，只輸出數值與位址等ASCII欄位(避開字碼頁)，不以-State篩選
 *
 * 查無連線時Get-NetTCPConnection拋CmdletizationQuery_NotFound_LocalPort，視為查無；其餘錯誤(含指令不存在CommandNotFoundException，其Category亦為ObjectNotFound，故以FullyQualifiedErrorId分辨)輸出錯誤識別碼並以離開碼3結束
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
        `$rows = @()`,
        `try {`,
        `    $rows = @(Get-NetTCPConnection -LocalPort ${port} -ErrorAction Stop)`,
        `}`,
        `catch {`,
        `    if ($_.FullyQualifiedErrorId -notlike 'CmdletizationQuery_NotFound_LocalPort*') {`,
        `        Write-Output ('${PS_ERR} ' + $_.FullyQualifiedErrorId)`,
        `        exit 3`,
        `    }`,
        `}`,
        `Write-Output '${PS_BEGIN}'`,
        `foreach ($r in $rows) {`,
        `    Write-Output ('R ' + [string]$r.LocalPort + ' ' + [string]$r.RemoteAddress + ' ' + [string]$r.RemotePort + ' ' + [string]$r.OwningProcess)`,
        `}`,
        `Write-Output '${PS_END}'`,
        `exit 0`,
    ].join('\n')
}


/**
 * 解析buildPsScript之腳本輸出，取本地埠為port之監聽列PID
 *
 * 須有開始與結束標記，其間每個非空行須為`R <本地埠> <遠端位址> <遠端埠> <PID>`，否則視為無法解析
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

        //timeout, 每個子指令之逾時, 非正數為預設值, 小數無條件進位為整數(spawnSync之timeout須為整數, 非整數即拋ERR_OUT_OF_RANGE), 夾至計時器上限
        v = get(opt, 'timeout')
        let timeout = (isnum(v) && Number(v) > 0) ? Math.min(Math.ceil(Number(v)), cst.TIMER_TIME_MAX) : TIMEOUT_DEF

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

    //port, 支援字串型數字; 先取原始值快照再判定與轉換(包裝物件以原型之valueOf拆包, 不呼叫物件自身之valueOf, 免判定與取值不一), 其餘物件、判型拋錯(不可讀之值)視同不合法
    let n = null
    try {
        let v = port
        if (typeof v === 'object' && v !== null) {
            if (v instanceof Number) {
                v = Number.prototype.valueOf.call(v)
            }
            else if (v instanceof String) {
                v = String.prototype.valueOf.call(v)
            }
            else {
                v = undefined
            }
        }
        if ((typeof v === 'number' || typeof v === 'string') && ispint(v) && Number(v) <= 65535) {
            n = Number(v)
        }
    }
    catch (err) {
        n = null
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
 * Windows: 先netstat，查到即採用(useBoth為true時仍續查)；netstat查無或失敗時以Get-NetTCPConnection確認，其查無才判無人；
 * 因netstat之查無不採信(系統回報之狀態錯誤時整列漏列)，netstat之失敗與查無同樣轉查Get-NetTCPConnection，最終之查無以其結果為準；Get-NetTCPConnection失敗即整體失敗；
 * useBoth為true時兩者皆查並取聯集，Get-NetTCPConnection失敗即整體失敗(不以netstat之部分結果代替)。
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
