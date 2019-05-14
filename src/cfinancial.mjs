import isnum from './isnum.mjs'
import isp0int from './isp0int.mjs'
import dig from './dig.mjs'


/**
 * 數字或字串轉金融格式(百分位添加逗號)表示
 * 若輸入不是數字或字串時則回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cfinancial.test.js Github}
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @param {Integer} [idig=0] 輸入指定小數位整數，預設為0
 * @returns {String} 回傳金融格式的字串
 * @example
 *
 */
function cfinancial(v, idig = 0) {

    //check
    if (!isnum(v)) {
        return ''
    }
    if (!isp0int(idig)) {
        return ''
    }

    v = dig(v, idig)

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


export default cfinancial
