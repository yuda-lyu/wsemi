import isenum from './isenum.mjs'


/**
 * 輸入浮點數計算asin角度值
 *
 * v須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳null；v超出-1~1(定義域外)時依Math.asin回傳NaN。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/asind.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數值，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳null
 * @returns {Number} 回傳asin角度值，v非有效數字時回傳null
 * @example
 *
 * console.log(asind(0))
 * // => 0
 *
 * console.log(asind(0.5))
 * // => 30.000000000000004
 *
 * console.log(asind(0.7071067811865475))
 * // => 44.99999999999999
 *
 * console.log(asind(0.8660254037844386))
 * // => 59.99999999999999
 *
 * console.log(asind(1))
 * // => 90
 *
 * console.log(asind(-0.5))
 * // => -30.000000000000004
 *
 * console.log(asind(-0.7071067811865475))
 * // => -44.99999999999999
 *
 * console.log(asind(-0.8660254037844386))
 * // => -59.99999999999999
 *
 * console.log(asind(-1))
 * // => -90
 *
 * console.log(asind(Infinity))
 * // => null
 *
 * console.log(asind('0x10'))
 * // => null
 *
 */
function asind(v) {

    //check
    if (!isenum(v)) {
        return null
    }
    v = Number(v) //檢測之值即為使用之值(去頭尾空白後Number)

    return Math.asin(v) * 180 / Math.PI
}


export default asind
