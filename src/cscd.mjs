import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import sind from './sind.mjs'


/**
 * 輸入角度計算csc值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cscd.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} deg 輸入角度數字或字串
 * @returns {Number} 回傳csc值
 * @example
 *
 * console.log(cscd(0))
 * // => Infinity
 *
 * console.log(cscd(30))
 * // => 2.0000000000000004
 *
 * console.log(cscd(45))
 * // => 1.4142135623730951
 *
 * console.log(cscd(60))
 * // => 1.1547005383792517
 *
 * console.log(cscd(90))
 * // => 1
 *
 * console.log(cscd(120))
 * // => 1.1547005383792515
 *
 * console.log(cscd(135))
 * // => 1.414213562373095
 *
 * console.log(cscd(150))
 * // => 2.0000000000000004
 *
 * console.log(cscd(180))
 * // => 8165619676597685
 *
 * console.log(cscd(210))
 * // => -1.9999999999999996
 *
 * console.log(cscd(225))
 * // => -1.4142135623730951
 *
 * console.log(cscd(240))
 * // => -1.1547005383792517
 *
 * console.log(cscd(270))
 * // => -1
 *
 * console.log(cscd(300))
 * // => -1.1547005383792517
 *
 * console.log(cscd(315))
 * // => -1.4142135623730947
 *
 * console.log(cscd(330))
 * // => -1.9999999999999982
 *
 * console.log(cscd(360))
 * // => -4082809838298842.5
 *
 * console.log(cscd(450))
 * // => 1
 *
 * console.log(cscd(720))
 * // => -2041404919149421.2
 *
 */
function cscd(deg) {

    //check
    if (!isnum(deg)) {
        return null
    }
    deg = cdbl(deg)

    return 1 / sind(deg)
}


export default cscd
