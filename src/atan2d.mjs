import isenum from './isenum.mjs'


/**
 * 輸入浮點數x,y計算atan2角度值
 *
 * x與y須皆為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，任一不是(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳null；
 * 不再接受Infinity與-Infinity(舊版atan2d(1, Infinity)為90)，需要極限值者請自行以90、-90代入。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/atan2d.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} x 輸入點x座標，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳null
 * @param {Number|String} y 輸入點y座標，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳null
 * @returns {Number} 回傳atan2角度值，x或y非有效數字時回傳null
 * @example
 *
 * console.log(atan2d(1, 0))
 * // => 0
 *
 * console.log(atan2d(1, 0.5))
 * // => 26.56505117707799
 *
 * console.log(atan2d(1, 0.7071067811865475))
 * // => 35.264389682754654
 *
 * console.log(atan2d(1, 0.8660254037844386))
 * // => 40.89339464913091
 *
 * console.log(atan2d(1, 1))
 * // => 45
 *
 * console.log(atan2d(1, 1.7320508075688767))
 * // => 59.99999999999999
 *
 * console.log(atan2d(1, Infinity))
 * // => null (非有效數字；舊版為90)
 *
 * console.log(atan2d(1, -0.5))
 * // => -26.56505117707799
 *
 * console.log(atan2d(1, -0.7071067811865475))
 * // => -35.264389682754654
 *
 * console.log(atan2d(1, -0.8660254037844386))
 * // => -40.89339464913091
 *
 * console.log(atan2d(1, -1))
 * // => -45
 *
 * console.log(atan2d(1, -1.7320508075688767))
 * // => -59.99999999999999
 *
 * console.log(atan2d(1, -Infinity))
 * // => null (非有效數字；舊版為-90)
 *
 * console.log(atan2d('0x10', 1))
 * // => null
 *
 */
function atan2d(x, y) {

    //check
    if (!isenum(x)) {
        return null
    }
    x = Number(x) //檢測之值即為使用之值(去頭尾空白後Number)
    if (!isenum(y)) {
        return null
    }
    y = Number(y)

    return Math.atan2(y, x) * 180 / Math.PI
}


export default atan2d
