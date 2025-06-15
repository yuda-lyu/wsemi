import Decimal from 'decimal.js'
import get from 'lodash-es/get.js'
import isnum from './isnum.mjs'
import isp0int from './isp0int.mjs'
import cint from './cint.mjs'


/**
 * 數字或字串四捨五入至指定位數(0位為整數)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/round.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @param {Integer} [idig=0] 輸入指定位數整數，預設0
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {String} [opt.rounding='ROUND_HALF_UP'] 輸入取捨方式，可選'ROUND_HALF_UP'代表四捨五入或'ROUND_HALF_EVEN'代表四捨六入五成雙，預設'ROUND_HALF_UP'
 * @returns {Number} 回傳四捨五入的數字
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
 */
function round(v, idig = 0, opt = {}) {

    //idig
    if (!isp0int(idig)) {
        idig = 0
    }
    idig = cint(idig)

    //rounding
    let rounding = get(opt, 'rounding', '')
    if (rounding !== 'ROUND_HALF_UP' && rounding !== 'ROUND_HALF_EVEN') {
        rounding = 'ROUND_HALF_UP'
    }

    //check
    if (!isnum(v)) {
        return ''
    }

    //cdbl
    // v = cdbl(v) //decimal也支援數字字串輸入, 不使用cdbl可加速

    //r
    let r = new Decimal(v).toDecimalPlaces(idig, Decimal[rounding]).toNumber()

    return r
}


export default round
