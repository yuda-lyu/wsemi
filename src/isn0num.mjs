import isnum from './isnum.mjs'
import cdbl from './cdbl.mjs'


/**
 * 判斷是否為小於等於0浮點數(非正浮點數)
 * 非正浮點數包含0
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isn0num.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
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
