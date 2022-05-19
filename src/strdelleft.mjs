import isestr from './isestr.mjs'
import isp0int from './isp0int.mjs'
import strright from './strright.mjs'
import cint from './cint.mjs'


/**
 * 刪除字串左邊n個字元
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strdelleft.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被刪除的字串
 * @param {Integer} n 輸入刪除左邊n個字元正整數
 * @returns {String} 回傳處理後字串
 * @example
 *
 * console.log(strdelleft('test中文', 2))
 * // => 'st中文'
 *
 */
function strdelleft(c, n) {

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

    return strright(c, c.length - n)
}


export default strdelleft
