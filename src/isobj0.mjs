import isobj from './isobj.mjs'


/**
 * 判斷是否為空物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isobj0.test.js Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 * isobj0({})
 * // => true
 * isobj0({ a: 123 })
 * // => false
 */
function isobj0(v) {

    if (isobj(v)) {
        for (let k in v) {
            return false
        }
        return true
    }
    return false
}


export default isobj0
