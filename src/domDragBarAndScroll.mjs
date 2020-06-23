import get from 'lodash/get'
import isBoolean from 'lodash/isBoolean'
import isFunction from 'lodash/isFunction'
import evem from './evem.mjs'
import domCancelEvent from './domCancelEvent.mjs'


/**
 * 前端監聽指定panel與bar的DOM元素，可偵測滾輪與拖曳bar事件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domDragBarAndScroll.test.js Github}
 * @memberOf wsemi
 * @param {HTMLEvent} event 輸入event物件
 * @example
 *
 * //監聽dom
 * let divPanel = ele
 * let divBar = ele
 * let getHeighRatio = () => 0.9
 * let das = domDragBarAndScroll(divPanel, divBar, { getHeighRatio, stopScrollPropagationForPanel: true })
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
    let fBarTouchstart = null
    let fBarTouchmove = null
    let fBarTouchend = null
    let fWindowMousemove = null
    let fWindowMouseup = null
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
                domCancelEvent(e) //要禁止外部元素如body也被捲動
            }
        }
        elePanel.addEventListener('wheel', fPanelWheel)

        //fPanelTouchstart
        fPanelTouchstart = (e) => {
            if (useTouchDragForPanel) {
                let cy = -e.touches[0].clientY * getHeighRatio()
                let cx = -e.touches[0].clientX * getWidthRatio()
                barPressing = true
                ev.emit('pressBar', { clientY: cy, clientX: cx }) //窄版頁面, 上鎖與紀錄頁面點擊y座標, 僅紀錄第一觸擊點座標, 另需被heighRatio修正比例
                // domCancelEvent(e)
            }
        }
        elePanel.addEventListener('touchstart', fPanelTouchstart)

        //fPanelTouchmove
        fPanelTouchmove = (e) => {
            if (barPressing) {
                let cy = -e.touches[0].clientY * getHeighRatio()
                let cx = -e.touches[0].clientX * getWidthRatio()
                ev.emit('dragBar', { clientY: cy, clientX: cx }) //窄版頁面, 用滑動距離拖曳頁面, 實際是傳移動距離給bar, 僅紀錄第一觸擊點座標, 另需被heighRatio修正比例
                domCancelEvent(e) //要禁止回傳否則會連外部body捲軸一起移動畫面
            }
        }
        elePanel.addEventListener('touchmove', fPanelTouchmove)

        //fPanelTouchend
        fPanelTouchend = (e) => {
            if (barPressing) {
                barPressing = false
                ev.emit('freeBar') //窄版頁面, 解鎖
                // domCancelEvent(e)
            }
        }
        elePanel.addEventListener('touchend', fPanelTouchend)

        //fBarMousedown
        fBarMousedown = (e) => {
            barPressing = true
            ev.emit('pressBar', { clientY: e.clientY, clientX: e.clientX }) //寬版bar, 上鎖與紀錄點擊y座標
            // domCancelEvent(e)
        }
        eleBar.addEventListener('mousedown', fBarMousedown)

        //fBarTouchstart
        fBarTouchstart = (e) => {
            barPressing = true
            ev.emit('pressBar', { clientY: e.touches[0].clientY, clientX: e.touches[0].clientX }) //窄版bar, 上鎖與紀錄bar點擊y座標
            // domCancelEvent(e)
        }
        eleBar.addEventListener('touchstart', fBarTouchstart)

        //fBarTouchmove
        fBarTouchmove = (e) => {
            if (barPressing) {
                ev.emit('dragBar', { clientY: e.touches[0].clientY, clientX: e.touches[0].clientX }) //窄版bar, 用滑動距離拖曳bar, 實際是傳移動距離給bar
                domCancelEvent(e) //要禁止回傳否則會連外部body捲軸一起移動畫面
            }
        }
        eleBar.addEventListener('touchmove', fBarTouchmove)

        //fBarTouchend
        fBarTouchend = (e) => {
            if (barPressing) {
                barPressing = false
                ev.emit('freeBar') //窄版bar, 解鎖
                // domCancelEvent(e)
            }
        }
        eleBar.addEventListener('touchend', fBarTouchend)

        //fWindowMousemove
        fWindowMousemove = (e) => {
            if (barPressing) {
                ev.emit('dragBar', { clientY: e.clientY, clientX: e.clientX }) //寬版bar, 用鎖與滑動距離拖曳bar
                // domCancelEvent(e)
            }
        }
        window.addEventListener('mousemove', fWindowMousemove)

        //fWindowMouseup
        fWindowMouseup = (e) => {
            if (barPressing) {
                barPressing = false
                ev.emit('freeBar') //寬版bar, 解鎖
                domCancelEvent(e) //要禁止回傳否則會連外部body捲軸一起移動畫面
            }
        }
        window.addEventListener('mouseup', fWindowMouseup)

    }

    function clear() {

        //elePanel remove wheel, touchstart, touchmove, touchend
        elePanel.removeEventListener('wheel', fPanelWheel)
        elePanel.removeEventListener('touchstart', fPanelTouchstart)
        elePanel.removeEventListener('touchmove', fPanelTouchmove)
        elePanel.removeEventListener('touchend', fPanelTouchend)

        //eleBar remove mousedown, touchstart, touchmove, touchend
        eleBar.removeEventListener('mousedown', fBarMousedown)
        eleBar.removeEventListener('touchstart', fBarTouchstart)
        eleBar.removeEventListener('touchmove', fBarTouchmove)
        eleBar.removeEventListener('touchend', fBarTouchend)

        //window remove mousemove, mouseup
        window.removeEventListener('mousemove', fWindowMousemove)
        window.removeEventListener('mouseup', fWindowMouseup)

    }

    //add
    add()

    //save
    ev.clear = clear

    return ev
}


export default domDragBarAndScroll