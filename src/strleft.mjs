import isestr from './isestr.mjs'
import isp0int from './isp0int.mjs'
import cint from './cint.mjs'


/**
 * 取字串左邊n個字元
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strleft.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被取的字串
 * @param {Integer} n 輸入取左邊n個字元
 * @returns {String} 回傳處理後字串
 * @example
 *
 * console.log(strleft('test中文', 2))
 * // => 'te'
 *
 */
function strleft(c, n) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!isp0int(n)) {
        return ''
    }

    n = cint(n)

    //check
    if (n === 0) {
        return ''
    }

    return c.substring(0, n)
}


export default strleft
