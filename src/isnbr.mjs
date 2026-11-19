/**
 * 判斷是否為數字
 *
 * 只收原始數字(含NaN、Infinity)，包裝物件new Number(1)為false，偽造Symbol.toStringTag為'Number'之一般物件亦為false；對任何輸入皆不拋錯(含已撤銷之Proxy)
 * 要把包裝物件轉成數字請用轉型函數cdbl(轉型函數照舊拆包)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnbr.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isnbr(1.25))
 * // => true
 *
 * console.log(isnbr('1.25'))
 * // => false
 *
 * console.log(isnbr(new Number(1)))
 * // => false (包裝物件, 判斷函數只收原始值)
 *
 */
function isnbr(v) {
    //typeof不呼叫被檢測值之任何方法或陷阱, 對已撤銷之Proxy亦不拋錯; 包裝物件之typeof為'object'
    return typeof v === 'number'
}


export default isnbr
