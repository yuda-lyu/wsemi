import unbox from './_unbox.mjs'


/**
 * 布林值或字串轉布林值
 *
 * 只把布林true、false與字串'true'、'false'轉為對應之布林值，字串先去頭尾空白且須全小寫；其餘輸入一律轉為false，包含數字(cbol(1)為false)、大小寫混用之字串('TRUE'、'True'、'tRuE'為false)、'y'、'yes'、'1'、陣列、物件、null與undefined(使用者2026-11-16定，dspec〈輸入參數之檢測機制〉§3.3 B2：布林與數字不互轉)
 * 轉型函數照舊拆包: 包裝物件new Boolean(true)、new String('true')先取出原始值再轉換(判斷函數isbol、isestr只收原始值，轉型函數不受影響)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/cbol.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意值
 * @returns {Boolean} 回傳布林值，恆回傳原始布林值(輸入new Boolean時回傳其原始值而非包裝物件)，無法轉換者回傳false
 * @example
 *
 * console.log(cbol(true))
 * // => true
 *
 * console.log(cbol(false))
 * // => false
 *
 * console.log(cbol('true'))
 * // => true
 *
 * console.log(cbol(' true '))
 * // => true (去頭尾空白)
 *
 * console.log(cbol('false'))
 * // => false
 *
 * console.log(cbol(1))
 * // => false (數字不轉為布林)
 *
 * console.log(cbol(0))
 * // => false
 *
 * console.log(cbol('tRuE'))
 * // => false (須全小寫)
 *
 * console.log(cbol('TRUE'))
 * // => false (須全小寫)
 *
 * console.log(cbol('abc'))
 * // => false
 *
 * console.log(cbol(''))
 * // => false
 *
 * console.log(cbol([]))
 * // => false
 *
 * console.log(cbol({}))
 * // => false
 *
 * console.log(cbol(null))
 * // => false
 *
 * console.log(cbol(undefined))
 * // => false
 *
 * console.log(cbol(new Boolean(true)))
 * // => true (轉型函數拆包, 回傳原始布林值)
 *
 */
function cbol(v) {

    //拆包, 轉型函數照舊轉換包裝物件(new Boolean、new String), 非包裝物件原樣
    v = unbox(v)

    //布林
    if (v === true) {
        return true
    }
    if (v === false) {
        return false
    }

    //字串, 去頭尾空白後須為全小寫之'true'; 'false'與其餘字串皆為false
    if (typeof v === 'string') {
        return v.trim() === 'true'
    }

    //其餘一律false(含數字)
    return false
}


export default cbol
