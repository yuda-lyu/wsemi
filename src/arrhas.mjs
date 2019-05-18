import isestr from './isestr.mjs'
import isearr from './isearr.mjs'


/**
 * 判斷任一字串陣列vtar內元素，是否「等於」任一字串陣列vhas內元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrhas.test.js Github}
 * @memberOf wsemi
 * @param {Array|String} vtar 輸入被查找的字串陣列或字串
 * @param {Array|String} vhas 輸入查找字串陣列或字串
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * arrhas(['abc', 'bcd'], 'abc')
 * // => true
 * arrhas(['xyz', 'bcd'], 'abc')
 * // => false
 * arrhas(['abc', 'bcd'], ['abc', 'cde'])
 * // => true
 * arrhas(['abc', 'bcd'], ['xyz', 'cde'])
 * // => false
 */
function arrhas(vtar, vhas) {

    //不是陣列則自動轉陣列
    if (isestr(vtar)) {
        vtar = [vtar]
    }
    else if (isearr(vtar)) {
        //預設輸入陣列
    }
    else {
        return false
    }

    //不是陣列則自動轉陣列
    if (isestr(vhas)) {
        vhas = [vhas]
    }
    else if (isearr(vhas)) {
        //預設輸入陣列
    }
    else {
        return false
    }

    //由vtar各元素當中，若存在vhas內任一元素則回傳true，反之回傳false
    for (let i = 0; i < vtar.length; i++) {
        for (let j = 0; j < vhas.length; j++) {
            if (vtar[i] === vhas[j]) {
                return true
            }
        }
    }
    return false
}


export default arrhas
