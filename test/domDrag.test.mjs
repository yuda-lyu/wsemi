import assert from 'assert'
import domDrag from '../src/domDrag.mjs'
import { mkFakeDom, clearFakeDom, trackIntervals, tick } from './tools/fakeDom.mjs'
import { useFakeClock } from './tools/timeKit.mjs'
import { mkRec, fiveOnTrace, watchUnhandled, mkMeta, flush, keysByType, allPrimitive } from './tools/domDragTraceKit.mjs'


let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))


let KINDS = ['change', 'start', 'enter', 'leave', 'move', 'drop']


//listenAll, 記錄實例之全部事件(change記為change:mode)
function listenAll(d, rec) {
    for (let k of KINDS) {
        d.on(k, (m) => rec.push(k === 'change' ? `change:${m.mode}` : k))
    }
}


//mkItems, 於body下建立n個項目(帶dragindex)並綁定同一群組; 項目i之座標點為(10, 10+50i), 其堆疊為[項目, body]
//  withChild時項目內另有子元素, 子元素之座標點為(20, 10+50i), 其堆疊為[子元素, 項目, body]
function mkItems(env, n, group, o = {}) {
    let items = []
    for (let i = 0; i < n; i++) {
        let el = env.body.appendChild(new env.Ele('div', { rect: { left: 0, top: 50 * i, width: 100, height: 40 } }))
        el.setAttribute('dragindex', String(i))
        let pt = { x: 10, y: 10 + 50 * i }
        env.setStack(pt.x, pt.y, [el, env.body])
        let child = null
        let ptChild = null
        if (o.withChild) {
            child = el.appendChild(new env.Ele('span', { rect: { left: 15, top: 50 * i + 5, width: 20, height: 20 } }))
            ptChild = { x: 20, y: 10 + 50 * i }
            env.setStack(ptChild.x, ptChild.y, [child, el, env.body])
        }
        let it = { el, pt, child, ptChild, rec: [], opt: { group, timeDragStartDelay: 5, ...(o.opt || {}) } }
        it.bind = (rec = it.rec) => {
            it.d = domDrag(el, it.opt)
            listenAll(it.d, rec)
            return it.d
        }
        it.bind()
        items.push(it)
    }
    return items
}


//mouse, 真實滑鼠事件: 帶clientX/Y、pageX/Y、isTrusted, 且非由觸控補發(sourceCapabilities.firesTouchEvents為false); 按下與移動時主鍵按住(buttons為1)
let mp = (pt, o = {}) => ({ clientX: pt.x, clientY: pt.y, pageX: pt.x, pageY: pt.y, isTrusted: true, sourceCapabilities: { firesTouchEvents: false }, ...o })
let mouse = (env) => ({
    press: (it, pt = it.pt, o = {}) => it.el.dispatch('mousedown', mp(pt, { button: 0, buttons: 1, ...o })),
    move: (pt, o = {}) => env.winDispatch('mousemove', mp(pt, { buttons: 1, ...o })),
    up: (pt, o = {}) => env.winDispatch('mouseup', mp(pt, { button: 0, buttons: 0, ...o })),
})


//touch, 觸控事件先到起手元素再送達window(target固定為起手元素)
let touch = (env) => ({
    start: (it, t, all) => env.bubble([it.el], 'touchstart', { touch: t, all }, true),
    move: (from, t, all) => env.bubble([from.el], 'touchmove', { touch: t, all }, true),
    end: (from, t, all) => env.bubble([from.el], 'touchend', { touch: t, all }, true),
    cancel: (from, t) => env.bubble([from.el], 'touchcancel', { touch: t }, true),
})


let opacity = (env) => {
    let c = env.body.children.find((x) => x.getAttribute('dragpreviewid') !== null)
    return c ? c.style.opacity : null
}


let events = (rec) => rec.filter((x) => !x.startsWith('change'))


describe(`domDrag`, function() {

    let iv = null
    let all = []

    beforeEach(function() {
        iv = trackIntervals()
        all = []
    })

    afterEach(async function() {
        for (let d of all) {
            d.unbind()
        }
        await tick()
        iv.restore()
    })

    after(function() {
        clearFakeDom()
    })

    //--- 遞送 ---

    it(`should deliver events only to the target element, change before each event`, async function() {
        //事件只送達落點元素; 先change後該事件
        let env = mkFakeDom()
        let [a, b, c] = mkItems(env, 3, 't1')
        all.push(a.d, b.d, c.d)
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        m.move(b.pt)
        m.up(b.pt)
        assert.strict.deepStrictEqual([a.rec, b.rec, c.rec], [['change:start', 'start'], ['change:enter', 'enter', 'change:move', 'move', 'change:drop', 'drop'], []])
    })

    it(`should deliver once to the current binding after many rebinds, nothing to old ones, with no listener left behind`, async function() {
        //重建不累積遞送與監聽, 舊實例收不到
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't2')
        let nEle = a.el.nListeners()
        let olds = []
        for (let k = 0; k < 50; k++) {
            a.d.unbind()
            let r = []
            olds.push(r)
            a.bind(k === 49 ? a.rec : r)
        }
        all.push(a.d, b.d)
        a.rec.length = 0
        let m = mouse(env)
        m.press(b)
        await sleep(20)
        m.move(a.pt)
        m.up(a.pt)
        assert.strict.deepStrictEqual([a.rec.filter((x) => x === 'drop').length, olds.slice(0, 49).every((r) => r.length === 0), a.el.nListeners(), nEle, env.nWinListeners()], [1, true, nEle, 3, 0])
    })

    it(`should not deliver the event itself when the change listener unbinds the target`, async function() {
        //change之監聽器內解除落點: 不再送該事件
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't3')
        all.push(a.d)
        b.d.on('change', (m) => {
            if (m.mode === 'enter') {
                b.d.unbind()
            }
        })
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        m.up(b.pt)
        assert.strict.deepStrictEqual(b.rec, ['change:enter'])
    })

    //--- 解除與重綁 ---

    it(`should remove its attributes after unbind, keep those of a newer binding, and tolerate a second unbind`, async function() {
        //解除後(下一個microtask)移除本實例之屬性; 同元素已由新實例綁定(同群組或異群組)時不動; 可重複解除; clear同unbind
        let env = mkFakeDom()
        let [a] = mkItems(env, 1, 't4')
        a.d.unbind()
        await tick()
        let after1 = [a.el.getAttribute('draggroup'), a.el.getAttribute('dragid'), a.el.nListeners()]
        assert.doesNotThrow(() => a.d.unbind())
        let d1 = domDrag(a.el, { group: 't4' })
        let d2 = domDrag(a.el, { group: 't4' })
        d1.unbind()
        await tick()
        let keptSame = [a.el.getAttribute('draggroup'), a.el.getAttribute('dragid') !== null]
        let d3 = domDrag(a.el, { group: 't4b' })
        d2.clear()
        await tick()
        let keptOther = [a.el.getAttribute('draggroup'), a.el.getAttribute('dragid') !== null]
        d3.clear()
        await tick()
        assert.strict.deepStrictEqual([after1, keptSame, keptOther, a.el.getAttribute('dragid'), a.el.getAttribute('draggroup')], [[null, null, 0], ['t4', true], ['t4b', true], null, null])
    })

    it(`should write the group attribute once across rebinds in the same tick`, async function() {
        //宿主重繪時先解除再重建: 群組屬性值未變不重寫、不先移除, 每次重建只改識別屬性
        let env = mkFakeDom()
        let [a] = mkItems(env, 1, 't4c')
        for (let k = 0; k < 5; k++) {
            a.d.unbind()
            a.bind()
        }
        all.push(a.d)
        await tick()
        assert.strict.deepStrictEqual([a.el.nSet.get('draggroup'), a.el.nSet.get('dragid'), a.el.getAttribute('draggroup')], [1, 6, 't4c'])
    })

    it(`should not treat an unbound element, or a copy carrying its attributes, as a target`, async function() {
        //已解除(仍在頁面)之元素不為落點, 其舊實例不收事件, 預覽為不可放; 複製而帶有成員屬性之元素亦非成員
        let env = mkFakeDom()
        let [a, b, c] = mkItems(env, 3, 't5')
        all.push(a.d, c.d)
        b.d.unbind()
        let copy = env.body.appendChild(c.el.cloneNode(true))
        let ptCopy = { x: 10, y: 500 }
        env.setStack(ptCopy.x, ptCopy.y, [copy, env.body])
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        let op1 = opacity(env)
        m.move(ptCopy)
        let op2 = opacity(env)
        m.up(ptCopy)
        assert.strict.deepStrictEqual([b.rec, c.rec, events(a.rec), op1, op2], [[], [], ['start'], 0.2, 0.2])
    })

    it(`should clean up when the last element unbinds, even within the preview delay`, async function() {
        //最後一員解除: 會話監聽、延遲計時器、預覽皆清除
        let env = mkFakeDom()
        let [a] = mkItems(env, 1, 't6', { opt: { timeDragStartDelay: 30 } })
        let m = mouse(env)
        m.press(a)
        a.d.unbind()
        await sleep(60)
        m.move(a.pt)
        m.up(a.pt)
        assert.strict.deepStrictEqual([env.previews(), env.nWinListeners(), a.el.nListeners(), iv.active()], [0, 0, 0, 0])
    })

    it(`should keep dragging when every element is unbound and bound again one by one, as a host re-render does`, async function() {
        //w-component-vue之v-domdragdrop於宿主每次重繪逐元素clear→init: 拖曳延續, 之後之事件送達新實例, 舊實例收不到
        let env = mkFakeDom()
        let [a, b, c] = mkItems(env, 3, 't7')
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        let rebindEach = () => {
            for (let it of [a, b, c]) {
                it.d.unbind()
                it.rec = []
                it.bind()
            }
        }
        m.move(b.pt)
        let b1 = b.rec
        rebindEach()
        let b2 = b.rec
        m.move(b.pt)
        m.move(c.pt)
        let c2 = c.rec
        rebindEach()
        await tick()
        let pv = env.previews()
        m.up(c.pt)
        all.push(a.d, b.d, c.d)
        assert.strict.deepStrictEqual([events(b1), events(b2), events(c2), events(c.rec), pv, env.previews()], [['enter'], ['move', 'leave'], ['enter'], ['drop'], 1, 0])
    })

    it(`should keep dragging when all elements are unbound and then all bound again in the same tick`, async function() {
        //群組一度清空: 刪除延後一個microtask, 同一輪內重建即沿用群組與拖曳
        let env = mkFakeDom()
        let items = mkItems(env, 3, 't7b')
        let [a, , c] = items
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        for (let it of items) {
            it.d.unbind()
        }
        for (let it of items) {
            it.rec = []
            it.bind()
        }
        await tick()
        let pv = env.previews()
        m.move(c.pt)
        m.up(c.pt)
        all.push(...items.map((it) => it.d))
        assert.strict.deepStrictEqual([pv, events(c.rec), env.previews()], [1, ['enter', 'drop'], 0])
    })

    it(`should cancel when the source is unbound and not bound again, with leave for the item it was over`, async function() {
        //拖曳中來源解除且未重建: 移動、放開或延遲建立預覽前即取消(解除後之microtask亦取消), 不發drop; 經過中之項目收到leave
        let env = mkFakeDom()
        let [a, b, c] = mkItems(env, 3, 't8')
        all.push(c.d)
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        a.d.unbind()
        m.move(b.pt)
        let pvMove = env.previews()
        let evMove = events(b.rec)
        m.up(b.pt)
        let dropMove = b.rec.includes('drop')
        m.press(b)
        b.d.unbind()
        await sleep(20)
        let pvTimer = env.previews()
        m.move(c.pt)
        m.up(c.pt)
        assert.strict.deepStrictEqual([pvMove, evMove, dropMove, pvTimer, c.rec, env.nWinListeners()], [0, ['enter', 'leave'], false, 0, [], 0])
    })

    it(`should remove the preview right after the source is unbound, without waiting for the pointer to move`, async function() {
        //來源解除且未重建: 解除後之microtask即取消, 靜止之指標下亦移除預覽
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't8b')
        all.push(b.d)
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        let before = env.previews()
        a.d.unbind()
        await tick()
        assert.strict.deepStrictEqual([before, env.previews(), env.nWinListeners()], [1, 0, 0])
    })

    it(`should ignore setIsActive after unbind`, async function() {
        //解除後呼叫setIsActive無作用且不拋錯, 不影響其他成員
        let env = mkFakeDom()
        let [a, b, c] = mkItems(env, 3, 't9')
        all.push(b.d, c.d)
        a.d.unbind()
        assert.doesNotThrow(() => a.d.setIsActive(false))
        let [x] = mkItems(env, 1, 't9x')
        x.d.unbind()
        await tick()
        assert.doesNotThrow(() => x.d.setIsActive(false))
        let m = mouse(env)
        m.press(b)
        await sleep(20)
        m.move(c.pt)
        m.up(c.pt)
        assert.strict.deepStrictEqual(events(c.rec), ['enter', 'drop'])
    })

    it(`should create no preview and clean up when the start listener unbinds the only element`, async function() {
        //start之監聽器內解除: 不建立預覽, 會話結束
        let env = mkFakeDom()
        let [a] = mkItems(env, 1, 't10')
        a.d.on('start', () => {
            a.d.unbind()
        })
        mouse(env).press(a)
        await sleep(30)
        assert.strict.deepStrictEqual([env.previews(), env.nWinListeners(), iv.active()], [0, 0, 0])
    })

    it(`should accept any string as the group name`, async function() {
        //群組鍵不與物件原型之鍵衝突
        let env = mkFakeDom()
        let out = []
        for (let gname of ['toString', '__proto__', 'constructor', 'hasOwnProperty']) {
            let items = null
            assert.doesNotThrow(() => {
                items = mkItems(env, 2, gname)
            }, gname)
            let [a, b] = items
            let m = mouse(env)
            m.press(a)
            await sleep(20)
            m.move(b.pt)
            m.up(b.pt)
            out.push(events(b.rec).join(','))
            a.d.unbind()
            b.d.unbind()
            a.el.remove()
            b.el.remove()
        }
        await tick()
        assert.strict.deepStrictEqual([out, env.nWinListeners()], [['enter,drop', 'enter,drop', 'enter,drop', 'enter,drop'], 0])
    })

    //--- 判定 ---

    it(`should hit the item alike over the item itself and its child, by mouse or by touch`, async function() {
        //經過項目自身與其子元素皆為同一落點, 無enter/leave交替; 觸控同; 觸控每次移動只處理一次; 只於本次觸控拖曳中阻止捲動
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't11', { withChild: true })
        all.push(a.d, b.d)
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        for (let pt of [b.ptChild, b.pt, b.ptChild, b.pt]) {
            m.move(pt)
        }
        m.up(b.pt)
        let mouseSeq = events(b.rec)
        b.rec.length = 0
        let t = touch(env)
        t.start(a, { ...a.pt, id: 1 })
        await sleep(20)
        let pre = []
        for (let pt of [b.ptChild, b.pt]) {
            pre.push(t.move(a, { ...pt, id: 1 }).defaultPrevented)
        }
        t.end(a, { ...b.pt, id: 1 })
        let touchSeq = events(b.rec)
        let after = t.move(a, { ...b.pt, id: 1 }).defaultPrevented
        assert.strict.deepStrictEqual([mouseSeq, touchSeq, pre, after], [['enter', 'move', 'move', 'move', 'drop'], ['enter', 'move', 'drop'], [true, true], false])
    })

    it(`should skip an element without a valid index and hit the element under it`, async function() {
        //未帶順序指標(或非有限數字)之元素不可為起點或落點, 且不阻擋其下之成員
        let env = mkFakeDom()
        let [a, b, c] = mkItems(env, 3, 't12')
        all.push(a.d, b.d, c.d)
        c.el.setAttribute('dragindex', 'Infinity')
        let inner = b.el.appendChild(new env.Ele('div'))
        inner.setAttribute('dragindex', 'x')
        let di = domDrag(inner, { group: 't12', timeDragStartDelay: 5 })
        all.push(di)
        let recInner = []
        listenAll(di, recInner)
        let ptInner = { x: 30, y: 60 }
        env.setStack(ptInner.x, ptInner.y, [inner, b.el, env.body])
        let m = mouse(env)
        b.el.removeAttribute('dragindex')
        m.press(b)
        await sleep(20)
        let startedFromB = b.rec.length > 0
        m.up(b.pt)
        b.el.setAttribute('dragindex', '1')
        m.press(a)
        await sleep(20)
        m.move(ptInner)
        m.move(c.pt)
        m.up(c.pt)
        assert.strict.deepStrictEqual([startedFromB, events(b.rec), recInner, c.rec], [false, ['enter', 'leave'], [], []])
    })

    it(`should see through elements outside the group, for passing over and for dropping alike`, async function() {
        //不屬本群組之元素(如遮罩)不阻擋其下之成員, 經過與放下相同
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't12b')
        all.push(a.d, b.d)
        let mask = env.body.appendChild(new env.Ele('div'))
        env.setStack(b.pt.x, b.pt.y, [mask, b.el, env.body])
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        let op = opacity(env)
        m.up(b.pt)
        assert.strict.deepStrictEqual([events(b.rec), op], [['enter', 'drop'], 0.4])
    })

    it(`should start from and hit the innermost element when elements are nested, even across groups`, async function() {
        //巢狀成員: 同一按下由最內層起手(外層不再起手, 跨群組亦同, 同時只一個拖曳); 經過時最內層為落點
        let env = mkFakeDom()
        let [outer, other] = mkItems(env, 2, 't13')
        let inner = outer.el.appendChild(new env.Ele('div', { rect: { left: 5, top: 5, width: 30, height: 20 } }))
        inner.setAttribute('dragindex', '5')
        let di = domDrag(inner, { group: 't13', timeDragStartDelay: 5 })
        let recInner = []
        listenAll(di, recInner)
        let inner2 = inner.appendChild(new env.Ele('div'))
        inner2.setAttribute('dragindex', '0')
        let dx = domDrag(inner2, { group: 't13x', timeDragStartDelay: 5 })
        let recX = []
        listenAll(dx, recX)
        all.push(outer.d, other.d, di, dx)
        let ptInner = { x: 12, y: 12 }
        env.setStack(ptInner.x, ptInner.y, [inner, outer.el, env.body])
        env.bubble([inner, outer.el], 'mousedown', mp(ptInner, { button: 0, buttons: 1 }))
        await sleep(20)
        let m = mouse(env)
        m.move(other.pt)
        m.up(other.pt)
        let startedInner = events(recInner)
        let startedOuter = events(outer.rec)
        other.rec.length = 0
        recInner.length = 0
        m.press(other)
        await sleep(20)
        m.move(ptInner)
        m.up(ptInner)
        let dropInner = [events(recInner), events(outer.rec)]
        recInner.length = 0
        env.bubble([inner2, inner, outer.el], 'mousedown', mp(ptInner, { button: 0, buttons: 1 }))
        await sleep(20)
        let previews = env.previews()
        m.up(ptInner)
        assert.strict.deepStrictEqual([startedInner, startedOuter, dropInner, events(recX), events(recInner), previews], [['start'], [], [['enter', 'drop'], []], ['start'], [], 1])
    })

    //--- 輸入 ---

    it(`should start only with the primary mouse button and ignore other buttons released during the drag`, async function() {
        //滑鼠只處理主鍵: 中鍵、右鍵不起手; 拖曳中其他鍵放開不影響; 無button之合成事件可起手
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't14')
        all.push(a.d, b.d)
        let m = mouse(env)
        m.press(a, a.pt, { button: 2, buttons: 2 })
        m.press(a, a.pt, { button: 1, buttons: 4 })
        let startsByOther = events(a.rec).length
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        m.up(b.pt, { button: 2, buttons: 1 })
        let dropByOther = b.rec.includes('drop')
        m.up(b.pt)
        let dropByPrimary = events(b.rec).filter((x) => x === 'drop').length
        a.rec.length = 0
        a.el.dispatch('mousedown', { clientX: 10, clientY: 10, pageX: 10, pageY: 10, sourceCapabilities: { firesTouchEvents: false } })
        let startSynthetic = events(a.rec)
        m.up(a.pt)
        assert.strict.deepStrictEqual([startsByOther, dropByOther, dropByPrimary, startSynthetic], [0, false, 1, ['start']])
    })

    it(`should end the drag when a real move shows the primary button was released out of sight`, async function() {
        //主鍵已放開(於視窗外放開而收不到mouseup): 下一個真實移動即結束並對經過中之項目發leave, 不發drop; 合成事件(非isTrusted)不因buttons為0而結束
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't15')
        all.push(a.d, b.d)
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        env.winDispatch('mousemove', { clientX: b.pt.x, clientY: b.pt.y, buttons: 0 })
        let enterSynthetic = events(b.rec)
        m.move(b.pt, { buttons: 0 })
        let pv = env.previews()
        m.up(b.pt)
        assert.strict.deepStrictEqual([enterSynthetic, events(b.rec), pv, env.nWinListeners()], [['enter'], ['enter', 'leave'], 0, 0])
    })

    it(`should follow only the finger that started, ignoring other fingers`, async function() {
        //觸控以起手手指鎖定: 他指落下(另一項目)不接手, 他指移動與放開不影響, 起手手指放開才發drop
        let env = mkFakeDom()
        let [a, b, c] = mkItems(env, 3, 't16')
        all.push(a.d, b.d, c.d)
        let t = touch(env)
        t.start(a, { ...a.pt, id: 1 })
        await sleep(20)
        t.start(c, { ...c.pt, id: 2 }, [{ ...a.pt, id: 1 }, { ...c.pt, id: 2 }])
        let startC = events(c.rec)
        t.move(a, { ...b.pt, id: 1 }, [{ ...b.pt, id: 1 }, { ...c.pt, id: 2 }])
        t.move(c, { ...a.pt, id: 2 }, [{ ...b.pt, id: 1 }, { ...a.pt, id: 2 }])
        t.end(c, { ...c.pt, id: 2 }, [{ ...b.pt, id: 1 }])
        let beforeEnd = [events(b.rec), events(c.rec), env.previews()]
        t.end(a, { ...b.pt, id: 1 }, [])
        assert.strict.deepStrictEqual([startC, beforeEnd, events(b.rec), env.previews()], [[], [['enter'], [], 1], ['enter', 'drop'], 0])
    })

    it(`should let a new touch take over when the starting finger is gone, and let the mouse take over a touch`, async function() {
        //起手手指已離開(放開事件遺失)時新觸控接手; 滑鼠按下一律接手觸控之殘留; 觸控不接手滑鼠
        let env = mkFakeDom()
        let [a, b, c] = mkItems(env, 3, 't17')
        all.push(a.d, b.d, c.d)
        let t = touch(env)
        let m = mouse(env)
        t.start(a, { ...a.pt, id: 1 })
        t.start(b, { ...b.pt, id: 2 }, [{ ...b.pt, id: 2 }])
        let startB = events(b.rec)
        m.press(c)
        let startC = events(c.rec)
        a.rec.length = 0
        t.start(a, { ...a.pt, id: 3 })
        let startA = events(a.rec)
        await sleep(20)
        m.move(b.pt)
        m.up(b.pt)
        assert.strict.deepStrictEqual([startB, startC, startA, events(b.rec)], [['start'], ['start'], [], ['start', 'enter', 'drop']])
    })

    it(`should ignore the compatibility mouse events a tap produces`, async function() {
        //觸控輕點後瀏覽器補發之mousedown不起手: 帶firesTouchEvents者一律, 無sourceCapabilities者於觸控放開後之時間窗內
        let env = mkFakeDom()
        let [a] = mkItems(env, 1, 't17b')
        all.push(a.d)
        let t = touch(env)
        t.start(a, { ...a.pt, id: 1 })
        t.end(a, { ...a.pt, id: 1 })
        let byTap = events(a.rec)
        a.rec.length = 0
        let fromTouch = { clientX: 10, clientY: 10, button: 0, sourceCapabilities: { firesTouchEvents: true } }
        let unknown = { clientX: 10, clientY: 10, button: 0 }
        a.el.dispatch('mousedown', fromTouch)
        a.el.dispatch('mousedown', unknown)
        let byCompat = events(a.rec)
        await sleep(850) //時間窗已過: 帶firesTouchEvents者仍不起手, 無sourceCapabilities者可起手
        a.el.dispatch('mousedown', fromTouch)
        let byCompatLate = events(a.rec)
        a.el.dispatch('mousedown', unknown)
        let byUnknownLate = events(a.rec)
        env.winDispatch('mouseup', { clientX: 10, clientY: 10, button: 0 })
        a.rec.length = 0
        mouse(env).press(a)
        let byMouse = events(a.rec)
        mouse(env).up(a.pt)
        assert.strict.deepStrictEqual([byTap, byCompat, byCompatLate, byUnknownLate, byMouse], [['start', 'drop'], [], [], ['start'], ['start']])
    })

    it(`should not schedule the preview when the start listener ends the drag`, async function() {
        //start之監聽器內結束拖曳(停用群組): 不排定延遲建立預覽之計時器
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't17c', { opt: { timeDragStartDelay: 777 } })
        all.push(a.d, b.d)
        a.d.on('start', () => {
            a.d.setIsActive(false)
        })
        let st = globalThis.setTimeout
        let n777 = 0
        globalThis.setTimeout = (fn, ms, ...args) => {
            if (ms === 777) {
                n777++
            }
            return st(fn, ms, ...args)
        }
        try {
            mouse(env).press(a)
        }
        finally {
            globalThis.setTimeout = st
        }
        assert.strict.deepStrictEqual([n777, events(a.rec), env.nWinListeners()], [0, ['start'], 0])
    })

    it(`should end without a drop on touchcancel of the starting finger, blur, or deactivation, with leave for the item it was over`, async function() {
        //各中斷路徑皆結束拖曳: 不發drop、經過中之項目收到leave、預覽移除、計時器與會話監聽取消; 他指之touchcancel不影響
        let out = {}
        for (let k of ['touchcancel', 'blur', 'inactive']) {
            let env = mkFakeDom()
            let [a, b] = mkItems(env, 2, `t18${k}`)
            let t = touch(env)
            t.start(a, { ...a.pt, id: 1 })
            await sleep(20)
            t.move(a, { ...b.pt, id: 1 })
            if (k === 'touchcancel') {
                t.cancel(a, { ...b.pt, id: 9 })
                out.other = env.previews()
                t.cancel(a, { ...b.pt, id: 1 })
            }
            else if (k === 'blur') {
                env.winDispatch('blur')
            }
            else {
                a.d.setIsActive(false)
            }
            let st = [env.previews(), env.nWinListeners(), iv.active()]
            t.end(a, { ...b.pt, id: 1 })
            out[k] = [events(b.rec), st]
            a.d.unbind()
            b.d.unbind()
        }
        assert.strict.deepStrictEqual(out, { other: 1, touchcancel: [['enter', 'leave'], [0, 0, 0]], blur: [['enter', 'leave'], [0, 0, 0]], inactive: [['enter', 'leave'], [0, 0, 0]] })
    })

    it(`should end a drag whose release was lost when the next press starts`, async function() {
        //放開事件遺失時, 下一次按下先結束前一次(對經過中之項目發leave)
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't19')
        all.push(a.d, b.d)
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        m.press(a)
        await sleep(20)
        assert.strict.deepStrictEqual([env.previews(), iv.active(), events(b.rec)], [1, 1, ['enter', 'leave']])
        m.move(b.pt)
        m.up(b.pt)
        assert.strict.deepStrictEqual([b.rec.filter((x) => x === 'drop').length, env.previews(), iv.active()], [1, 0, 0])
    })

    it(`should prevent the native dragstart and touch scrolling only while this element is being dragged`, async function() {
        //拖曳中阻止本元素起手之原生拖放與觸控捲動, 未拖曳、停用、其他成員時不干涉
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't20')
        all.push(a.d, b.d)
        let ds = () => [a.el.dispatch('dragstart').defaultPrevented, b.el.dispatch('dragstart').defaultPrevented]
        let before = ds()
        let m = mouse(env)
        m.press(a)
        let during = ds()
        m.up(a.pt)
        let after = ds()
        a.d.setIsActive(false)
        let t = touch(env)
        t.start(a, { ...a.pt, id: 1 })
        let scrollInactive = t.move(a, { ...b.pt, id: 1 }).defaultPrevented
        t.end(a, { ...b.pt, id: 1 })
        a.d.setIsActive(true)
        t.start(a, { ...a.pt, id: 1 })
        let scrollActive = t.move(a, { ...b.pt, id: 1 }).defaultPrevented
        let dsTouch = ds()
        t.end(a, { ...b.pt, id: 1 })
        assert.strict.deepStrictEqual([before, during, after, scrollInactive, scrollActive, dsTouch], [[false, false], [true, false], [false, false], false, true, [true, false]])
    })

    //--- 放開 ---

    it(`should end without a drop when released outside any item, and drag again normally`, async function() {
        //放開於項目外: 不發drop、預覽移除、狀態清除
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't21')
        all.push(a.d, b.d)
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        let out = { x: 300, y: 300 }
        m.move(out)
        m.up(out)
        let first = [events(b.rec), env.previews(), env.nWinListeners()]
        b.rec.length = 0
        m.move(b.pt)
        let idle = events(b.rec)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        m.up(b.pt)
        assert.strict.deepStrictEqual([first, idle, events(b.rec)], [[['enter', 'leave'], 0, 0], [], ['enter', 'drop']])
    })

    it(`should close the item it was over with leave when dropped on another item without a move between`, async function() {
        //enter必以leave或drop收尾: 放下之項目與經過中之項目不同時先對後者發leave
        let env = mkFakeDom()
        let [a, b, c] = mkItems(env, 3, 't22')
        all.push(a.d, b.d, c.d)
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        m.up(c.pt)
        assert.strict.deepStrictEqual([events(b.rec), events(c.rec)], [['enter', 'leave'], ['drop']])
    })

    it(`should send nothing more when a leave listener ends the drag`, async function() {
        //重入: leave之監聽器內停用群組, 已先清經過中之項目, 故不重複發leave, 回到移動後亦不再發enter
        let env = mkFakeDom()
        let [a, b, c] = mkItems(env, 3, 't22b')
        all.push(a.d, b.d, c.d)
        b.d.on('leave', () => {
            b.d.setIsActive(false)
        })
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        m.move(c.pt)
        m.up(c.pt)
        assert.strict.deepStrictEqual([events(b.rec), events(c.rec), env.previews(), env.nWinListeners()], [['enter', 'leave'], [], 0, 0])
    })

    it(`should clear the drag even when a drop listener throws`, async function() {
        //監聽器拋錯時拖曳狀態已先清除, 下一次拖曳正常
        let env = mkFakeDom()
        let [a, b] = mkItems(env, 2, 't23')
        all.push(a.d, b.d)
        let boom = true
        b.d.on('drop', () => {
            if (boom) {
                boom = false
                throw new Error('consumer boom')
            }
        })
        let m = mouse(env)
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        assert.throws(() => m.up(b.pt), /consumer boom/)
        let st = [env.previews(), env.nWinListeners()]
        b.rec.length = 0
        m.press(a)
        await sleep(20)
        m.move(b.pt)
        m.up(b.pt)
        assert.strict.deepStrictEqual([st, b.rec.filter((x) => x === 'drop').length, env.previews()], [[0, 0], 1, 0])
    })

    //--- 選項 ---

    it(`should accept numeric strings, use the defaults for invalid numeric options, clamp a negative delay to 0 and a huge one to the timer limit`, async function() {
        //數字字串(如網頁輸入、表格轉存之資料)轉為數字; 非數字字串、空白字串與NaN用預設(延遲120、不透明度0.4); 負數延遲視為0; Infinity夾至上限(不出現)
        let out = []
        for (let opt of [{ timeDragStartDelay: 'x', previewOpacity: NaN }, { timeDragStartDelay: ' ', previewOpacity: ' ' }, { timeDragStartDelay: '5', previewOpacity: '0.7' }, { timeDragStartDelay: -5 }, { timeDragStartDelay: Infinity }]) {
            let env = mkFakeDom()
            let [a, b] = mkItems(env, 2, 't24', { opt })
            let m = mouse(env)
            m.press(a)
            await sleep(40)
            let early = env.previews()
            await sleep(120)
            let late = env.previews()
            m.move(b.pt)
            out.push([early, late, opacity(env)])
            m.up(b.pt)
            a.d.unbind()
            b.d.unbind()
            await tick()
        }
        assert.strict.deepStrictEqual(out, [[0, 1, 0.4], [0, 1, 0.4], [1, 1, 0.7], [1, 1, 0.4], [0, 0, null]])
    })

})


//runDragScenario, 以假時鐘跑一組完整情境(完整拖曳、延遲前blur取消、觸控取消、來源解除), 回傳各步驟後之可觀察狀態與公開事件; onTrace為待測之回調選項, rec給定時一併回傳其事件簡式
async function runDragScenario(onTrace, k, rec = null) {
    let env = mkFakeDom()
    let c = useFakeClock()
    let its = []
    try {
        let [a, b] = mkItems(env, 2, `trs${k}`, { opt: { onTrace, timeDragStartDelay: 120 } })
        its = [a, b]
        let m = mouse(env)
        let t = touch(env)
        let log = []
        let snap = () => [env.previews(), opacity(env), env.nWinListeners(), events(a.rec).length, events(b.rec).length]
        //1. 完整拖曳: 延遲到點建立預覽, 經過b後放下
        m.press(a)
        log.push(snap())
        await c.advance(119)
        log.push(snap())
        await c.advance(1)
        log.push(snap())
        m.move(b.pt)
        log.push(snap())
        m.move(b.pt)
        m.up(b.pt)
        log.push(snap())
        //2. 延遲前視窗失焦而取消
        m.press(b)
        await c.advance(30)
        env.winDispatch('blur')
        log.push(snap())
        //3. 觸控起手, 預覽建立後被取消
        t.start(a, { ...a.pt, id: 1 })
        await c.advance(120)
        log.push(snap())
        t.cancel(a, { ...a.pt, id: 1 })
        log.push(snap())
        //4. 預覽建立後來源解除而取消
        m.press(a)
        await c.advance(120)
        a.d.unbind()
        await flush()
        log.push(snap())
        return {
            log,
            pub: [a.rec, b.rec],
            nSet: [Object.fromEntries(a.el.nSet), Object.fromEntries(b.el.nSet)],
            nEle: [a.el.nListeners(), b.el.nListeners()],
            lines: rec ? rec.lines() : null,
        }
    }
    finally {
        for (let it of its) {
            it.d.unbind()
        }
        await flush()
        c.restore()
    }
}


describe(`domDrag onTrace(R-TRACE-01)`, function() {

    let all = []
    let clock = null

    afterEach(async function() {
        for (let d of all) {
            d.unbind()
        }
        all = []
        await flush()
        if (clock) {
            clock.restore()
            clock = null
        }
    })

    after(function() {
        clearFakeDom()
    })

    it(`should notify start, timer set, timer fire at the delay, preview create, then preview remove and end drop in causal order`, async function() {
        //JSDoc onTrace: timeDragStartDelay(預設120ms)本身即規格, 以假時鐘斷言到點時刻(119ms未到、120ms到點); preview create於預覽建立後通知, remove於放開時先移除預覽, end於狀態皆清除後通知
        let env = mkFakeDom()
        clock = useFakeClock()
        let rec = mkRec(() => [env.previews(), env.nWinListeners() > 0])
        let [a, b] = mkItems(env, 2, 'tr1', { opt: { onTrace: rec.on, timeDragStartDelay: 120 } })
        all.push(a.d, b.d)
        let m = mouse(env)
        m.press(a)
        await clock.advance(119)
        let at119 = rec.timed()
        await clock.advance(1)
        await rec.wait((e) => e.type === 'preview' && e.phase === 'create')
        let opAtCreate = opacity(env)
        m.move(b.pt)
        m.up(b.pt)
        assert.strict.deepStrictEqual(at119, ['start:0/false@0', 'timer:set/120@0'])
        assert.strict.deepStrictEqual(rec.timed(), ['start:0/false@0', 'timer:set/120@0', 'timer:fire/120@120', 'preview:create@120', 'preview:remove@120', 'end:drop/0@120'])
        //通知當下[預覽數, 會話監聽是否存在]: 預覽建立後為1, 放開時預覽先移除而監聽尚在, end時預覽與監聽皆已清除
        assert.strict.deepStrictEqual(rec.snaps, [[0, true], [0, true], [0, true], [1, true], [0, true], [0, false]])
        assert.strict.deepStrictEqual([opAtCreate, events(b.rec)], [0.2, ['enter', 'drop']])
    })

    it(`should notify timer cancel and end release when released outside any item before the delay, and nothing afterwards`, async function() {
        //JSDoc onTrace: timer cancel為拖曳於到點前結束而取消; end release為放開於項目外; 取消後計時器不再到點(假時鐘推進超過延遲仍無事件、無預覽)
        let env = mkFakeDom()
        clock = useFakeClock()
        let rec = mkRec()
        let [a, b] = mkItems(env, 2, 'tr2', { opt: { onTrace: rec.on, timeDragStartDelay: 120 } })
        all.push(a.d, b.d)
        let m = mouse(env)
        m.press(a)
        await clock.advance(50)
        m.up({ x: 300, y: 300 })
        let ended = rec.timed()
        await clock.advance(500)
        assert.strict.deepStrictEqual(ended, ['start:0/false@0', 'timer:set/120@0', 'timer:cancel/120@50', 'end:release/0@50'])
        assert.strict.deepStrictEqual([rec.timed(), env.previews(), env.nWinListeners()], [ended, 0, 0])
    })

    it(`should report the resolved delay in timer set: default for invalid values, numeric strings, negative as 0, Infinity clamped to the timer limit`, async function() {
        //JSDoc timeDragStartDelay: 無效時用預設120, 數字字串依其值, 負數視為0, 超過計時器上限(含Infinity)夾至上限2147483647; timer事件之ms為解析後之值
        clock = useFakeClock()
        let got = []
        let i = 0
        for (let v of ['x', ' ', '5', -5, Infinity]) {
            let env = mkFakeDom()
            let rec = mkRec()
            let [a, b] = mkItems(env, 2, `tr3_${i++}`, { opt: { onTrace: rec.on, timeDragStartDelay: v } })
            all.push(a.d, b.d)
            mouse(env).press(a)
            got.push(rec.events.filter((e) => e.type === 'timer').map((e) => `${e.phase}/${e.ms}`))
        }
        assert.strict.deepStrictEqual(got, [['set/120'], ['set/120'], ['set/5'], ['set/0'], ['set/2147483647']])
    })

    it(`should notify end with the reason of each way a drag finishes, always after timer cancel and before leave and drop`, async function() {
        //JSDoc end reason: drop放開於項目上、release放開於項目外、buttons移動時主鍵已放開、touchcancel起手手指被取消、blur視窗失焦、inactive群組被停用、source-gone來源元素解除且未重建(移動、放開、解除後microtask三條路徑)、takeover新的按下接手前一次未收尾之拖曳; 同一次拖曳只通知一次end
        let ln = (head, tail) => ['start:' + head, 'timer:set/120', ...tail]
        let cancelEnd = (r, ind = 0) => ['timer:cancel/120', `end:${r}/${ind}`]
        let gone = ln('0/false', ['unbind:true', ...cancelEnd('source-gone')])
        //各案: [名稱, 起手方式(mouse0由項目0、mouse1由項目1滑鼠按下、touch由項目0觸控), 動作, 預期事件序列]
        let cases = [
            ['drop', 'mouse0', ({ m, b }) => m.up(b.pt), ln('0/false', cancelEnd('drop'))],
            ['release', 'mouse0', ({ m }) => m.up({ x: 300, y: 300 }), ln('0/false', cancelEnd('release'))],
            ['buttons', 'mouse1', ({ m, a }) => m.move(a.pt, { buttons: 0 }), ln('1/false', cancelEnd('buttons', 1))],
            ['touchcancel', 'touch', ({ t, a, b }) => {
                t.cancel(a, { ...b.pt, id: 9 }) //他指之取消不影響
                t.cancel(a, { ...b.pt, id: 1 })
            }, ln('0/true', cancelEnd('touchcancel'))],
            ['blur', 'mouse0', ({ env }) => env.winDispatch('blur'), ln('0/false', cancelEnd('blur'))],
            ['inactive', 'mouse0', ({ a }) => a.d.setIsActive(false), ln('0/false', cancelEnd('inactive'))],
            ['gone-move', 'mouse0', ({ a, b, m }) => {
                a.d.unbind()
                m.move(b.pt)
            }, gone],
            ['gone-up', 'mouse0', ({ a, b, m }) => {
                a.d.unbind()
                m.up(b.pt)
            }, gone],
            ['gone-microtask', 'mouse0', async ({ a }) => {
                a.d.unbind()
                await flush()
            }, gone],
            ['takeover', 'mouse0', ({ m, a }) => m.press(a), ['start:0/false', 'timer:set/120', ...cancelEnd('takeover'), 'start:0/false', 'timer:set/120']],
        ]
        clock = useFakeClock()
        let got = {}
        let want = {}
        let late = {}
        for (let [k, how, act, exp] of cases) {
            let env = mkFakeDom()
            let rec = mkRec()
            let [a, b] = mkItems(env, 2, `tr4_${k}`, { opt: { onTrace: rec.on, timeDragStartDelay: 120 } })
            all.push(a.d, b.d)
            let m = mouse(env)
            let t = touch(env)
            let from = how === 'mouse1' ? b : a
            if (how === 'touch') {
                t.start(from, { ...from.pt, id: 1 })
            }
            else {
                m.press(from)
            }
            await act({ env, a, b, m, t })
            got[k] = rec.lines()
            await flush() //其後之microtask不得再通知(同一次拖曳只一個end)
            late[k] = rec.lines()
            want[k] = exp
        }
        assert.strict.deepStrictEqual(got, want)
        assert.strict.deepStrictEqual(late, want)
    })

    it(`should notify no timer when the start listener already ended the drag, and nothing for presses that do not start a drag`, function() {
        //start之監聽器內結束拖曳(停用群組): 不排定計時器, 僅start與end(inactive); 非主鍵、停用中、無有效順序指標之按下不起手: 無事件, 無拖曳時setIsActive亦無end
        let env = mkFakeDom()
        clock = useFakeClock()
        let rec = mkRec()
        let [a, b] = mkItems(env, 2, 'tr5', { opt: { onTrace: rec.on, timeDragStartDelay: 777 } })
        all.push(a.d, b.d)
        let m = mouse(env)
        m.press(a, a.pt, { button: 2, buttons: 2 })
        m.press(a, a.pt, { button: 1, buttons: 4 })
        a.d.setIsActive(false)
        m.press(a)
        a.d.setIsActive(true)
        a.el.removeAttribute('dragindex')
        m.press(a)
        a.el.setAttribute('dragindex', '0')
        let idle = rec.lines()
        a.d.on('start', () => {
            a.d.setIsActive(false)
        })
        m.press(a)
        assert.strict.deepStrictEqual([idle, rec.lines()], [[], ['start:0/false', 'end:inactive/0']])
    })

    it(`should notify start and end before delivering the start, leave and drop events, even when a drop listener throws`, function() {
        //派發使用端事件者於派發前通知(監聽器拋錯而中斷派發時仍已通知): start先於start監聽器, end先於leave與drop監聽器
        let env = mkFakeDom()
        clock = useFakeClock()
        let order = []
        let rec = mkRec()
        let onTrace = (e) => {
            if (e.type === 'start' || e.type === 'end') {
                order.push(`t:${e.type}`)
            }
            rec.on(e)
        }
        let [a, b, c] = mkItems(env, 3, 'tr6', { opt: { onTrace, timeDragStartDelay: 120 } })
        all.push(a.d, b.d, c.d)
        a.d.on('start', () => order.push('l:start'))
        b.d.on('leave', () => order.push('l:leave'))
        let boom = false
        c.d.on('drop', () => {
            order.push('l:drop')
            if (boom) {
                throw new Error('consumer boom')
            }
        })
        let m = mouse(env)
        m.press(a)
        m.move(b.pt)
        m.up(c.pt)
        let first = order.slice()
        boom = true
        let k = rec.mark()
        m.press(a)
        assert.throws(() => m.up(c.pt), /consumer boom/)
        assert.strict.deepStrictEqual(first, ['t:start', 'l:start', 't:end', 'l:leave', 'l:drop'])
        assert.strict.deepStrictEqual(rec.lines(k), ['start:0/false', 'timer:set/120', 'timer:cancel/120', 'end:drop/0'])
        assert.strict.deepStrictEqual([env.previews(), env.nWinListeners()], [0, 0])
    })

    it(`should notify unbind with whether a drag of this element was in progress, once per instance, then end source-gone`, async function() {
        //JSDoc onTrace: unbind(drag)於解除當下通知, 重複呼叫不通知, 解除後不再起手; 進行中之拖曳於下一個microtask取消(preview remove、end source-gone), 他成員解除不影響拖曳
        let env = mkFakeDom()
        clock = useFakeClock()
        let rec = mkRec()
        let [a, b] = mkItems(env, 2, 'tr7', { opt: { onTrace: rec.on, timeDragStartDelay: 120 } })
        all.push(a.d, b.d)
        let m = mouse(env)
        m.press(a)
        await clock.advance(120)
        b.d.unbind()
        let afterOther = [rec.lines().slice(-1), env.previews()]
        a.d.unbind()
        a.d.unbind()
        let sync = rec.lines()
        await flush()
        assert.strict.deepStrictEqual(afterOther, [['unbind:false'], 1])
        assert.strict.deepStrictEqual(sync, ['start:0/false', 'timer:set/120', 'timer:fire/120', 'preview:create', 'unbind:false', 'unbind:true'])
        assert.strict.deepStrictEqual(rec.lines(), [...sync, 'preview:remove', 'end:source-gone/0'])
        //解除後之按下不再起手
        let n = rec.events.length
        m.press(a)
        m.press(b)
        assert.strict.deepStrictEqual([rec.events.length, env.previews()], [n, 0])
    })

    it(`should report a drag only to the callback of the instance that started it, also after the source is rebound`, async function() {
        //一次拖曳之事件皆由起手元素之回調通知(落點元素之回調不通知); 宿主重繪時先解除再重建(拖曳延續)者, 後續事件仍由起手實例之回調通知, 新實例之回調不收
        let env = mkFakeDom()
        clock = useFakeClock()
        let recA = mkRec()
        let recA2 = mkRec()
        let recB = mkRec()
        let [a, b] = mkItems(env, 2, 'tr8', { opt: { onTrace: recA.on, timeDragStartDelay: 120 } })
        all.push(a.d, b.d)
        b.d.unbind()
        b.opt = { ...b.opt, onTrace: recB.on }
        b.bind()
        all.push(b.d)
        await flush()
        let k = recA.mark()
        let m = mouse(env)
        m.press(a)
        await clock.advance(120)
        m.move(b.pt)
        a.d.unbind()
        a.opt = { ...a.opt, onTrace: recA2.on }
        a.bind()
        all.push(a.d)
        await flush()
        m.move(b.pt)
        m.up(b.pt)
        assert.strict.deepStrictEqual(recA.lines(k), ['start:0/false', 'timer:set/120', 'timer:fire/120', 'preview:create', 'unbind:true', 'preview:remove', 'end:drop/0'])
        assert.strict.deepStrictEqual([recA2.lines(), recB.lines(), events(b.rec)], [[], [], ['enter', 'move', 'drop']])
    })

    it(`should not pass onTrace on to the preview it creates`, async function() {
        //JSDoc onTrace: 內部建立之預覽(domDragPreview)不轉傳回調, 各自只通知自己之事件; 預覽存在期間每500ms之確認(tick)不出現在domDrag之事件流
        let env = mkFakeDom()
        clock = useFakeClock()
        let rec = mkRec()
        let [a, b] = mkItems(env, 2, 'tr9', { opt: { onTrace: rec.on, timeDragStartDelay: 120 } })
        all.push(a.d, b.d)
        let m = mouse(env)
        m.press(a)
        await clock.advance(120)
        await clock.advance(1500)
        let pv = env.previews()
        m.up(b.pt)
        assert.strict.deepStrictEqual(pv, 1)
        assert.strict.deepStrictEqual(rec.timed(), ['start:0/false@0', 'timer:set/120@0', 'timer:fire/120@120', 'preview:create@120', 'preview:remove@1620', 'end:drop/0@1620'])
    })

    it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時行為不變(預覽、透明度、會話監聽、公開事件、屬性寫入次數、元素監聽數皆同); P4: 回調之拋錯與回傳之rejection不影響拖曳、不產生未處理之rejection
        let un = watchUnhandled()
        let rec = mkRec()
        let got = []
        try {
            let k = 0
            for (let onTrace of fiveOnTrace(rec.on)) {
                got.push(await runDragScenario(onTrace, k++, onTrace === rec.on ? rec : null))
            }
            await flush()
            await flush()
        }
        finally {
            un.stop()
        }
        let ref = { ...got[0], lines: null }
        assert.strict.deepStrictEqual(got.map((r) => ({ ...r, lines: null })), [ref, ref, ref, ref, ref])
        assert.strict.deepStrictEqual(un.list, [])
        //情境本身確實跑到各步驟: 預覽於到點才出現, 放下、blur取消、觸控取消、來源解除後皆已清除
        assert.strict.deepStrictEqual(got[0].log.map((x) => x[0]), [0, 0, 1, 1, 0, 0, 1, 0, 0])
        //紀錄器收到之完整事件序列(四個階段)
        assert.strict.deepStrictEqual(got[1].lines, [
            'start:0/false', 'timer:set/120', 'timer:fire/120', 'preview:create', 'preview:remove', 'end:drop/0',
            'start:1/false', 'timer:set/120', 'timer:cancel/120', 'end:blur/1',
            'start:0/true', 'timer:set/120', 'timer:fire/120', 'preview:create', 'preview:remove', 'end:touchcancel/0',
            'start:0/false', 'timer:set/120', 'timer:fire/120', 'preview:create', 'unbind:true', 'preview:remove', 'end:source-gone/0',
        ])
    })

    it(`should notify with frozen events of fixed primitive fields and no receiver`, async function() {
        //R-TRACE-01 P4: 事件為凍結物件、各type之欄位固定且皆為原始值、回調不帶接收者
        let rec = mkRec()
        let meta = mkMeta(rec)
        await runDragScenario(meta.on, 'meta')
        assert.strict.deepStrictEqual(keysByType(rec.events), { start: 'ind,touch,type', timer: 'ms,phase,type', preview: 'phase,type', end: 'ind,reason,type', unbind: 'drag,type' })
        assert.strict.deepStrictEqual(allPrimitive(rec.events), true)
        assert.strict.deepStrictEqual(meta.meta.length > 0 && meta.meta.length === rec.events.length && meta.meta.every(([self, frozen]) => self === undefined && frozen), true)
    })

    it(`should build no event object when onTrace is not a function`, function() {
        //R-TRACE-01 P3: 未傳(或非函數)回調時不組事件物件(零額外成本), 傳了才組; 以Object.freeze呼叫數觀察(事件物件由getTrace凍結); 只含同步之起手、移動、放開
        let freeze = Object.freeze
        let seq = 0
        let count = (onTrace) => {
            let env = mkFakeDom()
            clock = useFakeClock()
            let [a, b] = mkItems(env, 2, `tr10_${seq++}`, { opt: { onTrace, timeDragStartDelay: 120 } })
            all.push(a.d, b.d)
            let m = mouse(env)
            let n = 0
            Object.freeze = (o) => {
                n++
                return freeze(o)
            }
            try {
                m.press(a)
                m.move(b.pt)
                m.up(b.pt)
            }
            finally {
                Object.freeze = freeze
            }
            a.d.unbind()
            b.d.unbind()
            clock.restore()
            clock = null
            return n
        }
        assert.strict.deepStrictEqual([count(undefined), count('abc'), count(null), count(() => {}) > 0], [0, 0, 0, true])
    })

})
