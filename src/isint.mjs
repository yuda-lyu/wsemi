import isInteger from 'lodash/isInteger'
import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 判斷是否為整數
 *
 * @export
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 */
export default function isint(v) {

    if (isnum(v)) {
        v = cdbl(v)
        return isInteger(v)
    }
    else {
        return false
    }
}
