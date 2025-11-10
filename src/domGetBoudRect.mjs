import isEle from './isEle.mjs'


/**
 * 前端針對DOM元素取得getBoundingClientRect
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domGetBoudRect.test.mjs Github}
 * @memberOf wsemi
 * @param {HTMLElement} ele 輸入DOM元素
 * @returns {Object} 回傳getBoundingClientRect結果物件
 * @example
 * need test in browser
 *
 * let r = domGetBoudRect(document.querySelector('#id'))
 * console.log(r)
 * // => {
 *   x:...,
 *   y:...,
 *   width:...,
 *   height:...,
 *   top:...,
 *   right:...,
 *   bottom:...,
 *   left:...,
 * }
 *
 */
function domGetBoudRect(ele) {

    //check
    if (!isEle(ele)) {
        return null
    }

    try {
        return ele.getBoundingClientRect()
    }
    catch (err) {}

    return null
}


export default domGetBoudRect
