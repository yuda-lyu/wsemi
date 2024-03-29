import isarr from './isarr.mjs'
import iser from './iser.mjs'


/**
 * 判斷是否為有效陣列，長度至少大於等於1，各元素至少皆為有效
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isearr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isearr([{}]))
 * // => false
 *
 * console.log(isearr([{ a: 123 }]))
 * // => true
 *
 */
function isearr(v) {

    //check
    if (!isarr(v)) {
        return false
    }

    //check length
    if (v.length === 0) {
        return false
    }

    //check length=1
    if (v.length === 1) {
        if (iser(v[0])) {
            return false
        }
    }

    return true
}


export default isearr
