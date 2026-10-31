import isenum from './isenum.mjs'
import sind from './sind.mjs'


/**
 * 輸入角度計算csc值
 *
 * deg須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳null。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cscd.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} deg 輸入角度，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳null
 * @returns {Number} 回傳csc值，deg非有效數字時回傳null
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
 * console.log(cscd(Infinity))
 * // => null
 *
 * console.log(cscd('0x10'))
 * // => null
 *
 */
function cscd(deg) {

    //check
    if (!isenum(deg)) {
        return null
    }
    deg = Number(deg) //檢測之值即為使用之值(去頭尾空白後Number)

    return 1 / sind(deg)
}


export default cscd
