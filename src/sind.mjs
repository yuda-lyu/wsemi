import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 輸入角度計算sin值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/sind.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} deg 輸入角度數字或字串
 * @returns {Number} 回傳sin值
 * @example
 *
 * console.log(sind(0))
 * // => 0
 *
 * console.log(sind(30))
 * // => 0.49999999999999994
 *
 * console.log(sind(45))
 * // => 0.7071067811865475
 *
 * console.log(sind(60))
 * // => 0.8660254037844386
 *
 * console.log(sind(90))
 * // => 1
 *
 * console.log(sind(120))
 * // => 0.8660254037844387
 *
 * console.log(sind(135))
 * // => 0.7071067811865476
 *
 * console.log(sind(150))
 * // => 0.49999999999999994
 *
 * console.log(sind(180))
 * // => 1.2246467991473532e-16
 *
 * console.log(sind(210))
 * // => -0.5000000000000001
 *
 * console.log(sind(225))
 * // => -0.7071067811865475
 *
 * console.log(sind(240))
 * // => -0.8660254037844385
 *
 * console.log(sind(270))
 * // => -1
 *
 * console.log(sind(300))
 * // => -0.8660254037844386
 *
 * console.log(sind(315))
 * // => -0.7071067811865477
 *
 * console.log(sind(330))
 * // => -0.5000000000000004
 *
 * console.log(sind(360))
 * // => -2.4492935982947064e-16
 *
 * console.log(sind(450))
 * // => 1
 *
 * console.log(sind(720))
 * // => -4.898587196589413e-16
 *
 */
function sind(deg) {

    //check
    if (!isnum(deg)) {
        return null
    }
    deg = cdbl(deg)

    return Math.sin(deg * Math.PI / 180)
}


export default sind
