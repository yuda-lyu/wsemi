import isint from './isint.mjs'
import cint from './cint.mjs'


/**
 * 判斷是否為大於等於0整數(非負整數)
 * 非負整數包含0
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
function isp0int(v) {

    //check
    if (!isint(v)) {
        return false
    }

    let r = cint(v) >= 0

    return r
}


export default isp0int
