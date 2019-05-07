import isestr from './isestr.mjs'
import isnum from './isnum.mjs'


/**
 * 輸入轉字串
 * 若輸入不是數字或字串時則回傳空字串
 * @export
 * @param {Number|String} v 輸入資料
 * @returns {String} 回傳字串
 */
export default function cstr(v) {

    //check
    if (!isestr(v) && !isnum(v)) {
        return ''
    }

    let r = String(v)

    return r
}
