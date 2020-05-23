import get from 'lodash/get'
import size from 'lodash/size'
import isnum from './isnum.mjs'
import iseobj from './iseobj.mjs'
import isestr from './isestr.mjs'
import isEle from './isEle.mjs'
import evem from './evem.mjs'
import getGlobal from './getGlobal.mjs'
// import domIsPageXYIn from './domIsPageXYIn.mjs' //已不使用
// import domGetOffset from './domGetOffset.mjs' //已不使用
//import Draggable from '@shopify/draggable/lib/draggable' //draggable.js沒有umd版, 故引用後即便用rollup剔除@shopify/draggable再打包, 還是會有未檢查window的殼層程式碼出現導致無法於nodejs環境下使用wsemi


function getDraggable() {
    let g = getGlobal()
    //let x = Draggable || g.Draggable
    let x = g.Draggable //直接取window內Draggable
    if (x.default) {
        x = x.default
    }
    return x
}


/**
 * 前端DOM元素拖曳功能
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

    function getAttr(el, attr) {
        let ind = null
        try {
            ind = el.getAttribute(attr)
        }
        catch (err) {}
        return ind
    }

    function getIndex(el) {
        return getAttr(el, attIndex)
    }

    function getBoudRect(el) {
        try {
            return el.getBoundingClientRect()
        }
        catch (err) {}
        return null
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

    //UseDraggable
    let UseDraggable = getDraggable()

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
            //console.log('無拖曳進入對象')
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
        if (!oe) {
            //console.log('找不到sensorEvent.originalEvent')
            return
        }

        //check
        if (!oe.target) {
            //console.log('找不到target元素')
            return
        }

        //已通過拖曳離開(drag:out)時清除dragTo, 且拖曳進入(drag:over)自己時不更新dragTo之機制, 避免拖曳回來原拖曳對象之問題
        // //isBack, 判斷滑鼠的pageX,Y是否位於原本拖曳對象內
        // let isBack = domIsPageXYIn(oe.pageX, oe.pageY, de.source) //若使用originalSource, 會因為被draggable隱藏無法取得bounding, 故改用source
        // // console.log('isBack', isBack)

        // //check
        // if (isBack) {
        //     // console.log('拖曳回到原本拖曳對象內故取消事件')
        //     return
        // }

        //isOuter
        let isOuter = oe.target.contains(dragTo.ele)
        // console.log('isOuter', isOuter)

        //check
        if (isOuter) {
            //console.log('拖曳至外層元素故取消事件')
            return
        }

        //因A拖曳至B再拖曳至C後, 由C拖曳回B時會觸發, 但此時是合理拖曳行為故不能使用此檢核, 且手機拖曳時target會提供原拖曳對象導致此條件必定成立而不能使用此檢核
        // //isIndependent
        // let isIndependent = !dragTo.ele.contains(oe.target)
        // //console.log('isIndependent', isIndependent)

        // //check
        // if (isIndependent) {
        //     console.log('拖曳至非所屬元素內故取消事件')
        //     return
        // }

        //p, 若有touches為手機拖曳
        let p = null
        if (oe.touches) {
            if (size(oe.touches) > 1) {
                //console.log('多點拖曳故取消事件')
                return
            }
            p = oe.touches[0] //clientX,Y是放在各touches內, 此處只允許單點拖曳
        }
        else {
            p = oe //clientX,Y是原本事件就有提供
        }

        //rt
        let rt = getBoudRect(dragTo.ele) //rect的left,top為基於瀏覽器可視區域左上角的座標
        // console.log('rt', rt)

        //x, y, w, h, rx, ry
        let x = p.clientX - rt.left //事件的clientX,Y是基於瀏覽器可視區域左上角的座標
        let y = p.clientY - rt.top
        let w = get(dragTo, 'ele.offsetWidth', 0)
        let h = get(dragTo, 'ele.offsetHeight', 0)
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

        //cursorInfor
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
