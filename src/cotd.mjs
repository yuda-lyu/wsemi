import isenum from './isenum.mjs'
import tand from './tand.mjs'


/**
 * 輸入角度計算cot值
 *
 * deg須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳null。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cotd.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} deg 輸入角度，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳null
 * @returns {Number} 回傳cot值，deg非有效數字時回傳null
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
 * console.log(cotd(Infinity))
 * // => null
 *
 * console.log(cotd('0x10'))
 * // => null
 *
 */
function cotd(deg) {

    //check
    if (!isenum(deg)) {
        return null
    }
    deg = Number(deg) //檢測之值即為使用之值(去頭尾空白後Number)

    return 1 / tand(deg)
}


export default cotd
