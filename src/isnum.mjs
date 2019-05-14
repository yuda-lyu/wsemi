import isestr from './isestr.mjs'
import isnbr from './isnbr.mjs'


/**
 * 判斷是否為數字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnum.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 */
function isnum(v) {

    let b = false
    if (isestr(v)) {
        b = !isNaN(Number(v))
    }
    else if (isnbr(v)) {
        b = true
    }

    return b
}


export default isnum
