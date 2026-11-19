import isobj from './isobj.mjs'


/**
 * 判斷是否為有效物件，須為物件(依型別標記判定，同isobj)且至少有一個自有可列舉字串鍵(等同Object.keys(v).length > 0)
 *
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、列舉鍵即拋錯之Proxy)，判定拋錯者回傳false
 *
 * 只有繼承而來之可列舉鍵(如Object.create({ a: 1 })、或建構函數之prototype上有可列舉屬性而實例本身無自有欄位)者視為無效物件，回傳false；Symbol鍵與不可列舉鍵不計
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/iseobj.test.mjs Github}
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
 * console.log(iseobj(Object.create({ a: 123 })))
 * // => false (只有繼承之鍵)
 *
 */
function iseobj(v) {

    if (!isobj(v)) {
        return false
    }

    //至少一個自有可列舉字串鍵(使用者2026-11-14, 第430項第二批): for...in只走可列舉字串鍵(含繼承), 以hasOwnProperty篩自有者, 遇到即回傳, 不配置鍵陣列
    //for...in與hasOwnProperty會觸發Proxy之ownKeys、getPrototypeOf、getOwnPropertyDescriptor等陷阱, 陷阱拋錯者無法判定, 回傳false
    try {
        for (let k in v) {
            if (Object.prototype.hasOwnProperty.call(v, k)) {
                return true
            }
        }
    }
    catch (err) {
        return false
    }
    return false
}


export default iseobj
