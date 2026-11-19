/**
 * 判斷是否為字串
 *
 * 只收原始字串(含空字串)，包裝物件new String('a')為false，偽造Symbol.toStringTag為'String'之一般物件亦為false；對任何輸入皆不拋錯(含已撤銷之Proxy)
 * 要把包裝物件轉成字串請用轉型函數cstr(轉型函數照舊拆包)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isstr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isstr(0))
 * // => false
 *
 * console.log(isstr('0'))
 * // => true
 *
 * console.log(isstr(''))
 * // => true
 *
 * console.log(isstr(new String('a')))
 * // => false (包裝物件, 判斷函數只收原始值)
 *
 */
function isstr(v) {
    //typeof不呼叫被檢測值之任何方法或陷阱, 對已撤銷之Proxy亦不拋錯; 包裝物件之typeof為'object'
    return typeof v === 'string'
}


export default isstr
