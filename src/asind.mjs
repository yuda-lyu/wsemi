import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 輸入浮點數計算asin角度值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/asind.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @returns {Number} 回傳asin角度值
 * @example
 *
 * console.log(asind(0))
 * // => 0
 *
 * console.log(asind(0.5))
 * // => 30.000000000000004
 *
 * console.log(asind(0.7071067811865475))
 * // => 44.99999999999999
 *
 * console.log(asind(0.8660254037844386))
 * // => 59.99999999999999
 *
 * console.log(asind(1))
 * // => 90
 *
 * console.log(asind(-0.5))
 * // => -30.000000000000004
 *
 * console.log(asind(-0.7071067811865475))
 * // => -44.99999999999999
 *
 * console.log(asind(-0.8660254037844386))
 * // => -59.99999999999999
 *
 * console.log(asind(-1))
 * // => -90
 *
 */
function asind(v) {

    //check
    if (!isnum(v)) {
        return null
    }
    v = cdbl(v)

    return Math.asin(v) * 180 / Math.PI
}


export default asind
