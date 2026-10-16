import isBoolean from 'lodash-es/isBoolean.js'


/**
 * 判斷是否為boolean
 *
 * 包裝物件(new String/Number/Boolean)依內部標籤視同其型別；值判定函數(isestr、isstr0、isnan、isnum族)與cbol對包裝物件拆包後判定，其餘函數不保證，請傳入原始值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isbol.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isbol(false))
 * // => true
 *
 */
function isbol(v) {

    return isBoolean(v)
}


export default isbol
