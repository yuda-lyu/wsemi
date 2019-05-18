import isestr from './isestr.mjs'
import isstr from './isstr.mjs'


/**
 * 取代字串
 * 針對c查找是否含有t，並將t全部取代成r
 * 若輸入c,t,r不是字串時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/replace.test.js Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被取代的字串
 * @param {String} t 輸入要查找的字串
 * @param {String} r 輸入要取代的字串
 * @returns {String} 回傳取代後字串
 * @example
 * replace('1.25abc', '5a', '0')
 * // => '1.20bc'
 */
function replace(c, t, r) {

    //check
    if (!isestr(c)) {
        return ''
    }
    if (!isestr(t)) {
        return ''
    }
    if (!isstr(r)) { //可取代成空字串
        return ''
    }

    let o = new RegExp(t, 'g')
    let rr = String(c).replace(o, r)

    return rr
}


export default replace
