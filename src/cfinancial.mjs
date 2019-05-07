import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import cstr from './cstr.mjs'


/**
 * 數字或字串轉金融格式(百分位添加逗號)表示
 * 若輸入不是數字或字串時則回傳空字串
 * @export
 * @param {Number|String} v 輸入數字或字串
 * @returns {String} 回傳金融格式的字串
 */
export default function cfinancial(v) {

    //check
    if (!isestr(v) && !isnum(v)) {
        return ''
    }

    v = cstr(v)

    //轉成金融數字格式
    let x = v.split('.')
    let x1 = x[0]
    let x2 = x.length > 1 ? '.' + x[1] : ''
    let rgx = /(\d+)(\d{3})/
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2')
    }
    let r = x1 + x2

    return r
}
