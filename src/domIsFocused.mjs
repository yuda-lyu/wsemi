import isEle from './isEle.mjs'


/**
 * 前端檢測DOM元素是否為聚焦狀態
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/domIsFocused.test.js Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入Element元素
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * console.log(domIsFocused(ele))
 * // => true or false
 *
 */
function domIsFocused(ele) {

    //check ele
    if (!isEle(ele)) {
        return Promise.reject('invalid element')
    }

    //r
    let r = false
    try {
        r = (document.activeElement === ele)
    }
    catch (err) {}

    return r
}


export default domIsFocused

