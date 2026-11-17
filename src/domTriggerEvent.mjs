import isWindow from './isWindow.mjs'
import isEle from './isEle.mjs'


function init() {
    //MouseEvent polyfill
    //https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent#Polyfill

    try {
        new MouseEvent('MouseEventPolyfillTest')
        return false // No need to polyfill
    }
    catch (err) {
        // Need to polyfill - fall through
    }

    // Polyfills DOM4 MouseEvent
    let MouseEventPolyfill = function (eventType, params) {
        params = params || { bubbles: false, cancelable: false }
        let mouseEvent = document.createEvent('MouseEvent')
        mouseEvent.initMouseEvent(eventType,
            params.bubbles,
            params.cancelable,
            window,
            0,
            params.screenX || 0,
            params.screenY || 0,
            params.clientX || 0,
            params.clientY || 0,
            params.ctrlKey || false,
            params.altKey || false,
            params.shiftKey || false,
            params.metaKey || false,
            params.button || 0,
            params.relatedTarget || null
        )

        return mouseEvent
    }

    MouseEventPolyfill.prototype = Event.prototype

    window.MouseEvent = MouseEventPolyfill
}
if (isWindow()) {
    init()
}


/**
 * 前端觸發ele基於MouseEvent的eventName
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domTriggerEvent.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素，非元素則拋錯
 * @param {String} eventName 輸入事件名稱字串，須為非空之原始字串，否則拋錯
 * @throws {Error} ele非元素拋出Error('invalid ele: must be an element')，eventName非非空字串拋出Error('invalid eventName: must be a non-empty string')，皆先於建立事件與派發(不觸發任何事件)，訊息不含輸入值；兩者皆無效時先報ele
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * domTriggerEvent(ele, 'click')
 *
 */
function domTriggerEvent(ele, eventName) {

    //check, 會觸發事件, 輸入無效即拋錯且先於任何動作(同domAppend); 原生會把非字串事件名轉成字串(如undefined得'undefined')照常派發
    if (!isEle(ele)) {
        throw new Error('invalid ele: must be an element')
    }
    if (typeof eventName !== 'string' || eventName === '') {
        throw new Error('invalid eventName: must be a non-empty string')
    }

    //event
    let event = new MouseEvent(eventName, {
        'view': window,
        'bubbles': true,
        'cancelable': true
    })

    //dispatchEvent
    ele.dispatchEvent(event)

}


export default domTriggerEvent
