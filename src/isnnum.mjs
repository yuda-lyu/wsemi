import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 判斷是否為小於0浮點數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnnum.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isnnum(0))
 * // => false
 *
 * console.log(isnnum('0'))
 * // => false
 *
 * console.log(isnnum(125))
 * // => false
 *
 * console.log(isnnum(1.25))
 * // => false
 *
 * console.log(isnnum('125'))
 * // => false
 *
 * console.log(isnnum('1.25'))
 * // => false
 *
 * console.log(isnnum(-125))
 * // => true
 *
 * console.log(isnnum(-1.25))
 * // => true
 *
 * console.log(isnnum('-125'))
 * // => true
 *
 * console.log(isnnum('-1.25'))
 * // => true
 *
 */
function isnnum(v) {

    //check
    if (!isnum(v)) {
        return false
    }

    let r = cdbl(v) < 0

    return r
}


export default isnnum
