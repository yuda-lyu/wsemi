import isint from './isint.mjs'
import cint from './cint.mjs'


/**
 * 判斷是否為小於等於0整數(非正整數)
 * 非正整數包含0
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isn0int(v) {

    //check
    if (!isint(v)) {
        return false
    }

    let r = cint(v) <= 0

    return r
}
