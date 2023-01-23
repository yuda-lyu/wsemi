import size from 'lodash/size'
import get from 'lodash/get'


/**
 * 前端DOM元素事件取得使用者滑鼠或第一觸控點座標
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetPointFromEvent.test.mjs Github}
 * @memberOf wsemi
 * @param {HTEMLEvent} e 輸入dom事件物件
 * @returns {Object} 回傳座標物件，其內有clientX、clientY、pageX、pageY，clientX、clientY代表基於顯示區(viewport)之x與y座標，pageX、pageY代表基於內容區(page)之x與y座標
 * @example
 * need test in browser
 *
 * window.addEventListener('mousemove', (e) => {
 *   console.log(domGetPointFromEvent(e))
 * })
 *
 */
function domGetPointFromEvent(e) {

    //check
    let cx = get(e, 'clientX', null) //距離顯示區(viewport)左上角之x座標, 代表隨捲軸改變
    let cy = get(e, 'clientY', null) //距離顯示區(viewport)左上角之y座標, 代表隨捲軸改變
    let px = get(e, 'pageX', null) //距離內容區(page)左上角之x座標, , 代表不隨捲軸改變
    let py = get(e, 'pageY', null) //距離內容區(page)左上角之y座標, , 代表不隨捲軸改變
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
