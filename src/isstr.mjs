/**
 * 判斷是否為字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isstr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isstr(0))
 * // => false
 *
 * console.log(isstr('0'))
 * // => true
 *
 * console.log(isstr(''))
 * // => true
 *
 */
function isstr(v) {
    let c = Object.prototype.toString.call(v)
    return c === '[object String]'
}


export default isstr
