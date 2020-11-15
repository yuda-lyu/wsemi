/**
 * 前端DOM元素事件停止傳遞事件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domCancelEvent.test.js Github}
 * @memberOf wsemi
 * @param {HTMLEvent} event 輸入event物件
 * @example
 * need test in browser
 *
 * window.addEventListener('touchstart', (e) => {
 *     domCancelEvent(e)
 * })
 *
 */
function domCancelEvent(e) {

    //check
    if (!e) {
        return 'invalid event'
    }

    //check, 拖曳事件因拖曳自己會捲動螢幕, 會觸發不可取消事件, 故需偵測直接跳出
    if (!e.cancelable) {
        return 'event is not cancelable'
    }

    //try, 有些情形preventDefault是passive無法呼叫
    try {
        if (window.event) {
            e.cancelBubble = true //IE11
        }
        else {
            e.stopPropagation()
        }
        e.preventDefault()
    }
    catch (err) {}

}


export default domCancelEvent
