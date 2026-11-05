import assert from 'assert'
import cp from 'child_process'
import fs from 'fs'
import net from 'net'
import path from 'path'
import kit from '../src/_execPortPids.mjs'
import execProcessPortPids from '../src/execProcessPortPids.mjs'
import execProcessPortPidsSync from '../src/execProcessPortPidsSync.mjs'
import { withGuard, waitExit, reapTree } from './tools/execTraceKit.mjs'


//_execPortPids之Windows資料來源(作業系統API GetExtendedTcpTable)之真實行為: 以真實監聽/連線驗證查得之PID、位址族、連線不誤判、受限語言模式之退回、無暫存檔殘留
//規格(wu312, 主控2026-11-05): ①buildPsScript以GetExtendedTcpTable查(AF_INET與AF_INET6皆查, table class 5), 只輸出本地埠相符之列, 格式維持`R <本地埠> <遠端位址> <遠端埠> <PID>`與開始/結束標記;
//  ②監聽列之判定維持「遠端為萬用位址且遠端埠0」, 不依狀態欄; ③Add-Type或API失敗時退回Get-NetTCPConnection(離開碼3與ERR行同現行); ④對外API、回傳語意(空陣列＝已確認無人, 失敗＝null/reject)不變; ⑤多次呼叫後暫存夾無Add-Type遺留檔
describe(`_execPortPids OS API(wu312, Windows)`, function() {

    this.timeout(180000)

    let isWin = process.platform === 'win32'
    let SR = kit.readInput(80, {}, null).cfg.sysRoot
    let CHILD = path.resolve('./test/tools/portPidsChild.mjs')
    let FD = path.resolve('./test/_tmp/execPortPidsOsApi')

    before(function() {
        if (!isWin) {
            this.skip()
        }
        fs.rmSync(FD, { recursive: true, force: true })
        fs.mkdirSync(FD, { recursive: true })
    })

    after(function() {
        fs.rmSync(FD, { recursive: true, force: true })
    })


    //psQuery, 以buildCmd組成之真實PowerShell子指令查埠(經內建同步執行函數與classify), env可覆蓋; script可置換以強制某路徑; 回傳{ via, c, raw, status }
    let psQuery = (port, o = {}) => {
        let cmd = kit.buildCmd('powershell', port, SR)
        let args = cmd.args
        if (typeof o.script === 'function' || o.clm === true) {
            let script = typeof o.script === 'function' ? o.script(kit.buildPsScript(port)) : kit.buildPsScript(port)
            if (o.clm === true) {
                //受限語言模式(Constrained Language Mode)之真實引擎: 先(完整語言模式下)載入腳本文字與NetTCPIP模組, 再把SessionState.LanguageMode降為ConstrainedLanguage, 最後以Invoke-Expression於該模式執行腳本
                //  (__PSLockdownPolicy=4於本機(Windows 11 build 26300)無效, 見下方該案; 系統層級之CLM需WDAC/AppLocker政策與管理員權限, 不在測試範圍)
                script = [
                    `$s = [System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String('${Buffer.from(script, 'utf16le').toString('base64')}'))`,
                    `Import-Module NetTCPIP`,
                    `$ExecutionContext.SessionState.LanguageMode = 'ConstrainedLanguage'`,
                    `Invoke-Expression $s`,
                ].join('\n')
            }
            args = [...cmd.args.slice(0, 3), Buffer.from(script, 'utf16le').toString('base64')]
        }
        let r = cp.spawnSync(cmd.prog, args, { windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000, killSignal: 'SIGKILL', maxBuffer: kit.MAX_BUFFER, env: o.env ? { ...process.env, ...o.env } : process.env })
        let raw = r.stdout ? r.stdout.toString('latin1') : ''
        let m = /^WSEMI-PORTPIDS-VIA (\w+)$/m.exec(raw)
        let c = kit.classify('powershell', { status: typeof r.status === 'number' ? r.status : null, stdout: raw, error: r.error || null }, port, 60000)
        return { via: m ? m[1] : null, c, raw, status: r.status }
    }

    //okQuery, 斷言查詢成功且走作業系統API, 回傳PID陣列
    let apiPids = (port, o) => {
        let q = psQuery(port, o)
        assert.strict.deepStrictEqual([q.c.ok, q.via], [true, 'api'], q.raw)
        return q.c.pids
    }

    //listenIn, 本行程起監聽; 無法綁定(如主機無IPv6)回null
    let listenIn = (host, port = 0, ipv6Only = false) => new Promise((resolve) => {
        let srv = net.createServer()
        srv.on('error', () => resolve(null))
        srv.listen({ host, port, ipv6Only }, () => resolve(srv))
    })
    let closeSrv = (srv) => new Promise((resolve) => srv.close(resolve))

    //spawnChild, 起子行程並等其就緒行(以stdout事件同步); 回傳{ child, info, lines, waitLine, stop }
    let spawnChild = async (args) => {
        let child = cp.spawn(process.execPath, [CHILD, ...args], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
        let ex = waitExit(child)
        let lines = []
        let waiters = []
        let buf = ''
        child.stdout.on('data', (d) => {
            buf += d.toString()
            let i
            while ((i = buf.indexOf('\n')) >= 0) {
                let s = buf.slice(0, i).trim()
                buf = buf.slice(i + 1)
                if (s !== '') {
                    let o = JSON.parse(s)
                    lines.push(o)
                    waiters = waiters.filter((w) => !w(o))
                }
            }
        })
        child.stderr.on('data', () => {})
        child.stdin.on('error', () => {})
        //waitLine, 等第一個符合pred之輸出行(含已收到者)
        let waitLine = (pred, what) => {
            let hit = lines.find(pred)
            if (hit) {
                return Promise.resolve(hit)
            }
            return withGuard(new Promise((resolve) => {
                waiters.push((o) => {
                    if (pred(o)) {
                        resolve(o)
                        return true
                    }
                    return false
                })
            }), 30000, what)
        }
        let info = await waitLine((o) => o.listens !== undefined || o.localPort !== undefined || o.error !== undefined, 'child ready')
        let stop = async () => {
            try {
                child.stdin.end()
            }
            catch (err) {}
            await withGuard(ex, 20000, 'child exit').catch(async () => {
                await reapTree(child.pid)
            })
        }
        return { child, info, lines, waitLine, send: (s) => child.stdin.write(s + '\n'), stop }
    }

    //HOSTS, 四種綁定位址(規格: 127.0.0.1、0.0.0.0、::、::1); ::與::1於主機無IPv6時跳過
    let HOSTS = ['127.0.0.1', '0.0.0.0', '::', '::1']


    describe(`real listeners of this process(規格①②④: 新起與已存在之監聽, 關閉後為空陣列)`, function() {

        let existing = {} //before建立, 於各案查詢前已存在之監聽

        before(async function() {
            for (let h of HOSTS) {
                existing[h] = await listenIn(h)
            }
        })

        after(async function() {
            for (let h of HOSTS) {
                if (existing[h]) {
                    await closeSrv(existing[h]).catch(() => {})
                }
            }
        })

        for (let h of HOSTS) {
            it(`${h}: fresh listener, existing listener, none after close`, async function() {
                //新起之監聽: 剛綁定即查
                let fresh = await listenIn(h)
                if (fresh === null) {
                    this.skip()
                }
                let pf = fresh.address().port
                try {
                    assert.strict.deepStrictEqual(apiPids(pf), [process.pid], `fresh ${h}:${pf}`)
                    //已存在之監聽: 於其他查詢之後再查, 結果相同
                    let pe = existing[h].address().port
                    assert.strict.deepStrictEqual(apiPids(pe), [process.pid], `existing ${h}:${pe}`)
                    assert.strict.deepStrictEqual(apiPids(pf), [process.pid], `fresh again ${h}:${pf}`)
                }
                finally {
                    await closeSrv(fresh)
                }
                //關閉後: 已確認無人(空陣列, 不是失敗)
                assert.strict.deepStrictEqual(apiPids(pf), [], `closed ${h}:${pf}`)
            })
        }

    })


    describe(`real listeners of another process(規格①④)`, function() {

        for (let h of HOSTS) {
            it(`${h}: child pid found (not this process), none after the child ends`, async function() {
                let ch = await spawnChild(['listen', JSON.stringify([{ host: h }])])
                if (ch.info.error !== undefined) {
                    await ch.stop()
                    this.skip() //主機無此位址
                }
                let port = ch.info.listens[0].port
                try {
                    assert.strict.deepStrictEqual(apiPids(port), [ch.info.pid], `${h}:${port}`)
                    assert.strict.notDeepStrictEqual(ch.info.pid, process.pid)
                    //對外API(useBoth: 兩個資料來源聯集)亦得同一結果, 同步與非同步版相同
                    let sp = execProcessPortPidsSync(port, { useBoth: true })
                    assert.strict.deepStrictEqual(sp, [ch.info.pid])
                    let ap = await withGuard(execProcessPortPids(port, { useBoth: true }), 60000, 'async api')
                    assert.strict.deepStrictEqual(ap, [ch.info.pid])
                }
                finally {
                    await ch.stop()
                }
                assert.strict.deepStrictEqual(apiPids(port), [], `after child end ${h}:${port}`)
            })
        }

    })


    describe(`same port on IPv4 and IPv6 held by different processes(規格①: 兩個PID都要有)`, function() {

        //[v4位址, v6位址]
        for (let [h4, h6] of [['0.0.0.0', '::'], ['127.0.0.1', '::1']]) {
            it(`${h4} (process A) + ${h6} (process B): both pids, then each side alone, then none`, async function() {
                let a = await spawnChild(['listen', JSON.stringify([{ host: h4 }])])
                if (a.info.error !== undefined) {
                    await a.stop()
                    this.skip()
                }
                let port = a.info.listens[0].port
                let b = await spawnChild(['listen', JSON.stringify([{ host: h6, port, ipv6Only: true }])])
                if (b.info.error !== undefined) {
                    await a.stop()
                    await b.stop()
                    this.skip() //主機無IPv6, 或此版本同埠v4/v6不可並存
                }
                try {
                    let want = [a.info.pid, b.info.pid].sort((x, y) => x - y)
                    assert.strict.deepStrictEqual(apiPids(port), want, `both ${h4} + ${h6} :${port}`)
                    assert.strict.deepStrictEqual(execProcessPortPidsSync(port, { useBoth: true }), want)
                    //B結束後只剩A(v4), A結束後無人
                    await b.stop()
                    assert.strict.deepStrictEqual(apiPids(port), [a.info.pid], `v4 only`)
                }
                finally {
                    await b.stop()
                    await a.stop()
                }
                assert.strict.deepStrictEqual(apiPids(port), [], `none`)
            })
        }

    })


    describe(`outbound/established connections are never judged as listeners(規格②: 含各種狀態與PID 0之列)`, function() {

        //伺服端在本行程(allowHalfOpen以便控制半關閉), 客端在另一行程; 查客端本地埠與伺服端埠
        let setup = async (host = '127.0.0.1') => {
            let socks = []
            //accepted: 伺服端接受連線之事件(以事件同步, 不輪詢)
            let onAccepted = null
            let accepted = new Promise((resolve) => {
                onAccepted = resolve
            })
            let srv = net.createServer({ allowHalfOpen: true }, (s) => {
                s.on('error', () => {})
                socks.push(s)
                onAccepted()
            })
            let okListen = await new Promise((resolve) => {
                srv.once('error', () => resolve(false))
                srv.listen(0, host, () => resolve(true))
            })
            if (!okListen) {
                return null
            }
            let sp = srv.address().port
            let ch = await spawnChild(['connect', host, String(sp)])
            assert.strict.deepStrictEqual(ch.info.error, undefined)
            await withGuard(accepted, 30000, 'server accepted')
            return { srv, sp, ch, socks, cp: ch.info.localPort }
        }
        let teardown = async (x) => {
            await x.ch.stop()
            for (let s of x.socks) {
                s.destroy()
            }
            await closeSrv(x.srv)
        }

        it(`ESTABLISHED: client port is not a listener; server port lists only the listener`, async function() {
            let x = await setup()
            try {
                assert.strict.deepStrictEqual(apiPids(x.cp), [], `client port ${x.cp}`)
                assert.strict.deepStrictEqual(apiPids(x.sp), [process.pid], `server port ${x.sp}`)
            }
            finally {
                await teardown(x)
            }
        })

        it(`FIN_WAIT_2 (client ended first, server not yet): client port not a listener`, async function() {
            let x = await setup()
            try {
                let ended = new Promise((resolve) => x.socks[0].once('end', resolve))
                x.ch.send('end')
                await withGuard(ended, 30000, 'server saw FIN')
                assert.strict.deepStrictEqual(apiPids(x.cp), [], `client port ${x.cp}`)
            }
            finally {
                await teardown(x)
            }
        })

        it(`CLOSE_WAIT (server ended first, client still open): client port not a listener`, async function() {
            let x = await setup()
            try {
                x.socks[0].end()
                await x.ch.waitLine((o) => o.ev === 'end', 'client saw FIN')
                assert.strict.deepStrictEqual(apiPids(x.cp), [], `client port ${x.cp}`)
            }
            finally {
                await teardown(x)
            }
        })

        it(`TIME_WAIT (client closed first, owner pid 0): client port not a listener`, async function() {
            let x = await setup()
            try {
                //客端主動關閉(送FIN), 伺服端(allowHalfOpen)收到後自行關閉, 客端(主動關閉方)進TIME_WAIT
                let ended = new Promise((resolve) => x.socks[0].once('end', resolve))
                let closed = new Promise((resolve) => x.socks[0].once('close', resolve))
                x.ch.send('destroy')
                await x.ch.waitLine((o) => o.ev === 'close', 'client closed')
                await withGuard(ended, 30000, 'server saw FIN')
                x.socks[0].end()
                await withGuard(closed, 30000, 'server side closed')
                let q = psQuery(x.cp)
                assert.strict.deepStrictEqual([q.c.ok, q.via, q.c.pids], [true, 'api', []], q.raw)
                //TIME_WAIT之列確實在表內(證明此案走到該狀態): 本地埠為客端埠、遠端為伺服端、PID為0; 該列遠端非萬用位址, 不成立為監聽
                assert.strict.deepStrictEqual(q.raw.split(/\r?\n/).includes(`R ${x.cp} 127.0.0.1 ${x.sp} 0`), true, q.raw)
            }
            finally {
                await teardown(x)
            }
        })

        it(`IPv6 ESTABLISHED: client port is not a listener; the row carries the real IPv6 remote address and port`, async function() {
            let x = await setup('::1')
            if (x === null) {
                this.skip()
            }
            try {
                let q = psQuery(x.cp)
                assert.strict.deepStrictEqual([q.c.ok, q.via, q.c.pids], [true, 'api', []], q.raw)
                let rows = q.raw.split(/\r?\n/).filter((l) => l.startsWith('R '))
                assert.strict.deepStrictEqual(rows.length >= 1, true, q.raw)
                for (let l of rows) {
                    assert.strict.deepStrictEqual(l.startsWith(`R ${x.cp} ::1 ${x.sp} `), true, l)
                }
                assert.strict.deepStrictEqual(apiPids(x.sp), [process.pid], `server port ${x.sp}`)
            }
            finally {
                await teardown(x)
            }
        })

        it(`rows of a local port that is only used by outbound connections come out with their real remote address`, async function() {
            let x = await setup()
            try {
                let q = psQuery(x.cp)
                let rows = q.raw.split(/\r?\n/).filter((l) => l.startsWith('R '))
                //腳本輸出本地埠相符之全部列(含連線列), 判定交由parsePs: 這條連線列的遠端為伺服端而非萬用位址
                assert.strict.deepStrictEqual(rows.length >= 1, true, q.raw)
                for (let l of rows) {
                    assert.strict.deepStrictEqual(l.startsWith(`R ${x.cp} 127.0.0.1 ${x.sp} `), true, l)
                }
                assert.strict.deepStrictEqual(q.c.pids, [])
            }
            finally {
                await teardown(x)
            }
        })

    })


    describe(`buffer retry on ERROR_INSUFFICIENT_BUFFER(122)(規格①: 表大小會變動, 要重取)`, function() {

        let listener = null
        let port = 0

        before(async function() {
            listener = await listenIn('127.0.0.1')
            port = listener.address().port
        })

        after(async function() {
            await closeSrv(listener)
        })

        //第一次(空指標)探測大小必回122, 配置後即成功: 這是每次查詢都走的重取; 下面以改小第一次配置量, 強制出現「第二次回122」, 驗多次重取
        const GROW = 'alloc = size + 4096; size = alloc;'

        it(`a table that grew past the first allocation (second 122) is fetched again and the answer still comes from the OS API`, function() {
            //第1次探測回122並給所需大小S; 改成只配S/2: 第2次呼叫再回122(size=S); 第3次配S後成功
            let q = psQuery(port, { script: (s) => s.replace(GROW, 'alloc = (t == 0) ? size / 2 : size; size = alloc;') })
            assert.strict.deepStrictEqual([q.c.ok, q.via, q.c.pids], [true, 'api', [process.pid]], q.raw)
        })

        it(`with only one re-allocation allowed the same situation cannot be satisfied -> whole query falls back (no partial answer)`, function() {
            let q = psQuery(port, { script: (s) => s.replace(GROW, 'alloc = (t == 0) ? size / 2 : size; size = alloc;').replace('t < 16', 't < 2') })
            assert.strict.deepStrictEqual([q.c.ok, q.via, q.c.pids], [true, 'cmdlet', [process.pid]], q.raw)
        })

        it(`retries are bounded: an allocation that never fits ends in the fallback after at most 16 attempts (no endless loop)`, function() {
            let q = psQuery(port, { script: (s) => s.replace(GROW, 'alloc = 8; size = alloc;') })
            assert.strict.deepStrictEqual([q.c.ok, q.via, q.c.pids], [true, 'cmdlet', [process.pid]], q.raw)
        })

    })


    describe(`known gap(待主控裁示)`, function() {

        //僅綁定(bind後未listen)之TCP socket: 作業系統API(GetExtendedTcpTable)與netstat不列(實測, 見tmp證據boundOnly), 只有Get-NetTCPConnection列; 此案寫「期望」行為, 現況不成立故為pending, 不凍結缺陷
        it.skip(`[known gap] a bound-only (never listening) TCP socket is reported with its pid by the OS API path`, function() {})

    })


    describe(`fallback to Get-NetTCPConnection(規格③)`, function() {

        let listener = null
        let port = 0

        before(async function() {
            listener = await listenIn('127.0.0.1')
            port = listener.address().port
        })

        after(async function() {
            await closeSrv(listener)
        })

        it(`the harness really runs in Constrained Language Mode where Add-Type is refused (precondition of the CLM cases)`, function() {
            let wrapper = [
                `$ExecutionContext.SessionState.LanguageMode = 'ConstrainedLanguage'`,
                `Write-Output ('MODE ' + $ExecutionContext.SessionState.LanguageMode)`,
                `try { Add-Type -TypeDefinition 'public class WsemiClmProbe { }'; Write-Output 'ADDTYPE ok' } catch { Write-Output 'ADDTYPE refused' }`,
            ].join('\n')
            let r = cp.spawnSync(`${SR}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`, ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(wrapper, 'utf16le').toString('base64')], { windowsHide: true, encoding: 'latin1', timeout: 60000 })
            assert.strict.deepStrictEqual(String(r.stdout).split(/\r?\n/).filter((l) => /^(MODE|ADDTYPE)/.test(l)), ['MODE ConstrainedLanguage', 'ADDTYPE refused'])
        })

        it(`Constrained Language Mode: Add-Type is blocked, falls back to the cmdlet, result still correct`, async function() {
            let q = psQuery(port, { clm: true })
            assert.strict.deepStrictEqual([q.c.ok, q.via, q.c.pids], [true, 'cmdlet', [process.pid]], q.raw)
            //關閉後的埠: 查無(cmdlet之NotFound)仍為確認無人而非失敗
            let srv2 = await listenIn('127.0.0.1')
            let p2 = srv2.address().port
            await closeSrv(srv2)
            let q2 = psQuery(p2, { clm: true })
            assert.strict.deepStrictEqual([q2.c.ok, q2.via, q2.c.pids], [true, 'cmdlet', []], q2.raw)
        })

        it(`environment variable __PSLockdownPolicy=4 (skipped where this machine ignores it)`, function() {
            //此環境變數為舊式受限語言模式開關; Windows 11 build 26300上實測無效(仍為FullLanguage), 無效時跳過(不假裝已驗)
            let lm = cp.spawnSync(`${SR}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`, ['-NoProfile', '-NonInteractive', '-Command', 'Write-Output $ExecutionContext.SessionState.LanguageMode'], { windowsHide: true, encoding: 'latin1', env: { ...process.env, __PSLockdownPolicy: '4' } })
            if (String(lm.stdout).trim() !== 'ConstrainedLanguage') {
                this.skip()
            }
            let q = psQuery(port, { env: { __PSLockdownPolicy: '4' } })
            assert.strict.deepStrictEqual([q.c.ok, q.via, q.c.pids], [true, 'cmdlet', [process.pid]], q.raw)
        })

        it(`Constrained Language Mode with the cmdlet missing too -> exit 3 + CommandNotFoundException (failure, same as before)`, function() {
            let q = psQuery(port, { clm: true, script: (s) => s.replace('Get-NetTCPConnection -LocalPort', 'Get-NetTCPConnectionWsemiMissing -LocalPort') })
            assert.strict.deepStrictEqual([q.c.ok, q.c.reason, q.c.code, q.c.detail], [false, 'code', 3, 'code[3]: CommandNotFoundException'], q.raw)
        })

        it(`Add-Type command missing (compile step cannot run): falls back to the cmdlet`, function() {
            let q = psQuery(port, { script: (s) => s.replace('Add-Type -TypeDefinition', 'Add-TypeWsemiMissing -TypeDefinition') })
            assert.strict.deepStrictEqual([q.c.ok, q.via, q.c.pids], [true, 'cmdlet', [process.pid]], q.raw)
        })

        it(`C# compile error: falls back to the cmdlet`, function() {
            let q = psQuery(port, { script: (s) => s.replace('public static List<string> Query', 'public static List<string> Query_x_not_valid(') })
            assert.strict.deepStrictEqual([q.c.ok, q.via, q.c.pids], [true, 'cmdlet', [process.pid]], q.raw)
        })

        it(`API error code (table class invalid -> ERROR_INVALID_PARAMETER): falls back to the cmdlet, not a partial/empty answer`, function() {
            //table class 5 -> 99: GetExtendedTcpTable回87, C#拋錯, 整體退回(不以單一位址族或空結果代替)
            let q = psQuery(port, { script: (s) => s.replace('af, 5, 0)', 'af, 99, 0)') })
            assert.strict.deepStrictEqual([q.c.ok, q.via, q.c.pids], [true, 'cmdlet', [process.pid]], q.raw)
        })

        it(`fallback keeps the exit code 3 and the ERR line when the cmdlet fails with another error`, function() {
            //Add-Type無法執行且Get-NetTCPConnection收到不合法參數: 錯誤識別碼非NotFound -> exit 3 + ERR行
            let q = psQuery(port, { script: (s) => s.replace('Add-Type -TypeDefinition', 'Add-TypeWsemiMissing -TypeDefinition').replace('-LocalPort ' + port, '-LocalPort 99999999999') })
            assert.strict.deepStrictEqual([q.c.ok, q.c.reason, q.c.code], [false, 'code', 3], q.raw)
            assert.strict.deepStrictEqual(/^WSEMI-PORTPIDS-ERR \S+/m.test(q.raw), true, q.raw)
        })

    })


    describe(`no Add-Type leftovers in the temp dir(規格⑤)`, function() {

        it(`6 successful runs (private TEMP/TMP) leave no files; same through the public API`, async function() {
            let dir = path.join(FD, 'tmp-clean')
            fs.mkdirSync(dir, { recursive: true })
            let listener = await listenIn('127.0.0.1')
            let port = listener.address().port
            let bakT = process.env.TEMP
            let bakP = process.env.TMP
            try {
                for (let i = 0; i < 3; i++) {
                    assert.strict.deepStrictEqual(apiPids(port, { env: { TEMP: dir, TMP: dir } }), [process.pid])
                }
                //對外API(子行程繼承本行程之環境變數)
                process.env.TEMP = dir
                process.env.TMP = dir
                for (let i = 0; i < 3; i++) {
                    assert.strict.deepStrictEqual(execProcessPortPidsSync(port, { useBoth: true }), [process.pid])
                }
                assert.strict.deepStrictEqual(await withGuard(execProcessPortPids(port, { useBoth: true }), 60000, 'async api'), [process.pid])
            }
            finally {
                process.env.TEMP = bakT
                process.env.TMP = bakP
                await closeSrv(listener)
            }
            assert.strict.deepStrictEqual(fs.readdirSync(dir), [])
        })

    })

})
