import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import tand from './tand.mjs'


/**
 * 輸入角度計算cot值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cotd.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} deg 輸入角度數字或字串
 * @returns {Number} 回傳cot值
 * @example
 *
 * console.log(cotd(0))
 * // => Infinity
 *
 * console.log(cotd(30))
 * // => 1.7320508075688774
 *
 * console.log(cotd(45))
 * // => 1.0000000000000002
 *
 * console.log(cotd(60))
 * // => 0.577350269189626
 *
 * console.log(cotd(90))
 * // => 6.123233995736766e-17
 *
 * console.log(cotd(120))
 * // => -0.5773502691896254
 *
 * console.log(cotd(135))
 * // => -0.9999999999999998
 *
 * console.log(cotd(150))
 * // => -1.7320508075688774
 *
 * console.log(cotd(180))
 * // => -8165619676597685
 *
 * console.log(cotd(210))
 * // => 1.7320508075688767
 *
 * console.log(cotd(225))
 * // => 1.0000000000000004
 *
 * console.log(cotd(240))
 * // => 0.5773502691896264
 *
 * console.log(cotd(270))
 * // => 1.83697019872103e-16
 *
 * console.log(cotd(300))
 * // => -0.5773502691896258
 *
 * console.log(cotd(315))
 * // => -0.9999999999999996
 *
 * console.log(cotd(330))
 * // => -1.7320508075688754
 *
 * console.log(cotd(360))
 * // => -4082809838298842.5
 *
 * console.log(cotd(450))
 * // => 3.061616997868383e-16
 *
 * console.log(cotd(720))
 * // => -2041404919149421.2
 *
 */
function cotd(deg) {

    //check
    if (!isnum(deg)) {
        return null
    }
    deg = cdbl(deg)

    return 1 / tand(deg)
}


export default cotd
