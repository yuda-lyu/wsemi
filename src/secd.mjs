import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'
import cosd from './cosd.mjs'


/**
 * 輸入角度計算sec值
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/secd.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} deg 輸入角度數字或字串
 * @returns {Number} 回傳sec值
 * @example
 *
 * console.log(secd(0))
 * // => 1
 *
 * console.log(secd(30))
 * // => 1.1547005383792515
 *
 * console.log(secd(45))
 * // => 1.414213562373095
 *
 * console.log(secd(60))
 * // => 1.9999999999999996
 *
 * console.log(secd(90))
 * // => 16331239353195370
 *
 * console.log(secd(120))
 * // => -2.000000000000001
 *
 * console.log(secd(135))
 * // => -1.4142135623730951
 *
 * console.log(secd(150))
 * // => -1.1547005383792515
 *
 * console.log(secd(180))
 * // => -1
 *
 * console.log(secd(210))
 * // => -1.1547005383792517
 *
 * console.log(secd(225))
 * // => -1.4142135623730947
 *
 * console.log(secd(240))
 * // => -1.9999999999999982
 *
 * console.log(secd(270))
 * // => -5443746451065123
 *
 * console.log(secd(300))
 * // => 1.9999999999999996
 *
 * console.log(secd(315))
 * // => 1.4142135623730954
 *
 * console.log(secd(330))
 * // => 1.154700538379252
 *
 * console.log(secd(360))
 * // => 1
 *
 * console.log(secd(450))
 * // => 3266247870639073.5
 *
 * console.log(secd(720))
 * // => 1
 *
 */
function secd(deg) {

    //check
    if (!isnum(deg)) {
        return null
    }
    deg = cdbl(deg)

    return 1 / cosd(deg)
}


export default secd
