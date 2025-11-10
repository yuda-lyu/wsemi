

/**
 * 前端針對DOM元素事件內座標(clientX, clientY)取得DOM元素陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domElementsFromPoint.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} clientX 輸入指定x座標浮點數，須基於顯示區(viewport)之x座標
 * @param {Number} clientY 輸入指定y座標浮點數，須基於顯示區(viewport)之x座標
 * @returns {Array} 回傳DOM元素陣列
 * @example
 * need test in browser
 *
 * window.addEventListener('mousemove', (e) => {
 *   console.log(domElementsFromPoint(e.clientX, e.clientY))
 * })
 *
 */
function domElementsFromPoint(clientX, clientY) {
    let ps = []
    try {
        ps = document.elementsFromPoint(clientX, clientY)
    }
    catch (err) {
        console.log(err)
    }
    return ps
}


export default domElementsFromPoint
