import each from 'lodash/each'
import size from 'lodash/size'
import get from 'lodash/get'
import genID from './genID.mjs'
import isestr from './isestr.mjs'
import isEle from './isEle.mjs'
import cint from './cint.mjs'
import evem from './evem.mjs'
import domRemove from './domRemove.mjs'
import domCancelEvent from './domCancelEvent.mjs'
import domIsPageXYIn from './domIsPageXYIn.mjs'


function getEles(ele, selectors) {
    let eles = null
    try {
        eles = ele.querySelectorAll(selectors)
    }
    catch (err) { }
    return eles
}


function getAttr(ele, attr) {
    let r = null
    try {
        r = ele.getAttribute(attr)
    }
    catch (err) {}
    return r
}


// function domFindParent(ele, f) {
//     let r = null

//     //check
//     if (!isEle(ele)) {
//         console.log('ele is not HTMLElement')
//         return r
//     }
//     if (!isfun(f)) {
//         console.log('invalid f')
//         return r
//     }

//     //while
//     let parent = ele
//     try {
//         while (parent) {

//             //check
//             if (f(parent)) {
//                 r = parent
//                 break
//             }

//             //parentNode
//             parent = parent.parentNode

//         }
//     }
//     catch (err) {
//         console.log('can not find parent in while', err)
//     }
//     return r
// }


function getBoudRect(ele) {
    try {
        return ele.getBoundingClientRect()
    }
    catch (err) {}
    return null
}


function getPointRefLoc(p, ele) {
    let rt = getBoudRect(ele)
    if (!rt) {
        return null
    }
    let x = p.clientX - rt.left //事件的clientX,Y是基於瀏覽器可視區域左上角的座標
    let y = p.clientY - rt.top
    let w = ele.offsetWidth
    let h = ele.offsetHeight
    return {
        x, y, w, h
    }
}


// function isInner(p, ele) {
//     let rl = getPointRefLoc(p, ele)
//     if (!rl) {
//         return false
//     }
//     return rl.x >= 0 && rl.x <= rl.w && rl.y >= 0 && rl.y <= rl.h
// }


function getPointFromEvent(e) {

    //check
    let cx = get(e, 'clientX', null)
    let cy = get(e, 'clientY', null)
    let px = get(e, 'pageX', null)
    let py = get(e, 'pageY', null)
    if (cx !== null && cy !== null && px !== null && py !== null) {
        return {
            clientX: cx,
            clientY: cy,
            pageX: px,
            pageY: py,
        }
    }

    //check
    let touches = get(e, 'changedTouches', []) //touchend時touches長度為0, 故需改用changedTouches
    if (size(touches) !== 1) {
        return null
    }

    //p
    let p = touches[0]

    return {
        clientX: get(p, 'clientX', null),
        clientY: get(p, 'clientY', null),
        pageX: get(p, 'pageX', null),
        pageY: get(p, 'pageY', null),
    }
}


function getIndex(ele, attIndex) {
    let kitem = getAttr(ele, attIndex)
    kitem = cint(kitem)
    return kitem
}


function dragPreview() {
    let _prevName = '_prevName'
    let _node = null
    let _container = null

    function cloneNode(ele, x, y) {
        //console.log('cloneNode')

        //getBoudRect
        let rt = getBoudRect(ele)
        if (!rt) {
            return
        }

        //深複製
        let nd = ele.cloneNode(true)

        //清空margin, 因getBoundingClientRect取得的left與top會因margin自動合併, 導致不含自己的margin, 故放到container時又會出現margin的影響導致偏移, 故需先清空margin
        nd.style.margin = 0

        //儲存資訊
        nd.tShiftX = x - rt.left
        nd.tShiftY = y - rt.top
        nd.tWidth = ele.offsetWidth
        nd.tHeight = ele.offsetHeight
        nd.tParent = ele.parentNode
        // console.log('cloneNode tShiftY', nd.tShiftY, 'y', y, 'rt.y', rt.y)

        return nd
    }

    function createPreview(ele, x, y) {
        //console.log('createPreview')

        //複製ele
        let node = cloneNode(ele, x, y)

        //創建container
        let container = document.createElement('div')
        container.setAttribute('name', _prevName)
        //container.style.display = 'none'//先隱藏

        //將複製的ele塞入container
        container.appendChild(node)

        //將container塞入原本ele的父層內
        node.tParent.appendChild(container)

        //儲存至全域
        _node = node
        _container = container

        //updateDragPreview
        updateDragPreview(x, y, 'createPreview')

    }

    function updateDragPreview(x, y, from) {
        //console.log('updateDragPreview', x, y, from)

        //check
        if (!_node || !_container) {
            return
        }

        //update
        //_container.style.display = 'display:block' //顯示
        _container.style.position = 'fixed'
        _container.style.zIndex = 100000
        _container.style.pointerEvents = 'none'
        _container.style.top = `${y - _node.tShiftY}px`
        _container.style.left = `${x - _node.tShiftX}px`
        _container.style.width = `${_node.tWidth}px`
        _container.style.height = `${_node.tHeight}px`
        _container.style.background = 'rgba(255,255,255,0.5)'
        // console.log('updateDragPreview', y, 'from', from)
        // console.log('updateDragPreview y', y, ' y -_node.tShiftY=top', y - _node.tShiftY)

    }

    function removeDragPreview() {
        //console.log('removeDragPreview')

        //domRemove
        domRemove(`[name=${_prevName}]`)

        //clear
        _node = null
        _container = null

    }

    let evMM = function(e) {
        //console.log('window mousemove', e)
        updateDragPreview(e.clientX, e.clientY, 'window mousemove')
    }
    window.addEventListener('mousemove', evMM)

    let evTM = function(e) {
        //console.log('window touchmove', e)
        let p = getPointFromEvent(e)
        if (p) {
            updateDragPreview(p.clientX, p.clientY, 'window touchmove')
        }
    }
    window.addEventListener('touchmove', evTM)

    let evDg = function(e) {
        //console.log('window drag', e)
        updateDragPreview(e.clientX, e.clientY, 'window drag')
    }
    window.addEventListener('drag', evDg)

    let evDge = function(e) {
        //console.log('window dragend', e)
        removeDragPreview()
    }
    window.addEventListener('dragend', evDge)

    function clear() {
        window.removeEventListener('mousemove', evMM)
        window.removeEventListener('touchmove', evTM)
        window.removeEventListener('drag', evDg)
        window.removeEventListener('dragend', evDge)
    }

    return {
        createPreview,
        updateDragPreview,
        removeDragPreview,
        clear,
    }
}


/**
 * 前端監聽DOM元素陣列拖曳事件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDrag.test.js Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.attIndex='dragindex'] 輸入標記元素順序指標字串，預設'dragindex'
 * @param {String} [opt.attGroup='draggroup'] 輸入標記元素群組字串，預設'draggroup'
 * @param {String} [opt.selectors='[dragtag]'] 輸入查詢元素用字串，主要是給draggable.js用來標記哪些元素可被拖曳之用，預設'[dragtag]'
 * @returns {Object} 回傳物件，可使用on與clear函數，on可監聽change、start、move、enter、leave、drop事件，clear為釋放監聽
 * @example
 *
 * //監聽dom
 * let dd = domDrag(document.querySelector('#id'), { attIndex: 'dragindex', selectors: '[dragtag]' })
 *
 * //change
 * dd.on('change', (msg) => {
 *     console.log('change', msg)
 * })
 * dd.on('start', (msg) => {
 *     console.log('start', msg)
 * })
 * dd.on('move', (msg) => {
 *     console.log('move', msg)
 * })
 * dd.on('enter', (msg) => {
 *     console.log('enter', msg)
 * })
 * dd.on('leave', (msg) => {
 *     console.log('leave', msg)
 * })
 * dd.on('drop', (msg) => {
 *     console.log('drop', msg)
 * })
 *
 * //釋放監聽
 * dd.clear()
 *
 */
function domDrag(ele, opt = {}) {
    let _startInd = null
    let _startEle = null
    let _endInd = null
    let _endEle = null
    let _events = []

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
    let attGroup = get(opt, 'attGroup', 'draggroup')
    if (!isestr(attGroup)) {
        console.log('invalid attGroup in opt', attGroup)
        return
    }
    let selectors = get(opt, 'selectors', '[dragtag]')
    if (!isestr(selectors)) {
        console.log('invalid selectors in opt', selectors)
        return
    }

    //dragPreview
    let pv = dragPreview()

    //eles
    let eles = getEles(ele, selectors)
    if (!eles) {
        console.log('初始化時無法取得拖曳元素')
        return
    }

    //gid
    let gid = 'dg' + genID(8)

    //setAttrs
    function setAttrs() {
        each(eles, (ele, k) => {

            //setAttribute
            // ele.setAttribute('draggable', true)
            ele.setAttribute(attGroup, gid)

        })
    }

    //bindEvents
    function bindEvents() {
        let f
        let name

        name = 'mousemove'
        f = function(e) {
            dragMove(e, 'mouse')
        }
        window.addEventListener(name, f)
        _events.push({ ele: window, name, f })

        name = 'mouseup'
        f = function(e) {
            dragDrop(e, 'mouse')
        }
        window.addEventListener(name, f)
        _events.push({ ele: window, name, f })

        name = 'touchmove'
        f = function(e) {
            dragMove(e, 'touch')
        }
        window.addEventListener(name, f)
        _events.push({ ele: window, name, f })

        name = 'touchend'
        f = function(e) {
            dragDrop(e, 'touch')
        }
        window.addEventListener(name, f)
        _events.push({ ele: window, name, f })

        each(eles, (ele, k) => { //eles綁定成為元素需自動更新, 例如用vue自動由數據順序產生元素, 而拖曳完的eles將不會是原始元素順序, 故k不可信

            name = 'mousedown'
            f = function(e) {
                dragStart(e, ele, 'mouse')
            }
            ele.addEventListener(name, f, false)
            _events.push({ ele, name, f })

            name = 'touchstart'
            f = function(e) {
                touchStart(e, ele)
            }
            ele.addEventListener(name, f, false)
            _events.push({ ele, name, f })

        })
    }

    //unbindEvents
    function unbindEvents() {
        each(_events, ({ ele, name, f }) => {
            ele.removeEventListener(name, f)
        })
    }

    function dragStart(e, ele, from) {
        //console.log('dragStart', e, ele, from)

        //getIndex
        let kitem = getIndex(ele, attIndex)

        //check
        if (kitem === null) { //不能用!kitem判斷, 因kitem可能為0
            //console.log('dragStart: 無法取得kitem')
            return
        }

        _startInd = kitem
        _startEle = ele

        //emit
        let msg = {
            event: e,
            startInd: _startInd,
            startEle: _startEle,
        }
        ev.emit('change', { mode: 'start', ...msg })
        ev.emit('start', msg)

        //p
        let p = getPointFromEvent(e)
        if (!p) {
            return
        }

        //createPreview
        pv.createPreview(ele, p.clientX, p.clientY)

    }

    function findEleFromEvent(e) {
        let eleIn = null

        //p
        let p = getPointFromEvent(e)
        if (!p) {
            return eleIn
        }

        //each
        for (let i = 0; i < eles.length; i++) {
            let ele = eles[i]
            let b = domIsPageXYIn(p.pageX, p.pageY, ele)
            if (b) {
                eleIn = ele
                break
            }
        }

        return eleIn
    }

    function dragMove(e, from) {
        //console.log('dragMove', e, from)

        //check
        if (_startInd === null) {
            return
        }

        //p
        let p = getPointFromEvent(e)
        if (!p) {
            return
        }

        function emitEnter(endInd, endEle) {
            _endInd = endInd
            _endEle = endEle

            //emit
            let msg = {
                event: e,
                startInd: _startInd,
                startEle: _startEle,
                endInd: _endInd,
                endEle: _endEle,
            }
            ev.emit('change', { mode: 'enter', ...msg })
            ev.emit('enter', msg)

        }

        function emitLeave() {

            //emit
            let msg = {
                event: e,
                startInd: _startInd,
                startEle: _startEle,
                endInd: _endInd,
                endEle: _endEle,
            }
            ev.emit('change', { mode: 'leave', ...msg })
            ev.emit('leave', msg)

            //clear, 要放在emit之後才能清除
            _endInd = null
            _endEle = null

        }

        function emitMove(rl, rx, ry) {

            //emit
            let msg = {
                event: e,
                startInd: _startInd,
                startEle: _startEle,
                endInd: _endInd,
                endEle: _endEle,
                ...rl,
                rx,
                ry,
            }
            ev.emit('change', { mode: 'move', ...msg })
            ev.emit('move', msg)

        }

        //eleIn
        let eleIn = findEleFromEvent(e)

        //check
        if (!eleIn) {

            //check
            if (_endInd !== null) {

                //emitLeave
                emitLeave()

            }

            return
        }

        //getIndex
        let kitem = getIndex(eleIn, attIndex)

        //check
        if (kitem === null) { //不能用!kitem判斷, 因kitem可能為0
            //console.log('dragMove: 無法取得kitem')
            return
        }

        //check
        if (kitem === _startInd) { //拖曳至原拖曳項目

            //由其他拖曳項目拖曳至原拖曳項目內, 需要觸發leave事件
            if (_endInd !== null) {

                //emitLeave
                emitLeave()

            }

            return
        }

        //check
        if (kitem !== _endInd) { //拖曳至不同於上一個拖曳項目
            //enter

            //於其他拖曳項目之間拖曳, 且非拖曳至原拖曳項目, 故也需要觸發leave事件
            if (_endInd !== null) {

                //emitLeave
                emitLeave()

            }

            //emitEnter
            emitEnter(kitem, eleIn)

        }
        else { //move, 於上一個拖曳項目內拖曳

            //rl
            let rl = getPointRefLoc(p, eleIn)

            //rx, ry
            let rx = 0
            if (rl.w > 0) {
                rx = rl.x / rl.w
            }
            let ry = 0
            if (rl.h > 0) {
                ry = rl.y / rl.h
            }

            if (rx >= 0 && rx <= 1 && ry >= 0 && ry <= 1) {

                //emitMove
                emitMove(rl, rx, ry)

            }

        }

    }

    function dragDrop(e, from) {
        //console.log('dragDrop', e, from)

        //domCancelEvent
        domCancelEvent(e)

        //removeDragPreview
        pv.removeDragPreview()

        //check
        if (_startInd === null) {
            return
        }

        function emitDrop(endInd, endEle) {
            _endInd = endInd
            _endEle = endEle

            //emit
            let msg = {
                event: e,
                startInd: _startInd,
                startEle: _startEle,
                endInd: _endInd,
                endEle: _endEle,
            }
            ev.emit('change', { mode: 'drop', ...msg })
            ev.emit('drop', msg)

        }

        //eleIn
        let eleIn = findEleFromEvent(e)

        //check, 釋放時不在拖曳元素內故跳出
        if (!eleIn) {
            _startInd = null
            _startEle = null
            _endInd = null
            _endEle = null
            return
        }

        //getIndex
        let kitem = getIndex(eleIn, attIndex)

        //check
        if (kitem === null) { //不能用!kitem判斷, 因kitem可能為0
            //console.log('dragDrop: 無法取得kitem')
            return
        }

        //emitDrop, 若拖曳至原拖曳項目上也要能觸發, 否則外部收不到滑鼠放掉訊息, 僅收得到拖曳至非拖曳項目的leave事件
        emitDrop(kitem, eleIn)

        //clear, 要放在emit之後才能清除
        _startInd = null
        _startEle = null
        _endInd = null
        _endEle = null

    }

    function touchStart(e, ele) {
        //console.log('touchStart', e, ele)

        //domCancelEvent, touchstart需取消之後拖曳事件, 否則會變成捲動螢幕
        domCancelEvent(e)

        //dragStart
        dragStart(e, ele, 'touch')

    }

    //ev
    let ev = evem()

    //bindEvents, setAttrs
    bindEvents()
    setAttrs()

    //save
    ev.gid = gid
    ev.clear = function() {
        unbindEvents()
        pv.clear()
    }

    return ev
}


export default domDrag
