import assert from 'assert'
import domIsStable from '../src/domIsStable.mjs'


let delay = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms)
    })
}


//FakeEle, 以class實例模擬DOM元素: isEle走lodash isElement, 要求nodeType為1且非plain object
//  rect可由測試改動, anims為getAnimations回傳之陣列
class FakeEle {
    constructor() {
        this.nodeType = 1
        this.rect = { left: 0, top: 0, width: 100, height: 100 }
        this.anims = []
        this.bThrowGetAnimations = false
    }

    getBoundingClientRect() {
        return { ...this.rect }
    }

    getAnimations() {
        if (this.bThrowGetAnimations) {
            throw new Error('getAnimations not supported')
        }
        return this.anims.slice()
    }
}


//mkAnim, 模擬Animation物件: playState、iterations、finished(msFinish為null代表永不落定, bReject代表被取消)
function mkAnim(opt = {}) {
    let playState = ('playState' in opt) ? opt.playState : 'running'
    let iterations = ('iterations' in opt) ? opt.iterations : 1
    let msFinish = ('msFinish' in opt) ? opt.msFinish : null
    let bReject = ('bReject' in opt) ? opt.bReject : false
    let a = {
        playState,
        pending: false,
        effect: {
            getTiming: () => {
                return { iterations }
            },
        },
    }
    a.finished = new Promise((resolve, reject) => {
        if (msFinish === null) {
            return
        }
        setTimeout(() => {
            a.playState = 'finished'
            if (bReject) {
                reject(new Error('AbortError'))
            }
            else {
                resolve(a)
            }
        }, msFinish)
    })
    a.finished.catch(() => {})
    return a
}


//startTransition, 模擬CSS transition: 建立後為running且pending, msPending內rect不動, 之後位移dx, 於ms結束並自getAnimations消失
function startTransition(el, opt = {}) {
    let msPending = ('msPending' in opt) ? opt.msPending : 20
    let ms = ('ms' in opt) ? opt.ms : 300
    let dx = ('dx' in opt) ? opt.dx : 200
    let a = {
        playState: 'running',
        pending: true,
        effect: {
            getTiming: () => {
                return { iterations: 1 }
            },
        },
    }
    let done = null
    a.finished = new Promise((resolve) => {
        done = resolve
    })
    el.anims.push(a)
    setTimeout(() => {
        a.pending = false
        el.rect = { ...el.rect, left: el.rect.left + dx }
    }, msPending)
    setTimeout(() => {
        el.anims = el.anims.filter((x) => x !== a)
        a.playState = 'finished'
        done(a)
    }, ms)
    return a
}


describe(`domIsStable`, function() {

    this.timeout(20000)

    //--- 檢查 ---

    it(`should reject when ele is not an element`, async function() {
        for (let v of [null, undefined, {}, { nodeType: 1 }, 'div', 123]) {
            let err = null
            try {
                await domIsStable(v)
            }
            catch (e) {
                err = e
            }
            assert.strict.deepStrictEqual(err, 'invalid element', String(v))
        }
    })

    it(`should reject when ele has no getBoundingClientRect`, async function() {
        let el = new FakeEle()
        el.getBoundingClientRect = null
        let err = null
        try {
            await domIsStable(el)
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err, 'invalid element.getBoundingClientRect')
    })

    //--- promise模式 ---

    it(`should resolve true for a static element after about timeDiff`, async function() {
        let el = new FakeEle()
        let t0 = Date.now()
        let b = await domIsStable(el)
        let dt = Date.now() - t0
        assert.strict.deepStrictEqual(b, true)
        assert.strict.deepStrictEqual(dt >= 100 && dt < 250, true, `dt=${dt}`)
    })

    it(`should resolve false when the rect changes inside the window`, async function() {
        let el = new FakeEle()
        setTimeout(() => {
            el.rect = { ...el.rect, left: 50 }
        }, 50)
        let b = await domIsStable(el)
        assert.strict.deepStrictEqual(b, false)
    })

    it(`should resolve true when the rect changes within tolerance`, async function() {
        let el = new FakeEle()
        setTimeout(() => {
            el.rect = { ...el.rect, left: 0.5 }
        }, 50)
        let b = await domIsStable(el, { tolerance: 1 })
        assert.strict.deepStrictEqual(b, true)
    })

    it(`should resolve false when a transition is created late in the window and moves only after the second sample`, async function() {
        //建議書之情境: transition於視窗第90ms建立, pending 30ms, r1與r2皆未見位移; 舊寫法等完finished後只看等完之數量而誤判為穩定
        let el = new FakeEle()
        setTimeout(() => {
            startTransition(el, { msPending: 30, ms: 300 })
        }, 90)
        let t0 = Date.now()
        let b = await domIsStable(el)
        let dt = Date.now() - t0
        assert.strict.deepStrictEqual(b, false)
        assert.strict.deepStrictEqual(dt >= 300, true, `dt=${dt}`) //有等動畫結束
    })

    it(`should resolve false when a transition is already running before the call`, async function() {
        let el = new FakeEle()
        startTransition(el, { msPending: 0, ms: 300 })
        await delay(50)
        let b = await domIsStable(el)
        assert.strict.deepStrictEqual(b, false)
    })

    it(`should resolve true on the next call after the transition has ended`, async function() {
        let el = new FakeEle()
        startTransition(el, { msPending: 0, ms: 150 })
        let b1 = await domIsStable(el)
        let b2 = await domIsStable(el)
        assert.strict.deepStrictEqual([b1, b2], [false, true])
    })

    it(`should resolve false when an animation starts after the window during the wait`, async function() {
        //視窗結束時有動畫A, 等A結束期間又出現動畫B, n2>0應回不穩定
        let el = new FakeEle()
        startTransition(el, { msPending: 0, ms: 200, dx: 0 })
        setTimeout(() => {
            startTransition(el, { msPending: 0, ms: 300, dx: 0 })
        }, 150)
        let b = await domIsStable(el)
        assert.strict.deepStrictEqual(b, false)
    })

    it(`should resolve false when the rect moves during the wait even if the second sample matched`, async function() {
        //視窗內rect未動, 動畫結束時才位移(r3與r1不同)
        let el = new FakeEle()
        let a = mkAnim({ msFinish: 200 })
        el.anims.push(a)
        setTimeout(() => {
            el.rect = { ...el.rect, left: 300 }
            el.anims = []
        }, 195)
        let b = await domIsStable(el)
        assert.strict.deepStrictEqual(b, false)
    })

    it(`should still resolve when the awaited animation is cancelled`, async function() {
        let el = new FakeEle()
        el.anims.push(mkAnim({ msFinish: 150, bReject: true }))
        let b = await domIsStable(el)
        assert.strict.deepStrictEqual(b, false)
    })

    it(`should ignore a finished fill-forwards animation still reported by getAnimations`, async function() {
        //子元素做完進場動畫後仍留在getAnimations(playState為finished), 不得讓父元素永遠不穩定
        let el = new FakeEle()
        el.anims.push(mkAnim({ playState: 'finished' }))
        let b = await domIsStable(el)
        assert.strict.deepStrictEqual(b, true)
    })

    it(`should ignore a paused animation`, async function() {
        let el = new FakeEle()
        el.anims.push(mkAnim({ playState: 'paused' }))
        let b = await domIsStable(el)
        assert.strict.deepStrictEqual(b, true)
    })

    it(`should ignore an infinite animation instead of waiting forever`, async function() {
        //spinner之finished永不落定, 不計亦不等待
        let el = new FakeEle()
        el.anims.push(mkAnim({ iterations: Infinity, msFinish: null }))
        let t0 = Date.now()
        let b = await domIsStable(el)
        let dt = Date.now() - t0
        assert.strict.deepStrictEqual(b, true)
        assert.strict.deepStrictEqual(dt < 250, true, `dt=${dt}`)
    })

    it(`should count a pending transition as active`, async function() {
        let el = new FakeEle()
        let a = mkAnim({ msFinish: 150 })
        a.pending = true
        el.anims.push(a)
        let b = await domIsStable(el)
        assert.strict.deepStrictEqual(b, false)
    })

    it(`should ignore an animation whose effect is missing`, async function() {
        let el = new FakeEle()
        let a = mkAnim({ msFinish: 150 })
        a.effect = null
        el.anims.push(a)
        let b = await domIsStable(el)
        assert.strict.deepStrictEqual(b, true)
    })

    it(`should degrade to rect-only detection when getAnimations throws`, async function() {
        let el = new FakeEle()
        el.bThrowGetAnimations = true
        let b1 = await domIsStable(el)
        setTimeout(() => {
            el.rect = { ...el.rect, left: 50 }
        }, 50)
        let b2 = await domIsStable(el)
        assert.strict.deepStrictEqual([b1, b2], [true, false])
    })

    it(`should honour opt.timeDiff`, async function() {
        let el = new FakeEle()
        let t0 = Date.now()
        await domIsStable(el, { timeDiff: 20 })
        let dt = Date.now() - t0
        assert.strict.deepStrictEqual(dt >= 20 && dt < 100, true, `dt=${dt}`)
    })

    //--- event模式 ---

    it(`should emit true once for a static element and nothing more`, async function() {
        let el = new FakeEle()
        let seq = []
        let ev = domIsStable(el, { mode: 'event' })
        ev.on('stable', (b) => {
            seq.push(b)
        })
        ev.create()
        await delay(600)
        ev.dispose()
        assert.strict.deepStrictEqual(seq, [true])
    })

    it(`should emit false then true across a transition`, async function() {
        let el = new FakeEle()
        let seq = []
        let ev = domIsStable(el, { mode: 'event' })
        ev.on('stable', (b) => {
            seq.push(b)
        })
        ev.create()
        await delay(400)
        startTransition(el, { msPending: 20, ms: 200 })
        await delay(1200)
        ev.dispose()
        assert.strict.deepStrictEqual(seq, [true, false, true])
    })

    it(`should emit false then true when the transition is created late in a round window`, async function() {
        //每輪r1至r2為100ms, 於第一次true後每隔一段時間建立transition, 各次皆須觀察到false再true
        let el = new FakeEle()
        let seq = []
        let ev = domIsStable(el, { mode: 'event' })
        ev.on('stable', (b) => {
            seq.push(b)
        })
        ev.create()
        await delay(400)
        for (let ms of [0, 30, 60, 90, 120]) {
            let n = seq.length
            await delay(ms)
            startTransition(el, { msPending: 30, ms: 200 })
            await delay(900)
            assert.strict.deepStrictEqual(seq.slice(n), [false, true], `ms=${ms}`)
        }
        ev.dispose()
    })

    it(`should stop emitting after dispose`, async function() {
        let el = new FakeEle()
        let seq = []
        let ev = domIsStable(el, { mode: 'event' })
        ev.on('stable', (b) => {
            seq.push(b)
        })
        ev.create()
        await delay(400)
        assert.strict.deepStrictEqual(ev.dispose(), true)
        startTransition(el, { msPending: 20, ms: 200 })
        await delay(700)
        assert.strict.deepStrictEqual(seq, [true])
    })

})
