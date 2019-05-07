import isint from './isint.mjs'
import cint from './cint.mjs'


/**
 * 判斷是否為負整數
 * 負整數不包含0，為小於0的整數
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isnint(v) {

    //check
    if (!isint(v)) {
        return false
    }

    let r = cint(v) < 0

    return r
}
