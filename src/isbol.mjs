/**
 * 判斷是否為boolean
 *
 * 只收原始布林(true、false)，包裝物件new Boolean(true)為false，偽造Symbol.toStringTag為'Boolean'之一般物件亦為false；對任何輸入皆不拋錯(含已撤銷之Proxy)
 * 要把輸入轉成布林請用轉型函數cbol(轉型函數照舊拆包)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isbol.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isbol(false))
 * // => true
 *
 * console.log(isbol(new Boolean(false)))
 * // => false (包裝物件, 判斷函數只收原始值)
 *
 */
function isbol(v) {

    //typeof不呼叫被檢測值之任何方法或陷阱, 對已撤銷之Proxy亦不拋錯; 包裝物件之typeof為'object'
    return typeof v === 'boolean'
}


export default isbol
