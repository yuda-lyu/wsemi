import isEle from './isEle.mjs'
import isestr from './isestr.mjs'


/**
 * 前端DOM元素取得屬性
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetAttr.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入DOM元素
 * @param {String} attr 輸入欲取得屬性名稱字串
 * @returns {String} 回傳屬性值
 * @example
 * need test in browser
 *
 * //<div id="eid" cus_attr="abc"></div>
 * let r = domGetAttr(document.querySelector('#eid'), 'cus_attr')
 * conssole.log(r)
 * // => abc
 *
 */
function domGetAttr(ele, attr) {

    //check
    if (!isEle(ele)) {
        return null
    }
    if (!isestr(attr)) {
        return null
    }

    try {
        return ele.getAttribute(attr)
    }
    catch (err) {}

    return null
}


export default domGetAttr
