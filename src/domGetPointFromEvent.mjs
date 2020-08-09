import size from 'lodash/size'
import get from 'lodash/get'


/**
 * 前端DOM元素事件取得使用者滑鼠或第一觸控點座標
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetPointFromEvent.test.js Github}
 * @memberOf wsemi
 * @param {HTEMLEvent} e 輸入dom事件物件
 * @example
 * window.addEventListener('mousemove', (e) => {
 *   console.log(domGetPointFromEvent(e))
 * })
 */
function domGetPointFromEvent(e) {

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


export default domGetPointFromEvent
