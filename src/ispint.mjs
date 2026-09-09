import isint from './isint.mjs'
import cint from './cint.mjs'


/**
 * 判斷是否為正整數
 * 正整數不包含0，為大於0的整數
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ispint.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.useLimitSafe=false] 輸入是否限制須為安全整數布林值，原樣傳遞給isint，若為true則超出安全整數範圍者(即Number.isSafeInteger為false，含Infinity、-Infinity與絕對值大於Number.MAX_SAFE_INTEGER者)判定為false，預設false
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(ispint(0))
 * // => false
 *
 * console.log(ispint('0'))
 * // => false
 *
 * console.log(ispint(125))
 * // => true
 *
 * console.log(ispint(1.25))
 * // => false
 *
 * console.log(ispint('125'))
 * // => true
 *
 * console.log(ispint('1.25'))
 * // => false

 * console.log(ispint(-125))
 * // => false
 *
 * console.log(ispint(-1.25))
 * // => false
 *
 * console.log(ispint('-125'))
 * // => false
 *
 * console.log(ispint('-1.25'))
 * // => false
 *
 */
function ispint(v, opt = {}) {

    //check, opt原樣傳遞, 安全整數之判定統一由isint負責, 不於此重複實作
    if (!isint(v, opt)) {
        return false
    }

    //cint無須傳入opt, 因已通過isint之檢查, 此處v必為安全整數, cint不會有超出安全整數範圍之情形
    let r = cint(v) > 0

    return r
}


export default ispint
