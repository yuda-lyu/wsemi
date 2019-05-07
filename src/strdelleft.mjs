import isestr from './isestr.mjs'
import ispint from './ispint.mjs'
import strright from './strright.mjs'


/**
 * 刪除字串左邊n個字元
 *
 * @export
 * @param {String} c 輸入要被刪除的字串
 * @param {Integer} n 輸入刪除左邊n個字元
 * @returns {String} 回傳處理後字串
 */
export default function strdelleft(c, n) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!ispint(n)) {
        return ''
    }

    return strright(c, c.length - n)
}
