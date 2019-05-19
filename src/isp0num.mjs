import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 判斷是否為大於等於0浮點數(非負浮點數)
 * 非負浮點數包含0
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isp0num.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * isp0num(0)
 * // => true
 *
 * isp0num(125)
 * // => true
 *
 * isp0num(1.25)
 * // => true
 *
 * isp0num(-1.25)
 * // => false
 *
 * isp0num('1.25')
 * // => true
 */
function isp0num(v) {

    //check
    if (!isnum(v)) {
        return false
    }

    let r = cdbl(v) >= 0

    return r
}


export default isp0num
