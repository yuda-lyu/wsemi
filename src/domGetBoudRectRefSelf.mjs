import isNumber from 'lodash-es/isNumber'
import iseobj from './iseobj.mjs'
import isEle from './isEle.mjs'
import domGetBoudRect from './domGetBoudRect.mjs'


/**
 * 前端由事件clientX與clientY座標，計算於DOM元素內的左上角座標x與y，以及該元素的寬度w與高度h
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetBoudRectRefSelf.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} p 輸入座標點物件，主要需有DOM事件(event)的clientX與clientY，此為相對可視區域左上角的座標，單位皆為px
 * @param {HTMLElement} ele 輸入DOM元素
 * @returns {Object} 回傳物件，內含x、y、寬度w、高度h，單位皆為px
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
    if (!isNumber(p.clientX) || !isNumber(p.clientY)) {
        return null
    }
    if (!isEle(ele)) {
        return null
    }

    //domGetBoudRect
    let rt = domGetBoudRect(ele)
    if (!rt) {
        return null
    }

    let x = p.clientX - rt.left //事件的clientX,clientY是基於瀏覽器可視區域左上角的座標
    let y = p.clientY - rt.top
    let w = ele.offsetWidth
    let h = ele.offsetHeight

    return {
        x, y, w, h
    }
}


export default domGetBoudRectRefSelf
