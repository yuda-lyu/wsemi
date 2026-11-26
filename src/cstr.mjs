import isestr from './isestr.mjs'
import isnum from './isnum.mjs'
import unbox from './_unbox.mjs'


//unboxBigSym, 拆BigInt與Symbol之包裝物件(Object(1n)、Object(Symbol()))為原始值, 非包裝物件原樣回傳; 內部槽判定, 不拋錯
function unboxBigSym(v) {
    if (v === null || typeof v !== 'object') {
        return v
    }
    try {
        return BigInt.prototype.valueOf.call(v)
    }
    catch (err) {}
    try {
        return Symbol.prototype.valueOf.call(v)
    }
    catch (err) {}
    return v
}


/**
 * 輸入轉字串
 * 若輸入不是字串、數字、Symbol、BigInt時則回傳空字串
 * 轉型函數照舊拆包: 包裝物件new String('a')、new Number(1)先取出原始值再轉換(判斷函數isestr、isnum只收原始值，轉型函數不受影響)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cstr.test.mjs Github}
 * @memberOf wsemi
 * @param {String|Number|Symbol|BigInt} v 輸入資料
 * @returns {String} 回傳字串
 * @example
 *
 * console.log(cstr(2.25))
 * // => '2.25'
 *
 * console.log(cstr(123n))
 * // => '123'
 *
 * console.log(cstr(BigInt('9007199254740993')))
 * // => '9007199254740993' (超過Number.MAX_SAFE_INTEGER, BigInt精確保留)
 *
 */
function cstr(v) {

    //拆包, 轉型函數照舊轉換包裝物件(isestr、isnum只收原始值)
    v = unbox(v)

    //拆包BigInt與Symbol之包裝物件, 以內部槽判定(偽造Symbol.toStringTag者與Proxy不是包裝物件), 判型一律用typeof而不呼叫被檢測值之任何方法或陷阱(lodash isSymbol於已撤銷之Proxy拋錯, C1: 轉型函數無法轉型回預設值, 不拋錯)
    v = unboxBigSym(v)

    //check
    if (!isestr(v) && !isnum(v) && typeof v !== 'symbol' && typeof v !== 'bigint') {
        return ''
    }

    let r = ''
    try {
        r = String(v)
    }
    catch (err) {
    }
    try {
        r = v.toString()
    }
    catch (err) {
    }

    return r
}


export default cstr
