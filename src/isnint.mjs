import isint from './isint.mjs'
import cint from './cint.mjs'


/**
 * 判斷是否為負整數
 * 負整數不包含0，為小於0的整數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnint.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isnint(0))
 * // => false
 *
 * console.log(isnint(125))
 * // => false
 *
 * console.log(isnint(-125))
 * // => true
 *
 */
function isnint(v) {

    //check
    if (!isint(v)) {
        return false
    }

    let r = cint(v) < 0

    return r
}


export default isnint
