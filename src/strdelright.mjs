import isestr from './isestr.mjs'
import ispint from './ispint.mjs'
import strleft from './strleft.mjs'


/**
 * 刪除字串右邊n個字元
 *
 * @memberOf wsemi
 * @param {String} c 輸入要被刪除的字串
 * @param {Integer} n 輸入刪除右邊n個字元
 * @returns {String} 回傳處理後字串
 */
function strdelright(c, n) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!ispint(n)) {
        return ''
    }

    return strleft(c, c.length - n)
}


export default strdelright
