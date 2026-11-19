import isenum from './isenum.mjs'
import cdbl from './cdbl.mjs'
import isEle from './isEle.mjs'


/**
 * 前端計算clientX與clientY是否位於DOM元素內
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domIsClientXYIn.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} clientX 輸入點的clientX座標，須為有效數字(有限數字或十進位數字字串，去頭尾空白後取值；NaN、Infinity、'0x10'、包裝物件、null、非數字字串皆非有效數字)，判定通過後以cdbl轉為數字再使用；非有效數字則回傳false
 * @param {Number|String} clientY 輸入點的clientY座標，規則同clientX
 * @param {HTMLElement} ele 輸入元素，非元素則回傳false
 * @returns {Boolean} 回傳是否位於DOM元素內布林值，位於元素外框內(含邊界)為true，其餘(含clientX、clientY非有效數字，ele非元素，無法取得元素外框)皆為false
 * @example
 * need test in browser
 *
 * let p = {
 *     clientX: 'from event',
 *     clientY: 'from event',
 * }
 * let ele = document.querySelector('#id')
 * let b = domIsClientXYIn(p.clientX, p.clientY, ele)
 * // => true or false
 *
 * console.log(domIsClientXYIn('12.3', '45.6', ele))
 * // => true or false (數字字串同數字)
 *
 * console.log(domIsClientXYIn(NaN, 10, ele))
 * // => false
 *
 */
function domIsClientXYIn(clientX, clientY, ele) {

    //check
    if (!isenum(clientX)) {
        return false
    }
    if (!isenum(clientY)) {
        return false
    }
    if (!isEle(ele)) {
        return false
    }

    //cdbl, 檢測之值即使用之值
    clientX = cdbl(clientX)
    clientY = cdbl(clientY)

    //calc rt
    let rt
    try {
        rt = ele.getBoundingClientRect()
    }
    catch (err) {
        console.log('invalid ele: must have a working getBoundingClientRect', err)
        return false
    }

    //r
    let r = false
    try {
        r = clientX >= rt.left && clientX <= rt.right && clientY >= rt.top && clientY <= rt.bottom
    }
    catch (err) {
        console.log('catch when calculating page information of element', err)
    }

    return r
}


export default domIsClientXYIn
