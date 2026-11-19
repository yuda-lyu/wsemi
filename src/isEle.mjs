import isElement from 'lodash-es/isElement.js'


/**
 * 前端判斷元素是否存在
 *
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、讀取nodeType即拋錯之物件)，lodash之isElement判定拋錯者回傳false
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isEle.test.mjs Github}
 * @memberOf wsemi
 * @param {Element} ele 輸入DOM元素
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * need test in browser
 *
 * let ele = document.querySelector('#id')
 * console.log(isEle(ele))
 * // => true or false
 *
 */
function isEle(ele) {
    try {
        return isElement(ele) === true
    }
    catch (err) {
        return false
    }
    // return (
    //     typeof HTMLElement === 'object' ? ele instanceof HTMLElement
    //         : ele && typeof ele === 'object' && ele !== null && ele.nodeType === 1 && typeof ele.nodeName === 'string'
    // )
}


export default isEle
