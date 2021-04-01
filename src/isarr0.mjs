import isarr from './isarr.mjs'


/**
 * 判斷是否為無內容陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isarr0.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isarr([]))
 * // => true
 *
 * console.log(isarr([{}]))
 * // => false
 *
 */
function isarr0(v) {

    if (isarr(v)) {
        if (v.length === 0) {
            return true
        }
        return false
    }
    return false
}


export default isarr0
