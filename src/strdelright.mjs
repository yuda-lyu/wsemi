import isestr from './isestr.mjs'
import isp0int from './isp0int.mjs'
import strleft from './strleft.mjs'
import cint from './cint.mjs'


/**
 * 刪除字串右邊n個字元
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strdelright.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被刪除的字串
 * @param {Integer} n 輸入刪除右邊n個字元
 * @returns {String} 回傳處理後字串
 * @example
 *
 * console.log(strdelright('test中文', 2))
 * // => 'test'
 *
 */
function strdelright(c, n) {

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
        return c
    }

    return strleft(c, c.length - n)
}


export default strdelright
