import isint from './isint.mjs'
import cint from './cint.mjs'


/**
 * 判斷是否為大於等於0整數(非負整數)
 * 非負整數包含0
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isp0int.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isp0int(0))
 * // => true
 *
 * console.log(isp0int('0'))
 * // => true
 *
 * console.log(isp0int(125))
 * // => true
 *
 * console.log(isp0int(1.25))
 * // => false
 *
 * console.log(isp0int('125'))
 * // => true
 *
 * console.log(isp0int('1.25'))
 * // => false

 * console.log(isp0int(-125))
 * // => false
 *
 * console.log(isp0int(-1.25))
 * // => false
 *
 * console.log(isp0int('-125'))
 * // => false
 *
 * console.log(isp0int('-1.25'))
 * // => false
 *
 */
function isp0int(v) {

    //check
    if (!isint(v)) {
        return false
    }

    let r = cint(v) >= 0

    return r
}


export default isp0int
