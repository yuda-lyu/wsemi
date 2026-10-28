import assert from 'assert'
import domIsStable from '../src/domIsStable.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


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


//--- 觀察回調(opt.onTrace)與假時鐘之測試輔助(R-TRACE-01) ---
//  C類案(時間即規格者)於useFakeClock下跑: 時間只由advance推進, 事件發生時之時刻(假Date.now())即該事件之時間, 斷言事件內容與時刻, 不以真實毫秒之上界或比值

//mkRec, traceRec另記各事件發生當下之Date.now()(假時鐘下為假時間, ms), ts與events同索引
function mkRec() {
    let tr = traceRec()
    let ts = []
    let on = (e) => {
        ts.push(Date.now())
        tr.on(e)
    }
    return { ...tr, on, ts }
}

//byType, 取紀錄中指定type之事件(附t為其發生時刻)
function byType(rec, type) {
    return rec.events.map((e, i) => ({ ...e, t: rec.ts[i] })).filter((e) => e.type === type)
}

//advanceUntil, 以假時鐘逐1ms推進至pred成立, 回傳已推進之毫秒數; maxMs為虛擬毫秒之上限, 只防懸置(不表達規格), 到上限仍未成立回傳-1
async function advanceUntil(clock, pred, maxMs = 5000) {
    for (let i = 0; i < maxMs; i++) {
        if (pred()) {
            return i
        }
        await clock.advance(1)
    }
    return pred() ? maxMs : -1
}

//flush, 以真實setImmediate(不受假時鐘影響)讓出一次, 使已排入之microtask(如create於microtask啟動第一輪)執行完畢, 不推進假時間;
//  不用rec.wait等事件: 假時鐘下其防懸置之計時器亦被取代而不會觸發, 事件若因缺陷而不來則懸置至mocha逾時且假時鐘不被還原
function flush() {
    return new Promise((resolve) => {
        setImmediate(resolve)
    })
}

//settle, 假時鐘下逐1ms推進至p落定, 回傳{ settled, v, err, t }, t為落定時距呼叫之假時間(ms); maxMs內未落定則settled為false(不懸置)
async function settle(clock, p, maxMs = 2000) {
    let t0 = Date.now()
    let r = { settled: false, v: undefined, err: undefined, t: null }
    p.then((v) => {
        r.settled = true
        r.v = v
        r.t = Date.now() - t0
    }, (err) => {
        r.settled = true
        r.err = (err && err.message !== undefined) ? err.message : err
        r.t = Date.now() - t0
    })
    await advanceUntil(clock, () => r.settled, maxMs)
    return r
}

//runPm, 假時鐘下呼叫domIsStable(promise模式)並推進至落定, 回傳settle之結果並附rec(事件紀錄)
async function runPm(clock, el, opt = {}, maxMs = 2000) {
    let rec = mkRec()
    let r = await settle(clock, domIsStable(el, { ...opt, onTrace: rec.on }), maxMs)
    return { ...r, rec }
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
        //預設timeDiff為100: 相隔100ms取第二次位置後即判定(靜止且無動畫則無需再等); 時間即規格, 假時鐘下驗「第99ms尚未判定、第100ms即判定」, 不斷言真實毫秒之上界
        let clock = useFakeClock()
        try {
            let el = new FakeEle()
            let rec = mkRec()
            let res = null
            domIsStable(el, { onTrace: rec.on }).then((b) => {
                res = b
            })
            await clock.advance(99)
            assert.strict.deepStrictEqual([res, rec.types()], [null, ['round', 'rect']]) //timeDiff前只取了第一次位置, 尚未判定
            await clock.advance(1)
            assert.strict.deepStrictEqual(res, true) //靜態元素: 位置未變且無動畫則穩定
            assert.strict.deepStrictEqual(rec.types(), ['round', 'rect', 'rect', 'anims', 'anims', 'rect', 'judge'])
            assert.strict.deepStrictEqual(byType(rec, 'rect').map((e) => [e.at, e.t]), [[1, 0], [2, 100], [3, 100]]) //第二次位置相隔timeDiff(100ms)
            assert.strict.deepStrictEqual(byType(rec, 'judge').map((e) => [e.stable, e.moved, e.t]), [[true, false, 100]])
        }
        finally {
            clock.restore()
        }
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
        //transition(300ms)於第0ms已開始並位移, 第50ms才呼叫: 視窗結束(第150ms)時動畫仍進行(n1=1), 須等其結束(第300ms)再判; 位置自始未變, 故false純因動畫
        //  原以真實delay(50)之恢復時刻決定其後delay(100)與動畫結束計時器之先後, 負載下可使動畫先結束而誤判true; 假時鐘使先後確定
        let clock = useFakeClock()
        try {
            let el = new FakeEle()
            startTransition(el, { msPending: 0, ms: 300 })
            await clock.advance(50)
            let r = await runPm(clock, el)
            assert.strict.deepStrictEqual([r.settled, r.v, r.t], [true, false, 250]) //事件之t為假時鐘絕對時刻(呼叫於第50ms)
            assert.strict.deepStrictEqual(byType(r.rec, 'anims').map((e) => [e.at, e.n, e.t]), [[1, 1, 150], [2, 0, 300]]) //視窗結束(第150ms)時有1個動畫, 動畫結束(第300ms)後為0
            assert.strict.deepStrictEqual(byType(r.rec, 'judge').map((e) => [e.stable, e.moved, e.t]), [[false, false, 300]]) //等動畫結束才判定, 位置未變
        }
        finally {
            clock.restore()
        }
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
        //spinner之finished永不落定, 不計亦不等待: 假時鐘下於timeDiff(100ms)即判定; 若被計入或等待則maxMs內不落定(settled為false)
        let clock = useFakeClock()
        try {
            let el = new FakeEle()
            el.anims.push(mkAnim({ iterations: Infinity, msFinish: null }))
            let r = await runPm(clock, el, {}, 1000)
            assert.strict.deepStrictEqual([r.settled, r.v, r.t], [true, true, 100])
            assert.strict.deepStrictEqual(byType(r.rec, 'anims').map((e) => [e.at, e.n]), [[1, 0], [2, 0]]) //無限循環動畫不計
        }
        finally {
            clock.restore()
        }
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
        //timeDiff為20: 相隔20ms取第二次位置並判定(假時鐘下恰於第20ms, 不是預設之100ms)
        let clock = useFakeClock()
        try {
            let el = new FakeEle()
            let r = await runPm(clock, el, { timeDiff: 20 })
            assert.strict.deepStrictEqual([r.settled, r.v, r.t], [true, true, 20])
            assert.strict.deepStrictEqual(byType(r.rec, 'rect').map((e) => [e.at, e.t]), [[1, 0], [2, 20], [3, 20]])
        }
        finally {
            clock.restore()
        }
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
        //event模式之輪詢鏈(timeDiff 100、timeDetect 50)與transition(測試自帶計時器)之先後即規格, 假時鐘使其確定(原以真實sleep(1200)與輪詢鏈競爭, 負載下少emit)
        //  時間線: 第0ms起第一輪, 第100ms判穩定而emit true; 其後每輪100ms且前一輪未完之tick略過, 故每輪相隔150ms(第150、300、450、...ms起);
        //  第420ms建立transition(位移於第440ms, 第620ms結束): 涵蓋它的第450ms輪於第550ms取樣見動畫(n1=1), 等至第620ms動畫結束才判不穩定而emit false;
        //  下一輪第650ms起、第750ms判整輪靜止而emit true
        let clock = useFakeClock()
        try {
            let el = new FakeEle()
            let rec = mkRec()
            let seq = []
            let ev = domIsStable(el, { mode: 'event', onTrace: rec.on })
            ev.on('stable', (b) => {
                seq.push(b)
            })
            ev.create()
            await flush() //create於microtask啟動第一輪(不推進假時間)
            await clock.advance(420)
            startTransition(el, { msPending: 20, ms: 200 })
            await clock.advance(700)
            ev.dispose()
            assert.strict.deepStrictEqual(seq, [true, false, true])
            assert.strict.deepStrictEqual(byType(rec, 'emit').map((e) => [e.stable, e.t]), [[true, 100], [false, 620], [true, 750]])
            //false純因動畫進行中: 涵蓋它的那一輪(seq 4)於視窗結束時見1個動畫, 動畫結束後為0, 結束後之位置與第一次相同(未再位移)
            assert.strict.deepStrictEqual(byType(rec, 'judge').filter((e) => !e.stable).map((e) => [e.seq, e.moved, e.t]), [[4, false, 620]])
            assert.strict.deepStrictEqual(byType(rec, 'anims').filter((e) => e.seq === 4).map((e) => [e.at, e.n, e.t]), [[1, 1, 550], [2, 0, 620]])
        }
        finally {
            clock.restore()
        }
    })

    it(`should emit false then true when the transition is created late in a round window`, async function() {
        //每輪r1至r2為100ms, 於第一次true後, 在某輪開始後0、30、60、90、120ms(視窗之頭、中、尾與窗後)建立transition, 各次皆須觀察到false再true
        //  原以固定delay(900)等輪詢鏈, 且各次建立點相對於輪次之相位不定; 改以round事件對齊相位、假時鐘推進至emit出現(maxMs只防懸置), 斷言emit之內容
        let clock = useFakeClock()
        try {
            let el = new FakeEle()
            let rec = mkRec()
            let seq = []
            let ev = domIsStable(el, { mode: 'event', onTrace: rec.on })
            ev.on('stable', (b) => {
                seq.push(b)
            })
            ev.create()
            await flush()
            await advanceUntil(clock, () => seq.length === 1) //第一次true
            assert.strict.deepStrictEqual(seq, [true])
            for (let ms of [0, 30, 60, 90, 120]) {
                let n = rec.mark()
                let nSeq = seq.length
                await advanceUntil(clock, () => rec.types(n).includes('round')) //下一輪開始(該輪r1已取)
                await clock.advance(ms)
                startTransition(el, { msPending: 30, ms: 200 })
                await advanceUntil(clock, () => seq.length - nSeq >= 2)
                assert.strict.deepStrictEqual(seq.slice(nSeq), [false, true], `ms=${ms}`)
            }
            ev.dispose()
            assert.strict.deepStrictEqual(seq, [true, false, true, false, true, false, true, false, true, false, true]) //無多餘之emit
        }
        finally {
            clock.restore()
        }
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

    //--- 偵測器骨架、數值選項 ---

    //countRect, 計數getBoundingClientRect之呼叫(每輪取三次位置)
    let countRect = (el) => {
        el.n = 0
        let g = el.getBoundingClientRect.bind(el)
        el.getBoundingClientRect = () => {
            el.n++
            return g()
        }
        return el
    }

    //trackIntervals, 追蹤setInterval之存活數
    let trackIntervals = () => {
        let si = globalThis.setInterval
        let ci = globalThis.clearInterval
        let act = new Set()
        globalThis.setInterval = (fn, ms) => {
            let id = si(fn, ms)
            act.add(id)
            return id
        }
        globalThis.clearInterval = (id) => {
            act.delete(id)
            return ci(id)
        }
        return {
            active: () => act.size,
            restore: () => {
                globalThis.setInterval = si
                globalThis.clearInterval = ci
            },
        }
    }

    it(`should return an inert detector with the error in event mode for an invalid element`, async function() {
        //event模式不回傳Promise: on、create、dispose可呼叫且永不觸發, error為原因; promise模式仍reject(見上)
        let el = new FakeEle()
        el.getBoundingClientRect = null
        let evs = [domIsStable(null, { mode: 'event' }), domIsStable(el, { mode: 'event' })]
        let got = []
        for (let ev of evs) {
            assert.doesNotThrow(() => {
                ev.on('stable', (b) => got.push(b))
                ev.create()
            })
        }
        await delay(250)
        let rs = evs.map((ev) => ev.dispose())
        assert.strict.deepStrictEqual([evs.map((ev) => ev instanceof Promise), evs.map((ev) => ev.error), got, rs], [[false, false], ['invalid element', 'invalid element.getBoundingClientRect'], [], [true, true]])
    })

    it(`should start the first round right after create, before any timer, and only once however often create is called`, async function() {
        //create於microtask啟動第一輪(不等50ms輪詢與首個間隔); 重複create不並存兩份輪詢; dispose後create無效; dispose後無存活之計時器
        //  假時鐘下a、b於同一假時刻鎖步啟動, 兩者之事件序列(含各事件時刻)須完全相同, 且輪起點恰為每timeDetect(30ms)一輪(原以500ms窗內取樣次數比值0.7~1.3, 輪數少時越界)
        let clock = useFakeClock()
        let iv = trackIntervals() //須於啟用假時鐘後包裝, 追蹤的是假時鐘之setInterval
        try {
            let a = countRect(new FakeEle())
            let b = countRect(new FakeEle())
            let c = countRect(new FakeEle())
            let ta = mkRec()
            let tb = mkRec()
            let tc = mkRec()
            let ea = domIsStable(a, { mode: 'event', timeDiff: 20, timeDetect: 30, onTrace: ta.on })
            let eb = domIsStable(b, { mode: 'event', timeDiff: 20, timeDetect: 30, onTrace: tb.on })
            let ec = domIsStable(c, { mode: 'event', timeDiff: 20, timeDetect: 30, onTrace: tc.on })
            ea.create()
            let nAtCreate = [a.n, ta.events.length]
            await Promise.resolve()
            let nAfterMicrotask = [a.n, ta.types()]
            eb.create()
            eb.create()
            ec.dispose()
            ec.create()
            await flush() //b於microtask啟動後再推進, 使a、b同於第0ms起算(advance之首個tick會先於未執行之microtask)
            await clock.advance(500)
            let during = iv.active()
            ea.dispose()
            eb.dispose()
            assert.strict.deepStrictEqual([nAtCreate, nAfterMicrotask, c.n, tc.events.length, during, iv.active()], [[0, 0], [1, ['round', 'rect']], 0, 0, 2, 0])
            assert.strict.deepStrictEqual(byType(ta, 'round').map((e) => e.t), Array.from({ length: 17 }, (_, i) => i * 30)) //第一輪於create之microtask(第0ms), 其後每30ms一輪
            assert.strict.deepStrictEqual([tb.events, tb.ts], [ta.events, ta.ts]) //b重複create仍只一份輪詢, 與a逐事件相同
            let nEv = ta.events.length
            await clock.advance(100)
            assert.strict.deepStrictEqual([ta.types().pop(), ta.events.length, tb.events.length], ['dispose', nEv, nEv]) //dispose後不再有事件
        }
        finally {
            iv.restore()
            clock.restore()
        }
    })

    it(`should not start another round while one is still waiting for an animation`, async function() {
        //前一輪未完(等待動畫結束)不另起新輪: 輪詢間隔30ms, 動畫400ms, 期間只有第一輪之兩次取點
        let el = countRect(new FakeEle())
        el.anims = [mkAnim({ msFinish: 400 })]
        let ev = domIsStable(el, { mode: 'event', timeDiff: 20, timeDetect: 30 })
        ev.create()
        await delay(300)
        let n = el.n
        ev.dispose()
        assert.strict.deepStrictEqual(n, 2)
    })

    it(`should measure an element inserted after create from its insertion`, async function() {
        //Vue 2指令於bind時create而元素其後才插入: 第一輪於microtask起量(此時已插入), 不以未插入之0尺寸白費一輪
        //  假時鐘下驗: 第一次取樣即為插入後之尺寸, 且首次stable=true恰於timeDiff(50ms)後(原斷言真實時間tFirst<90)
        let clock = useFakeClock()
        try {
            let el = new FakeEle()
            el.rect = { left: 0, top: 0, width: 0, height: 0 }
            let rec = mkRec()
            let ev = domIsStable(el, { mode: 'event', timeDiff: 50, timeDetect: 50, onTrace: rec.on })
            let got = []
            ev.on('stable', (b) => {
                got.push([b, Date.now()])
            })
            ev.create()
            el.rect = { left: 0, top: 0, width: 100, height: 100 } //同一輪之同步流程內插入
            await flush()
            await clock.advance(50)
            ev.dispose()
            assert.strict.deepStrictEqual(byType(rec, 'rect').filter((e) => e.seq === 1).map((e) => [e.at, e.w, e.h]), [[1, 100, 100], [2, 100, 100], [3, 100, 100]])
            assert.strict.deepStrictEqual(got, [[true, 50]])
        }
        finally {
            clock.restore()
        }
    })

    it(`should report a throwing stable listener instead of swallowing it, and keep detecting`, async function() {
        //監聽器拋錯經evEmit: 有error監聽者則發出error事件, 不被吞掉亦不中斷偵測
        //  假時鐘使「輪詢鏈」與「測試自帶之transition計時器」之先後確定(原以真實delay(200)、delay(700)與輪詢鏈競爭)
        let clock = useFakeClock()
        try {
            let el = new FakeEle()
            let rec = mkRec()
            let ev = domIsStable(el, { mode: 'event', timeDiff: 20, timeDetect: 30, onTrace: rec.on })
            let seq = []
            let errs = []
            let boom = true
            ev.on('stable', (b) => {
                if (boom) {
                    boom = false
                    throw new Error('stable boom')
                }
                seq.push(b)
            })
            ev.on('error', (e) => errs.push(e.msg.message))
            ev.create()
            await flush()
            await advanceUntil(clock, () => rec.types().includes('emit')) //第一次stable(true)之監聽器拋錯
            assert.strict.deepStrictEqual([errs, seq], [['stable boom'], []])
            await clock.advance(185) //第205ms
            startTransition(el, { msPending: 20, ms: 200 })
            await advanceUntil(clock, () => seq.length >= 2, 700)
            ev.dispose()
            assert.strict.deepStrictEqual([errs, seq], [['stable boom'], [false, true]])
            assert.strict.deepStrictEqual(byType(rec, 'emit').map((e) => e.stable), [true, false, true]) //拋錯之emit亦已通知, 偵測未中斷
        }
        finally {
            clock.restore()
        }
    })

    it(`should use the defaults for invalid numeric options, and accept numeric strings`, async function() {
        //tolerance非有效非負數(含null、布林)→0(靜止元素仍穩定), Infinity保留(任何變化皆容許); timeDiff非有效(含null)→100, 0為有效(w-component-vue亦視0為有效), 負數視為0; 數字字串照常
        //  timeDiff之落定時刻(距呼叫之ms)於假時鐘下確定: 無效與null為預設100, 0與負數為立即(第一個計時器時機, 不是預設100), '20'為20(原以真實時間之上界dt<50、dt<100)
        let clock = useFakeClock()
        try {
            let el = new FakeEle()
            let out = []
            for (let v of ['abc', -1, NaN, null, true]) {
                out.push((await runPm(clock, el, { tolerance: v })).v)
            }
            let tDiff = async (timeDiff) => {
                let r = await runPm(clock, el, { timeDiff })
                return r.settled ? r.t : -1
            }
            let tBad = await tDiff('abc')
            let tNull = await tDiff(null)
            let tNeg = await tDiff(-5)
            let tZero = await tDiff(0)
            let tStr = await tDiff('20')
            let moving = async (tolerance) => {
                setTimeout(() => {
                    el.rect = { ...el.rect, left: el.rect.left + 0.5 }
                }, 50)
                return (await runPm(clock, el, { tolerance })).v
            }
            let bStrTol = await moving('1')
            let bInfTol = await moving(Infinity)
            let bZeroTol = await moving(0)
            assert.strict.deepStrictEqual(out, [true, true, true, true, true])
            assert.strict.deepStrictEqual([tBad, tNull, tNeg >= 0 && tNeg <= 1, tZero >= 0 && tZero <= 1, tStr, bStrTol, bInfTol, bZeroTol], [100, 100, true, true, 20, true, true, false], `bad=${tBad} null=${tNull} neg=${tNeg} zero=${tZero} str=${tStr}`)
        }
        finally {
            clock.restore()
        }
    })

    it(`should use the default interval for an invalid timeDetect`, async function() {
        //timeDetect非有效正數(0、負數、非數字、null)→50, 不成高頻輪詢
        //  假時鐘下各偵測器於同一假時刻鎖步啟動, 其事件序列(含各事件時刻)須與timeDetect:50者完全相同, 且輪起點恰為每50ms一輪(原以500ms窗內取樣次數比值<1.3)
        let clock = useFakeClock()
        try {
            let vals = [50, 0, -5, 'x', null]
            let recs = vals.map(() => mkRec())
            let dets = vals.map((timeDetect, i) => domIsStable(new FakeEle(), { mode: 'event', timeDiff: 10, timeDetect, onTrace: recs[i].on }))
            for (let ev of dets) {
                ev.create()
            }
            await flush()
            await clock.advance(500)
            for (let ev of dets) {
                ev.dispose()
            }
            assert.strict.deepStrictEqual(byType(recs[0], 'round').map((e) => e.t), Array.from({ length: 11 }, (_, i) => i * 50))
            for (let i = 1; i < vals.length; i++) {
                assert.strict.deepStrictEqual([recs[i].events, recs[i].ts], [recs[0].events, recs[0].ts], `timeDetect=${String(vals[i])}`)
            }
        }
        finally {
            clock.restore()
        }
    })

    //--- 觀察回調(onTrace) ---

    it(`should notify rounds, samples, judgements, skips, emits and dispose through onTrace with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉, 同一輪以seq對應; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let clock = useFakeClock()
        try {
            let rec = mkRec()
            let meta = []
            let onTrace = function(e) {
                meta.push([this, Object.isFrozen(e)])
                rec.on(e)
            }
            let brief = (n) => rec.events.slice(n).map((e) => [e.type, ...Object.keys(e).filter((k) => k !== 'type').map((k) => e[k])])

            //promise模式: 三次位置各不相同(0、5、9), 有一個動畫橫跨第二次取樣(第40ms)並於第70ms結束
            let el = new FakeEle()
            el.anims.push(mkAnim({ msFinish: 70 }))
            setTimeout(() => {
                el.rect = { ...el.rect, left: 5 }
            }, 10)
            setTimeout(() => {
                el.rect = { ...el.rect, left: 9 }
            }, 60)
            let r1 = await settle(clock, domIsStable(el, { timeDiff: 40, onTrace }))
            assert.strict.deepStrictEqual([r1.settled, r1.v, r1.t], [true, false, 70]) //等動畫結束(第70ms)才判定
            assert.strict.deepStrictEqual(brief(0), [
                ['round', 1],
                ['rect', 1, 1, 0, 0, 100, 100],
                ['rect', 1, 2, 5, 0, 100, 100],
                ['anims', 1, 1, 1],
                ['anims', 1, 2, 0],
                ['rect', 1, 3, 9, 0, 100, 100],
                ['judge', 1, false, true],
            ])

            //promise模式: 量測拋錯(第二次取點拋錯)→fail後reject
            let n = rec.mark()
            let bad = new FakeEle()
            let k = 0
            let g = bad.getBoundingClientRect.bind(bad)
            bad.getBoundingClientRect = () => {
                k++
                if (k === 2) {
                    throw new Error('rect boom')
                }
                return g()
            }
            let r2 = await settle(clock, domIsStable(bad, { timeDiff: 40, onTrace }))
            assert.strict.deepStrictEqual([r2.settled, r2.err], [true, 'rect boom'])
            assert.strict.deepStrictEqual(brief(n), [
                ['round', 1],
                ['rect', 1, 1, 0, 0, 100, 100],
                ['fail', 1],
            ])

            //event模式: timeDiff 40、timeDetect 30, 第30ms之輪詢遇第一輪未完而略過; 第40ms判穩定而emit true; 第45ms釋放
            n = rec.mark()
            let ev = domIsStable(new FakeEle(), { mode: 'event', timeDiff: 40, timeDetect: 30, onTrace })
            let atListener = []
            ev.on('stable', (b) => {
                atListener.push([b, rec.types().pop()])
            })
            ev.create()
            await flush()
            await clock.advance(45)
            ev.dispose()
            assert.strict.deepStrictEqual(brief(n), [
                ['round', 1],
                ['rect', 1, 1, 0, 0, 100, 100],
                ['skip', 1, 'busy'],
                ['rect', 1, 2, 0, 0, 100, 100],
                ['anims', 1, 1, 0],
                ['anims', 1, 2, 0],
                ['rect', 1, 3, 0, 0, 100, 100],
                ['judge', 1, true, false],
                ['emit', 1, true],
                ['done', 1],
                ['dispose', 1],
            ])
            assert.strict.deepStrictEqual(atListener, [[true, 'emit']]) //emit事件先於監聽器之派發

            //各type之欄位固定且皆為原始值, 皆凍結, this為undefined
            let keys = {}
            for (let e of rec.events) {
                keys[e.type] = Object.keys(e).join(',')
                assert.strict.deepStrictEqual(Object.values(e).every((v) => v === null || typeof v !== 'object'), true)
            }
            assert.strict.deepStrictEqual(keys, {
                round: 'type,seq',
                rect: 'type,seq,at,x,y,w,h',
                anims: 'type,seq,at,n',
                judge: 'type,seq,stable,moved',
                fail: 'type,seq',
                skip: 'type,seq,reason',
                emit: 'type,seq,stable',
                done: 'type,seq',
                dispose: 'type,seq',
            })
            assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
        }
        finally {
            clock.restore()
        }
    })

    it(`should not notify after dispose, even for the round still in flight`, async function() {
        //JSDoc opt.onTrace: 釋放後不再通知(進行中之一輪亦然), 重複dispose不重複通知
        let clock = useFakeClock()
        try {
            let rec = mkRec()
            let seq = []
            let ev = domIsStable(new FakeEle(), { mode: 'event', timeDiff: 100, timeDetect: 30, onTrace: rec.on })
            ev.on('stable', (b) => {
                seq.push(b)
            })
            ev.create()
            await flush()
            await clock.advance(10) //第一輪已取第一次位置, 等待相隔timeDiff之第二次取樣
            assert.strict.deepStrictEqual(ev.dispose(), true)
            assert.strict.deepStrictEqual(ev.dispose(), true)
            await clock.advance(500) //原先排定之第二次取樣(第100ms)與輪詢皆已不影響
            assert.strict.deepStrictEqual([rec.types(), seq], [['round', 'rect', 'dispose'], []])
        }
        finally {
            clock.restore()
        }
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為(結果與時序)不變; P4: 回調之拋錯與回傳值不影響偵測、不產生未處理之rejection
        //以假時鐘使各次執行之時序相同, 同一情境涵蓋promise模式(靜止、位移、動畫中、元素無效、量測拋錯)與event模式(穩定、不穩定、再穩定)
        let scenario = async (onTrace) => {
            let clock = useFakeClock()
            try {
                let opt = onTrace === undefined ? {} : { onTrace }
                let out = {}
                let el = new FakeEle()
                out.still = await settle(clock, domIsStable(el, opt))
                setTimeout(() => {
                    el.rect = { ...el.rect, left: 50 }
                }, 50)
                out.moved = await settle(clock, domIsStable(el, opt))
                startTransition(el, { msPending: 0, ms: 300, dx: 0 })
                out.anim = await settle(clock, domIsStable(el, opt))
                let invalid = new FakeEle()
                invalid.getBoundingClientRect = null
                out.invalid = await settle(clock, domIsStable(invalid, opt))
                let k = 0
                let thrower = new FakeEle()
                let g = thrower.getBoundingClientRect.bind(thrower)
                thrower.getBoundingClientRect = () => {
                    k++
                    if (k === 2) {
                        throw new Error('rect boom')
                    }
                    return g()
                }
                out.thrown = await settle(clock, domIsStable(thrower, opt))
                let el2 = new FakeEle()
                let seq = []
                let ev = domIsStable(el2, { ...opt, mode: 'event', timeDiff: 40, timeDetect: 30 })
                ev.on('stable', (b) => {
                    seq.push([b, Date.now()])
                })
                ev.create()
                await clock.advance(100)
                startTransition(el2, { msPending: 10, ms: 100 })
                await clock.advance(400)
                ev.dispose()
                out.seq = seq
                return out
            }
            finally {
                clock.restore()
            }
        }
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let a = null
        let rec = traceRec()
        let rs = []
        try {
            a = await scenario(undefined)
            rs.push(await scenario(rec.on))
            rs.push(await scenario(() => {
                throw new Error('trace boom')
            }))
            rs.push(await scenario(() => Promise.reject(new Error('trace reject'))))
            rs.push(await scenario('abc'))
            await new Promise((resolve) => setImmediate(resolve))
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        assert.strict.deepStrictEqual(rs, [a, a, a, a])
        assert.strict.deepStrictEqual(un, [])
        //情境本身須有意義: 各結果如規格, 且記錄器收到各type之事件
        assert.strict.deepStrictEqual([a.still.v, a.moved.v, a.anim.v, a.invalid.err, a.thrown.err, a.seq.map((x) => x[0])], [true, false, false, 'invalid element.getBoundingClientRect', 'rect boom', [true, false, true]])
        assert.strict.deepStrictEqual(Array.from(new Set(rec.types())).sort(), ['anims', 'dispose', 'done', 'emit', 'fail', 'judge', 'rect', 'round', 'skip'])
    })

})
