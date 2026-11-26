/**
 * 判斷是否為null
 *
 * 只有null為true(語言原生判定v === null，不讀Symbol.toStringTag)：偽造Symbol.toStringTag為'Null'之物件為false
 * 對任何輸入皆不拋錯(含已撤銷之Proxy、讀取內部標籤即拋錯之物件)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnull.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isnull(null))
 * // => true
 *
 */
function isnull(v) {
    return v === null
}


export default isnull
