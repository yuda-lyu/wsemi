import isarr from './isarr.mjs'


/**
 * 判斷是否為無內容陣列
 *
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、讀取長度即拋錯者)，判定拋錯者回傳false
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isarr0.test.mjs Github}
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
        //讀取length可能觸發Proxy之陷阱而拋錯, 無法判定者回傳false
        try {
            if (v.length === 0) {
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


export default isarr0
