import assert from 'assert'
import net from 'net'
import kit from '../src/_execPortPids.mjs'
import execProcessPortPids from '../src/execProcessPortPids.mjs'
import execProcessPortPidsSync from '../src/execProcessPortPidsSync.mjs'
import { ok, NS, PS, fakeExec, fakeExecAsync, CASES, recEvents, checkEvents } from './tools/portPidsKit.mjs'
import { fiveOnTrace, collectUnhandled } from './tools/execTraceKit.mjs'
import { thrower } from './tools/codecThrown.mjs'


//規格(主控run01規劃,JSDoc): 同步版與非同步版共用同一套解析與判定規則(同一張案例表、同一失敗訊息); 失敗回傳null, 絕不以空陣列表示失敗;
//  失敗之訊息由onTrace之settle事件之msg取得; 不可非同步(exit/signal處理器內呼叫), 故注入之exec回傳Promise視為失敗; 本函數不拋錯
describe(`execProcessPortPidsSync`, function() {

    let isWin = process.platform === 'win32'

    describe(`decision table with injected exec, same as async version`, function() {

        for (let c of CASES) {
            it(`${c.name}`, async function() {
                let calls = []
                let { evs, on } = recEvents()
                let r = execProcessPortPidsSync(8080, { platform: c.platform || 'win32', useBoth: c.useBoth, exec: fakeExec(c.outs, calls), onTrace: on, timeout: 1234 })
                //成功回傳PID陣列(空陣列代表無人), 失敗回傳null
                assert.strict.deepStrictEqual(r, c.pids)
                assert.strict.deepStrictEqual(calls.map((x) => x.src), c.srcs)
                for (let x of calls) {
                    assert.strict.deepStrictEqual([x.timeout, x.maxBuffer], [1234, kit.MAX_BUFFER])
                }
                checkEvents(evs, c.srcs)
                let st = evs[evs.length - 1]
                if (c.pids === null) {
                    assert.strict.deepStrictEqual(c.msg.test(st.msg), true, st.msg)
                    //失敗訊息同非同步版之reject訊息, 事件序列亦同
                    let { evs: evsA, on: onA } = recEvents()
                    let msgA = await execProcessPortPids(8080, { platform: c.platform || 'win32', useBoth: c.useBoth, exec: fakeExecAsync(c.outs, []), onTrace: onA, timeout: 1234 }).then(() => 'resolved', (m) => m)
                    assert.strict.deepStrictEqual(st.msg, msgA)
                    assert.strict.deepStrictEqual(evs, evsA)
                }
                else {
                    assert.strict.deepStrictEqual(st, { type: 'settle', ok: true, reason: 'ok', src: c.by, count: c.pids.length, msg: '' })
                }
            })
        }

        it(`exec returning a Promise -> failure (cannot wait), rejection marked handled`, async function() {
            let un = collectUnhandled()
            try {
                let { evs, on } = recEvents()
                let r = execProcessPortPidsSync(8080, { platform: 'linux', exec: () => Promise.reject(new Error('later boom')), onTrace: on })
                assert.strict.deepStrictEqual(r, null)
                assert.strict.deepStrictEqual(evs[evs.length - 1].msg, 'port[8080] listener query failed: lsof exec failed: exec returned a Promise, which the sync version cannot wait for')
                await new Promise((resolve) => setImmediate(resolve))
                assert.strict.deepStrictEqual(un.stop(), [])
            }
            finally {
                un.stop()
            }
        })

        it(`exec throwing -> failure, no throw`, function() {
            let r = null
            assert.doesNotThrow(() => {
                r = execProcessPortPidsSync(8080, { platform: 'linux', exec: thrower(new Error('sync boom')) })
            })
            assert.strict.deepStrictEqual(r, null)
        })

    })

    describe(`input`, function() {

        it(`invalid port -> null with settle message`, function() {
            for (let v of [0, 65536, '80.3', undefined, 'abc']) {
                let { evs, on } = recEvents()
                let r = execProcessPortPidsSync(v, { exec: thrower(new Error('exec must not be called')), onTrace: on })
                assert.strict.deepStrictEqual(r, null)
                assert.strict.deepStrictEqual(evs, [{ type: 'settle', ok: false, reason: 'port', src: null, count: null, msg: 'port is not an integer between 1 and 65535' }])
            }
        })

        it(`opt unreadable -> null, no throw`, function() {
            let r = 'x'
            assert.doesNotThrow(() => {
                let opt = {
                    get platform() {
                        throw new Error('platform getter boom')
                    },
                }
                r = execProcessPortPidsSync(8080, opt)
            })
            assert.strict.deepStrictEqual(r, null)
            let p = Proxy.revocable({}, {})
            p.revoke()
            assert.strict.deepStrictEqual(execProcessPortPidsSync(8080, p.proxy), null)
        })

    })

    describe(`failure semantics with real commands`, function() {

        it(`commands not found -> null, not []`, function() {
            if (!isWin) {
                this.skip()
            }
            let bak = process.env.SystemRoot
            let { evs, on } = recEvents()
            let r = 'x'
            try {
                process.env.SystemRoot = 'C:\\wsemi-not-exist-sysroot'
                r = execProcessPortPidsSync(8080, { onTrace: on })
            }
            finally {
                process.env.SystemRoot = bak
            }
            assert.strict.deepStrictEqual(r, null)
            assert.strict.deepStrictEqual(/netstat error\[ENOENT\].*powershell error\[ENOENT\]/.test(evs[evs.length - 1].msg), true, evs[evs.length - 1].msg)
        })

        it(`timeout of a real slow command -> null`, function() {
            let slow = (prog, args, o) => kit.runCmdSync(process.execPath, ['-e', 'setTimeout(() => {}, 30000)'], o)
            let { evs, on } = recEvents()
            let r = execProcessPortPidsSync(8080, { platform: 'linux', timeout: 300, exec: slow, onTrace: on })
            assert.strict.deepStrictEqual(r, null)
            assert.strict.deepStrictEqual(evs[evs.length - 1].msg, 'port[8080] listener query failed: lsof timeout[300ms]')
        })

        it(`fractional timeout works with real commands (spawnSync needs an integer)`, async function() {
            //小數之timeout無條件進位為整數(原樣交spawnSync會拋ERR_OUT_OF_RANGE而每個子指令皆失敗); 於已關閉之埠查詢, 應確認無人而非失敗
            let srv = net.createServer()
            await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve))
            let port = srv.address().port
            await new Promise((resolve) => srv.close(resolve))
            let { evs, on } = recEvents()
            let r = execProcessPortPidsSync(port, { timeout: 20000.5, onTrace: on })
            assert.strict.deepStrictEqual(r, [], evs[evs.length - 1].msg)
        })

    })

    describe(`real listener of this process`, function() {

        //listen, 監聽失敗回null(如主機無IPv6)
        let listen = (host) => new Promise((resolve) => {
            let srv = net.createServer()
            srv.on('error', () => resolve(null))
            srv.listen(0, host, () => resolve(srv))
        })

        for (let host of ['0.0.0.0', '::']) {
            it(`listen on ${host}: found own pid, then none after close`, async function() {
                let srv = await listen(host)
                if (srv === null) {
                    this.skip()
                }
                let port = srv.address().port
                try {
                    let { evs, on } = recEvents()
                    assert.strict.deepStrictEqual(execProcessPortPidsSync(port, { onTrace: on }), [process.pid])
                    let st = evs[evs.length - 1]
                    assert.strict.deepStrictEqual(isWin ? ['netstat', 'powershell'].includes(st.src) : st.src === 'lsof', true, st.src)
                    assert.strict.deepStrictEqual(execProcessPortPidsSync(port, { useBoth: true }), [process.pid])
                }
                finally {
                    await new Promise((resolve) => srv.close(resolve))
                }
                let { evs, on } = recEvents()
                assert.strict.deepStrictEqual(execProcessPortPidsSync(port, { onTrace: on }), [])
                assert.strict.deepStrictEqual(evs[evs.length - 1].src, isWin ? 'powershell' : 'lsof')
            })
        }

    })

    describe(`onTrace P3/P4`, function() {

        let scenarios = [
            ['found by netstat', { outs: { netstat: ok(NS.v4) } }],
            ['found by powershell', { outs: { netstat: ok(NS.none), powershell: ok(PS.v6) } }],
            ['failure', { outs: { netstat: ok(NS.none), powershell: ok('', 1) } }],
        ]
        for (let [name, sc] of scenarios) {
            it(`${name}: five callbacks give identical results`, async function() {
                let un = collectUnhandled()
                try {
                    let { evs, on } = recEvents()
                    let rs = []
                    for (let cb of fiveOnTrace(on)) {
                        let opt = { platform: 'win32', exec: fakeExec(sc.outs, []) }
                        if (cb !== undefined) {
                            opt.onTrace = cb
                        }
                        rs.push(execProcessPortPidsSync(8080, opt))
                    }
                    for (let r of rs) {
                        assert.strict.deepStrictEqual(r, rs[0])
                    }
                    assert.strict.deepStrictEqual(evs.length > 0 && evs.every((e) => Object.isFrozen(e)), true)
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
