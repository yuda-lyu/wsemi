import assert from 'assert'
import domDragPreview from '../src/domDragPreview.mjs'
import { mkFakeDom, clearFakeDom, trackIntervals } from './tools/fakeDom.mjs'
import { useFakeClock } from './tools/timeKit.mjs'
import { mkRec, fiveOnTrace, watchUnhandled, mkMeta, flush, keysByType, allPrimitive } from './tools/domDragTraceKit.mjs'


let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))


describe(`domDragPreview`, function() {

    let iv = null

    beforeEach(function() {
        iv = trackIntervals()
    })

    afterEach(function() {
        iv.restore()
    })

    after(function() {
        clearFakeDom()
    })

    it(`should hold no listener or timer until a preview exists, and release both when it is removed`, function() {
        //預覽存在期間才監聽視窗與確認來源, 移除預覽時一併停止
        let env = mkFakeDom()
        let src = env.body.appendChild(new env.Ele())
        let pv = domDragPreview()
        let idle = [env.nWinListeners(), iv.active()]
        pv.createPreview(src, 10, 10)
        let during = [env.previews(), env.nWinListeners(), iv.active()]
        pv.removeDragPreview()
        assert.strict.deepStrictEqual([idle, during, env.previews(), env.nWinListeners(), iv.active()], [[0, 0], [1, 2, 1], 0, 0, 0])
        pv.clear()
    })

    it(`should replace an existing preview instead of stacking a second one`, function() {
        //同一時間只有一個預覽與一組監聽、一個計時器
        let env = mkFakeDom()
        let a = env.body.appendChild(new env.Ele())
        let b = env.body.appendChild(new env.Ele())
        let pv = domDragPreview()
        pv.createPreview(a, 10, 10)
        pv.createPreview(b, 20, 20)
        assert.strict.deepStrictEqual([env.previews(), env.nWinListeners(), iv.active()], [1, 2, 1])
        pv.clear()
        assert.strict.deepStrictEqual([env.previews(), env.nWinListeners(), iv.active()], [0, 0, 0])
    })

    it(`should remove the preview when its own source leaves the page, not when another element does`, async function() {
        //確認對象為本次預覽之來源元素
        let env = mkFakeDom()
        let a = env.body.appendChild(new env.Ele())
        let other = env.body.appendChild(new env.Ele())
        let pv = domDragPreview()
        pv.createPreview(a, 10, 10)
        other.remove()
        await sleep(600)
        let kept = env.previews()
        a.remove()
        await sleep(600)
        assert.strict.deepStrictEqual([kept, env.previews(), env.nWinListeners(), iv.active()], [1, 0, 0, 0])
        pv.clear()
    })

    it(`should tolerate removing twice, clearing twice, and a container already taken out of the page`, function() {
        //移除與clear可重複呼叫; 容器已被外部移出時移除不拋錯且停止計時器與監聽
        let env = mkFakeDom()
        let a = env.body.appendChild(new env.Ele())
        let pv = domDragPreview()
        pv.createPreview(a, 10, 10)
        env.body.children[1].remove()
        assert.doesNotThrow(() => {
            pv.removeDragPreview()
            pv.removeDragPreview()
        })
        pv.createPreview(a, 10, 10)
        assert.doesNotThrow(() => {
            pv.clear()
            pv.clear()
        })
        assert.strict.deepStrictEqual([env.previews(), iv.active(), env.nWinListeners()], [0, 0, 0])
    })

    it(`should not create anything when the source has no box`, function() {
        let env = mkFakeDom()
        let a = env.body.appendChild(new env.Ele())
        a.getBoundingClientRect = null
        let pv = domDragPreview()
        pv.createPreview(a, 10, 10)
        assert.strict.deepStrictEqual([env.previews(), iv.active(), env.nWinListeners()], [0, 0, 0])
        pv.clear()
    })

    it(`should follow the pointer and apply styles to the current preview only`, function() {
        let env = mkFakeDom()
        let a = env.body.appendChild(new env.Ele('div', { rect: { left: 5, top: 5, width: 100, height: 40 } }))
        let pv = domDragPreview()
        assert.doesNotThrow(() => pv.setContainerStyle({ opacity: 0.1 }))
        pv.createPreview(a, 10, 10)
        pv.setContainerStyle({ opacity: 0.3 })
        env.winDispatch('mousemove', { clientX: 50, clientY: 60 })
        let c = env.body.children[1]
        let byMouse = [c.style.opacity, c.style.left, c.style.top]
        env.winDispatch('touchmove', { touch: { x: 70, y: 80, id: 1 } })
        let byTouch = [c.style.left, c.style.top]
        pv.updateDragPreview(20, 30)
        assert.strict.deepStrictEqual([byMouse, byTouch, [c.style.left, c.style.top]], [[0.3, '45px', '55px'], ['65px', '75px'], ['15px', '25px']])
        pv.clear()
    })

    it(`should drop the name of radios in the copy so the original keeps its checked radio`, function() {
        //拷貝內之radio移除name(已勾選之拷貝以同名插入頁面會取消原件之勾選), 原件不變
        let env = mkFakeDom()
        let a = env.body.appendChild(new env.Ele())
        let r = a.appendChild(new env.Ele('input'))
        r.setAttribute('type', 'radio')
        r.setAttribute('name', 'rr')
        let pv = domDragPreview()
        pv.createPreview(a, 10, 10)
        let copy = env.body.children[1].querySelectorAll('input[type=radio]')
        assert.strict.deepStrictEqual([copy.length, copy[0].getAttribute('name'), r.getAttribute('name')], [1, null, 'rr'])
        pv.clear()
    })

    it(`should accept numeric strings and use the defaults for invalid numeric options`, function() {
        //數字字串(如網頁輸入、表格轉存之資料)轉為數字; NaN、Infinity、空白字串、非數字字串改用預設
        let env = mkFakeDom()
        let a = env.body.appendChild(new env.Ele())
        let out = []
        for (let opt of [{ containerOpacity: '0.5', containerBorderWidth: '3' }, { containerOpacity: NaN, containerBorderWidth: Infinity }, { containerOpacity: ' ', containerBorderWidth: 'abc' }]) {
            let pv = domDragPreview(opt)
            pv.createPreview(a, 10, 10)
            let c = env.body.children[1]
            out.push([c.style.opacity, c.style.border, c.style.width])
            pv.clear()
        }
        assert.strict.deepStrictEqual(out, [[0.5, '3px solid #f26', '106px'], [0.4, '1px solid #f26', '102px'], [0.4, '1px solid #f26', '102px']])
    })

})


//runPreviewScenario, 以假時鐘跑一組完整情境(建立、跟隨、替換、確認來源、來源離開被移除、無法建立、重複移除), 回傳各步驟後之可觀察狀態; onTrace為待測之回調選項
async function runPreviewScenario(onTrace, rec = null) {
    let env = mkFakeDom()
    let c = useFakeClock()
    try {
        let a = env.body.appendChild(new env.Ele('div', { rect: { left: 5, top: 5, width: 100, height: 40 } }))
        let b = env.body.appendChild(new env.Ele('div', { rect: { left: 5, top: 5, width: 100, height: 40 } }))
        let pv = domDragPreview({ onTrace })
        let snap = () => {
            let cc = env.body.children.find((x) => x.getAttribute('dragpreviewid') !== null)
            return [env.previews(), env.nWinListeners(), cc ? [cc.style.left, cc.style.top, cc.style.opacity] : null]
        }
        let log = []
        pv.createPreview(a, 10, 10)
        log.push(snap())
        env.winDispatch('mousemove', { clientX: 50, clientY: 60 })
        log.push(snap())
        pv.createPreview(b, 20, 20)
        log.push(snap())
        await c.advance(500)
        log.push(snap())
        b.remove()
        await c.advance(500)
        log.push(snap())
        a.getBoundingClientRect = null
        pv.createPreview(a, 1, 1)
        log.push(snap())
        pv.removeDragPreview()
        pv.clear()
        log.push(snap())
        return { log, lines: rec ? rec.lines() : null }
    }
    finally {
        c.restore()
    }
}


describe(`domDragPreview onTrace(R-TRACE-01)`, function() {

    let iv = null
    let clock = null

    beforeEach(function() {
        iv = trackIntervals()
    })

    afterEach(function() {
        if (clock) {
            clock.restore()
            clock = null
        }
        iv.restore()
    })

    after(function() {
        clearFakeDom()
    })

    it(`should notify create, replace, remove and clear in order only when a preview exists, with the state already consistent`, function() {
        //JSDoc onTrace: create(replaced)於預覽、監聽與計時器就緒後通知, remove(reason)於預覽、監聽與計時器移除後通知; 無預覽時重複呼叫removeDragPreview與clear不通知
        let env = mkFakeDom()
        let a = env.body.appendChild(new env.Ele())
        let b = env.body.appendChild(new env.Ele())
        let rec = mkRec(() => [env.previews(), env.nWinListeners(), iv.active()])
        let pv = domDragPreview({ onTrace: rec.on })
        pv.removeDragPreview()
        pv.clear()
        let idle = rec.lines()
        pv.createPreview(a, 10, 10)
        pv.createPreview(b, 20, 20)
        pv.removeDragPreview()
        pv.removeDragPreview()
        pv.createPreview(a, 10, 10)
        pv.clear()
        pv.clear()
        assert.strict.deepStrictEqual(idle, [])
        assert.strict.deepStrictEqual(rec.lines(), ['create:false', 'remove:replace', 'create:true', 'remove:remove', 'create:false', 'remove:clear'])
        //通知當下[預覽數, 視窗監聽數, 存活計時器數]: create時已就緒(1,2,1), remove時已全部移除(0,0,0)
        assert.strict.deepStrictEqual(rec.snaps, [[1, 2, 1], [0, 0, 0], [1, 2, 1], [0, 0, 0], [1, 2, 1], [0, 0, 0]])
    })

    it(`should notify skip no-box or build-error and create nothing, after removing the replaced preview`, function() {
        //JSDoc onTrace: skip(reason)為createPreview無法建立預覽; no-box為無法取得來源位置, build-error為建構時拋錯(如來源按鈕已自我刪除); 先移除既有預覽(remove replace)再skip
        let env = mkFakeDom()
        let a = env.body.appendChild(new env.Ele())
        let boxless = env.body.appendChild(new env.Ele())
        boxless.getBoundingClientRect = null
        let boom = env.body.appendChild(new env.Ele())
        boom.cloneNode = () => {
            throw new Error('clone boom')
        }
        let rec = mkRec(() => [env.previews(), env.nWinListeners(), iv.active()])
        let pv = domDragPreview({ onTrace: rec.on })
        pv.createPreview(a, 10, 10)
        pv.createPreview(boxless, 10, 10)
        pv.createPreview(boom, 10, 10)
        pv.clear()
        assert.strict.deepStrictEqual(rec.lines(), ['create:false', 'remove:replace', 'skip:no-box', 'skip:build-error'])
        assert.strict.deepStrictEqual(rec.snaps, [[1, 2, 1], [0, 0, 0], [0, 0, 0], [0, 0, 0]])
    })

    it(`should notify a tick every 500ms with whether the source is connected, then remove source-gone once it left the page`, async function() {
        //JSDoc onTrace: tick(connected)為每500ms確認來源是否仍在頁面中(時間本身即規格, 假時鐘); 另一元素離開不影響; 來源離開之該次tick緊接remove(source-gone), 其後不再通知
        let env = mkFakeDom()
        clock = useFakeClock()
        let a = env.body.appendChild(new env.Ele())
        let other = env.body.appendChild(new env.Ele())
        let rec = mkRec(() => env.previews())
        let pv = domDragPreview({ onTrace: rec.on })
        pv.createPreview(a, 10, 10)
        await clock.advance(499)
        let at499 = rec.lines()
        await clock.advance(1)
        other.remove()
        await clock.advance(500)
        a.remove()
        await clock.advance(500)
        let gone = rec.timed()
        await clock.advance(2000)
        assert.strict.deepStrictEqual(at499, ['create:false'])
        assert.strict.deepStrictEqual(gone, ['create:false@0', 'tick:true@500', 'tick:true@1000', 'tick:false@1500', 'remove:source-gone@1500'])
        assert.strict.deepStrictEqual(rec.timed(), gone)
        //tick通知當下預覽尚在, remove通知當下預覽已移除
        assert.strict.deepStrictEqual(rec.snaps, [1, 1, 1, 1, 0])
        pv.clear()
    })

    it(`should check only the source of the current preview after a replacement`, async function() {
        //替換後確認對象為新預覽之來源, 舊來源離開不影響
        let env = mkFakeDom()
        clock = useFakeClock()
        let a = env.body.appendChild(new env.Ele())
        let b = env.body.appendChild(new env.Ele())
        let rec = mkRec()
        let pv = domDragPreview({ onTrace: rec.on })
        pv.createPreview(a, 10, 10)
        pv.createPreview(b, 20, 20)
        a.remove()
        await clock.advance(500)
        b.remove()
        await clock.advance(500)
        assert.strict.deepStrictEqual(rec.timed(), ['create:false@0', 'remove:replace@0', 'create:true@0', 'tick:true@500', 'tick:false@1000', 'remove:source-gone@1000'])
        pv.clear()
    })

    it(`should notify no tick after remove or clear`, async function() {
        //remove之後確認來源之計時器已停止, 不再有tick; 重新建立後以新的500ms週期計時
        let env = mkFakeDom()
        clock = useFakeClock()
        let a = env.body.appendChild(new env.Ele())
        let rec = mkRec()
        let pv = domDragPreview({ onTrace: rec.on })
        pv.createPreview(a, 10, 10)
        await clock.advance(250)
        pv.clear()
        await clock.advance(2000)
        let first = rec.timed()
        pv.createPreview(a, 10, 10)
        await clock.advance(100)
        pv.removeDragPreview()
        await clock.advance(2000)
        assert.strict.deepStrictEqual(first, ['create:false@0', 'remove:clear@250'])
        assert.strict.deepStrictEqual(rec.timed(), ['create:false@0', 'remove:clear@250', 'create:false@2250', 'remove:remove@2350'])
    })

    it(`should give the same results without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時行為不變; P4: 回調之拋錯與回傳之rejection不影響預覽(位置、透明度、監聽、移除)、不產生未處理之rejection
        let un = watchUnhandled()
        let rec = mkRec()
        let got = []
        try {
            for (let onTrace of fiveOnTrace(rec.on)) {
                got.push(await runPreviewScenario(onTrace, onTrace === rec.on ? rec : null))
            }
            await flush()
            await flush()
        }
        finally {
            un.stop()
        }
        assert.strict.deepStrictEqual(got.map((r) => r.log), [got[0].log, got[0].log, got[0].log, got[0].log, got[0].log])
        assert.strict.deepStrictEqual(un.list, [])
        //情境本身確實跑到各步驟: 建立、跟隨、替換、確認來源、來源離開被移除、無法建立
        assert.strict.deepStrictEqual(got[0].log.map((x) => x[0]), [1, 1, 1, 1, 0, 0, 0])
        assert.strict.deepStrictEqual(got[1].lines, ['create:false', 'remove:replace', 'create:true', 'tick:true', 'tick:false', 'remove:source-gone', 'skip:no-box'])
    })

    it(`should notify with frozen events of fixed primitive fields and no receiver`, async function() {
        //R-TRACE-01 P4: 事件為凍結物件、各type之欄位固定且皆為原始值、回調不帶接收者
        let rec = mkRec()
        let meta = mkMeta(rec)
        await runPreviewScenario(meta.on)
        assert.strict.deepStrictEqual(keysByType(rec.events), { create: 'replaced,type', skip: 'reason,type', tick: 'connected,type', remove: 'reason,type' })
        assert.strict.deepStrictEqual(allPrimitive(rec.events), true)
        assert.strict.deepStrictEqual(meta.meta.length > 0 && meta.meta.length === rec.events.length && meta.meta.every(([self, frozen]) => self === undefined && frozen), true)
    })

    it(`should build no event object when onTrace is not a function`, function() {
        //R-TRACE-01 P3: 未傳(或非函數)回調時不組事件物件(零額外成本), 傳了才組; 以Object.freeze呼叫數觀察(事件物件由getTrace凍結)
        let env = mkFakeDom()
        let a = env.body.appendChild(new env.Ele())
        let b = env.body.appendChild(new env.Ele())
        let freeze = Object.freeze
        let count = (onTrace) => {
            let n = 0
            Object.freeze = (o) => {
                n++
                return freeze(o)
            }
            try {
                let pv = domDragPreview({ onTrace })
                pv.createPreview(a, 10, 10)
                pv.createPreview(b, 20, 20)
                pv.removeDragPreview()
                pv.clear()
            }
            finally {
                Object.freeze = freeze
            }
            return n
        }
        assert.strict.deepStrictEqual([count(undefined), count('abc'), count(null), count(() => {}) > 0], [0, 0, 0, true])
    })

})
