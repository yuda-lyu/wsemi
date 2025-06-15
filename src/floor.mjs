import Decimal from 'decimal.js'
import isnum from './isnum.mjs'
import isp0int from './isp0int.mjs'
import cint from './cint.mjs'


/**
 * 數字或字串無條件捨去至指定位數(0位為整數)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/floor.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @param {Integer} [idig=0] 輸入指定位數整數，預設0
 * @returns {Number} 回傳無條件進位的數字
 * @example
 *
 * console.log(floor(1.5))
 * // => 1
 *
 * console.log(floor('1.5'))
 * // => 1
 *
 * console.log(floor(-1.5))
 * // => -2
 *
 * console.log(floor('125abc'))
 * // => ''
 *
 * console.log(floor(9.83501, 2))
 * // => 9.83
 *
 * console.log(floor(9.8350, 2))
 * // => 9.83
 *
 * console.log(floor(9.82501, 2))
 * // => 9.82
 *
 * console.log(floor(9.8250, 2))
 * // => 9.82
 *
 * console.log(floor(9.8249, 2))
 * // => 9.82
 *
 * console.log(floor(12.6449, 2))
 * // => 12.64
 *
 * console.log(floor(12.645, 2))
 * // => 12.64
 *
 * console.log(floor(12.6451, 2))
 * // => 12.64
 *
 * console.log(floor(12.65, 2))
 * // => 12.65
 *
 * console.log(floor(12.64, 2))
 * // => 12.64
 *
 * console.log(floor(12.6, 2))
 * // => 12.6
 *
 * console.log(floor(12, 2))
 * // => 12
 *
 */
function floor(v, idig = 0) {

    //idig
    if (!isp0int(idig)) {
        idig = 0
    }
    idig = cint(idig)

    //check
    if (!isnum(v)) {
        return ''
    }

    //r
    let r = new Decimal(v).toDecimalPlaces(idig, Decimal.ROUND_FLOOR).toNumber()

    return r
}


export default floor
