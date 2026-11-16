import iseobj from './iseobj.mjs'
import isenum from './isenum.mjs'
import cdbl from './cdbl.mjs'
import isEle from './isEle.mjs'
import domGetBoudRect from './domGetBoudRect.mjs'


/**
 * 前端由事件clientX與clientY座標，計算於DOM元素內的左上角座標x與y，以及該元素的寬度w與高度h
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetBoudRectRefSelf.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} p 輸入座標點物件，主要需有DOM事件(event)的clientX與clientY，此為相對可視區域左上角的座標，單位皆為px。p須為至少有一個自有可列舉鍵之一般物件(如{ clientX, clientY })，傳入事件物件本身(toString標籤非[object Object])回傳null。clientX與clientY須為有效數字(有限數字或十進位數字字串，去頭尾空白後取值；NaN、Infinity、'0x10'、包裝物件、null、非數字字串皆非有效數字)，判定通過後以cdbl轉為數字再使用，依序(先clientX後clientY)各只讀取一次
 * @param {HTMLElement} ele 輸入DOM元素
 * @returns {Object} 回傳物件，內含x、y、寬度w、高度h，單位皆為px。p非有效物件、p.clientX或p.clientY非有效數字、ele非元素、無法取得元素外框時回傳null
 * @example
 * need test in browser
 *
 * let r = domGetBoudRectRefSelf(document.querySelector('#id'))
 * console.log(r)
 * // => {
 *   x:...,
 *   y:...,
 *   w:...,
 *   h:...,
 * }
 *
 */
function domGetBoudRectRefSelf(p, ele) {

    //check
    if (!iseobj(p)) {
        return null
    }

    //clientX, clientY, 依序讀取且各只讀取一次(clientX無效即不讀clientY, 同修改前之短路順序), 檢測之值即使用之值
    let clientX = p.clientX
    if (!isenum(clientX)) {
        return null
    }
    let clientY = p.clientY
    if (!isenum(clientY)) {
        return null
    }
    if (!isEle(ele)) {
        return null
    }

    //cdbl
    clientX = cdbl(clientX)
    clientY = cdbl(clientY)

    //domGetBoudRect
    let rt = domGetBoudRect(ele)
    if (!rt) {
        return null
    }

    let x = clientX - rt.left //事件的clientX,clientY是基於瀏覽器可視區域左上角的座標
    let y = clientY - rt.top
    let w = ele.offsetWidth
    let h = ele.offsetHeight

    return {
        x, y, w, h
    }
}


export default domGetBoudRectRefSelf
