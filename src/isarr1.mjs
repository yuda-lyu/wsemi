import isarr from './isarr.mjs'


/**
 * 判斷是否為有內容陣列，即長度至少為1之陣列
 *
 * 與isearr之差異：isearr於長度為1時會額外檢查該元素是否為有效值，故['']、[null]會判為false；本函數只看長度，故皆判為true
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isarr1.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isarr1([]))
 * // => false
 *
 * console.log(isarr1([{}]))
 * // => true
 *
 * console.log(isarr1(['']))
 * // => true
 *
 */
function isarr1(v) {

    if (isarr(v)) {
        if (v.length >= 1) {
            return true
        }
        return false
    }
    return false
}


export default isarr1
