/**
 * 判斷是否為null
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnull.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * console.log(isnull(null))
 * // => true
 */
function isnull(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Null]'
}


export default isnull
