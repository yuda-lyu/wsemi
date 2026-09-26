import assert from 'assert'
import domIsVisible from '../src/domIsVisible.mjs'


let tick = () => new Promise((resolve) => setTimeout(resolve, 0))


//Ele, 假元素: isEle走lodash isElement, 要求nodeType為1且非plain object
class Ele {
    constructor() {
        this.nodeType = 1
    }
}


//mkEnv, 假IntersectionObserver: 記錄觀察對象, 由測試以fire送出entries; throwCtor、throwObserve模擬建立失敗; noIO為無IntersectionObserver
function mkEnv(o = {}) {
    let env = { obs: [] }
    class IO {
        constructor(cb) {
            if (o.throwCtor) {
                throw new Error('ctor boom')
            }
            this.cb = cb
            this.targets = new Set()
            this.disconnected = false
            env.obs.push(this)
        }

        observe(t) {
            if (o.throwObserve) {
                throw new Error('observe boom')
            }
            this.targets.add(t)
        }

        disconnect() {
            this.targets.clear()
            this.disconnected = true
        }
    }
    class IOE {}
    IOE.prototype.intersectionRatio = 0
    globalThis.window = o.noIO ? {} : { IntersectionObserver: IO, IntersectionObserverEntry: IOE }
    globalThis.IntersectionObserver = o.noIO ? undefined : IO
    //fire, 對觀察ele之觀察器送出一次回呼, list之項目為isIntersecting布林值或{ b, time }
    env.fire = (ele, list) => {
        for (let ob of env.obs) {
            if (ob.targets.has(ele)) {
                ob.cb(list.map((v) => (typeof v === 'boolean' ? { target: ele, isIntersecting: v } : { target: ele, isIntersecting: v.b, time: v.time })), ob)
            }
        }
    }
    env.nObserving = (ele) => env.obs.filter((ob) => ob.targets.has(ele)).length
    return env
}


describe(`domIsVisible`, function() {

    after(function() {
        delete globalThis.window
        delete globalThis.IntersectionObserver
    })

    it(`should resolve with the latest entry in promise mode, ignoring a callback without entries`, async function() {
        //同一回呼多筆時取時間最新者; 無time時依先後取最後一筆; 無entries之回呼不resolve
        let env = mkEnv()
        let el1 = new Ele()
        let pm1 = domIsVisible(el1)
        env.fire(el1, [true, false])
        let el2 = new Ele()
        let pm2 = domIsVisible(el2)
        let settled = false
        pm2.then(() => {
            settled = true
        })
        env.fire(el2, [])
        await tick()
        let early = settled
        env.fire(el2, [{ b: true, time: 9 }, { b: false, time: 2 }])
        assert.strict.deepStrictEqual([await pm1, early, await pm2], [false, false, true])
    })

    it(`should reject in promise mode for an invalid element or without IntersectionObserver`, async function() {
        //promise模式維持reject原字串
        mkEnv()
        let e1 = null
        try {
            await domIsVisible(null)
        }
        catch (e) {
            e1 = e
        }
        mkEnv({ noIO: true })
        let e2 = null
        try {
            await domIsVisible(new Ele())
        }
        catch (e) {
            e2 = e
        }
        assert.strict.deepStrictEqual([e1, e2], ['invalid element', 'invalid IntersectionObserver'])
    })

    it(`should return an inert detector with the error in event mode for an invalid element or without IntersectionObserver`, async function() {
        //event模式不回傳Promise: on、create、dispose可呼叫且永不觸發, error為原因, 無未處理之拒絕
        let rejections = 0
        let onRej = () => {
            rejections++
        }
        process.on('unhandledRejection', onRej)
        mkEnv()
        let ev1 = domIsVisible({}, { mode: 'event' })
        mkEnv({ noIO: true })
        let ev2 = domIsVisible(new Ele(), { mode: 'event' })
        let got = []
        for (let ev of [ev1, ev2]) {
            assert.doesNotThrow(() => {
                ev.on('visible', (v) => got.push(v))
                ev.create()
            })
        }
        await tick()
        process.removeListener('unhandledRejection', onRej)
        assert.strict.deepStrictEqual([ev1.error, ev2.error, got, ev1.dispose(), ev2.dispose(), rejections], ['invalid element', 'invalid IntersectionObserver', [], true, true, 0])
    })

    it(`should observe right after create, before any timer, and emit the latest entry of each callback`, async function() {
        //create於microtask觀察(無50ms輪詢); 多筆取最新; 無entries之回呼不發出
        let env = mkEnv()
        let el = new Ele()
        let ev = domIsVisible(el, { mode: 'event' })
        let got = []
        ev.create()
        ev.on('visible', (v) => got.push(v))
        let atCreate = env.nObserving(el)
        await Promise.resolve()
        let afterMicrotask = env.nObserving(el)
        env.fire(el, [true])
        env.fire(el, [true, false])
        env.fire(el, [{ b: true, time: 5 }, { b: false, time: 3 }])
        env.fire(el, [])
        assert.strict.deepStrictEqual([atCreate, afterMicrotask, got, ev.error], [0, 1, [true, false, true], null])
        ev.dispose()
    })

    it(`should keep the error instead of throwing when the observer fails to start`, async function() {
        //建構子或observe拋錯: create不拋錯, error為所拋之錯誤, 已建立之觀察器釋放, 永不發出
        mkEnv({ throwCtor: true })
        let ev1 = domIsVisible(new Ele(), { mode: 'event' })
        assert.doesNotThrow(() => ev1.create())
        await tick()
        let env = mkEnv({ throwObserve: true })
        let ev2 = domIsVisible(new Ele(), { mode: 'event' })
        assert.doesNotThrow(() => ev2.create())
        await tick()
        assert.strict.deepStrictEqual([ev1.error.message, ev2.error.message, env.obs.length, env.obs[0].disconnected, ev1.dispose(), ev2.dispose()], ['ctor boom', 'observe boom', 1, true, true, true])
    })

    it(`should observe once however often create is called, and stop for good on dispose`, async function() {
        //create冪等; dispose後不再發出, 之後create無效
        let env = mkEnv()
        let el = new Ele()
        let ev = domIsVisible(el, { mode: 'event' })
        let got = []
        ev.on('visible', (v) => got.push(v))
        ev.create()
        ev.create()
        await tick()
        assert.strict.deepStrictEqual(env.obs.length, 1)
        env.fire(el, [true])
        assert.strict.deepStrictEqual(ev.dispose(), true)
        let disconnected = env.obs[0].disconnected
        env.fire(el, [false])
        ev.create()
        await tick()
        assert.strict.deepStrictEqual(ev.dispose(), true)
        assert.strict.deepStrictEqual([got, disconnected, env.obs.length], [[true], true, 1])
    })

    it(`should not observe at all when disposed right after create`, async function() {
        let env = mkEnv()
        let ev = domIsVisible(new Ele(), { mode: 'event' })
        ev.create()
        ev.dispose()
        await tick()
        assert.strict.deepStrictEqual(env.obs.length, 0)
    })

})
