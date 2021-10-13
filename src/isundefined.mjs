/**
 * 判斷是否為undefined
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isundefined.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isundefined(undefined))
 * // => true
 *
 */
function isundefined(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Undefined]'
}


export default isundefined
