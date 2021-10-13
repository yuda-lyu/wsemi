import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 輸入浮點數x,y計算atan2角度值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/atan2d.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} x 輸入點x座標之數字或字串
 * @param {Number|String} y 輸入點y座標之數字或字串
 * @returns {Number} 回傳atan2角度值
 * @example
 *
 * console.log(atan2d(1, 0))
 * // => 0
 *
 * console.log(atan2d(1, 0.5))
 * // => 26.56505117707799
 *
 * console.log(atan2d(1, 0.7071067811865475))
 * // => 35.264389682754654
 *
 * console.log(atan2d(1, 0.8660254037844386))
 * // => 40.89339464913091
 *
 * console.log(atan2d(1, 1))
 * // => 45
 *
 * console.log(atan2d(1, 1.7320508075688767))
 * // => 59.99999999999999
 *
 * console.log(atan2d(1, Infinity))
 * // => 90
 *
 * console.log(atan2d(1, -0.5))
 * // => -26.56505117707799
 *
 * console.log(atan2d(1, -0.7071067811865475))
 * // => -35.264389682754654
 *
 * console.log(atan2d(1, -0.8660254037844386))
 * // => -40.89339464913091
 *
 * console.log(atan2d(1, -1))
 * // => -45
 *
 * console.log(atan2d(1, -1.7320508075688767))
 * // => -59.99999999999999
 *
 * console.log(atan2d(1, -Infinity))
 * // => -90
 *
 */
function atan2d(x, y) {

    //check
    if (!isnum(x)) {
        return null
    }
    x = cdbl(x)
    if (!isnum(y)) {
        return null
    }
    y = cdbl(y)

    return Math.atan2(y, x) * 180 / Math.PI
}


export default atan2d
