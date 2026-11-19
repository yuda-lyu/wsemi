import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 判斷是否為小於0浮點數
 *
 * 只收原始數字與數字字串，包裝物件new Number(5)、new String('5')為false(判斷函數只收原始值)；對任何輸入皆不拋錯
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
