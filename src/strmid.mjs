import isestr from './isestr.mjs'
import ispint from './ispint.mjs'


/**
 * 取字串中位置s開始後n個字元
 *
 * @export
 * @param {String} c 輸入要被取的字串
 * @param {Integer} s 輸入要由第s個位置開始，為整數
 * @param {Integer} n 輸入開始後n個字元，為整數
 * @returns
 */
export default function strmid(c, s, n) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!ispint(s)) {
        return ''
    }
    if (!ispint(n)) {
        return ''
    }

    return c.substring((s - 1), (s + n - 1))
}
