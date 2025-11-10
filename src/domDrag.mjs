import each from 'lodash-es/each.js'
import get from 'lodash-es/get.js'
import pull from 'lodash-es/pull.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import isNumber from 'lodash-es/isNumber.js'
import genID from './genID.mjs'
import isestr from './isestr.mjs'
import isEle from './isEle.mjs'
import cint from './cint.mjs'
import evem from './evem.mjs'
import haskey from './haskey.mjs'
import domGetParents from './domGetParents.mjs'
import domGetPointFromEvent from './domGetPointFromEvent.mjs'
import domElementsFromPoint from './domElementsFromPoint.mjs'
import domGetAttr from './domGetAttr.mjs'
import domGetBoudRectRefSelf from './domGetBoudRectRefSelf.mjs'
import domDragPreview from './domDragPreview.mjs'


let kpDgs = {}


function regAndGetGroupEv(gid, eid, { attIdentify, previewOpacity, previewBackground, previewBorderWidth, previewBorderColor }) {

    //create
    if (!haskey(kpDgs, gid)) {

        //evg
        let evg = evem()

        //oevg
        let funs = {
            dragMove: (msg) => {
                evg.emit(gid + '-dragMove', msg)
            },
            dragDrop: (msg) => {
                evg.emit(gid + '-dragDrop', msg)
            },
        }
        let oevg = dgEvGroup(funs)
        // console.log('oevg', oevg)

        //bind
        oevg.bind()

        //domDragPreview
        let pv = domDragPreview({
            attIdentify,
            containerOpacity: previewOpacity,
            containerBackground: previewBackground,
            containerBorderWidth: previewBorderWidth,
            containerBorderColor: previewBorderColor,
        })

        //init
        kpDgs[gid] = {
            eleIds: [],
            evg,
            oevg,
            pv,
            isInit: false,
            isActive: true,
        }

    }

    //push eid
    kpDgs[gid].eleIds.push(eid)

    //return evg
    return kpDgs[gid].evg
}


function findEleFromEventEle(e, attGroup, gid) {
    let r = null

    //domGetParents
    let ps = domGetParents(e.target)
    // console.log('ps',ps,e)

    //domGetAttr
    each(ps, (v) => {
        let attr = domGetAttr(v, attGroup)
        if (attr === gid) {
            r = v
            return false //跳出
        }
    })

    return r
}


function findEleFromEventClientXY(e, attGroup, gid) {
    let r = null

    //domGetPointFromEvent
    let p = domGetPointFromEvent(e)
    if (!p) {
        return r
    }
    // console.log('p',p)

    //domElementsFromPoint
    let ps = domElementsFromPoint(p.clientX, p.clientY)
    // console.log('ps',ps)

    //domGetAttr
    each(ps, (v) => {
        let attr = domGetAttr(v, attGroup)
        if (attr === gid) {
            r = v
            return false //跳出
        }
    })

    return r
}


function getIndex(ele, attIndex) {
    let kitem = domGetAttr(ele, attIndex)
    kitem = cint(kitem)
    return kitem
}


function dgEvGroup(funs) {
    let _window_events = []

    function bindWindowEvents() {
        let name

        name = 'mousemove'
        let fw_mousemove = function(e) {
            funs.dragMove({ e, name: 'mousemove' })
        }
        window.addEventListener(name, fw_mousemove)
        _window_events.push({ ele: window, name, f: fw_mousemove })

        name = 'mouseup'
        let fw_mouseup = function(e) {
            funs.dragDrop({ e, name: 'mouseup' })
        }
        window.addEventListener(name, fw_mouseup)
        _window_events.push({ ele: window, name, f: fw_mouseup })

        name = 'touchmove'
        let fw_touchmove = function(e) {
            funs.dragMove({ e, name: 'touchmove' })
        }
        window.addEventListener(name, fw_touchmove)
        _window_events.push({ ele: window, name, f: fw_touchmove })

        name = 'touchend'
        let fw_touchend = function(e) {
            funs.dragDrop({ e, name: 'touchend' })
        }
        window.addEventListener(name, fw_touchend)
        _window_events.push({ ele: window, name, f: fw_touchend })

    }

    function unbindWindowEvents() {
        each(_window_events, ({ ele, name, f }) => {
            ele.removeEventListener(name, f)
        })
    }

    return {
        bind: bindWindowEvents,
        unbind: unbindWindowEvents,
    }
}


function dgEvEle(ele, funs, gid, eid) {
    // console.log('dgEvEle', ele, gid, eid)
    let _ele_events = []

    function bindEleEvents() {
        let name

        name = 'mousedown'
        let fe_mousedown = function(e) {
            funs.dragStart({ e, ele, name: 'mousedown' })
        }
        ele.addEventListener(name, fe_mousedown, false)
        _ele_events.push({ ele, name, f: fe_mousedown })

        name = 'touchstart'
        let fe_touchstart = function(e) {
            funs.dragStart({ e, ele, name: 'touchstart' })
        }
        ele.addEventListener(name, fe_touchstart, false)
        _ele_events.push({ ele, name, f: fe_touchstart })

        name = 'touchmove'
        let fe_touchmove = function(e) {
            funs.dragMove({ e, name: 'touchmove' })
            //domCancelEvent(e) //不能使用domCancelEvent, 因其內使用stopPropagation會連window的touchmove無法收到訊息
            if (e.cancelable) { //window捲動中時事件為禁止取消(cancelable=false)狀態
                e.preventDefault() //必要, 需由元素touchmove事件阻止預設拖曳行為, 否則會變成捲動螢幕, 此外由window的touchmove事件來阻止會失效
            }
        }
        ele.addEventListener(name, fe_touchmove, false)
        _ele_events.push({ ele, name, f: fe_touchmove })

    }

    function unbindEleEvents() {
        each(_ele_events, ({ ele, name, f }) => {
            ele.removeEventListener(name, f)
        })
    }

    return {
        bind: bindEleEvents,
        unbind: unbindEleEvents,
    }
}


function unbindEleAndGroup(gid, eid) {

    //dg
    let dg = kpDgs[gid]

    //cloneDeep
    let eleIds = cloneDeep(dg.eleIds)

    //pull
    pull(eleIds, eid)

    //save
    dg.eleIds = eleIds

    //check
    if (eleIds.length === 0) { //全部元素已解除監聽

        //unbind
        dg.oevg.unbind()

        //clear
        dg.pv.clear()

        //delete
        delete kpDgs[gid]

    }

}


function dgDragCore({ gid, attGroup, attIndex, attIdentify, timeDragStartDelay, previewOpacity, previewDisabledOpacity }) {
    let _startInd = null
    let _startEle = null
    let _endInd = null
    let _endEle = null

    //check
    if (kpDgs[gid].isInit) {
        return kpDgs[gid].evg
    }

    //isInit
    kpDgs[gid].isInit = true

    //evg
    let evg = kpDgs[gid].evg

    //on events
    evg.on(gid + '-dragStart', dragStart)
    evg.on(gid + '-dragMove', dragMove)
    evg.on(gid + '-dragDrop', dragDrop)

    //pv
    let pv = kpDgs[gid].pv

    function dragStart({ e, ele, from }) {
        // console.log('dragStart', e, ele, from)

        //check
        if (!kpDgs[gid].isActive) {
            return
        }

        //getIndex
        let kitem = getIndex(ele, attIndex)
        // console.log('kitem', kitem)

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
            tarInd: _startInd,
            tarEid: domGetAttr(_startEle, attIdentify),
        }
        evg.emit(gid + '-change', { mode: 'start', ...msg })
        evg.emit(gid + '-start', msg)

        //p
        let p = domGetPointFromEvent(e)
        if (!p) {
            return
        }

        //setTimeout, preview不能太快出現導致原本元素例如click事件失效
        setTimeout(() => {

            //check, 若觸發例如dragDrop事件因已清除故會無_startInd
            if (_startInd === null) {
                return
            }

            //createPreview
            pv.createPreview(_startEle, p.clientX, p.clientY)

            //setContainerStyle
            pv.setContainerStyle({ opacity: previewDisabledOpacity })

        }, timeDragStartDelay)

    }

    function dragMove({ e, name, from }) {
        // console.log('dragMove', e, name, from)

        //check
        if (!kpDgs[gid].isActive) {
            return
        }

        //eleIn
        let eleIn = findEleFromEventEle(e, attGroup, gid)
        // console.log('findEleFromEventEle eleIn',eleIn)

        //check
        if (_startInd === null) {
            return
        }

        //p
        let p = domGetPointFromEvent(e)
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
                tarInd: _endInd,
                tarEid: domGetAttr(_endEle, attIdentify),
            }
            evg.emit(gid + '-change', { mode: 'enter', ...msg })
            evg.emit(gid + '-enter', msg)

            //setContainerStyle
            pv.setContainerStyle({ opacity: previewOpacity })

        }

        function emitLeave() {

            //emit
            let msg = {
                event: e,
                startInd: _startInd,
                startEle: _startEle,
                endInd: _endInd,
                endEle: _endEle,
                tarInd: _endInd,
                tarEid: domGetAttr(_endEle, attIdentify),
            }
            evg.emit(gid + '-change', { mode: 'leave', ...msg })
            evg.emit(gid + '-leave', msg)

            //clear, 要放在emit之後才能清除
            _endInd = null
            _endEle = null

            //setContainerStyle
            pv.setContainerStyle({ opacity: previewDisabledOpacity })

        }

        function emitMove(rl, rx, ry) {

            //emit
            let msg = {
                event: e,
                startInd: _startInd,
                startEle: _startEle,
                endInd: _endInd,
                endEle: _endEle,
                tarInd: _endInd,
                tarEid: domGetAttr(_endEle, attIdentify),
                ...rl,
                rx,
                ry,
            }
            evg.emit(gid + '-change', { mode: 'move', ...msg })
            evg.emit(gid + '-move', msg)

            //setContainerStyle
            pv.setContainerStyle({ opacity: previewOpacity })

        }

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
            let rl = domGetBoudRectRefSelf(p, eleIn)

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

    function dragDrop({ e, name, from }) {
        // console.log('dragDrop', e, name, from)

        //removeDragPreview
        pv.removeDragPreview()
        // //pauseDragPreview
        // pv.pauseDragPreview(true)

        //check
        if (!kpDgs[gid].isActive) {
            return
        }

        //check
        if (_startInd === null) {
            //console.log('dragDrop: 無_startInd')
            return
        }
        // console.log('dragDrop', '_startInd', _startInd)

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
                tarInd: _endInd,
                tarEid: domGetAttr(_endEle, attIdentify),
            }
            evg.emit(gid + '-change', { mode: 'drop', ...msg })
            evg.emit(gid + '-drop', msg)

        }

        //eleIn
        let eleIn = findEleFromEventClientXY(e, attGroup, gid)
        // console.log('findEleFromEventClientXY eleIn',eleIn)

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

}


/**
 * 前端針對DOM元素設定監聽拖曳事件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDrag.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.attIdentify='dragid'] 輸入預覽元素唯一識別用之屬性名稱字串，預設'dragid'
 * @param {String} [opt.attIndex='dragindex'] 輸入預覽元素順序指標之屬性名稱字串，預設'dragindex'
 * @param {String} [opt.attGroup='draggroup'] 輸入預覽元素群組之屬性名稱字串，預設'draggroup'
 * @param {String} [opt.group='group'] 輸入預覽元素群組字串，預設'group'
 * @param {Number} [opt.timeDragStartDelay=120] 輸入預覽元素由點擊後延遲出現的時間數字，單位為毫秒ms，預設120。使用pointerEvents會導致游標樣式失效，故延遲顯示可用來讓點擊事件穿透
 * @param {Number} [opt.previewOpacity=0.4] 輸入預覽元素透明度數字，預設0.4
 * @param {Number} [opt.previewDisabledOpacity=0.2] 輸入無效時(位於非可拖曳元素內)預覽元素透明度數字，預設0.2
 * @param {String} [opt.previewBackground='white'] 輸入預覽元素背景顏色字串，預設'white'
 * @param {Number} [opt.previewBorderWidth=1] 輸入預覽元素邊框寬度數字，預設1
 * @param {String} [opt.previewBorderColor='#f26'] 輸入預覽元素邊框顏色字串，預設'#f26'
 * @returns {Object} 回傳物件，可使用on與clear函數，on可監聽change、start、move、enter、leave、drop事件，clear為釋放監聽
 * @example
 * need test in browser
 *
 * //監聽dom
 * let dd = domDrag(document.querySelector('#id'), { group:'group', attIndex: 'dragindex' })
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

    //check
    if (!isEle(ele)) {
        console.log('ele is not a HTMLElement', ele)
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

    //group
    let group = get(opt, 'group', null)
    if (!isestr(group)) {
        group = 'group'
    }

    //previewOpacity
    let previewOpacity = get(opt, 'previewOpacity', null)
    if (!isNumber(previewOpacity)) {
        previewOpacity = 0.4
    }

    //previewDisabledOpacity
    let previewDisabledOpacity = get(opt, 'previewDisabledOpacity', null)
    if (!isNumber(previewDisabledOpacity)) {
        previewDisabledOpacity = 0.2
    }

    //previewBackground
    let previewBackground = get(opt, 'previewBackground', null)
    if (!isestr(previewBackground)) {
        previewBackground = 'white'
    }

    //previewBorderWidth
    let previewBorderWidth = get(opt, 'previewBorderWidth', null)
    if (!isNumber(previewBorderWidth)) {
        previewBorderWidth = 1
    }

    //previewBorderColor
    let previewBorderColor = get(opt, 'previewBorderColor', null)
    if (!isestr(previewBorderColor)) {
        previewBorderColor = '#f26'
    }

    //timeDragStartDelay
    let timeDragStartDelay = get(opt, 'timeDragStartDelay', null)
    if (!isNumber(timeDragStartDelay)) {
        timeDragStartDelay = 120
    }

    //eid
    let eid = `c${genID(8)}`

    //gid
    let gid = group

    //setAttribute
    ele.setAttribute(attGroup, gid)
    ele.setAttribute(attIdentify, eid)

    //evg
    let evg = regAndGetGroupEv(gid, eid, { attIdentify, previewOpacity, previewBackground, previewBorderWidth, previewBorderColor })
    // console.log('evg', evg)

    //dgEvEle
    let eleFuncs = {
        dragStart: (msg) => {
            evg.emit(gid + '-dragStart', msg)
        },
        dragMove: (msg) => {
            evg.emit(gid + '-dragMove', msg)
        },
    }
    let oeve = dgEvEle(ele, eleFuncs, gid, eid)
    // console.log('ele', ele, 'oeve', oeve)

    //bind
    oeve.bind()

    //dgDragCore
    dgDragCore({ gid, attGroup, attIndex, attIdentify, timeDragStartDelay, previewOpacity, previewDisabledOpacity })

    function unbind() {

        //unbind
        oeve.unbind()

        //unbindEleAndGroup
        unbindEleAndGroup(gid, eid)

    }

    function setIsActive(isActive) {
        kpDgs[gid].isActive = isActive
    }

    //ev
    let ev = evem()

    //evg on
    evg.on(group + '-change', (msg) => {
        // console.log('dg evg', group + '-change', msg)
        if (msg.tarEid === eid) {
            ev.emit('change', msg)
        }
    })
    evg.on(group + '-start', (msg) => {
        // console.log('dg evg', group + '-start', msg)
        if (msg.tarEid === eid) {
            ev.emit('start', msg)
        }
    })
    evg.on(group + '-move', (msg) => {
        // console.log('dg evg', group + '-move', msg)
        if (msg.tarEid === eid) {
            ev.emit('move', msg)
        }
    })
    evg.on(group + '-enter', (msg) => {
        // console.log('dg evg', group + '-enter', msg)
        if (msg.tarEid === eid) {
            ev.emit('enter', msg)
        }
    })
    evg.on(group + '-leave', (msg) => {
        // console.log('dg evg', group + '-leave', msg)
        if (msg.tarEid === eid) {
            ev.emit('leave', msg)
        }
    })
    evg.on(group + '-drop', (msg) => {
        // console.log('dg evg', group + '-drop', msg)
        if (msg.tarEid === eid) {
            ev.emit('drop', msg)
        }
    })

    //add setIsActive
    ev.setIsActive = setIsActive

    //add unbind
    ev.unbind = unbind

    return ev
}


export default domDrag
