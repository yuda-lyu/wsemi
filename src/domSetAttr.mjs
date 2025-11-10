import isEle from './isEle.mjs'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'


/**
 * 前端針對DOM元素給予屬性值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domSetAttr.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入DOM元素
 * @param {String} attr 輸入欲給予屬性名稱字串
 * @param {String|Number} val 輸入值字串或數字
 * @returns {String} 回傳屬性值
 * @example
 * need test in browser
 *
 * //<div id="eid" cus_attr="abc"></div>
 * domSetAttr(document.querySelector('#eid'), 'cus_attr', 'def')
 *
 */
function domSetAttr(ele, attr, val) {

    //check
    if (!isEle(ele)) {
        return null
    }
    if (!isestr(attr)) {
        return null
    }
    if (!isestr(val) && !isnum(val)) {
        return null
    }

    try {
        ele.setAttribute(attr, val)
        return ele.getAttribute(attr)
    }
    catch (err) {}

    return null
}


export default domSetAttr
