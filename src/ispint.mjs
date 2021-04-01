import isint from './isint.mjs'
import cint from './cint.mjs'


/**
 * 判斷是否為正整數
 * 正整數不包含0，為大於0的整數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ispint.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(ispint(0))
 * // => false
 *
 * console.log(ispint(125))
 * // => true
 *
 * console.log(ispint('125'))
 * // => true
 *
 * console.log(ispint(1.25))
 * // => false
 *
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
