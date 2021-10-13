/**
 * 判斷是否為陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isarr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isarr([]))
 * // => true
 *
 * console.log(isarr([{}]))
 * // => true
 *
 */
function isarr(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Array]'
}


export default isarr
