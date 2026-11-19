/**
 * 判斷是否為NaN
 *
 * 只收原始值NaN，包裝物件new Number(NaN)為false(判斷函數只收原始值)；對任何輸入皆不拋錯(不呼叫被檢測值之任何方法)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnan.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值
 * @example
 *
 * console.log(isnan(NaN))
 * // => true
 *
 * console.log(isnan(new Number(NaN)))
 * // => false (包裝物件, 判斷函數只收原始值)
 *
 */
function isnan(v) {

    //Number.isNaN不轉型, 只有原始值NaN為true; 物件(含包裝物件new Number(NaN)、已撤銷之Proxy)一律false, 不呼叫其任何方法、不觸發任何陷阱
    return Number.isNaN(v)
}


export default isnan
