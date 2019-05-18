import round from 'lodash/round'
import isnum from './isnum.mjs'
import isp0int from './isp0int.mjs'
import cdbl from './cdbl.mjs'


/**
 * 數字取指定小數位的字串
 * 為字串故可自動補0
 * console.log(1.005.toFixed(2)) //1.00
 * console.log(dig(1.005, 2)) //1.01
 * 若輸入不是數字或字串時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/dig.test.js Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @param {Integer} [idig=0] 輸入指定小數位整數，預設為0
 * @returns {String} 回傳取指定小數位的字串
 * @example
 * dig(0.123456789, 3)
 * // => '0.123'
 * dig(0.123456789, 4)
 * // => '0.1235'
 */
function dig(v, idig = 0) {

    //check
    if (!isnum(v)) {
        return ''
    }
    if (!isp0int(idig)) {
        return ''
    }

    v = cdbl(v)
    let r = round(v, idig).toFixed(idig) //IEEE754, toFixed回傳為string

    return r
}


export default dig
