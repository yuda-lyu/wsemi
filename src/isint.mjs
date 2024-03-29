import isInteger from 'lodash-es/isInteger.js'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 判斷是否為整數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isint.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isint('1.25'))
 * // => false
 *
 * console.log(isint('125'))
 * // => true
 *
 * console.log(isint(1.25))
 * // => false
 *
 * console.log(isint(125))
 * // => true
 *
 */
function isint(v) {

    if (isnum(v)) {
        v = cdbl(v)
        return isInteger(v)
    }
    else {
        return false
    }
}


export default isint
