import isstr from './isstr.mjs'


/**
 * 判斷是否為有效字串
 *
 * 只收原始字串且非空字串，包裝物件new String('a')為false(判斷函數只收原始值)；對任何輸入皆不拋錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isestr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值，包裝物件為false
 * @example
 *
 * console.log(isestr('1.25'))
 * // => true
 *
 * console.log(isestr(125))
 * // => false
 *
 * console.log(isestr(''))
 * // => false
 *
 * console.log(isestr(new String('a')))
 * // => false (包裝物件, 判斷函數只收原始值)
 *
 */
function isestr(v) {

    //check
    if (isstr(v)) {
        if (v !== '') {
            return true
        }
    }
    return false
}


export default isestr
