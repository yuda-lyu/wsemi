/**
 * 判斷是否為數字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnbr.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * isnbr(1.25)
 * // => true
 * isnbr('1.25')
 * // => false
 */
function isnbr(v) {

    let c = Object.prototype.toString.call(v)
    return c === '[object Number]'
}


export default isnbr
