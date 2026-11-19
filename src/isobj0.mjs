import isobj from './isobj.mjs'


/**
 * 判斷是否為空物件
 *
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、列舉鍵即拋錯之Proxy)，判定拋錯者回傳false
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isobj0.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isobj0({}))
 * // => true
 *
 * console.log(isobj0({ a: 123 }))
 * // => false
 *
 */
function isobj0(v) {

    if (isobj(v)) {
        //for...in會觸發Proxy之ownKeys、getPrototypeOf等陷阱, 陷阱拋錯者無法判定是否為空, 回傳false
        try {
            for (let k in v) {
                return false
            }
            return true
        }
        catch (err) {
            return false
        }
    }
    return false
}


export default isobj0
