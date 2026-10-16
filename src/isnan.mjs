// import isNaN from 'lodash-es/isNaN.js'


/**
 * 判斷是否為NaN
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/isnan.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料
 * @returns {Boolean} 回傳判斷布林值，包裝物件依其原始值判定
 * @example
 *
 * console.log(isnan(NaN))
 * // => true
 *
 */
function isnan(v) {

    // return isNaN(v)
    if (v !== v) {
        return true
    }

    //包裝物件(new Number(NaN))以Number.prototype.valueOf取原始值, 非Number物件即拋錯而為false
    //  不呼叫物件自身之valueOf、不以內部標籤判定, 防一般物件偽裝
    if (v !== null && typeof v === 'object') {
        try {
            let p = Number.prototype.valueOf.call(v)
            return Number.isNaN(p)
        }
        catch (err) {
            return false
        }
    }

    return false
}


export default isnan
