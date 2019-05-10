import round from 'lodash/round'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 數字或字串四捨五入轉整數
 * 若輸入非數字則回傳0
 * @memberOf wsemi
 * @param {Number|String} v 輸入數字或字串
 * @returns {Integer} 回傳四捨五入後整數
 */
function cint(v) {

    //check
    if (!isnum(v)) {
        return 0
    }

    v = cdbl(v)

    let r = round(v)

    return r
}


export default cint
