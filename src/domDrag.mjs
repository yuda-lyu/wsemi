import each from 'lodash/each'
import size from 'lodash/size'
import get from 'lodash/get'
import isNumber from 'lodash/isNumber'
import isBoolean from 'lodash/isBoolean'
import genID from './genID.mjs'
import isestr from './isestr.mjs'
import isEle from './isEle.mjs'
import cint from './cint.mjs'
import evem from './evem.mjs'
import domIsClientXYIn from './domIsClientXYIn.mjs'
import domRemove from './domRemove.mjs'


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


function dragPreview(opt = {}) {
    let _prevName = '_prevName'
    let _ele = null
    let _node = null
    let _cover = null
    let _shell = null
    let _container = null

    //attIdentify, 產生preview會於preview內刪除, 並偵測該欄位與值是否有存在
    let attIdentify = get(opt, 'attIdentify', null)
    if (!isestr(attIdentify)) {
        attIdentify = 'dragid'
    }

    //containerOpacity
    let containerOpacity = get(opt, 'containerOpacity', null)
    if (!isNumber(containerOpacity)) {
        containerOpacity = 0.4
    }

    //containerBackground
    let containerBackground = get(opt, 'containerBackground', null)
    if (!isestr(containerBackground)) {
        containerBackground = 'white'
    }

    //containerBorderWidth
    let containerBorderWidth = get(opt, 'containerBorderWidth', null)
    if (!isNumber(containerBorderWidth)) {
        containerBorderWidth = 1
    }

    //containerBorderColor
    let containerBorderColor = get(opt, 'containerBorderColor', null)
    if (!isestr(containerBorderColor)) {
        containerBorderColor = '#f26'
    }

    function cloneNode(ele, x, y) {
        //console.log('cloneNode')

        //getBoudRect
        let rt = getBoudRect(ele)
        if (!rt) {
            return
        }

        //備份ele
        _ele = ele

        //深複製
        let nd = ele.cloneNode(true)

        //儲存資訊
        nd.tShiftX = x - rt.left
        nd.tShiftY = y - rt.top
        nd.tWidth = ele.offsetWidth
        nd.tHeight = ele.offsetHeight
        nd.tParent = ele.parentNode
        nd.setAttribute(attIdentify, '') //清除attIdentify欄位, 使全域存在唯一識別元素

        return nd
    }

    function createPreview(ele, x, y) {
        //console.log('createPreview')

        function core() {

            //複製ele
            let node = cloneNode(ele, x, y)

            //創建container
            let container = document.createElement('div')
            container.setAttribute('dragpreview', _prevName)

            //創建殼層shell
            let shell = document.createElement('div')
            shell.style.position = 'relative'

            //將複製的ele(node)塞入shell
            shell.appendChild(node)

            //創建遮罩cover
            let cover = document.createElement('div')
            cover.style.position = 'absolute'
            cover.style.zIndex = 1
            cover.style.top = 0
            cover.style.left = 0
            cover.style.width = '100%'
            cover.style.height = '100%'

            //將cover塞入shell
            shell.appendChild(cover)

            //將shell塞入container
            container.appendChild(shell)
            container.style.position = 'fixed'
            container.style.zIndex = 100000
            //container.style.pointerEvents = 'none' //會導致游標樣式失效
            container.style.width = `${node.tWidth + 2 * containerBorderWidth}px`
            container.style.height = `${node.tHeight + 2 * containerBorderWidth}px`
            container.style.opacity = containerOpacity
            container.style.background = containerBackground
            container.style.border = `${containerBorderWidth}px solid ${containerBorderColor}`

            //將container塞入原本ele的父層內
            node.tParent.appendChild(container)

            //儲存至全域
            _node = node
            _cover = cover
            _shell = shell
            _container = container

            //updateDragPreview
            updateDragPreview(x, y, 'createPreview')

        }

        //core, 暴力try catch攔錯, 因可能原dom例如是按鈕要自我刪除故會導致出錯
        try {
            core()
        }
        catch (err) {}

        //檢查原始元素是否存在, 若例如拖曳項目是可自我刪除的按鈕, 就有可能產生preview後原始元素被刪除, 故需跟著清除preview
        let t = setInterval(() => {
            let dragid = getAttr(_ele, 'dragid')
            let draggroup = getAttr(_ele, 'draggroup')
            let ele = document.querySelector(`[dragid='${dragid}'][draggroup='${draggroup}']`)
            if (!ele) {
                clearInterval(t)
                removeDragPreview()
            }
        }, 500)

    }

    function updateDragPreview(x, y, from) {
        //console.log('updateDragPreview', x, y, from)

        //check
        if (!_node || !_cover || !_shell || !_container) {
            return
        }

        //update
        _container.style.top = `${y - _node.tShiftY}px`
        _container.style.left = `${x - _node.tShiftX}px`

    }

    function removeDragPreview() {
        //console.log('removeDragPreview')

        //domRemove
        domRemove(`[dragpreview=${_prevName}]`)

        //clear
        _node = null
        _cover = null
        _shell = null
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

    function setNodeStyle(st) {
        try {
            each(st, (v, k) => {
                _node.style[k] = v
            })
        }
        catch (err) {}
    }

    function setCoverStyle(st) {
        try {
            each(st, (v, k) => {
                _cover.style[k] = v
            })
        }
        catch (err) {}
    }

    function setSellStyle(st) {
        try {
            each(st, (v, k) => {
                _shell.style[k] = v
            })
        }
        catch (err) {}
    }

    function setContainerStyle(st) {
        try {
            each(st, (v, k) => {
                _container.style[k] = v
            })
        }
        catch (err) {}
    }

    function clear() {
        window.removeEventListener('mousemove', evMM)
        window.removeEventListener('touchmove', evTM)
    }

    return {
        createPreview,
        updateDragPreview,
        removeDragPreview,
        setNodeStyle,
        setCoverStyle,
        setSellStyle,
        setContainerStyle,
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
 * @param {String} [opt.active=true] 輸入是否啟用拖曳功能布林值，預設true
 * @param {String} [opt.attIdentify='dragid'] 輸入標記元素唯一識別用字串，預設'dragid'
 * @param {String} [opt.attIndex='dragindex'] 輸入標記元素順序指標字串，預設'dragindex'
 * @param {String} [opt.attGroup='draggroup'] 輸入標記元素群組字串，預設'draggroup'
 * @param {String} [opt.selectors='[dragtag]'] 輸入查詢元素用字串，主要是給draggable.js用來標記哪些元素可被拖曳之用，預設'[dragtag]'
 * @param {Number} [opt.timeDragStartDelay=120] 輸入標記元素由點擊後延遲出現的時間數字，單位ms，預設120。使用pointerEvents會導致游標樣式失效，故延遲顯示可用來讓點擊事件穿透
 * @param {Number} [opt.previewOpacity=0.4] 輸入標記元素透明度數字，預設0.4
 * @param {String} [opt.previewBackground='white'] 輸入標記元素背景顏色字串，預設'white'
 * @param {Number} [opt.previewBorderWidth=1] 輸入標記元素邊框寬度數字，預設1
 * @param {String} [opt.previewBorderColor='#f26'] 輸入標記元素邊框顏色字串，預設'#f26'
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
    let _dragStartPoint = null
    let _createdPreview = false

    //check
    if (!isEle(ele)) {
        console.log('ele is not HTMLElement', ele)
        return
    }

    //attIdentify
    let attIdentify = get(opt, 'attIdentify', null)
    if (!isestr(attIdentify)) {
        attIdentify = 'dragid'
    }

    //attIndex
    let attIndex = get(opt, 'attIndex', null)
    if (!isestr(attIndex)) {
        attIndex = 'dragindex'
    }

    //attGroup
    let attGroup = get(opt, 'attGroup', null)
    if (!isestr(attGroup)) {
        attGroup = 'draggroup'
    }

    //selectors
    let selectors = get(opt, 'selectors', null)
    if (!isestr(selectors)) {
        selectors = '[dragtag]'
    }

    //active
    let active = get(opt, 'active', null)
    if (!isBoolean(active)) {
        active = true
    }

    //timeDragStartDelay
    let timeDragStartDelay = get(opt, 'timeDragStartDelay', null)
    if (!isNumber(timeDragStartDelay)) {
        timeDragStartDelay = 120
    }

    //previewOpacity
    let previewOpacity = get(opt, 'previewOpacity', null)

    //previewBackground
    let previewBackground = get(opt, 'previewBackground', null)

    //previewBorderWidth
    let previewBorderWidth = get(opt, 'previewBorderWidth', null)

    //previewBorderColor
    let previewBorderColor = get(opt, 'previewBorderColor', null)

    //dragPreview
    let pv = dragPreview({
        attIdentify,
        containerOpacity: previewOpacity,
        containerBackground: previewBackground,
        containerBorderWidth: previewBorderWidth,
        containerBorderColor: previewBorderColor,
    })

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
            ele.setAttribute(attGroup, gid)
            ele.setAttribute(attIdentify, `dg-${genID(8)}`)
        })
    }

    //bindEvents
    function bindEvents() {
        let f
        let name

        name = 'mousemove'
        f = function(e) {
            dragMove(e, 'mousemove')
        }
        window.addEventListener(name, f)
        _events.push({ ele: window, name, f })

        name = 'mouseup'
        f = function(e) {
            dragDrop(e, 'mouseup')
        }
        window.addEventListener(name, f)
        _events.push({ ele: window, name, f })

        name = 'touchmove'
        f = function(e) {
            dragMove(e, 'touchmove')
        }
        window.addEventListener(name, f)
        _events.push({ ele: window, name, f })

        name = 'touchend'
        f = function(e) {
            dragDrop(e, 'touchend')
        }
        window.addEventListener(name, f)
        _events.push({ ele: window, name, f })

        each(eles, (ele, k) => { //k不可信, 而eles綁定成為元素需自動更新, 因例如用vue由數據順序產生元素, 當拖曳完的eles將不會是原始元素順序, 但eles仍為原始數據順序

            name = 'mousedown'
            f = function(e) {
                dragStart(e, ele, 'mousedown')
            }
            ele.addEventListener(name, f, false)
            _events.push({ ele, name, f })

            name = 'touchstart'
            f = function(e) {
                dragStart(e, ele, 'touchstart')
            }
            ele.addEventListener(name, f, false)
            _events.push({ ele, name, f })

            name = 'touchmove'
            f = function(e) {
                //domCancelEvent(e) //不能使用domCancelEvent, 因其內使用stopPropagation會連window的touchmove無法收到訊息
                if (e.cancelable) { //window捲動中時事件為禁止取消(cancelable=false)狀態
                    e.preventDefault() //必要, 需由元素touchmove事件阻止預設拖曳行為, 否則會變成捲動螢幕, 此外由window的touchmove事件來阻止會失效
                }
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

    function safeCreatePreview() {
        if (_startEle === null) {
            return
        }
        if (!_createdPreview) {
            let p = _dragStartPoint
            pv.createPreview(_startEle, p.clientX, p.clientY)
            _createdPreview = true
        }
    }


    function findEleFromEvent(e) {
        let eleIn = null

        //p
        let p = getPointFromEvent(e)
        if (!p) {
            return eleIn
        }
        console.log('findEleFromEvent getPointFromEvent e', e)
        console.log('findEleFromEvent getPointFromEvent p', p)

        //each
        for (let i = 0; i < eles.length; i++) {
            let ele = eles[i]
            let b = domIsClientXYIn(p.clientX, p.clientY, ele)
            console.log('domIsClientXYIn', 'p.clientX', p.clientX, 'p.clientY', p.clientY, 'b', b)
            if (b) {
                eleIn = ele
                break
            }
        }

        return eleIn
    }

    function setActive(bol) {
        active = bol
    }

    function dragStart(e, ele, from) {
        //console.log('dragStart', e, ele, from)

        //check
        if (!active) {
            return
        }

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

        //save _dragStartPoint
        _dragStartPoint = p

        //setTimeout, preview不能太快出現導致原本元素例如click事件失效
        setTimeout(() => {

            //check, 若觸發例如dragDrop事件因已清除故會無_startInd
            if (_startInd === null) {
                return
            }

            //safeCreatePreview
            safeCreatePreview()

            //setCoverStyle, 必要, 快速拖曳但只在原拖曳項目時就需要能更改滑鼠游標
            pv.setCoverStyle({ cursor: 'no-drop' })

        }, timeDragStartDelay)

    }

    function dragMove(e, from) {
        //console.log('dragMove', e, from)

        //check
        if (!active) {
            return
        }

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

            //safeCreatePreview
            safeCreatePreview()

            //setCoverStyle
            pv.setCoverStyle({ cursor: 'pointer' })

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

            //setCoverStyle
            pv.setCoverStyle({ cursor: 'no-drop' })

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

            //safeCreatePreview
            safeCreatePreview()

            //setCoverStyle, 必要, 因現在dragStart為延遲觸發會setCoverStyle為no-drop, 當使用者拖曳過快, 就會先觸發完enter內的setCoverStyle, 才換dragStart內延遲觸發setCoverStyle導致游標有誤
            pv.setCoverStyle({ cursor: 'pointer' })

            //updateDragPreview
            pv.updateDragPreview(p.clientX, p.clientY, 'emitMove')

        }

        //eleIn
        let eleIn = findEleFromEvent(e)
        console.log('findEleFromEvent eleIn', eleIn)

        //check, 滑鼠所在處的可被拖曳元素
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
            console.log('p', p)
            console.log('rl', rl)

            //rx, ry
            let rx = 0
            if (rl.w > 0) {
                rx = rl.x / rl.w
            }
            let ry = 0
            if (rl.h > 0) {
                ry = rl.y / rl.h
            }
            console.log('rx', rx, 'ry', ry)

            if (rx >= 0 && rx <= 1 && ry >= 0 && ry <= 1) {

                //emitMove
                emitMove(rl, rx, ry)

            }

        }

    }

    function dragDrop(e, from) {
        //console.log('dragDrop', e, from)

        //check
        if (!active) {
            return
        }

        //removeDragPreview
        pv.removeDragPreview()
        _createdPreview = false

        //check
        if (_startInd === null) {
            //console.log('dragDrop: 無_startInd')
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
            //console.log('dragDrop: 釋放時不在拖曳元素內')
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

    //ev
    let ev = evem()

    //bindEvents, setAttrs
    bindEvents()
    setAttrs()

    //save
    ev.gid = gid
    ev.setActive = setActive
    ev.clear = function() {
        unbindEvents()
        pv.clear()
    }

    return ev
}


export default domDrag
