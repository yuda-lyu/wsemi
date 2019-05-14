import isint from './isint.mjs'
import cint from './cint.mjs'


/**
 * 判斷是否為小於等於0整數(非正整數)
 * 非正整數包含0
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isn0int.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 */
function isn0int(v) {

    //check
    if (!isint(v)) {
        return false
    }

    let r = cint(v) <= 0

    return r
}


export default isn0int
