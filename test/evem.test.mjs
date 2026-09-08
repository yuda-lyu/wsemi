import assert from 'assert'
import { spawnSync } from 'child_process'
import evem from '../src/evem.mjs'


describe(`evem`, function() {

    let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    //計數: safe型於本行程內之測試不得產生uncaughtException或unhandledRejection
    let nUncaught = 0
    let nUnhandled = 0
    let onUncaught = () => {
        nUncaught += 1
    }
    let onUnhandled = () => {
        nUnhandled += 1
    }
    before(function() {
        process.on('uncaughtException', onUncaught)
        process.on('unhandledRejection', onUnhandled)
    })
    after(function() {
        process.off('uncaughtException', onUncaught)
        process.off('unhandledRejection', onUnhandled)
    })

    //runChild, 於獨立node行程執行腳本(以cwd為repo根目錄import src/evem.mjs), 回傳{ status, stdout, stderr }; 用於證明basic型於setTimeout延後派發下確會使行程崩潰(exit 1), 此類斷言不能在mocha本行程做
    let runChild = (body) => {
        let script = `import evem from './src/evem.mjs'\n${body}`
        let r = spawnSync(process.execPath, ['--input-type=module', '-e', script], { cwd: process.cwd(), encoding: 'utf8', timeout: 20000 })
        return { status: r.status, stdout: r.stdout, stderr: r.stderr }
    }

    describe(`default type`, function() {

        it(`should emit and receive data with evem() (default)`, function() {
            let ev = evem()
            let got = null
            ev.on('evName', function(msg) {
                got = msg
            })
            ev.emit('evName', { abc: 12.34 })
            assert.strict.deepStrictEqual(got, { abc: 12.34 })
        })

        it(`should default to 'basic' (raw eventemitter3, unchanged behavior): evem(), {} and invalid opt.type all propagate a sync listener throw to the emit caller`, function() {
            for (let opt of [undefined, {}, { type: 'xxx' }]) {
                let ev = evem(opt)
                ev.on('a', () => {
                    throw new Error('boom')
                })
                assert.throws(() => ev.emit('a', 1), /boom/, `opt=${JSON.stringify(opt)} 應為 basic`)
                assert.strict.deepStrictEqual(ev.listeners('a').length, 1)
            }
        })

        it(`[child] should keep the process alive (exit 0) with evem({ type: 'safe' }) when a listener throws under setTimeout-delayed emit, logging via console.error when no 'error' listener`, function() {
            let r = runChild(`
                let ev = evem({ type: 'safe' })
                ev.on('x', () => { throw new Error('boom') })
                setTimeout(() => ev.emit('x', 1), 1)
                setTimeout(() => console.log('alive'), 200)
            `)
            // console.log('safe no-error-listener child', r)
            assert.strict.deepStrictEqual(r.status, 0)
            assert.strict.deepStrictEqual(r.stdout.trim(), 'alive')
            assert.strict.deepStrictEqual(r.stderr.includes(`no 'error' listener`), true)
            assert.strict.deepStrictEqual(r.stderr.includes('boom'), true)
        })

    })

    describe(`basic`, function() {

        it(`should propagate a sync listener throw to the emit caller (raw eventemitter3 semantics)`, function() {
            let ev = evem({ type: 'basic' })
            ev.on('a', () => {
                throw new Error('boom')
            })
            assert.throws(() => ev.emit('a'), /boom/)
        })

        it(`[child] should crash the process (exit 1) when a listener throws under setTimeout-delayed emit (default evem())`, function() {
            let r = runChild(`
                let ev = evem()
                ev.on('x', () => { throw new Error('boom') })
                setTimeout(() => ev.emit('x', 1), 1)
                setTimeout(() => console.log('alive'), 200)
            `)
            // console.log('basic sync child', r)
            assert.strict.deepStrictEqual(r.status, 1)
            assert.strict.deepStrictEqual(r.stdout.includes('alive'), false)
            assert.strict.deepStrictEqual(r.stderr.includes('boom'), true)
        })

        it(`[child] should crash the process (exit 1) when an async listener rejects under setTimeout-delayed emit (default evem())`, function() {
            let r = runChild(`
                let ev = evem()
                ev.on('x', async () => { throw new Error('async-boom') })
                setTimeout(() => ev.emit('x', 1), 1)
                setTimeout(() => console.log('alive'), 200)
            `)
            // console.log('basic async child', r)
            assert.strict.deepStrictEqual(r.status, 1)
            assert.strict.deepStrictEqual(r.stdout.includes('alive'), false)
            assert.strict.deepStrictEqual(r.stderr.includes('async-boom'), true)
        })

    })

    describe(`safe`, function() {

        it(`should fall back to the default policy when funGetListenerError is omitted or not a function (no throw)`, async function() {
            for (let bad of [undefined, null, 'no', 123, {}]) {
                let ev = evem({ type: 'safe', funGetListenerError: bad })
                let got = null
                ev.on('error', (e) => {
                    got = e.fun + ':' + e.name
                })
                ev.on('x', () => {
                    throw new Error('boom')
                })
                ev.emit('x')
                assert.strict.deepStrictEqual(got, 'listener:x', `funGetListenerError=${String(bad)} 應退回預設政策`)
            }
        })

        it(`[default policy] should re-emit 'error' with { fun:'listener', name, msg, args } when a listener throws or rejects`, async function() {
            let ev = evem({ type: 'safe' })
            let errs = []
            ev.on('error', (e) => {
                errs.push({ fun: e.fun, name: e.name, msg: e.msg.message, args: e.args })
            })
            ev.on('x', () => {
                throw new Error('boom')
            })
            ev.on('x', async () => {
                throw new Error('async-boom')
            })
            let before = nUncaught + nUnhandled
            setTimeout(() => ev.emit('x', 1, 'two'), 1)
            await delay(50)
            assert.strict.deepStrictEqual(errs, [
                { fun: 'listener', name: 'x', msg: 'boom', args: [1, 'two'] },
                { fun: 'listener', name: 'x', msg: 'async-boom', args: [1, 'two'] },
            ])
            assert.strict.deepStrictEqual(nUncaught + nUnhandled - before, 0)
        })

        it(`[default policy] should reject args[0].pm before re-emitting, so module flows do not hang`, async function() {
            let ev = evem({ type: 'safe' })
            let order = []
            ev.on('error', (e) => {
                order.push('error:' + e.name)
            })
            ev.on('change', () => {
                throw new Error('boom')
            })
            //pm-like(具then與reject, 即genPm之形狀): 以spy記錄reject被呼叫之時序(政策須先reject再重發error)
            let pmObj = {
                then: () => {},
                resolve: () => {},
                reject: (e) => {
                    order.push('pm-rejected:' + e.message)
                },
            }
            setTimeout(() => ev.emit('change', { fp: 'a', pm: pmObj }), 1)
            await delay(50)
            assert.strict.deepStrictEqual(order, ['pm-rejected:boom', 'error:change'])
        })

        it(`[default policy] should console.error (not silently drop) when no 'error' listener is registered`, async function() {
            let ev = evem({ type: 'safe' })
            ev.on('x', () => {
                throw new Error('boom')
            })
            let logged = []
            let _ce = console.error
            console.error = (...a) => {
                logged.push(a.map((x) => String(x && x.message ? x.message : x)).join(' '))
            }
            let before = nUncaught + nUnhandled
            try {
                setTimeout(() => ev.emit('x'), 1)
                await delay(50)
            }
            finally {
                console.error = _ce
            }
            assert.strict.deepStrictEqual(logged.length, 1)
            assert.strict.deepStrictEqual(logged[0].includes(`no 'error' listener`) && logged[0].includes('boom'), true)
            assert.strict.deepStrictEqual(nUncaught + nUnhandled - before, 0)
        })

        it(`[default policy] should not recurse when the 'error' listener itself throws; falls back to console.error`, async function() {
            let ev = evem({ type: 'safe' })
            let nErrorListener = 0
            ev.on('error', () => {
                nErrorListener += 1
                throw new Error('error-listener-boom')
            })
            ev.on('x', () => {
                throw new Error('boom')
            })
            let logged = []
            let _ce = console.error
            console.error = (...a) => {
                logged.push(String(a[0]))
            }
            let before = nUncaught + nUnhandled
            try {
                setTimeout(() => ev.emit('x'), 1)
                await delay(50)
            }
            finally {
                console.error = _ce
            }
            assert.strict.deepStrictEqual(nErrorListener, 1)
            assert.strict.deepStrictEqual(logged.length, 1)
            assert.strict.deepStrictEqual(logged[0].includes(`listener of 'error' threw`), true)
            assert.strict.deepStrictEqual(nUncaught + nUnhandled - before, 0)
        })

        it(`should route a sync-throwing listener to funGetListenerError under setTimeout-delayed emit, without uncaughtException`, async function() {
            let hits = []
            let ev = evem({
                type: 'safe',
                funGetListenerError: (name, err, args) => {
                    hits.push({ name, msg: err.message, args })
                },
            })
            let others = []
            ev.on('x', () => {
                throw new Error('boom')
            })
            ev.on('x', (a, b) => {
                others.push([a, b]) //同事件其他監聽器不受影響
            })
            let before = nUncaught
            setTimeout(() => ev.emit('x', 1, 'two'), 1)
            await delay(50)
            assert.strict.deepStrictEqual(hits, [{ name: 'x', msg: 'boom', args: [1, 'two'] }])
            assert.strict.deepStrictEqual(others, [[1, 'two']])
            assert.strict.deepStrictEqual(nUncaught - before, 0)
        })

        it(`should route an async-rejecting listener to funGetListenerError under setTimeout-delayed emit, without unhandledRejection`, async function() {
            let hits = []
            let ev = evem({
                type: 'safe',
                funGetListenerError: (name, err, args) => {
                    hits.push({ name, msg: err.message, args })
                },
            })
            ev.on('x', async () => {
                await delay(5)
                throw new Error('async-boom')
            })
            let before = nUnhandled
            setTimeout(() => ev.emit('x', { k: 1 }), 1)
            await delay(80)
            assert.strict.deepStrictEqual(hits, [{ name: 'x', msg: 'async-boom', args: [{ k: 1 }] }])
            assert.strict.deepStrictEqual(nUnhandled - before, 0)
        })

        it(`[child] should keep the process alive (exit 0) for both sync throw and async reject under setTimeout-delayed emit`, function() {
            let r = runChild(`
                let hits = []
                let ev = evem({ type: 'safe', funGetListenerError: (name, err, args) => { hits.push(name + ':' + err.message + ':' + JSON.stringify(args)) } })
                ev.on('x', () => { throw new Error('boom') })
                ev.on('x', async () => { throw new Error('async-boom') })
                setTimeout(() => ev.emit('x', 1), 1)
                setTimeout(() => { console.log('alive ' + JSON.stringify(hits)) }, 200)
            `)
            // console.log('safe child', r)
            assert.strict.deepStrictEqual(r.status, 0)
            assert.strict.deepStrictEqual(r.stdout.trim(), 'alive ["x:boom:[1]","x:async-boom:[1]"]')
        })

        it(`should keep context, listener order and emit's boolean return for normal listeners`, function() {
            let ev = evem({ type: 'safe', funGetListenerError: () => {} })
            let ctx = { tag: 'C' }
            let seen = []
            ev.on('x', function(v) {
                seen.push(['a', v, this && this.tag])
            }, ctx)
            ev.on('x', function(v) {
                seen.push(['b', v, this && this.tag])
                return 'ret'
            })
            //emit依eventemitter3契約回傳是否有監聽者之布林值, 不回傳監聽器結果
            assert.strict.deepStrictEqual(ev.emit('x', 7), true)
            assert.strict.deepStrictEqual(ev.emit('nobody'), false)
            assert.strict.deepStrictEqual(seen, [['a', 7, 'C'], ['b', 7, undefined]])
            assert.strict.deepStrictEqual(ev.listenerCount('x'), 2)
        })

        it(`[review] listeners() should return the original functions, and re-registering one must not break once`, function() {
            let ev = evem({ type: 'safe', funGetListenerError: () => {} })
            let n = 0
            let f = () => {
                n += 1
            }
            ev.once('x', f)
            let got = ev.listeners('x')
            assert.strict.deepStrictEqual(got.length, 1)
            assert.strict.deepStrictEqual(got[0] === f, true)
            //把listeners()取得者再on: once仍只執行1次, on每次執行1次 → 兩次emit共3次(修正前為4: once未被移除)
            ev.on('x', got[0])
            ev.emit('x')
            ev.emit('x')
            assert.strict.deepStrictEqual(n, 3)
            assert.strict.deepStrictEqual(ev.listenerCount('x'), 1)
        })

        it(`[review] should swallow an async funGetListenerError that rejects (no unhandledRejection)`, async function() {
            let ev = evem({
                type: 'safe',
                funGetListenerError: async () => {
                    throw new Error('handler-async-boom')
                },
            })
            ev.on('x', () => {
                throw new Error('boom')
            })
            let before = nUnhandled
            ev.emit('x')
            await delay(50)
            assert.strict.deepStrictEqual(nUnhandled - before, 0)
        })

        it(`[review] default policy should still report the original error when pm.reject throws or returns a rejection`, async function() {
            let ev = evem({ type: 'safe' })
            let errs = []
            ev.on('error', (e) => {
                errs.push(e.msg.message)
            })
            ev.on('x', () => {
                throw new Error('boom')
            })
            let before = nUnhandled
            let pmThrow = {
                then: () => {},
                reject: () => {
                    throw new Error('reject-boom')
                },
            }
            let pmAsync = {
                then: () => {},
                reject: () => Promise.reject(new Error('reject-async-boom')),
            }
            ev.emit('x', { pm: pmThrow })
            ev.emit('x', { pm: pmAsync })
            await delay(50)
            assert.strict.deepStrictEqual(errs, ['boom', 'boom'])
            assert.strict.deepStrictEqual(nUnhandled - before, 0)
        })

        it(`[review] default policy should only reject promise-like pm (then+reject), not any object that happens to have reject`, function() {
            let ev = evem({ type: 'safe' })
            ev.on('error', () => {})
            ev.on('x', () => {
                throw new Error('boom')
            })
            let calledPlain = false
            let calledPm = false
            let plain = {
                reject: () => {
                    calledPlain = true
                },
            }
            let pmLike = {
                then: () => {},
                reject: () => {
                    calledPm = true
                },
            }
            ev.emit('x', { pm: plain }) //業務物件恰有reject, 無then
            ev.emit('x', { pm: pmLike }) //promise-like
            assert.strict.deepStrictEqual([calledPlain, calledPm], [false, true])
        })

        it(`[review] should drop the wrapper cache once a listener is fully removed (off / once / removeAllListeners)`, function() {
            let ev = evem({ type: 'safe', funGetListenerError: () => {} })
            //以eventemitter3原型之listeners取得內部包裝函數, 比對身分: 移除後再註冊應為新包裝(快取已清)
            let raw = (name) => Object.getPrototypeOf(ev).listeners.call(ev, name)
            let f = () => {}

            ev.on('a', f)
            let w1 = raw('a')[0]
            ev.off('a', f)
            ev.on('a', f)
            let w2 = raw('a')[0]
            assert.strict.deepStrictEqual(w1 !== w2, true, 'off 後快取應清除')

            //同fn同事件註冊兩次: 只要仍有註冊, 快取須保留(同一包裝)
            ev.on('a', f)
            assert.strict.deepStrictEqual(raw('a')[0] === raw('a')[1], true)
            ev.off('a', f) //eventemitter3移除全部相符者
            assert.strict.deepStrictEqual(ev.listenerCount('a'), 0)

            //once自動移除後
            ev.once('b', f)
            let wb1 = raw('b')[0]
            ev.emit('b')
            ev.once('b', f)
            let wb2 = raw('b')[0]
            assert.strict.deepStrictEqual(wb1 !== wb2, true, 'once 自動移除後快取應清除')

            //removeAllListeners(name) 與 removeAllListeners()
            ev.on('c', f)
            ev.on('d', f)
            let wc1 = raw('c')[0]
            ev.removeAllListeners('c')
            assert.strict.deepStrictEqual([ev.listenerCount('c'), ev.listenerCount('d')], [0, 1])
            ev.on('c', f)
            assert.strict.deepStrictEqual(raw('c')[0] !== wc1, true, 'removeAllListeners(name) 後快取應清除')
            let wd1 = raw('d')[0]
            ev.removeAllListeners()
            assert.strict.deepStrictEqual(ev.eventNames().length, 0)
            ev.on('d', f)
            assert.strict.deepStrictEqual(raw('d')[0] !== wd1, true, 'removeAllListeners() 後快取應清除')
        })

        it(`[review] addListener alias, once with context, Symbol event names, and removeListener with context/once filters`, function() {
            let ev = evem({ type: 'safe', funGetListenerError: () => {} })
            let ctx = { tag: 'K' }
            let seen = []
            let f = function(v) {
                seen.push([v, this && this.tag])
            }
            ev.addListener('x', f)
            ev.once('x', f, ctx)
            ev.emit('x', 1)
            ev.emit('x', 2)
            assert.strict.deepStrictEqual(seen, [[1, undefined], [1, 'K'], [2, undefined]])
            //removeListener 帶 context 只移除該 context 之註冊
            ev.on('x', f, ctx)
            assert.strict.deepStrictEqual(ev.listenerCount('x'), 2)
            ev.removeListener('x', f, ctx)
            assert.strict.deepStrictEqual(ev.listenerCount('x'), 1)
            //removeListener 帶 once=true 只移除 once 註冊
            ev.once('x', f)
            assert.strict.deepStrictEqual(ev.listenerCount('x'), 2)
            ev.removeListener('x', f, undefined, true)
            assert.strict.deepStrictEqual(ev.listenerCount('x'), 1)
            //Symbol 事件名
            let s = Symbol('sym')
            let hit = 0
            ev.on(s, () => {
                hit += 1
                throw new Error('sym-boom')
            })
            assert.doesNotThrow(() => ev.emit(s))
            assert.strict.deepStrictEqual(hit, 1)
            ev.off(s, ev.listeners(s)[0])
            assert.strict.deepStrictEqual(ev.listenerCount(s), 0)
        })

        it(`[review] non-promise / fulfilled-promise listener results must not trigger the handler; a late reject after removal still reports`, async function() {
            let hits = []
            let ev = evem({
                type: 'safe',
                funGetListenerError: (name, err) => {
                    hits.push(name + ':' + err.message)
                },
            })
            ev.on('ok', () => 123)
            ev.on('ok', async () => 'fine')
            ev.emit('ok')
            await delay(20)
            assert.strict.deepStrictEqual(hits, [])

            //監聽器已執行、其async reject尚未發生時被移除: 仍回報(語意明定)
            let f = async () => {
                await delay(20)
                throw new Error('late-boom')
            }
            ev.on('late', f)
            ev.emit('late')
            ev.off('late', f)
            assert.strict.deepStrictEqual(ev.listenerCount('late'), 0)
            await delay(60)
            assert.strict.deepStrictEqual(hits, ['late:late-boom'])
        })

        it(`should remove listeners by original function via off/removeListener, even when the same function is bound to multiple events`, function() {
            let ev = evem({ type: 'safe', funGetListenerError: () => {} })
            let seen = []
            let fn = (v) => {
                seen.push(v)
            }
            ev.on('a', fn)
            ev.on('b', fn)
            assert.strict.deepStrictEqual([ev.listenerCount('a'), ev.listenerCount('b')], [1, 1])

            //移除a上的fn, b上的fn須保留(原一對一映射會使a移除失敗)
            ev.off('a', fn)
            assert.strict.deepStrictEqual([ev.listenerCount('a'), ev.listenerCount('b')], [0, 1])
            ev.emit('a', 'A')
            ev.emit('b', 'B')
            assert.strict.deepStrictEqual(seen, ['B'])

            //removeListener別名亦可
            ev.removeListener('b', fn)
            assert.strict.deepStrictEqual(ev.listenerCount('b'), 0)
        })

        it(`should auto-remove once listeners after first emit and still guard them`, async function() {
            let hits = []
            let ev = evem({
                type: 'safe',
                funGetListenerError: (name, err) => {
                    hits.push(name + ':' + err.message)
                },
            })
            let n = 0
            ev.once('x', () => {
                n += 1
                throw new Error('once-boom')
            })
            assert.strict.deepStrictEqual(ev.listenerCount('x'), 1)
            setTimeout(() => ev.emit('x'), 1)
            setTimeout(() => ev.emit('x'), 10)
            await delay(50)
            assert.strict.deepStrictEqual(n, 1)
            assert.strict.deepStrictEqual(ev.listenerCount('x'), 0)
            assert.strict.deepStrictEqual(hits, ['x:once-boom'])
        })

        it(`should support removeAllListeners and off(name) without a function`, function() {
            let ev = evem({ type: 'safe', funGetListenerError: () => {} })
            ev.on('a', () => {})
            ev.on('a', () => {})
            ev.on('b', () => {})
            ev.off('a')
            assert.strict.deepStrictEqual([ev.listenerCount('a'), ev.listenerCount('b')], [0, 1])
            ev.removeAllListeners()
            assert.strict.deepStrictEqual(ev.listenerCount('b'), 0)
        })

        it(`should not crash when funGetListenerError itself throws`, async function() {
            let ev = evem({
                type: 'safe',
                funGetListenerError: () => {
                    throw new Error('guard-boom')
                },
            })
            ev.on('x', () => {
                throw new Error('boom')
            })
            let before = nUncaught
            setTimeout(() => ev.emit('x'), 1)
            await delay(30)
            assert.strict.deepStrictEqual(nUncaught - before, 0)
        })

        it(`should let eventemitter3 throw TypeError when listener is not a function`, function() {
            let ev = evem({ type: 'safe', funGetListenerError: () => {} })
            assert.throws(() => ev.on('x', 'not-a-function'), /listener must be a function/)
        })

    })

    describe(`hygiene`, function() {

        it(`should not leak any uncaughtException or unhandledRejection from safe-type tests in this process`, async function() {
            await delay(100)
            assert.strict.deepStrictEqual([nUncaught, nUnhandled], [0, 0])
        })

    })

})
