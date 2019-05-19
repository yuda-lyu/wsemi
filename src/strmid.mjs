import isestr from './isestr.mjs'
import isp0int from './isp0int.mjs'
import ispint from './ispint.mjs'


/**
 * 取字串中位置s開始後n個字元
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strmid.test.js Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被取的字串
 * @param {Integer} s 輸入要由第s個位置開始，為正整數
 * @param {Integer} n 輸入開始後n個字元，為正整數
 * @returns {String} 回傳處理後字串
 * @example
 * strmid('test中文', 2, 1)
 * // => 's'
 *
 * strmid('test中文', 2, 3)
 * // => 'st中'
 */
function strmid(c, s, n) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!isp0int(s)) {
        return ''
    }
    if (!ispint(n)) {
        return ''
    }

    return c.substring((s), (s + n))
}

export default strmid
