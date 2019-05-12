/**
 * 前端觸發ele的eventName
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domTriggerEvent.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @param {String} eventName 輸入事件名稱字串
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
