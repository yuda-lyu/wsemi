import isint from './isint.mjs'
import cint from './cint.mjs'


/**
 * 判斷是否為正整數
 * 正整數不包含0，為大於0的整數
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function ispint(v) {

    //check
    if (!isint(v)) {
        return false
    }

    let r = cint(v) > 0

    return r
}


export default ispint
