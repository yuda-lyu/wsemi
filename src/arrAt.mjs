import isarr from './isarr.mjs'
import iseint from './iseint.mjs'
import optVal from './_optVal.mjs'


//iend: opt類參數(JSDoc [iend=null]), 有效整數且為索引(iseint, use: 'index'), 非預期(含負數、小數、Infinity、'0x2'、字串、包裝物件、超出索引範圍)視為未給(null), 只取istart一筆; 位置參數無opt物件可帶debug, 故不警告
let RULE_IEND = { fn: 'arrAt', name: 'iend', kind: 'eint', chk: { use: 'index' }, defDesc: 'null' }


/**
 * 由vall陣列提取指定欄位(或欄位範圍)之資料
 * 若istart與iend有效, 提取istart~iend欄位
 * 若僅istart有效, 提取istart欄位
 *
 * vall非陣列(含類陣列物件)回傳[]；陣列只有一個空元素(['']、[null]、[{}]、[[]])時照常取得該元素
 * istart為必須參數，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為索引(0~4294967294)，無效回傳[]；istart超出vall長度時回傳[]
 * iend為opt類參數(預設null)，須為有效整數且為索引，非預期之輸入(負數、小數、Infinity、'0x2'、非數字字串、包裝物件等)與小於istart者皆視為未給而只提取istart一筆，不報錯；iend超出vall長度時截至最後一個元素
 * 空位取得undefined；元素不深拷貝
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrAt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入要被提取的任意資料陣列
 * @param {Integer|String} istart 輸入起始的欄位指標整數，必須參數(有效整數，0~4294967294，數字字串亦可)，無效回傳[]
 * @param {Integer|String} [iend=null] 輸入結束的欄位指標整數，opt類參數(有效整數，0~4294967294，數字字串亦可)，若不使用、非預期之輸入或小於istart則視為未給，等同於istart，超出長度則截至最後一個元素，預設null
 * @returns {Array} 回傳提取的任意資料陣列
 * @example
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], 1))
 * // => [ 2 ]
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], 1, 4))
 * // => [ 2, 3, '4', 5 ]
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], '1', '2'))
 * // => [ 2, 3 ]
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], 1, Infinity))
 * // => [ 2 ]
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], 3, 1))
 * // => [ '4' ] (iend小於istart視為未給)
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], 4, 10))
 * // => [ 5, 'abc' ] (iend超出長度截至最後一個元素)
 *
 * console.log(arrAt([null], 0))
 * // => [ null ]
 *
 */
function arrAt(vall, istart, iend = null) {

    //check, 參數層非陣列回傳[](只有一個空元素之陣列照常取得該元素)
    if (!isarr(vall)) {
        return []
    }

    //istart為必須參數, 有效則取轉換值
    if (!iseint(istart, { use: 'index' })) {
        return []
    }
    istart = Number(istart)

    //iend為opt類參數, 非預期視為未給(null), 有效則取轉換值; 小於istart亦視為未給
    iend = optVal(iend, null, RULE_IEND)
    if (iend !== null && iend < istart) {
        iend = null
    }

    //istart超出長度回傳[]
    if (istart >= vall.length) {
        return []
    }

    //iend超出長度截至最後一個元素
    let e = iend === null ? istart : Math.min(iend, vall.length - 1)

    let t = []
    for (let i = istart; i <= e; i++) {
        t.push(vall[i])
    }

    return t
}


export default arrAt
