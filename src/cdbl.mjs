import toFinite from 'lodash/toFinite'
import isnum from './isnum.mjs'


/**
 * 數字或字串轉浮點數
 * 若輸入非數字則回傳0
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cdbl.test.js Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @returns {Number} 回傳數字
 * @example
 * cdbl('25')
 * // => 25
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
