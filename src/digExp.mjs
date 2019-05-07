import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import isp0int from './isp0int.mjs'
import cdbl from './cdbl.mjs'
import dig from './dig.mjs'


/**
 * 數字取指定小數位，小於1e-6改指數顯示
 * 若輸入不是數字或字串時則回傳空字串
 * @export
 * @param {Number|String} v 輸入數字或字串
 * @param {Integer} [idig=0] 輸入指定小數位整數，預設為0
 * @returns {String} 回傳取指定小數位的字串
 */
export default function digExp(v, idig) {

    //check
    if (!isestr(v) && !isnum(v)) {
        return ''
    }
    if (!isp0int(idig)) {
        return ''
    }

    v = cdbl(v)

    let r = ''
    if (v === 0) {
        r = '0'
    }
    else if (Math.abs(v) <= 1e-6) {
        r = v.toExponential(idig)
    }
    else {
        r = dig(v, idig)
    }

    return r
}
