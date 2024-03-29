import isestr from './isestr.mjs'
import isstr from './isstr.mjs'


/**
 * 取代字串，找尋條件為滿足具字首字尾則被取代
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/replacePlus.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被取代的字串
 * @param {String} pre 輸入需為字首的字串
 * @param {String} aft 輸入需為字尾的字串
 * @param {String} [not=null] 輸入需不包含的字串，預設為不使用
 * @param {String} r 輸入要取代的字串
 * @returns {String} 回傳取代後字串
 * @example
 *
 * console.log(replacePlus('1.25mn1.25abc中文結尾', '1', '文', null, 'xyz'))
 * // => 'xyz結尾'
 *
 * console.log(replacePlus('1.25mn1.25abc中文結尾', '1', '文', 'm', 'xyz'))
 * // => '1.25mnxyz結尾'
 *
 */
function replacePlus(c, pre, aft, not = null, r) {

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


export default replacePlus
