import isSymbol from 'lodash-es/isSymbol.js'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import isbigint from './isbigint.mjs'


/**
 * 輸入轉字串
 * 若輸入不是字串、數字、Symbol、BigInt時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cstr.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Number|Symbol|BigInt} v 輸入資料
 * @returns {String} 回傳字串
 * @example
 *
 * console.log(cstr(2.25))
 * // => '2.25'
 *
 * console.log(cstr(123n))
 * // => '123'
 *
 * console.log(cstr(BigInt('9007199254740993')))
 * // => '9007199254740993' (超過Number.MAX_SAFE_INTEGER, BigInt精確保留)
 *
 */
function cstr(v) {

    //check
    if (!isestr(v) && !isnum(v) && !isSymbol(v) && !isbigint(v)) {
        return ''
    }

    let r = ''
    try {
        r = String(v)
    }
    catch (err) {
    }
    try {
        r = v.toString()
    }
    catch (err) {
    }

    return r
}


export default cstr
