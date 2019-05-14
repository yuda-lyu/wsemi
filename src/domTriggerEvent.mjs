//MouseEvent polyfill
//https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent#Polyfill
(function (window) {
    try {
        new MouseEvent('test')
        return false // No need to polyfill
    }
    catch (e) {
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
})(window)


/**
 * 前端觸發ele的eventName
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domTriggerEvent.test.js Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @param {String} eventName 輸入事件名稱字串
 * @example
 *
 */
function domTriggerEvent(ele, eventName) {

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
