import get from 'lodash/get'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import evem from './evem.mjs'
import domCancelEvent from './domCancelEvent.mjs'


/**
 * 前端監聽指定panel與bar的DOM元素，可偵測滾輪與拖曳bar事件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDragBarAndScroll.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} panel 輸入panel元素
 * @param {HTMLElement} bar 輸入bar元素
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [getHeighRatio=()=>1] 輸入取得高度比例函數，因組件本身或內容物可能會調整尺寸, 故需由外部給予函數取得當前heighRatio，預設()=>1
 * @param {Function} [getWidthRatio=()=>1] 輸入取得寬度比例函數，因組件本身或內容物可能會調整尺寸, 故需由外部給予函數取得當前widthRatio，預設()=>1
 * @param {Boolean} [stopScrollPropagationForPanel=false] 輸入是否停用滑鼠捲動事件向上傳遞布林值，預設false
 * @param {Boolean} [stopTouchDragPropagationForPanel=false] 輸入是否停用手機拖曳事件向上傳遞布林值，預設false
 * @param {Boolean} [useTouchDragForPanel=true] 輸入是否使用手機拖曳事件布林值，預設true
 * @returns {Object} 回傳物件，可使用on與clear函數，on可監聽pressBar、dragBar、freeBar事件，clear為釋放監聽
 * @example
 * need test in browser
 *
 * //監聽dom
 * let divPanel = document.querySelector('#id_panel')
 * let divBar = document.querySelector('#id_bar')
 * let getHeighRatio = () => 0.9
 * let das = domDragBarAndScroll(divPanel, divBar, { getHeighRatio, stopScrollPropagationForPanel: true, stopTouchDragPropagationForPanel: true })
 * das.on('scrollPanel', () => {})
 * das.on('pressBar', () => {})
 * das.on('dragBar', () => {})
 * das.on('freeBar', () => {})
 *
 * //釋放監聽
 * das.clear()
 *
 */
function domDragBarAndScroll(panel, bar, opt = {}) {
    let fPanelWheel = null
    let fPanelTouchstart = null
    let fPanelTouchmove = null
    let fPanelTouchend = null
    let fBarMousedown = null
    let fBarMouseup = null
    let fBarTouchstart = null
    let fBarTouchmove = null
    let fBarTouchend = null
    let fWindowMousemove = null
    let fWindowMouseup = null
    let fWindowScroll = null
    let fWindowWheel = null
    let fDocumentScroll = null
    let fDocumentWheel = null
    let barPressing = false

    //getHeighRatio, 因組件本身或內容物可能會調整尺寸, 故需由外部給予函數取得當前heighRatio
    let getHeighRatio = get(opt, 'getHeighRatio', null)
    if (!isFunction(getHeighRatio)) {
        getHeighRatio = () => 1
    }

    //getWidthRatio, 因組件本身或內容物可能會調整尺寸, 故需由外部給予函數取得當前widthRatio
    let getWidthRatio = get(opt, 'getWidthRatio', null)
    if (!isFunction(getWidthRatio)) {
        getWidthRatio = () => 1
    }

    //stopScrollPropagationForPanel
    let stopScrollPropagationForPanel = get(opt, 'stopScrollPropagationForPanel', null)
    if (!isBoolean(stopScrollPropagationForPanel)) {
        stopScrollPropagationForPanel = false
    }

    //stopTouchDragPropagationForPanel
    let stopTouchDragPropagationForPanel = get(opt, 'stopTouchDragPropagationForPanel', null)
    if (!isBoolean(stopTouchDragPropagationForPanel)) {
        stopTouchDragPropagationForPanel = false
    }

    //useTouchDragForPanel
    let useTouchDragForPanel = get(opt, 'useTouchDragForPanel', null)
    if (!isBoolean(useTouchDragForPanel)) {
        useTouchDragForPanel = true
    }

    //ele
    let elePanel = panel
    let eleBar = bar

    //ev
    let ev = evem()

    function add() {

        //fPanelWheel
        fPanelWheel = (e) => {
            let ry = e.deltaY / Math.abs(e.deltaY)
            let rx = e.deltaX / Math.abs(e.deltaX)
            ev.emit('scrollPanel', { ratioY: ry, ratioX: rx }) //寬版頁面, 用滾輪上下捲動, 實際是傳移動距離給bar
            if (stopScrollPropagationForPanel) {
                domCancelEvent(e) //要禁止外部元素如body被滑鼠捲動
            }
        }
        elePanel.addEventListener('wheel', fPanelWheel)

        //fPanelTouchstart
        fPanelTouchstart = (e) => {
            if (useTouchDragForPanel) {

                //acy, acx
                let acy = get(e, `touches.0.clientY`, 0)
                let acx = get(e, `touches.0.clientX`, 0)

                //cy, cx
                let cy = -acy * getHeighRatio()
                let cx = -acx * getWidthRatio()

                //barPressing
                barPressing = true

                //emit
                ev.emit('pressBar', { clientY: cy, clientX: cx }) //窄版頁面, 上鎖與紀錄頁面點擊y座標, 僅紀錄第一觸擊點座標, 另需被heighRatio修正比例

                //cancel
                if (stopTouchDragPropagationForPanel) {
                    domCancelEvent(e)
                }

            }
        }
        elePanel.addEventListener('touchstart', fPanelTouchstart)

        //fPanelTouchmove
        fPanelTouchmove = (e) => {
            if (useTouchDragForPanel && barPressing) {

                //acy, acx
                let acy = get(e, `touches.0.clientY`, 0)
                let acx = get(e, `touches.0.clientX`, 0)

                // //check, 若水平向分量滑動較多, 則清空垂直向移動並結束
                // if (acx > 0 && acy > 0 && Math.abs(acx) >= Math.abs(acy)) {
                //     e.touches[0].clientY = 0 //Cannot set property clientY of #<Touch> which has only a getter
                //     return
                // }

                //cy, cx
                let cy = -acy * getHeighRatio()
                let cx = -acx * getWidthRatio()

                //emit
                ev.emit('dragBar', { clientY: cy, clientX: cx }) //窄版頁面, 用滑動距離拖曳頁面, 實際是傳移動距離給bar, 僅紀錄第一觸擊點座標, 另需被heighRatio修正比例

                //cancel
                if (stopTouchDragPropagationForPanel) {
                    domCancelEvent(e) //要禁止外部元素如body被拖曳移動畫面, 此會導致無法左右拖曳元素(導致開啟overflow-x:auto無法使用)
                }

            }
        }
        elePanel.addEventListener('touchmove', fPanelTouchmove, { passive: false }) //必須使用passive=false否則無法cancel

        //fPanelTouchend
        fPanelTouchend = (e) => {
            if (useTouchDragForPanel && barPressing) {

                //barPressing
                barPressing = false

                //emit
                ev.emit('freeBar') //窄版頁面, 解鎖

                //cancel
                if (stopTouchDragPropagationForPanel) {
                    domCancelEvent(e)
                }

            }
        }
        elePanel.addEventListener('touchend', fPanelTouchend)

        //fBarMousedown
        fBarMousedown = (e) => {
            barPressing = true
            ev.emit('pressBar', { clientY: e.clientY, clientX: e.clientX }) //寬版bar, 上鎖與紀錄點擊y座標
            //domCancelEvent(e)
        }
        eleBar.addEventListener('mousedown', fBarMousedown)

        //fBarMouseup, 可由fWindowMouseup自動解鎖, 不過若嵌入panel有攔截mouseup事件(例如popup)會導致外面window收不到mouseup事件, 故bar的mouseup事件仍需要監聽處理解鎖行為
        fBarMouseup = (e) => {
            if (barPressing) {
                barPressing = false
                ev.emit('freeBar') //窄版bar, 解鎖
                //domCancelEvent(e)
            }
        }
        eleBar.addEventListener('mouseup', fBarMouseup)

        //fBarTouchstart
        fBarTouchstart = (e) => {
            barPressing = true
            ev.emit('pressBar', { clientY: e.touches[0].clientY, clientX: e.touches[0].clientX }) //窄版bar, 上鎖與紀錄bar點擊y座標
            //domCancelEvent(e)
        }
        eleBar.addEventListener('touchstart', fBarTouchstart)

        //fBarTouchmove
        fBarTouchmove = (e) => {
            if (barPressing) {
                ev.emit('dragBar', { clientY: e.touches[0].clientY, clientX: e.touches[0].clientX }) //窄版bar, 用滑動距離拖曳bar, 實際是傳移動距離給bar
                domCancelEvent(e) //要禁止外部元素如body被拖曳移動畫面
            }
        }
        eleBar.addEventListener('touchmove', fBarTouchmove, { passive: false }) //必須使用passive=false否則無法cancel

        //fBarTouchend
        fBarTouchend = (e) => {
            if (barPressing) {
                barPressing = false
                ev.emit('freeBar') //窄版bar, 解鎖
                //domCancelEvent(e)
            }
        }
        eleBar.addEventListener('touchend', fBarTouchend)

        //fWindowMousemove
        fWindowMousemove = (e) => {
            if (barPressing) {
                ev.emit('dragBar', { clientY: e.clientY, clientX: e.clientX }) //寬版bar, 用鎖與滑動距離拖曳bar
                //domCancelEvent(e)
            }
        }
        window.addEventListener('mousemove', fWindowMousemove)

        //fWindowMouseup
        fWindowMouseup = (e) => {
            if (barPressing) {
                barPressing = false
                ev.emit('freeBar') //寬版bar, 解鎖
                if (stopScrollPropagationForPanel) {
                    domCancelEvent(e) //要禁止回傳否則會連外部body捲軸一起移動畫面
                }
            }
        }
        window.addEventListener('mouseup', fWindowMouseup)

        //fWindowScroll
        fWindowScroll = (e) => {
            // if (barPressing) {
            //     console.log('cancel window scroll')
            //     //若已經為滑鼠捲動或觸控拖曳時, 則取消傳遞至外部的scroll事件, 避免例如手機拖曳觸底時會另外呼叫window的scroll事件
            //     //此事件無法取消(cancelable=false), 即便使用passive=false
            //     domCancelEvent(e)
            // }
        }
        window.addEventListener('scroll', fWindowScroll, { passive: false })

        //fWindowWheel
        fWindowWheel = (e) => {
            // if (barPressing) {
            //     console.log('cancel window wheel')
            //     //若已經為滑鼠捲動或觸控拖曳時, 則取消傳遞至外部的scroll事件, 避免例如手機拖曳觸底時會另外呼叫window的scroll事件
            //     //此事件無法取消(cancelable=false), 即便使用passive=false
            //     domCancelEvent(e)
            // }
        }
        window.addEventListener('wheel', fWindowWheel, { passive: false })

        //fDocumentScroll
        fDocumentScroll = (e) => {
            // if (barPressing) {
            //     console.log('cancel document scroll')
            //     //若已經為滑鼠捲動或觸控拖曳時, 則取消傳遞至外部的scroll事件, 避免例如手機拖曳觸底時會另外呼叫window的scroll事件
            //     //此事件無法取消(cancelable=false), 即便使用passive=false
            //     domCancelEvent(e)
            // }
        }
        document.addEventListener('scroll', fDocumentScroll, { passive: false })

        //fDocumentWheel
        fDocumentWheel = (e) => {
            // if (barPressing) {
            //     console.log('cancel document wheel')
            //     //若已經為滑鼠捲動或觸控拖曳時, 則取消傳遞至外部的scroll事件, 避免例如手機拖曳觸底時會另外呼叫window的scroll事件
            //     //此事件無法取消(cancelable=false), 即便使用passive=false
            //     domCancelEvent(e)
            // }
        }
        document.addEventListener('wheel', fDocumentWheel, { passive: false })

    }

    function clear() {

        //elePanel remove wheel, touchstart, touchmove, touchend
        elePanel.removeEventListener('wheel', fPanelWheel)
        elePanel.removeEventListener('touchstart', fPanelTouchstart)
        elePanel.removeEventListener('touchmove', fPanelTouchmove)
        elePanel.removeEventListener('touchend', fPanelTouchend)

        //eleBar remove mousedown, mouseup, touchstart, touchmove, touchend
        eleBar.removeEventListener('mousedown', fBarMousedown)
        eleBar.removeEventListener('mouseup', fBarMouseup)
        eleBar.removeEventListener('touchstart', fBarTouchstart)
        eleBar.removeEventListener('touchmove', fBarTouchmove)
        eleBar.removeEventListener('touchend', fBarTouchend)

        //window remove mousemove, mouseup, wheel
        window.removeEventListener('mousemove', fWindowMousemove)
        window.removeEventListener('mouseup', fWindowMouseup)
        window.removeEventListener('scroll', fWindowScroll)
        window.removeEventListener('wheel', fWindowWheel)

        //document remove scroll, wheel
        document.removeEventListener('scroll', fDocumentScroll)
        document.removeEventListener('wheel', fDocumentWheel)

    }

    //add
    add()

    //save
    ev.clear = clear

    return ev
}


export default domDragBarAndScroll
