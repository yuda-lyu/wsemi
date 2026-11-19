import isarr from './isarr.mjs'


/**
 * 判斷是否為有內容陣列，即長度至少為1之陣列
 *
 * 與isearr之差異：isearr於長度為1時會額外檢查該元素是否為有效值，故['']、[null]會判為false；本函數只看長度，故皆判為true
 *
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、讀取長度即拋錯者)，判定拋錯者回傳false
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
        //讀取length可能觸發Proxy之陷阱而拋錯, 無法判定者回傳false
        try {
            if (v.length >= 1) {
                return true
            }
        }
        catch (err) {
            return false
        }
        return false
    }
    return false
}


export default isarr1
