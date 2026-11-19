import isstr from './isstr.mjs'


/**
 * 判斷是否為空字串
 *
 * 只收原始字串，包裝物件new String('')為false(判斷函數只收原始值)；對任何輸入皆不拋錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isstr0.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值，包裝物件為false
 * @example
 *
 * console.log(isstr0(''))
 * // => true
 *
 * console.log(isstr0('0'))
 * // => false
 *
 * console.log(isstr0('abc125'))
 * // => false
 *
 * console.log(isstr0(new String('')))
 * // => false (包裝物件, 判斷函數只收原始值)
 *
 */
function isstr0(v) {

    if (isstr(v)) {
        if (v === '') {
            return true
        }
    }
    return false
}


export default isstr0
