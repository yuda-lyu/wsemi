import isenum from './isenum.mjs'


/**
 * 輸入角度計算tan值
 *
 * deg須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳null。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/tand.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} deg 輸入角度，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳null
 * @returns {Number} 回傳tan值，deg非有效數字時回傳null
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
 * console.log(tand(' 45 '))
 * // => 0.9999999999999999
 *
 * console.log(tand(Infinity))
 * // => null
 *
 * console.log(tand('0x10'))
 * // => null
 *
 */
function tand(deg) {

    //check
    if (!isenum(deg)) {
        return null
    }
    deg = Number(deg) //檢測之值即為使用之值(去頭尾空白後Number)

    return Math.tan(deg * Math.PI / 180)
}


export default tand
