import isstr from './isstr.mjs'


/**
 * 判斷是否為有效字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isestr.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * isestr('1.25')
 * // => true
 *
 * isestr(125)
 * // => false
 *
 * isestr('')
 * // => false
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
