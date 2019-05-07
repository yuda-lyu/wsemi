import isestr from './isestr.mjs'
import ispint from './ispint.mjs'


/**
 * 取字串左邊n個字元
 *
 * @export
 * @param {String} c 輸入要被取的字串
 * @param {Integer} n 輸入取左邊n個字元
 * @returns {String} 回傳處理後字串
 */
export default function strleft(c, n) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!ispint(n)) {
        return ''
    }

    return c.substr(0, n)
}
