import isenum from './isenum.mjs'


/**
 * 輸入浮點數計算atan角度值
 *
 * v須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳null；
 * 不再接受Infinity與-Infinity(舊版atand(Infinity)為90)，需要極限值者請自行以90、-90代入。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/atand.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數值，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳null
 * @returns {Number} 回傳atan角度值，v非有效數字時回傳null
 * @example
 *
 * console.log(atand(0))
 * // => 0
 *
 * console.log(atand(0.5))
 * // => 26.56505117707799
 *
 * console.log(atand(0.7071067811865475))
 * // => 35.264389682754654
 *
 * console.log(atand(0.8660254037844386))
 * // => 40.89339464913091
 *
 * console.log(atand(1))
 * // => 45
 *
 * console.log(atand(1.7320508075688767))
 * // => 59.99999999999999
 *
 * console.log(atand(Infinity))
 * // => null (非有效數字；舊版為90)
 *
 * console.log(atand(-0.5))
 * // => -26.56505117707799
 *
 * console.log(atand(-0.7071067811865475))
 * // => -35.264389682754654
 *
 * console.log(atand(-0.8660254037844386))
 * // => -40.89339464913091
 *
 * console.log(atand(-1))
 * // => -45
 *
 * console.log(atand(-1.7320508075688767))
 * // => -59.99999999999999
 *
 * console.log(atand(-Infinity))
 * // => null (非有效數字；舊版為-90)
 *
 * console.log(atand('0x10'))
 * // => null
 *
 */
function atand(v) {

    //check
    if (!isenum(v)) {
        return null
    }
    v = Number(v) //檢測之值即為使用之值(去頭尾空白後Number)

    return Math.atan(v) * 180 / Math.PI
}


export default atand
