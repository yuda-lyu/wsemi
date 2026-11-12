import isestr from './isestr.mjs'
import isstr from './isstr.mjs'


/**
 * 取代字串
 * 針對c查找是否含有t，並將t全部取代成r
 * 若輸入c,t,r不是字串時則回傳空字串
 *
 * t與r皆為字面文字，不作正規表示式；r內之$&、$'、$`、$$、$<name>、$1等亦不特殊解讀（原樣輸出，不會展開成比對到的文字等）
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/replace.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被取代的字串
 * @param {String} t 輸入要查找的字串，為字面文字
 * @param {String} r 輸入要取代的字串，為字面文字，$樣式不展開
 * @returns {String} 回傳取代後字串
 * @example
 *
 * console.log(replace('1.25abc', '5a', '0'))
 * // => '1.20bc'
 *
 * console.log(replace('價格{p}', '{p}', '$&5'))
 * // => '價格$&5'
 *
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

    // let o = new RegExp(t, 'g')
    // let rr = String(c).replace(o, r)
    //r為字面文字: 以函式回傳r, 取代字串中之$&、$'、$`、$$等樣式不展開(R-REPLACE-LITERAL-01)
    let rr = String(c).replaceAll(t, () => String(r))

    return rr
}


export default replace
