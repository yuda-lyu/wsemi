import isestr from './isestr.mjs'
import isstr from './isstr.mjs'


/**
 * 取代字串，找尋條件為滿足具字首字尾則被取代
 *
 * @export
 * @param {String} c 輸入要被取代的字串
 * @param {String} pre 輸入需為字首的字串
 * @param {String} aft 輸入需為字尾的字串
 * @param {String} [not=undefined] 輸入需不包含的字串，預設為不使用
 * @param {String} r 輸入要取代的字串
 * @returns {String} 回傳取代後字串
 */
export default function replacePlus(c, pre, aft, not = undefined, r) {

    //check
    if (!isestr(c) || !isestr(pre) || !isestr(aft)) {
        return ''
    }
    if (!isstr(r)) { //可取代成空字串
        return ''
    }

    let cfit = '[\\s\\S]*'
    if (isestr(not)) {
        cfit = '[^' + not + ']*'
    }

    let t = pre + cfit + aft
    let rex = new RegExp(t, 'g')
    let rr = c.replace(rex, r)

    return rr
}
