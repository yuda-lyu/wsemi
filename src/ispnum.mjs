import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 判斷是否為大於0浮點數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ispnum.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(ispnum(0))
 * // => false
 *
 * console.log(ispnum('0'))
 * // => false
 *
 * console.log(ispnum(125))
 * // => true
 *
 * console.log(ispnum(1.25))
 * // => true
 *
 * console.log(ispnum('125'))
 * // => true
 *
 * console.log(ispnum('1.25'))
 * // => true

 * console.log(ispnum(-125))
 * // => false
 *
 * console.log(ispnum(-1.25))
 * // => false
 *
 * console.log(ispnum('-125'))
 * // => false
 *
 * console.log(ispnum('-1.25'))
 * // => false
 *
 */
function ispnum(v) {

    //check
    if (!isnum(v)) {
        return false
    }

    let r = cdbl(v) > 0

    return r
}


export default ispnum
