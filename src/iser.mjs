import isundefined from './isundefined.mjs'
import isnull from './isnull.mjs'
import isobj0 from './isobj0.mjs'
import isstr0 from './isstr0.mjs'
import isarr0 from './isarr0.mjs'
import isnan from './isnan.mjs'


/**
 * 判斷是否為廣義無效
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/iser.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(iser('12a5'))
 * // => false
 *
 * console.log(iser(''))
 * // => true
 *
 * console.log(iser([]))
 * // => true
 *
 * console.log(iser([{}]))
 * // => false
 *
 * console.log(iser(['']))
 * // => false
 *
 * console.log(iser({}))
 * // => true
 *
 * console.log(iser(null))
 * // => true
 *
 * console.log(iser(undefined))
 * // => true
 *
 * console.log(iser(NaN))
 * // => true
 *
 */
function iser(v) {

    if (isundefined(v)) {
        return true
    }
    if (isnull(v)) {
        return true
    }
    if (isobj0(v)) {
        return true
    }
    if (isstr0(v)) {
        return true
    }
    if (isarr0(v)) {
        return true
    }
    if (isnan(v)) {
        return true
    }
    return false
}


export default iser
