import isestr from './isestr.mjs'
import isnum from './isnum.mjs'


/**
 * 輸入轉字串
 * 若輸入不是數字或字串時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cstr.test.mjs Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入資料
 * @returns {String} 回傳字串
 * @example
 *
 * console.log(cstr(2.25))
 * // => '2.25'
 *
 */
function cstr(v) {

    //check
    if (!isestr(v) && !isnum(v)) {
        return ''
    }

    let r = String(v)

    return r
}


export default cstr
