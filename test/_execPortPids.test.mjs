import assert from 'assert'
import cp from 'child_process'
import net from 'net'
import kit from '../src/_execPortPids.mjs'
import { row, HEAD_ZH, ns, BG, ps } from './tools/portPidsKit.mjs'
import { withGuard, untilTrue, isAlive } from './tools/execTraceKit.mjs'


//execProcessPortPids與execProcessPortPidsSync共用之內部模組: 解析(固定輸出)、子指令之組成、結果之判定、預設執行函數之真實行為
//規格(主控run01規劃): ①監聽列＝TCP、本地埠相符、遠端位址為萬用位址(0.0.0.0/::/[::]/*)且遠端埠0、PID>0, 不依狀態欄(狀態值可能錯、狀態文字隨語系);
//  ③Get-NetTCPConnection只輸出數值欄、不加-State; netstat不加-p TCP; ④失敗(指令不存在、逾時、非預期之離開碼、輸出無法解析)與無人嚴格分開; ⑤每個子指令帶時限、windowsHide
describe(`_execPortPids`, function() {

    let isWin = process.platform === 'win32'

    describe(`parseNetstat(規格①)`, function() {

        let P = 8080
        let pn = (rows, head) => kit.parseNetstat(ns(rows, head), P)

        //[案名, 列, 預期pids]
        let tbl = [
            ['IPv4 listener', [row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'LISTENING', '1111')], [1111]],
            ['IPv6 listener', [row('TCP', '[::]:8080', '[::]:0', 'LISTENING', '2222')], [2222]],
            ['* form remote', [row('TCP', '0.0.0.0:8080', '*:*', 'LISTENING', '5555')], [5555]],
            ['specific local address IPv4/IPv6', [row('TCP', '127.0.0.1:8080', '0.0.0.0:0', 'LISTENING', '3333'), row('TCP', '[::1]:8080', '[::]:0', 'LISTENING', '3333')], [3333]],
            ['IPv6 local with zone id', [row('TCP', '[fe80::1%12]:8080', '[::]:0', 'LISTENING', '4444')], [4444]],
            //狀態錯誤(本機實測: 監聽列顯示FIN_WAIT_1、CLOSED)仍判為監聽, 不依狀態欄
            ['wrong state text FIN_WAIT_1/CLOSED/ESTABLISHED', [row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'FIN_WAIT_1', '61'), row('TCP', '[::]:8080', '[::]:0', 'CLOSED', '62'), row('TCP', '127.0.0.1:8080', '0.0.0.0:0', 'ESTABLISHED', '63')], [61, 62, 63]],
            //狀態文字為其他語系(德文、Big5以latin1解碼之亂碼), 表頭亦為中文
            ['localized state text', [row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'ABHÖREN', '71'), row('TCP', '[::]:8080', '[::]:0', 'ºÊÅ¥', '72')], [71, 72], HEAD_ZH],
            //狀態值為0: 狀態欄缺漏(4欄)或為數字0
            ['state column missing (4 cols)', [row('TCP', '0.0.0.0:8080', '0.0.0.0:0', null, '81')], [81]],
            ['state value 0', [row('TCP', '0.0.0.0:8080', '0.0.0.0:0', '0', '82')], [82]],
            ['multi-word localized state', [row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'EN ECOUTE', '83')], [83]],
            //連線列不是監聽列: 遠端埠為8080之對外連線、本地8080之進入連線
            ['outgoing connection to remote :8080', [row('TCP', '10.0.0.5:51000', '10.0.0.9:8080', 'ESTABLISHED', '91')], []],
            ['inbound connection on local :8080 excluded', [row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'LISTENING', '1111'), row('TCP', '127.0.0.1:8080', '127.0.0.1:51001', 'ESTABLISHED', '9999')], [1111]],
            //TIME_WAIT之PID為0
            ['TIME_WAIT pid 0', [row('TCP', '127.0.0.1:8080', '127.0.0.1:51002', 'TIME_WAIT', '0'), row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'TIME_WAIT', '0')], []],
            //他埠前綴相同
            ['other port with same suffix/prefix', [row('TCP', '0.0.0.0:18080', '0.0.0.0:0', 'LISTENING', '101'), row('TCP', '0.0.0.0:80800', '0.0.0.0:0', 'LISTENING', '102'), row('TCP', '0.0.0.0:808', '0.0.0.0:0', 'LISTENING', '103'), row('TCP', '[::]:28080', '[::]:0', 'LISTENING', '104')], []],
            //多PID去重、由小到大
            ['multi pid dedup and sort', [row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'LISTENING', '2222'), row('TCP', '[::]:8080', '[::]:0', 'LISTENING', '1111'), row('TCP', '[::1]:8080', '[::]:0', 'LISTENING', '2222')], [1111, 2222]],
            //UDP列不是TCP
            ['UDP on same port', [row('UDP', '0.0.0.0:8080', '*:*', null, '111'), row('UDP', '[::]:8080', '*:*', null, '112')], []],
            //遠端為萬用位址但埠非0、遠端埠0但位址非萬用
            ['wildcard host with nonzero port / real host with port 0', [row('TCP', '0.0.0.0:8080', '0.0.0.0:443', 'SYN_SENT', '121'), row('TCP', '0.0.0.0:8080', '10.0.0.1:0', 'SYN_SENT', '122')], []],
            //他埠之列PID非數字: 與本埠無關, 略過
            ['non-digit pid on other port ignored', [row('TCP', '0.0.0.0:9090', '0.0.0.0:0', 'LISTENING', 'abc'), row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'LISTENING', '1111')], [1111]],
            //目標埠整列缺漏(本機實測): 他埠有列, 可解析, 查無
            ['target row missing among others', [], []],
        ]
        for (let [name, rows, want, head] of tbl) {
            it(`${name}`, function() {
                let r = pn([...BG, ...rows], head)
                assert.strict.deepStrictEqual(r, { ok: true, pids: want })
            })
        }

        it(`port 80 does not match :8080 rows`, function() {
            let r = kit.parseNetstat(ns([...BG, row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'LISTENING', '1111'), row('TCP', '0.0.0.0:180', '0.0.0.0:0', 'LISTENING', '2')]), 80)
            assert.strict.deepStrictEqual(r, { ok: true, pids: [] })
        })

        //輸出無法解析(規格④): 空輸出、亂碼、只有表頭 -> ok為false, 不為空清單
        let bad = [
            ['empty output', ''],
            ['garbage', 'abc def ghi jkl\r\n\u0000\u00ff\u00fe 12 34\r\nTCPX 1 2 3\r\n'],
            ['header only', ns([])],
            ['TCP rows without address', '  TCP    foo    bar    LISTENING    123\r\n'],
            //本埠之監聽列而PID欄不合: 擁有者不明, 不靜默略過(否則與其他列合起來只得部分結果)
            ['matching row with non-digit pid', ns([...BG, row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'LISTENING', '1111'), row('TCP', '[::]:8080', '[::]:0', 'LISTENING', 'abc')])],
            ['matching row with negative pid', ns([...BG, row('TCP', '[::]:8080', '[::]:0', 'LISTENING', '-5')])],
        ]
        for (let [name, text] of bad) {
            it(`unparseable: ${name}`, function() {
                assert.strict.deepStrictEqual(kit.parseNetstat(text, P), { ok: false, pids: null })
            })
        }

    })

    describe(`parsePs(規格①④)`, function() {

        let P = 8080
        let tbl = [
            ['IPv4 listener', ps([[8080, '0.0.0.0', 0, 1111]]), [1111]],
            ['IPv6 listener', ps([[8080, '::', 0, 2222]]), [2222]],
            ['none', ps([]), []],
            ['connections and TIME_WAIT excluded', ps([[8080, '10.0.0.9', 51000, 2222], [8080, '127.0.0.1', 51002, 0], [8080, '0.0.0.0', 0, 0]]), []],
            ['other local port excluded', ps([[18080, '0.0.0.0', 0, 3333], [80, '::', 0, 3334]]), []],
            ['dedup IPv4 and IPv6', ps([[8080, '::', 0, 1111], [8080, '0.0.0.0', 0, 1111], [8080, '0.0.0.0', 0, 999]]), [999, 1111]],
            //標記之前之其他輸出(如進度訊息)略過
            ['preamble before begin ignored', ps([[8080, '0.0.0.0', 0, 1111]], ['#< CLIXML', 'warning text']), [1111]],
        ]
        for (let [name, text, want] of tbl) {
            it(`${name}`, function() {
                assert.strict.deepStrictEqual(kit.parsePs(text, P), { ok: true, pids: want })
            })
        }

        let bad = [
            ['empty output', ''],
            ['missing end marker (truncated)', 'WSEMI-PORTPIDS-BEGIN\r\nR 8080 0.0.0.0 0 1111\r\n'],
            ['missing begin marker', 'R 8080 0.0.0.0 0 1111\r\nWSEMI-PORTPIDS-END\r\n'],
            ['end before begin', 'WSEMI-PORTPIDS-END\r\nWSEMI-PORTPIDS-BEGIN\r\n'],
            ['garbage line inside', 'WSEMI-PORTPIDS-BEGIN\r\nR 8080 0.0.0.0 0 1111\r\n????\r\nWSEMI-PORTPIDS-END\r\n'],
            ['row with missing field', 'WSEMI-PORTPIDS-BEGIN\r\nR 8080  0 1111\r\nWSEMI-PORTPIDS-END\r\n'],
            ['error line only', 'WSEMI-PORTPIDS-ERR CommandNotFoundException\r\n'],
        ]
        for (let [name, text] of bad) {
            it(`unparseable: ${name}`, function() {
                assert.strict.deepStrictEqual(kit.parsePs(text, P), { ok: false, pids: null })
            })
        }

    })

    describe(`parseLsof(規格③④)`, function() {

        it(`pids dedup and sort, pid 0 excluded`, function() {
            assert.strict.deepStrictEqual(kit.parseLsof('5678\n1234\n5678\n0\n'), { ok: true, pids: [1234, 5678] })
        })

        it(`empty -> none`, function() {
            assert.strict.deepStrictEqual(kit.parseLsof(''), { ok: true, pids: [] })
            assert.strict.deepStrictEqual(kit.parseLsof('\n  \n'), { ok: true, pids: [] })
        })

        it(`non-digit token -> unparseable`, function() {
            assert.strict.deepStrictEqual(kit.parseLsof('1234\nnode\n'), { ok: false, pids: null })
            assert.strict.deepStrictEqual(kit.parseLsof('lsof: WARNING: something'), { ok: false, pids: null })
        })

    })

    describe(`buildCmd(規格②③)`, function() {

        let SR = 'D:\\WinX'

        it(`netstat: -ano only (no -p TCP), absolute path under SystemRoot`, function() {
            let c = kit.buildCmd('netstat', 8080, SR)
            assert.strict.deepStrictEqual(c, { prog: 'D:\\WinX\\System32\\netstat.exe', args: ['-ano'] })
        })

        it(`powershell: encoded script queries -LocalPort without -State, outputs only numeric/address fields`, function() {
            let c = kit.buildCmd('powershell', 8080, SR)
            assert.strict.deepStrictEqual(c.prog, 'D:\\WinX\\System32\\WindowsPowerShell\\v1.0\\powershell.exe')
            assert.strict.deepStrictEqual(c.args.slice(0, 3), ['-NoProfile', '-NonInteractive', '-EncodedCommand'])
            let script = Buffer.from(c.args[3], 'base64').toString('utf16le')
            assert.strict.deepStrictEqual(script, kit.buildPsScript(8080))
            assert.strict.deepStrictEqual(script.includes('Get-NetTCPConnection -LocalPort 8080 '), true)
            //狀態值可能錯誤(本機實測為0), 不以-State篩選、不輸出State
            assert.strict.deepStrictEqual(/-State\b|\.State\b/.test(script), false)
            assert.strict.deepStrictEqual(script.includes('$r.OwningProcess') && script.includes('$r.RemoteAddress') && script.includes('$r.RemotePort'), true)
            //受限語言模式不可呼叫[Console]之方法, 輸出用Write-Output
            assert.strict.deepStrictEqual(script.includes('[Console]'), false)
        })

        it(`lsof: -nP -iTCP:<port> -sTCP:LISTEN -t`, function() {
            assert.strict.deepStrictEqual(kit.buildCmd('lsof', 8080, SR), { prog: 'lsof', args: ['-nP', '-iTCP:8080', '-sTCP:LISTEN', '-t'] })
        })

    })

    describe(`classify(規格④)`, function() {

        let e = (code) => Object.assign(new Error(`spawn x ${code}`), { code })

        it(`ok results`, function() {
            let r = kit.classify('netstat', { status: 0, stdout: ns([...BG, row('TCP', '0.0.0.0:8080', '0.0.0.0:0', 'LISTENING', '1111')]), error: null }, 8080, 10000)
            assert.strict.deepStrictEqual(r, { ok: true, reason: 'ok', code: 0, pids: [1111], detail: 'found 1' })
            //stdout為Buffer時以latin1解碼
            r = kit.classify('powershell', { status: 0, stdout: Buffer.from(ps([]), 'latin1'), error: null }, 8080, 10000)
            assert.strict.deepStrictEqual(r, { ok: true, reason: 'ok', code: 0, pids: [], detail: 'none' })
            //lsof查無以離開碼1結束
            r = kit.classify('lsof', { status: 1, stdout: '', error: null }, 8080, 10000)
            assert.strict.deepStrictEqual(r, { ok: true, reason: 'ok', code: 1, pids: [], detail: 'none' })
        })

        it(`failures are never an empty list`, function() {
            let cases = [
                ['netstat', { status: null, stdout: '', error: e('ETIMEDOUT') }, 'timeout', null, 'timeout[300ms]'],
                ['netstat', { status: null, stdout: '', error: e('ENOENT') }, 'error', null, 'error[ENOENT]: spawn x ENOENT'],
                ['netstat', { status: null, stdout: '', error: e('ENOBUFS') }, 'error', null, 'error[ENOBUFS]: spawn x ENOBUFS'],
                ['netstat', { status: 1, stdout: '', error: null }, 'code', 1, 'code[1]'],
                ['netstat', { status: null, stdout: '', error: null }, 'code', null, 'code[null]'],
                ['netstat', { status: 0, stdout: '', error: null }, 'parse', 0, 'unparseable output'],
                ['powershell', { status: 3, stdout: 'WSEMI-PORTPIDS-ERR CommandNotFoundException\r\n', error: null }, 'code', 3, 'code[3]: CommandNotFoundException'],
                ['powershell', { status: 0, stdout: 'R 8080 0.0.0.0 0 1\r\n', error: null }, 'parse', 0, 'unparseable output'],
                ['lsof', { status: 2, stdout: '', error: null }, 'code', 2, 'code[2]'],
                ['lsof', { status: 0, stdout: 'x', error: null }, 'parse', 0, 'unparseable output'],
                ['netstat', null, 'exec', null, 'exec failed: result is not an object'],
                ['netstat', 'abc', 'exec', null, 'exec failed: result is not an object'],
                ['netstat', { status: 0, stdout: 123, error: null }, 'exec', null, 'exec failed: stdout is not a string'],
            ]
            for (let [src, res, reason, code, detail] of cases) {
                let r = kit.classify(src, res, 8080, 300)
                assert.strict.deepStrictEqual(r, { ok: false, reason, code, pids: null, detail }, `${src} ${JSON.stringify(res)}`)
            }
        })

        it(`unreadable result (getter throws) -> exec failure`, function() {
            let res = {
                get status() {
                    throw new Error('getter boom')
                },
            }
            let r = kit.classify('netstat', res, 8080, 300)
            assert.strict.deepStrictEqual(r.ok, false)
            assert.strict.deepStrictEqual(r.reason, 'exec')
            assert.strict.deepStrictEqual(r.detail.includes('getter boom'), true)
        })

    })

    describe(`readInput`, function() {

        let ex = () => {}

        it(`port: integer 1~65535, string number and wrapper accepted`, function() {
            //包裝物件以原型之valueOf取原始值, 不呼叫物件自身(可變)之valueOf, 判定與取值為同一值
            //包裝物件以Object(原始值)建立(同new Number/new String); n1之自身valueOf每次回不同值(9090、99999), 若判定與取值各自呼叫則範圍外之99999會通過
            let n1 = Object(8080)
            let k = 0
            n1.valueOf = () => [9090, 99999][k++ % 2]
            let good = [[1, 1], [8080, 8080], ['8080', 8080], [65535, 65535], [Object(8080), 8080], [Object('8080'), 8080], [n1, 8080]]
            for (let [v, n] of good) {
                assert.strict.deepStrictEqual(kit.readInput(v, {}, ex).port, n, `port ${String(v)}`)
            }
            let pv = Proxy.revocable({}, {})
            pv.revoke()
            let bad = [0, -1, 65536, 80.3, '80.3', '8093|1', '', ' ', 'abc', undefined, null, true, [80], {}, NaN, Infinity, Symbol('p'), 80n, Object(0), new Proxy(Object(80), {}), pv.proxy, {
                valueOf() {
                    throw new Error('valueOf boom')
                },
            }, {
                valueOf() {
                    return 80
                },
            }]
            for (let v of bad) {
                let r = kit.readInput(v, {}, ex)
                assert.strict.deepStrictEqual(r.err, null)
                assert.strict.deepStrictEqual(r.port, null, `port ${typeof v}`)
            }
        })

        it(`timeout default, integer ceil and clamp; platform/useBoth/exec/sysRoot defaults`, function() {
            let c = kit.readInput(80, {}, ex).cfg
            assert.strict.deepStrictEqual([c.timeout, c.useBoth, c.platform, c.exec, c.trace], [10000, false, process.platform, ex, null])
            //同一次查詢之各子指令用入口讀取之SystemRoot
            assert.strict.deepStrictEqual(c.sysRoot, process.env.SystemRoot || 'C:\\Windows')
            assert.strict.deepStrictEqual(kit.readInput(80, { timeout: 300 }, ex).cfg.timeout, 300)
            assert.strict.deepStrictEqual(kit.readInput(80, { timeout: '300' }, ex).cfg.timeout, 300)
            //spawnSync之timeout須為整數, 小數無條件進位
            assert.strict.deepStrictEqual(kit.readInput(80, { timeout: 1500.5 }, ex).cfg.timeout, 1501)
            assert.strict.deepStrictEqual(kit.readInput(80, { timeout: '0.5' }, ex).cfg.timeout, 1)
            for (let v of [0, -5, 'abc', null, NaN]) {
                assert.strict.deepStrictEqual(kit.readInput(80, { timeout: v }, ex).cfg.timeout, 10000, `timeout ${v}`)
            }
            assert.strict.deepStrictEqual(kit.readInput(80, { timeout: 2 ** 40 }, ex).cfg.timeout, 2147483647)
            assert.strict.deepStrictEqual(kit.readInput(80, null, ex).cfg.timeout, 10000)
        })

        it(`opt unreadable -> err message`, function() {
            let opt = {
                get timeout() {
                    throw new Error('opt boom')
                },
            }
            let r = kit.readInput(80, opt, ex)
            assert.strict.deepStrictEqual(r.err, 'opt is not readable: opt boom')
            let p = Proxy.revocable({}, {})
            p.revoke()
            r = kit.readInput(80, p.proxy, ex)
            assert.strict.deepStrictEqual(typeof r.err === 'string' && r.err.indexOf('opt is not readable: ') === 0, true)
        })

    })

    //預設執行函數之真實行為(接縫): 無法啟動、逾時(強制結束子程序)、非零離開碼、輸出過大、正常輸出; 兩版各測
    describe(`runCmd / runCmdSync(規格④⑤)`, function() {

        let node = process.execPath
        let o = { timeout: 15000, maxBuffer: 1024 * 1024 }

        //spyCp, 攔截child_process之spawn與spawnSync(被測模組以cp.spawn屬性取用), 記錄所給之選項與子程序pid, 呼叫原函數; 案例結束必還原
        let spyCp = () => {
            let rec = []
            let oSpawn = cp.spawn
            let oSync = cp.spawnSync
            cp.spawn = function(...a) {
                let c = oSpawn.apply(this, a)
                rec.push({ fn: 'spawn', opt: a[2], pid: c.pid })
                return c
            }
            cp.spawnSync = function(...a) {
                let r = oSync.apply(this, a)
                rec.push({ fn: 'spawnSync', opt: a[2], pid: r.pid })
                return r
            }
            return {
                rec,
                restore: () => {
                    cp.spawn = oSpawn
                    cp.spawnSync = oSync
                },
            }
        }

        //checkOpt, 規格⑤: 隱藏視窗、不經shell、stdin不開啟; 同步版另帶時限、強制結束之訊號與輸出上限
        let checkOpt = (name, x, oo) => {
            assert.strict.deepStrictEqual([x.opt.windowsHide, x.opt.shell, x.opt.stdio[0]], [true, false, 'ignore'])
            if (name === 'runCmdSync') {
                assert.strict.deepStrictEqual([x.opt.timeout, x.opt.killSignal, x.opt.maxBuffer], [oo.timeout, 'SIGKILL', oo.maxBuffer])
            }
        }

        //runSpy, 以攔截執行一次, 回傳{ r, x }(x為唯一一次之紀錄)
        let runSpy = async (name, prog, args, oo) => {
            let sp = spyCp()
            let r = null
            try {
                r = await withGuard(Promise.resolve(name === 'runCmd' ? kit.runCmd(prog, args, oo) : kit.runCmdSync(prog, args, oo)), 30000, name)
            }
            finally {
                sp.restore()
            }
            assert.strict.deepStrictEqual(sp.rec.length, 1)
            assert.strict.deepStrictEqual(sp.rec[0].fn, name === 'runCmd' ? 'spawn' : 'spawnSync')
            return { r, x: sp.rec[0] }
        }

        for (let name of ['runCmd', 'runCmdSync']) {

            it(`${name}: program not found -> error ENOENT`, async function() {
                let { r, x } = await runSpy(name, 'C:\\wsemi-not-exist-dir\\no-such-prog.exe', ['-x'], o)
                checkOpt(name, x, o)
                assert.strict.deepStrictEqual(r.status, null)
                assert.strict.deepStrictEqual(r.error.code, 'ENOENT')
                let c = kit.classify('netstat', r, 80, o.timeout)
                assert.strict.deepStrictEqual([c.ok, c.reason, c.pids], [false, 'error', null])
            })

            it(`${name}: timeout kills the child -> error ETIMEDOUT`, async function() {
                //子程序長睡30秒, 以300ms逾時; 判定以結果之error與該子程序已不存在為準(pid由攔截取得, 消失以真實計時器輪詢, 上限只防懸置)
                let oo = { timeout: 300, maxBuffer: o.maxBuffer }
                let { r, x } = await runSpy(name, node, ['-e', 'setTimeout(() => {}, 30000)'], oo)
                checkOpt(name, x, oo)
                assert.strict.deepStrictEqual(r.error && r.error.code, 'ETIMEDOUT')
                let c = kit.classify('powershell', r, 80, 300)
                assert.strict.deepStrictEqual([c.ok, c.reason, c.detail], [false, 'timeout', 'timeout[300ms]'])
                assert.strict.deepStrictEqual(typeof x.pid, 'number')
                await untilTrue(() => !isAlive(x.pid), { guard: 10000, what: `sleeper ${x.pid} dead` })
            })

            it(`${name}: non-zero exit code`, async function() {
                let { r, x } = await runSpy(name, node, ['-e', 'process.stdout.write("x"); process.exit(5)'], o)
                checkOpt(name, x, o)
                assert.strict.deepStrictEqual([r.status, r.error], [5, null])
                let c = kit.classify('netstat', r, 80, o.timeout)
                assert.strict.deepStrictEqual([c.ok, c.reason, c.code], [false, 'code', 5])
            })

            it(`${name}: stdout over maxBuffer -> error ENOBUFS (not truncated), child killed`, async function() {
                let oo = { timeout: 15000, maxBuffer: 1000 }
                let { r, x } = await runSpy(name, node, ['-e', 'process.stdout.write("x".repeat(200000)); setTimeout(() => {}, 30000)'], oo)
                checkOpt(name, x, oo)
                assert.strict.deepStrictEqual(r.error && r.error.code, 'ENOBUFS')
                let c = kit.classify('netstat', r, 80, 15000)
                assert.strict.deepStrictEqual([c.ok, c.reason], [false, 'error'])
                await untilTrue(() => !isAlive(x.pid), { guard: 10000, what: `writer ${x.pid} dead` })
            })

            if (name === 'runCmd') {
                it(`runCmd: stdio stream error -> error result (not an uncaught exception), child killed`, async function() {
                    //攔截spawn後, 於子程序之stdout發出error(模擬管道錯誤)
                    let oSpawn = cp.spawn
                    let pid = null
                    cp.spawn = function(...a) {
                        let c = oSpawn.apply(this, a)
                        pid = c.pid
                        setImmediate(() => c.stdout.emit('error', new Error('pipe boom')))
                        return c
                    }
                    let r = null
                    try {
                        r = await withGuard(kit.runCmd(node, ['-e', 'setTimeout(() => {}, 30000)'], o), 30000, 'stream error')
                    }
                    finally {
                        cp.spawn = oSpawn
                    }
                    assert.strict.deepStrictEqual([r.status, r.stdout, r.error && r.error.message], [null, '', 'pipe boom'])
                    await untilTrue(() => !isAlive(pid), { guard: 10000, what: `child ${pid} dead` })
                })
            }

            it(`${name}: stdout returned as latin1 string`, async function() {
                let { r, x } = await runSpy(name, node, ['-e', 'process.stdout.write(Buffer.from([0x41, 0xa4, 0xa4, 0x0d, 0x0a]))'], o)
                checkOpt(name, x, o)
                assert.strict.deepStrictEqual(r, { status: 0, stdout: 'A\u00a4\u00a4\r\n', error: null })
            })

        }

    })

    //PowerShell腳本之真實行為(Windows): 查無為開始/結束標記之間無列(不是失敗); 指令不存在為離開碼3並輸出錯誤識別碼(是失敗)
    describe(`PowerShell script on real Windows(規格②④)`, function() {

        let SRR = kit.readInput(80, {}, null).cfg.sysRoot //本機之SystemRoot

        before(function() {
            if (!isWin) {
                this.skip()
            }
        })

        it(`not found port -> markers with no rows (none, not failure)`, async function() {
            //取一個剛釋放之埠(監聽後關閉), 其上無連線
            let srv = net.createServer()
            await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve))
            let port = srv.address().port
            await new Promise((resolve) => srv.close(resolve))
            let c = kit.buildCmd('powershell', port, SRR)
            let r = kit.runCmdSync(c.prog, c.args, { timeout: 60000, maxBuffer: kit.MAX_BUFFER })
            let k = kit.classify('powershell', r, port, 60000)
            assert.strict.deepStrictEqual([k.ok, k.reason, k.pids], [true, 'ok', []], JSON.stringify(r))
        })

        it(`cmdlet missing -> exit 3 with CommandNotFoundException (failure, distinguished from not found)`, async function() {
            let c = kit.buildCmd('powershell', 8080, SRR)
            let script = kit.buildPsScript(8080).replace('Get-NetTCPConnection -LocalPort', 'Get-NetTCPConnectionWsemiMissing -LocalPort')
            let args = [...c.args.slice(0, 3), Buffer.from(script, 'utf16le').toString('base64')]
            let r = kit.runCmdSync(c.prog, args, { timeout: 60000, maxBuffer: kit.MAX_BUFFER })
            let k = kit.classify('powershell', r, 8080, 60000)
            assert.strict.deepStrictEqual([k.ok, k.reason, k.code, k.detail], [false, 'code', 3, 'code[3]: CommandNotFoundException'], JSON.stringify(r))
        })

    })

})
