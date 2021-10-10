import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 輸入角度計算tan值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/tand.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} deg 輸入角度數字或字串
 * @returns {Number} 回傳tan值
 * @example
 *
 * console.log(tand(0))
 * // => 1
 *
 * console.log(tand(30))
 * // => 0.8660254037844387
 *
 * console.log(tand(45))
 * // => 0.7071067811865476
 *
 * console.log(tand(60))
 * // => 0.5000000000000001
 *
 * console.log(tand(90))
 * // => 6.123233995736766e-17
 *
 * console.log(tand(120))
 * // => -0.4999999999999998
 *
 * console.log(tand(135))
 * // => -0.7071067811865475
 *
 * console.log(tand(150))
 * // => -0.8660254037844387
 *
 * console.log(tand(180))
 * // => -1
 *
 * console.log(tand(210))
 * // => -0.8660254037844386
 *
 * console.log(tand(225))
 * // => -0.7071067811865477
 *
 * console.log(tand(240))
 * // => -0.5000000000000004
 *
 * console.log(tand(270))
 * // => -1.8369701987210297e-16
 *
 * console.log(tand(300))
 * // => 0.5000000000000001
 *
 * console.log(tand(315))
 * // => 0.7071067811865474
 *
 * console.log(tand(330))
 * // => 0.8660254037844384
 *
 * console.log(tand(360))
 * // => 1
 *
 * console.log(tand(450))
 * // => 3.061616997868383e-16
 *
 * console.log(tand(720))
 * // => 1
 *
 */
function tand(deg) {

    //check
    if (!isnum(deg)) {
        return null
    }
    deg = cdbl(deg)

    return Math.tan(deg * Math.PI / 180)
}


export default tand
