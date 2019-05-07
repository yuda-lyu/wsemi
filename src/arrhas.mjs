import isestr from './isestr.mjs'
import isarr from './isarr.mjs'


/**
 * 判斷任一字串陣列vtar內元素，是否「等於」任一字串陣列vhas內元素
 *
 * @export
 * @param {Array|String} vtar 輸入被查找的字串陣列或字串
 * @param {Array|String} vhas 輸入查找字串陣列或字串
 * @returns {Boolean} 回傳判斷布林值
 */
export default function arrhas(vtar, vhas) {

    //不是陣列則自動轉陣列
    if (isestr(vtar)) {
        vtar = [vtar]
    }
    else if (isarr(vtar)) {
        //預設輸入陣列
    }
    else {
        return false
    }

    //不是陣列則自動轉陣列
    if (isestr(vhas)) {
        vhas = [vhas]
    }
    else if (isarr(vhas)) {
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
