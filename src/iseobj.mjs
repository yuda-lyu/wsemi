import isobj from './isobj.mjs'


/**
 * 判斷是否為有效物件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isobj.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(iseobj({}))
 * // => false
 *
 * console.log(iseobj({ a: 123 }))
 * // => true
 *
 */
function iseobj(v) {

    if (isobj(v)) {
        for (let k in v) {
            return true
        }
        return false
    }
    return false
}


export default iseobj
