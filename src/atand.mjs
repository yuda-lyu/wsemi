import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 輸入浮點數計算atan角度值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/atand.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @returns {Number} 回傳atan角度值
 * @example
 *
 * console.log(atand(0))
 * // => 0
 *
 * console.log(atand(0.5))
 * // => 26.56505117707799
 *
 * console.log(atand(0.7071067811865475))
 * // => 35.264389682754654
 *
 * console.log(atand(0.8660254037844386))
 * // => 40.89339464913091
 *
 * console.log(atand(1))
 * // => 45
 *
 * console.log(atand(1.7320508075688767))
 * // => 59.99999999999999
 *
 * console.log(atand(Infinity))
 * // => 90
 *
 * console.log(atand(-0.5))
 * // => -26.56505117707799
 *
 * console.log(atand(-0.7071067811865475))
 * // => -35.264389682754654
 *
 * console.log(atand(-0.8660254037844386))
 * // => -40.89339464913091
 *
 * console.log(atand(-1))
 * // => -45
 *
 * console.log(atand(-1.7320508075688767))
 * // => -59.99999999999999
 *
 * console.log(atand(-Infinity))
 * // => -90
 *
 */
function atand(v) {

    //check
    if (!isnum(v)) {
        return null
    }
    v = cdbl(v)

    return Math.atan(v) * 180 / Math.PI
}


export default atand
