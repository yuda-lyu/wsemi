import assert from 'assert'
import domDragPreview from '../src/domDragPreview.mjs'
import { mkFakeDom, clearFakeDom, trackIntervals } from './tools/fakeDom.mjs'


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
