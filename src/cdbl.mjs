import toFinite from 'lodash-es/toFinite.js'
import isnum from './isnum.mjs'


/**
 * 數字或字串轉浮點數
 * 若輸入非數字則回傳0
 * 轉換結果恆為有限數(可用、可計算之數值): Infinity於數學上是數值(isnum為true)故屬可轉換者, 但非可計算之值, 故±Infinity(含'Infinity'、'1e400'等超出浮點範圍之字串)夾為±Number.MAX_VALUE(1.7976931348623157e+308), 不回Infinity亦不回0
 * 要排除Infinity者(如計算類參數), 先以isenum(有效數字)或iseint(有效整數)判斷, 不要以cdbl之結果判斷
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cdbl.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @returns {Number} 回傳數字，恆為有限數，非數字回傳0，±Infinity回傳±Number.MAX_VALUE
 * @example
 *
 * console.log(cdbl('25'))
 * // => 25
 *
 * console.log(cdbl(Infinity))
 * // => 1.7976931348623157e+308 (Number.MAX_VALUE)
 *
 * console.log(cdbl(-Infinity))
 * // => -1.7976931348623157e+308 (-Number.MAX_VALUE)
 *
 * console.log(cdbl('1e400'))
 * // => 1.7976931348623157e+308 (Number.MAX_VALUE)
 *
 */
function cdbl(v) {

    //check
    if (!isnum(v)) {
        return 0
    }

    let r = toFinite(v)

    return r
}


export default cdbl
