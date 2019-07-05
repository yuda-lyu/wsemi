/**
 * 判斷是否為Promise
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ispm.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * ispm('1.25')
 * // => false
 *
 * ispm(new Promise(function() {}))
 * // => true
 */
function ispm(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Promise]'
}


export default ispm
