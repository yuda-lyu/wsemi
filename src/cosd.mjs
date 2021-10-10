import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 輸入角度計算cos值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cosd.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} deg 輸入角度數字或字串
 * @returns {Number} 回傳cos值
 * @example
 *
 * console.log(cosd(0))
 * // => 1
 *
 * console.log(cosd(30))
 * // => 0.8660254037844387
 *
 * console.log(cosd(45))
 * // => 0.7071067811865476
 *
 * console.log(cosd(60))
 * // => 0.5000000000000001
 *
 * console.log(cosd(90))
 * // => 6.123233995736766e-17
 *
 * console.log(cosd(120))
 * // => -0.4999999999999998
 *
 * console.log(cosd(135))
 * // => -0.7071067811865475
 *
 * console.log(cosd(150))
 * // => -0.8660254037844387
 *
 * console.log(cosd(180))
 * // => -1
 *
 * console.log(cosd(210))
 * // => -0.8660254037844386
 *
 * console.log(cosd(225))
 * // => -0.7071067811865477
 *
 * console.log(cosd(240))
 * // => -0.5000000000000004
 *
 * console.log(cosd(270))
 * // => -1.8369701987210297e-16
 *
 * console.log(cosd(300))
 * // => 0.5000000000000001
 *
 * console.log(cosd(315))
 * // => 0.7071067811865474
 *
 * console.log(cosd(330))
 * // => 0.8660254037844384
 *
 * console.log(cosd(360))
 * // => 1
 *
 * console.log(cosd(450))
 * // => 3.061616997868383e-16
 *
 * console.log(cosd(720))
 * // => 1
 *
 */
function cosd(deg) {

    //check
    if (!isnum(deg)) {
        return null
    }
    deg = cdbl(deg)

    return Math.cos(deg * Math.PI / 180)
}


export default cosd
