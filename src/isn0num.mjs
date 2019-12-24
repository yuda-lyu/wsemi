import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 判斷是否為小於等於0浮點數(非正浮點數)
 * 非正浮點數包含0
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isn0num.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * console.log(isn0num(0))
 * // => true
 *
 * console.log(isn0num(-125))
 * // => true
 *
 * console.log(isn0num(-1.25))
 * // => true
 *
 * console.log(isn0num(125))
 * // => false
 *
 * console.log(isn0num('-125'))
 * // => true
 *
 * console.log(isn0num('-1.25'))
 * // => true
 *
 * console.log(isn0num('125'))
 * // => false
 */
function isn0num(v) {

    //check
    if (!isnum(v)) {
        return false
    }

    let r = cdbl(v) <= 0

    return r
}


export default isn0num
