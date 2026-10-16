/**
 * 判斷是否為數字
 *
 * 包裝物件(new String/Number/Boolean)依內部標籤視同其型別；值判定函數(isestr、isstr0、isnan、isnum族)與cbol對包裝物件拆包後判定，其餘函數不保證，請傳入原始值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnbr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isnbr(1.25))
 * // => true
 *
 * console.log(isnbr('1.25'))
 * // => false
 *
 */
function isnbr(v) {
    let c = Object.prototype.toString.call(v)
    return c === '[object Number]'
}


export default isnbr
