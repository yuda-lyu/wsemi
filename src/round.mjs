import loround from 'lodash/round'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 數字或字串四捨五入至整數
 * 若輸入不是數字或字串時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/round.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @returns {Integer} 回傳四捨五入的整數
 * @example
 *
 * console.log(round(1.5))
 * // => 2
 *
 * console.log(round('1.5'))
 * // => 2
 *
 * console.log(round('125abc'))
 * // => ''
 *
 */
function round(v) {

    //check
    if (!isnum(v)) {
        return ''
    }

    v = cdbl(v)

    let r = loround(v)

    return r
}


export default round
