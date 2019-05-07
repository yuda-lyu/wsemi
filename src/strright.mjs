import isestr from './isestr.mjs'
import ispint from './ispint.mjs'


/**
 * 取字串右邊n個字元
 *
 * @export
 * @param {String} c 輸入要被取的字串
 * @param {Integer} n 輸入取右邊n個字元
 * @returns {String} 回傳處理後字串
 */
export default function strright(c, n) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!ispint(n)) {
        return ''
    }

    return c.substr(c.length - n, n)
}
