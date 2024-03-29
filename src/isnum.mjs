import isestr from './isestr.mjs'
import isnbr from './isnbr.mjs'
import isnan from './isnan.mjs'


/**
 * 判斷是否為數字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnum.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isnum(0))
 * // => true
 *
 * console.log(isnum(1.25))
 * // => true
 *
 * console.log(isnum('-125'))
 * // => true
 *
 */
function isnum(v) {

    let b = false
    if (isestr(v)) {
        b = !isNaN(Number(v))
    }
    else if (isnbr(v)) { //注意NaN為Number, 故isnbr回傳true
        if (isnan(v)) {
            return false //此處判定為有效數字, 故NaN須剔除
        }
        else {
            b = true
        }
    }

    return b
}


export default isnum
