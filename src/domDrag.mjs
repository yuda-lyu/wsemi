import get from 'lodash/get'
import isnum from './isnum.mjs'
import iseobj from './iseobj.mjs'
import isestr from './isestr.mjs'
import isEle from './isEle.mjs'
import evem from './evem.mjs'
import domIsPageXYIn from './domIsPageXYIn.mjs'
import domGetOffset from './domGetOffset.mjs'
import Draggable from '@shopify/draggable/lib/draggable'


/**
 * 前端找尋DOM元素並插入節點、元素或文字等
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDrag.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.attIndex='dragindex'] 輸入標記元素順序指標字串，預設'dragindex'
 * @param {String} [opt.selectors='[dragtag]'] 輸入查詢元素用字串，主要是給draggable.js用來標記哪些元素可被拖曳之用，預設'[dragtag]'
 * @example
 * need test in browser
 */
function domDrag(ele, opt = {}) {
    let self = null
    let dragTo = null
    let tmsgDragMove = null

    //check
    if (!isEle(ele)) {
        console.log('ele is not HTMLElement', ele)
        return
    }
    let attIndex = get(opt, 'attIndex', 'dragindex')
    if (!isestr(attIndex)) {
        console.log('invalid attIndex in opt', attIndex)
        return
    }
    let selectors = get(opt, 'selectors', '[dragtag]')
    if (!isestr(selectors)) {
        console.log('invalid selectors in opt', selectors)
        return
    }

    function getIndex(el) {
        let ind = null
        try {
            ind = el.getAttribute(attIndex)
        }
        catch (err) {}
        return ind
    }

    function getEle(ind) {
        let el = null
        try {
            el = ele.querySelector(`[${attIndex}="${ind}"]`)
        }
        catch (err) {}
        return el
    }

    //ev
    let ev = evem()

    //UseDraggable, Draggable於weboack打包時會用default儲存, 調用時則需改用default
    let UseDraggable = Draggable
    if (Draggable.default) {
        UseDraggable = Draggable.default
    }

    //draggable
    let draggable = new UseDraggable(ele, {
        draggable: selectors,
    })
    // console.log('draggable', draggable)

    //on
    draggable.on('drag:start', (de) => {
        // console.log('drag:start', de, de.originalSource)

        //self
        self = getIndex(de.originalSource)

        //check, 非數字
        if (!isnum(self)) {
            return
        }

        //msg
        let msg = {
            selfInd: self,
            selfEle: de.originalSource,
        }

        //emit
        ev.emit('drag-start', msg)
        ev.emit('change', { mode: 'drag-start', ...msg })

    })
    draggable.on('drag:move', (de) => {
        //console.log('drag:move', de)

        //check, 無拖曳進入drag-enter對象資料
        if (!iseobj(dragTo)) {
            return
        }

        //check
        if (!de.source) {
            //console.log('找不到source元素')
            return
        }

        //oe
        let oe = get(de, 'sensorEvent.originalEvent', null)
        // console.log('oe', oe)

        //check
        if (!de.sensorEvent.originalEvent.target) {
            //console.log('找不到target元素')
            return
        }

        //isBack, 判斷滑鼠的pageX,Y是否位於原本拖曳對象內
        let isBack = domIsPageXYIn(oe.pageX, oe.pageY, de.source) //若使用originalSource, 會因為被draggable隱藏無法取得bounding, 故改用source
        // console.log('isBack', isBack)

        //check
        if (isBack) {
            // console.log('拖曳回到原本拖曳對象內故取消事件')
            return
        }

        //isOuter
        let isOuter = de.sensorEvent.originalEvent.target.contains(dragTo.ele)
        // console.log('isOuter', isOuter)

        //check
        if (isOuter) {
            //console.log('拖曳至外層元素故取消事件')
            return
        }

        //isIndependent
        let isIndependent = !dragTo.ele.contains(de.sensorEvent.originalEvent.target)
        // console.log('isIndependent', isIndependent)

        //check
        if (isIndependent) {
            //console.log('拖曳至非所屬元素內故取消事件')
            return
        }

        //offset
        let offset = domGetOffset(de.sensorEvent.originalEvent.target, dragTo.ele)
        // console.log('offset', offset)

        //cursorInfor
        let x = offset.dx + get(de, 'sensorEvent.originalEvent.offsetX', 0)
        let y = offset.dy + get(de, 'sensorEvent.originalEvent.offsetY', 0)
        let w = get(dragTo, 'ele.clientWidth', 0)
        let h = get(dragTo, 'ele.clientHeight', 0)
        let rx = 0
        if (w > 0) {
            rx = x / w
        }
        let ry = 0
        if (h > 0) {
            ry = y / h
        }
        // console.log('y', y)
        // console.log('h', h)
        // console.log('ry', ry)
        let cursorInfor = {
            x,
            y,
            w,
            h,
            rx,
            ry,
        }

        //check, 若靠近元素底部移動並移出時, 可能因有包覆層導致觸發drag:move, 但其offsetX,offsetY會很靠近0, 導致滑鼠所在位置的比例計算錯誤, 故給予門檻偵測並跳出
        if (get(tmsgDragMove, 'enterInd', null) === dragTo.ind) {
            if (tmsgDragMove.cursorInfor.ry > 0.95 && ry < 0.05) {
                // console.log('同高之包覆層無效y向移動觸發故取消事件')
                return
            }
            if (tmsgDragMove.cursorInfor.rx > 0.95 && rx < 0.05) {
                // console.log('同寬之包覆層無效x向移動觸發故取消事件')
                return
            }
        }

        //msg
        let msg = {
            selfInd: self,
            selfEle: de.originalSource,
            enterInd: dragTo.ind,
            enterEle: dragTo.ele,
            enterEvent: oe,
            cursorInfor,
        }

        //save
        tmsgDragMove = msg

        //emit
        ev.emit('drag-move', msg)
        ev.emit('change', { mode: 'drag-move', ...msg })

    })
    draggable.on('drag:over', (de) => {
        //console.log('drag:over', de, de.over)

        //ind
        let ind = getIndex(de.over)

        //check, 非數字
        if (!isnum(self) || !isnum(ind)) {
            return
        }

        //check, 等於原始拖曳對象
        if (self === ind) {
            return
        }

        //check, 已觸發拖曳進入drag-enter
        if (ind === get(dragTo, 'ind')) {
            return
        }

        //update dragTo
        dragTo = {
            ind,
            ele: de.over,
        }

        //msg
        let msg = {
            selfInd: self,
            selfEle: de.originalSource,
            enterInd: ind,
            enterEle: de.over, //getEle(ind),
        }

        //emit
        ev.emit('drag-enter', msg)
        ev.emit('change', { mode: 'drag-enter', ...msg })

    })
    // draggable.on('drag:over:container', (de) => {
    //     console.log('drag:over:container', de, de.over)
    // })
    draggable.on('drag:out', (de) => {
        //console.log('drag:out', de, de.over)

        //ind
        let ind = getIndex(de.over)

        //check, 非數字
        if (!isnum(self) || !isnum(ind)) {
            return
        }

        //check, 等於原始拖曳對象
        if (self === ind) {
            return
        }

        //check, 已觸發拖曳離開drag-leave
        if (!dragTo) {
            return
        }

        //update dragTo
        dragTo = null

        //msg
        let msg = {
            selfInd: self,
            selfEle: de.originalSource,
            leaveInd: ind,
            leaveEle: de.over, //getEle(ind),
        }

        //emit
        ev.emit('drag-leave', msg)
        ev.emit('change', { mode: 'drag-leave', ...msg })

    })
    // draggable.on('drag:out:container', (de) => {
    //     console.log('drag:out:containerr', de, de.over)
    // })
    draggable.on('drag:stop', (de) => {
        //console.log('drag:stop', de, de.source)

        //check
        if (!isnum(self) || !isnum(get(dragTo, 'ind'))) {
            return
        }

        //check
        if (self === dragTo.ind) {
            return
        }

        //msg
        let msg = {
            selfInd: self,
            selfEle: de.originalSource,
            dropInd: dragTo.ind,
            dropEle: getEle(dragTo.ind),
        }

        //emit
        ev.emit('drag-drop', msg)
        ev.emit('change', { mode: 'drag-drop', ...msg })

        //update dragTo
        dragTo = null

    })

    //save draggable, 一定要把draggable送出才能呼叫其內destroy, 因draggable內使用this處理相關呼叫, 不回傳整個draggable會導致this實際為ev而導致無法使用
    ev.draggable = draggable

    return ev
}


export default domDrag
