import Decimal from 'decimal.js'
import get from 'lodash-es/get.js'
import isenum from './isenum.mjs'
import iseint from './iseint.mjs'


/**
 * 數字或字串四捨五入至指定位數(0位為整數)
 *
 * v須為有效數字(isenum: 有限數字，或去頭尾空白後為十進位寫法之數字字串)，其餘(Infinity、'Infinity'、'0x10'、'1e400'、'-'、''、null、包裝物件等)回傳空字串；
 * idig屬選填參數，須為0~100之有效整數(iseint，use為'digits')，不是則用預設0，不報錯。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/round.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數值，需為有效數字(數字或數字字串，定義見isenum，不收Infinity與'0x10'等)，非有效數字時回傳空字串
 * @param {Integer} [idig=0] 輸入指定位數，需為0~100之有效整數(數字或數字字串，定義見iseint之use為digits)，非有效時改用預設0，預設0
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.rounding='ROUND_HALF_UP'] 輸入取捨方式，可選'ROUND_HALF_UP'代表四捨五入或'ROUND_HALF_EVEN'代表四捨六入五成雙，預設'ROUND_HALF_UP'
 * @returns {Number} 回傳四捨五入的數字，v非有效數字時回傳空字串
 * @example
 *
 * console.log(round(1.5))
 * // => 2
 *
 * console.log(round('1.5'))
 * // => 2
 *
 * console.log(round(-1.5))
 * // => -2 (四捨五入不看正負號得-2)
 *
 * console.log(round('125abc'))
 * // => ''
 *
 * console.log(round(9.83501, 2))
 * // => 9.84
 *
 * console.log(round(9.8350, 2))
 * // => 9.84
 *
 * console.log(round(9.82501, 2))
 * // => 9.83
 *
 * console.log(round(9.8250, 2))
 * // => 9.83
 *
 * console.log(round(9.8249, 2))
 * // => 9.82
 *
 * console.log(round(12.6449, 2))
 * // => 12.64
 *
 * console.log(round(12.645, 2))
 * // => 12.65
 *
 * console.log(round(12.6451, 2))
 * // => 12.65
 *
 * console.log(round(12.65, 2))
 * // => 12.65
 *
 * console.log(round(12.64, 2))
 * // => 12.64
 *
 * console.log(round(12.6, 2))
 * // => 12.6
 *
 * console.log(round(12, 2))
 * // => 12
 *
 * console.log(round(9.83501, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 9.84
 *
 * console.log(round(9.8350, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 9.84 (四捨六入五成雙, 第3位5進位得9.84)
 *
 * console.log(round(9.82501, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 9.83
 *
 * console.log(round(9.8250, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 9.82 (四捨六入五成雙, 第3位5捨去得9.82)
 *
 * console.log(round(9.8249, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 9.82
 *
 * console.log(round(12.6449, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 12.64
 *
 * console.log(round(12.645, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 12.64 (四捨六入五成雙, 第3位5捨去得12.64)
 *
 * console.log(round(12.6451, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 12.65
 *
 * console.log(round(12.65, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 12.65
 *
 * console.log(round(12.64, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 12.64
 *
 * console.log(round(12.6, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 12.6
 *
 * console.log(round(12, 2, { rounding: 'ROUND_HALF_EVEN' }))
 * // => 12
 *
 * console.log(round(' 1.5 '))
 * // => 2
 *
 * console.log(round(Infinity))
 * // => ''
 *
 * console.log(round('0x10'))
 * // => ''
 *
 * console.log(round(1.2345, 101))
 * // => 1 (idig非0~100之有效整數, 改用預設0)
 *
 */
function round(v, idig = 0, opt = {}) {

    //idig, 非0~100之有效整數(含數字字串)則用預設0, 其後一律使用轉換值
    if (!iseint(idig, { use: 'digits' })) {
        idig = 0
    }
    idig = Number(idig)

    //rounding
    let rounding = get(opt, 'rounding', '')
    if (rounding !== 'ROUND_HALF_UP' && rounding !== 'ROUND_HALF_EVEN') {
        rounding = 'ROUND_HALF_UP'
    }

    //check
    if (!isenum(v)) {
        return ''
    }

    //v為字串時去頭尾空白(Decimal不接受前後空白), 檢測之值即為使用之值
    //decimal也支援數字字串輸入, 直接解析字串可保留多餘位數(不經Number先捨入), 故不轉Number
    if (typeof v === 'string') {
        v = v.trim()
    }

    //r
    let r = new Decimal(v).toDecimalPlaces(idig, Decimal[rounding]).toNumber()

    return r
}


export default round
