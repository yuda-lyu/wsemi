import * as ldround from 'lodash/round'
import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 數字或字串四捨五入至整數
 * 若輸入不是數字或字串時則回傳空字串
 * @export
 * @param {Number|String} v 輸入數字或字串
 * @returns {Integer} 回傳四捨五入的整數
 */
export default function round(v) {

    //check
    if (!isestr(v) && !isnum(v)) {
        return ''
    }

    v = cdbl(v)

    let r = ldround(v)

    return r
}
