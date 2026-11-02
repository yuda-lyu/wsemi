import range from 'lodash-es/range.js'
import at from 'lodash-es/at.js'
import isearr from './isearr.mjs'
import iseint from './iseint.mjs'
import optVal from './_optVal.mjs'


//iend: opt類參數(JSDoc [iend=null]), 有效整數且為索引(iseint, use: 'index'), 非預期(含負數、小數、Infinity、'0x2'、字串、包裝物件、超出索引範圍)視為未給(null), 只取istart一筆; 位置參數無opt物件可帶debug, 故不警告
let RULE_IEND = { fn: 'arrAt', name: 'iend', kind: 'eint', chk: { use: 'index' }, defDesc: 'null' }


/**
 * 由vall陣列提取指定欄位(或欄位範圍)之資料
 * 若istart與iend有效, 提取istart~iend欄位
 * 若僅istart有效, 提取istart欄位
 *
 * istart為必須參數，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為索引(0~4294967294)，無效回傳[]；
 * iend為opt類參數(預設null)，須為有效整數且為索引，非預期之輸入(負數、小數、Infinity、'0x2'、非數字字串、包裝物件等)視為未給而只提取istart一筆，不報錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/arrAt.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} vall 輸入要被提取的任意資料陣列
 * @param {Integer|String} istart 輸入起始的欄位指標整數，必須參數(有效整數，0~4294967294，數字字串亦可)，無效回傳[]
 * @param {Integer|String} [iend=null] 輸入結束的欄位指標整數，opt類參數(有效整數，0~4294967294，數字字串亦可)，若不使用或非預期之輸入則視為未給，等同於istart，預設null
 * @returns {Array} 回傳提取的任意資料陣列
 * @example
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], 1))
 * // => [2]
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], 1, 4))
 * // => [2, 3, '4', 5]
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], '1', '2'))
 * // => [2, 3]
 *
 * console.log(arrAt([1, 2, 3, '4', 5, 'abc'], 1, Infinity))
 * // => [2]
 *
 */
function arrAt(vall, istart, iend = null) {

    //check
    if (!isearr(vall)) {
        return []
    }

    //istart為必須參數, 有效則取轉換值
    if (!iseint(istart, { use: 'index' })) {
        return []
    }
    istart = Number(istart)

    //iend為opt類參數, 非預期視為未給(null), 有效則取轉換值
    iend = optVal(iend, null, RULE_IEND)

    let t
    if (iend !== null) {

        //check
        if (istart >= vall.length || iend >= vall.length) {
            return []
        }

        let inds = range(istart, iend + 1)
        t = at(vall, inds)

    }
    else {

        //check
        if (istart >= vall.length) {
            return []
        }

        t = at(vall, istart)

    }

    return t
}


export default arrAt
