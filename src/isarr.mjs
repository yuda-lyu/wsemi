/**
 * 判斷是否為陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isarr.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * isarr([])
 * // => true
 *
 * isarr([{}])
 * // => true
 */
function isarr(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Array]'
}


export default isarr
