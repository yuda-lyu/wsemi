/**
 * 判斷是否為undefined
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isundefined.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isundefined(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Undefined]'
}


export default isundefined
