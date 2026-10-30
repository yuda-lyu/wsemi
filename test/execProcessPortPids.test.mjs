import assert from 'assert'
import net from 'net'
import util from 'util'
import kit from '../src/_execPortPids.mjs'
import execProcessPortPids from '../src/execProcessPortPids.mjs'
import { ok, NS, PS, fakeExecAsync, CASES, recEvents, checkEvents } from './tools/portPidsKit.mjs'
import { withGuard, fiveOnTrace, collectUnhandled } from './tools/execTraceKit.mjs'
import { thrower } from './tools/codecThrown.mjs'


//規格(主控run01規劃,JSDoc): ①監聽列＝TCP、本地埠相符、遠端位址為萬用位址且遠端埠0、PID>0, 不依狀態欄; ②Windows先netstat, 查無時再以Get-NetTCPConnection確認, 兩者皆查無才判無人;
//  ③Linux/macOS為lsof; ④失敗(指令不存在、逾時、非預期之離開碼、輸出無法解析)reject字串, 絕不以空清單表示失敗; ⑤子指令帶時限(opt.timeout); ⑥執行函數可注入(opt.exec); ⑦opt.onTrace
describe(`execProcessPortPids`, function() {

    let isWin = process.platform === 'win32'

    //settled, 取得結果: { ok, v }, ok為是否resolve, v為resolve之值或reject之值
    let settled = (pm) => pm.then((v) => ({ ok: true, v }), (v) => ({ ok: false, v }))

    describe(`decision table with injected exec(規格②③④⑥)`, function() {

        for (let c of CASES) {
            it(`${c.name}`, async function() {
                let calls = []
                let { evs, on } = recEvents()
                //JSDoc: 事件皆於resolve或reject之前通知 -> settle事件當下Promise仍為pending
                let pm = null
                let states = []
                let onT = (e) => {
                    on(e)
                    if (e.type === 'settle') {
                        states.push(util.inspect(pm).includes('<pending>'))
                    }
                }
                pm = execProcessPortPids(8080, { platform: c.platform || 'win32', useBoth: c.useBoth, exec: fakeExecAsync(c.outs, calls), onTrace: onT, timeout: 1234 })
                let r = await settled(pm)
                assert.strict.deepStrictEqual(states, [true])
                if (c.pids !== null) {
                    //resolve PID數字陣列, 空陣列代表已確認無人
                    assert.strict.deepStrictEqual(r, { ok: true, v: c.pids })
                }
                else {
                    //失敗一律reject字串, 不為空陣列(規格④)
                    assert.strict.deepStrictEqual(r.ok, false)
                    assert.strict.deepStrictEqual(typeof r.v, 'string')
                    assert.strict.deepStrictEqual(c.msg.test(r.v), true, r.v)
                    assert.strict.deepStrictEqual(r.v.indexOf('port[8080] listener query failed: '), 0)
                }
                //依序執行之資料來源(netstat查到即不再執行powershell), 各子指令帶時限
                assert.strict.deepStrictEqual(calls.map((x) => x.src), c.srcs)
                for (let x of calls) {
                    assert.strict.deepStrictEqual([x.timeout, x.maxBuffer], [1234, kit.MAX_BUFFER])
                }
                checkEvents(evs, c.srcs)
                let st = evs[evs.length - 1]
                if (c.pids !== null) {
                    assert.strict.deepStrictEqual(st, { type: 'settle', ok: true, reason: 'ok', src: c.by, count: c.pids.length, msg: '' })
                }
                else {
                    assert.strict.deepStrictEqual(st, { type: 'settle', ok: false, reason: 'query', src: null, count: null, msg: r.v })
                }
            })
        }

        it(`result events carry reason and code`, async function() {
            let { evs, on } = recEvents()
            await settled(execProcessPortPids(8080, { platform: 'win32', exec: fakeExecAsync({ netstat: ok(NS.none), powershell: ok(PS.errCmd, 3) }, []), onTrace: on }))
            let rs = evs.filter((e) => e.type === 'result')
            assert.strict.deepStrictEqual(rs, [
                { type: 'result', src: 'netstat', ok: true, reason: 'ok', code: 0, count: 0 },
                { type: 'result', src: 'powershell', ok: false, reason: 'code', code: 3, count: null },
            ])
            assert.strict.deepStrictEqual(evs[0], { type: 'run', src: 'netstat', timeout: 10000 })
        })

        it(`exec receives absolute programs and fixed args`, async function() {
            let calls = []
            await execProcessPortPids('8080', { platform: 'win32', exec: fakeExecAsync({ netstat: ok(NS.none), powershell: ok(PS.none) }, calls) })
            assert.strict.deepStrictEqual(calls[0].args, ['-ano'])
            assert.strict.deepStrictEqual(calls[0].prog.endsWith('\\System32\\netstat.exe'), true)
            assert.strict.deepStrictEqual(calls[1].args.slice(0, 3), ['-NoProfile', '-NonInteractive', '-EncodedCommand'])
            assert.strict.deepStrictEqual(Buffer.from(calls[1].args[3], 'base64').toString('utf16le'), kit.buildPsScript(8080))
        })

        it(`exec returning a rejected promise or sync throw -> failure, not empty`, async function() {
            let r = await settled(execProcessPortPids(8080, { platform: 'linux', exec: () => Promise.reject(new Error('rej boom')) }))
            assert.strict.deepStrictEqual(r, { ok: false, v: 'port[8080] listener query failed: lsof exec failed: rej boom' })
            r = await settled(execProcessPortPids(8080, { platform: 'linux', exec: thrower('str boom') }))
            assert.strict.deepStrictEqual(r, { ok: false, v: 'port[8080] listener query failed: lsof exec failed: str boom' })
        })

    })

    describe(`input(規格④)`, function() {

        let never = () => {
            throw new Error('exec must not be called')
        }

        it(`invalid port -> reject message, exec not called`, async function() {
            for (let v of [0, 65536, '80.3', '8093|1', undefined, null, 'abc', [80], 1.5]) {
                let { evs, on } = recEvents()
                let r = await settled(execProcessPortPids(v, { exec: never, onTrace: on }))
                assert.strict.deepStrictEqual(r, { ok: false, v: 'port is not an integer between 1 and 65535' }, `port ${String(v)}`)
                assert.strict.deepStrictEqual(evs, [{ type: 'settle', ok: false, reason: 'port', src: null, count: null, msg: 'port is not an integer between 1 and 65535' }])
            }
        })

        it(`string port accepted`, async function() {
            let r = await execProcessPortPids('8080', { platform: 'linux', exec: async () => ok('42\n') })
            assert.strict.deepStrictEqual(r, [42])
        })

        it(`opt unreadable -> reject, no sync throw`, async function() {
            let pm = null
            assert.doesNotThrow(() => {
                let opt = {
                    get exec() {
                        throw new Error('exec getter boom')
                    },
                }
                pm = execProcessPortPids(8080, opt)
            })
            assert.strict.deepStrictEqual(await settled(pm), { ok: false, v: 'opt is not readable: exec getter boom' })
            let p = Proxy.revocable({}, {})
            p.revoke()
            let r = await settled(execProcessPortPids(8080, p.proxy))
            assert.strict.deepStrictEqual(r.ok, false)
            assert.strict.deepStrictEqual(r.v.indexOf('opt is not readable: '), 0)
        })

    })

    //真實執行(預設執行函數): 指令不存在、逾時、非零離開碼皆reject而非空陣列
    describe(`failure semantics with real commands(規格④⑤)`, function() {

        it(`commands not found (SystemRoot points to a missing folder) -> reject, not []`, async function() {
            if (!isWin) {
                this.skip()
            }
            //呼叫後即還原環境變數: 同一次查詢之兩個子指令皆用呼叫當下之SystemRoot(第2個子指令於微任務後才組成, 不得再讀環境變數)
            let bak = process.env.SystemRoot
            process.env.SystemRoot = 'C:\\wsemi-not-exist-sysroot'
            let calls = []
            let pm = null
            try {
                pm = execProcessPortPids(8080, { onTrace: (e) => calls.push(e) })
            }
            finally {
                process.env.SystemRoot = bak
            }
            let r = await withGuard(settled(pm), 60000, 'query')
            assert.strict.deepStrictEqual(r.ok, false)
            assert.strict.deepStrictEqual(/netstat error\[ENOENT\].*powershell error\[ENOENT\]/.test(r.v), true, r.v)
            assert.strict.deepStrictEqual(calls.filter((e) => e.type === 'result').map((e) => e.reason), ['error', 'error'])
        })

        it(`lsof not installed -> reject, not []`, async function() {
            if (!isWin) {
                this.skip() //Linux/macOS上lsof可能存在, 此案只在Windows(無lsof)驗證指令不存在之失敗
            }
            let r = await withGuard(settled(execProcessPortPids(8080, { platform: 'linux' })), 60000, 'query')
            assert.strict.deepStrictEqual(r, { ok: false, v: 'port[8080] listener query failed: lsof error[ENOENT]: spawn lsof ENOENT' })
        })

        it(`timeout of a real slow command -> reject timeout, not []`, async function() {
            //預設執行函數執行長睡之子程序(取代netstat/powershell), opt.timeout到即強制結束並視為失敗
            let slow = (prog, args, o) => kit.runCmd(process.execPath, ['-e', 'setTimeout(() => {}, 30000)'], o)
            let r = await withGuard(settled(execProcessPortPids(8080, { platform: 'win32', timeout: 300, exec: slow })), 30000, 'query')
            assert.strict.deepStrictEqual(r, { ok: false, v: 'port[8080] listener query failed: netstat timeout[300ms], powershell timeout[300ms]' })
        })

        it(`non-zero exit code of a real command -> reject, not []`, async function() {
            let bad = (prog, args, o) => kit.runCmd(process.execPath, ['-e', 'process.exit(2)'], o)
            let r = await withGuard(settled(execProcessPortPids(8080, { platform: 'linux', exec: bad })), 30000, 'query')
            assert.strict.deepStrictEqual(r, { ok: false, v: 'port[8080] listener query failed: lsof code[2]' })
        })

        it(`fractional timeout works with real commands (same as sync version)`, async function() {
            //小數之timeout無條件進位為整數; 於已關閉之埠查詢, 應確認無人而非失敗
            let srv = net.createServer()
            await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve))
            let port = srv.address().port
            await new Promise((resolve) => srv.close(resolve))
            let r = await withGuard(settled(execProcessPortPids(port, { timeout: '20000.5' })), 90000, 'query')
            assert.strict.deepStrictEqual(r, { ok: true, v: [] })
        })

    })

    //真實案: 本程序起監聽, 查得到自己的PID; 關閉後查無(本機netstat異常時實際走Get-NetTCPConnection備援, 走哪條路由settle事件之src得知)
    describe(`real listener of this process(規格①②)`, function() {

        //listen, 監聽失敗回null(如主機無IPv6), 該案skip
        let listen = (host) => new Promise((resolve) => {
            let srv = net.createServer()
            srv.on('error', () => resolve(null))
            srv.listen(0, host, () => resolve(srv))
        })
        let close = (srv) => new Promise((resolve) => srv.close(resolve))

        for (let host of ['0.0.0.0', '::']) {
            it(`listen on ${host}: found own pid, then none after close`, async function() {
                let srv = await listen(host)
                if (srv === null) {
                    this.skip()
                }
                let port = srv.address().port
                try {
                    let { evs, on } = recEvents()
                    let pids = await withGuard(execProcessPortPids(port, { onTrace: on }), 60000, 'query listening')
                    assert.strict.deepStrictEqual(pids, [process.pid])
                    let st = evs[evs.length - 1]
                    assert.strict.deepStrictEqual(isWin ? ['netstat', 'powershell'].includes(st.src) : st.src === 'lsof', true, st.src)
                    //useBoth: 兩者皆查, 結果相同
                    let pids2 = await withGuard(execProcessPortPids(String(port), { useBoth: true }), 60000, 'query useBoth')
                    assert.strict.deepStrictEqual(pids2, [process.pid])
                }
                finally {
                    await close(srv)
                }
                let { evs, on } = recEvents()
                let pids = await withGuard(execProcessPortPids(port, { onTrace: on }), 60000, 'query closed')
                assert.strict.deepStrictEqual(pids, [])
                //查無須經最終資料來源確認(Windows為Get-NetTCPConnection, 不以netstat之查無判無人)
                assert.strict.deepStrictEqual(evs[evs.length - 1].src, isWin ? 'powershell' : 'lsof')
            })
        }

    })

    //觀察回調(R-TRACE-01): 五種回調之結果相同、無未處理之rejection、事件凍結
    describe(`onTrace P3/P4(規格⑦)`, function() {

        let scenarios = [
            ['found by powershell', { platform: 'win32', outs: { netstat: ok(NS.none), powershell: ok(PS.v4) } }],
            ['failure', { platform: 'win32', outs: { netstat: ok(NS.none), powershell: ok('', 1) } }],
            ['invalid port', { port: 'x', platform: 'win32', outs: {} }],
        ]
        for (let [name, sc] of scenarios) {
            it(`${name}: five callbacks give identical results`, async function() {
                let un = collectUnhandled()
                try {
                    let { evs, on } = recEvents()
                    let rs = []
                    for (let cb of fiveOnTrace(on)) {
                        let opt = { platform: sc.platform, exec: fakeExecAsync(sc.outs, []) }
                        if (cb !== undefined) {
                            opt.onTrace = cb
                        }
                        rs.push(await settled(execProcessPortPids(sc.port || 8080, opt)))
                    }
                    for (let r of rs) {
                        assert.strict.deepStrictEqual(r, rs[0])
                    }
                    assert.strict.deepStrictEqual(evs.length > 0, true)
                    assert.strict.deepStrictEqual(evs.every((e) => Object.isFrozen(e)), true)
                    await new Promise((resolve) => setImmediate(resolve))
                    assert.strict.deepStrictEqual(un.stop(), [])
                }
                finally {
                    un.stop()
                }
            })
        }

    })

})
