import times from 'lodash-es/times.js'
import constant from 'lodash-es/constant.js'
import iser from './iser.mjs'
import iseint from './iseint.mjs'


/**
 * 產生重複n次任意資料之陣列
 *
 * n為必須參數(本函數之意圖即重複，重複次數不可省)，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為個數(0~4294967295，0回傳[]，與rep之n為0回傳''對稱)；非預期之輸入(未給、null、負數、小數、Infinity、'0x2'、包裝物件等)throw Error('invalid n: must be a non-negative integer')，訊息不帶輸入值
 * o為空(undefined、null、''等，見iser)回傳[]，先於n之檢查
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/repObj.test.mjs Github}
 * @memberOf wsemi
 * @param {*} o 輸入任意資料，為空(undefined、null、''等)回傳[]
 * @param {Integer|String} n 輸入重複次數，必須參數(有效整數，0~4294967295，數字字串亦可)，非預期之輸入throw Error
 * @returns {Array} 回傳任意資料之陣列
 * @example
 *
 * console.log(repObj({ a: 12.45, b: 'opqr' }, 2))
 * // => [{ a: 12.45, b: 'opqr' }, { a: 12.45, b: 'opqr' }]
 *
 * console.log(repObj({ a: 12.45, b: 'opqr' }, '2'))
 * // => [{ a: 12.45, b: 'opqr' }, { a: 12.45, b: 'opqr' }]
 *
 * console.log(repObj({ a: 12.45, b: 'opqr' }, 0))
 * // => []
 *
 * try {
 *     repObj({ a: 12.45, b: 'opqr' }, -1)
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid n: must be a non-negative integer
 *
 */
function repObj(o, n) {

    //check
    if (iser(o)) {
        return []
    }

    //n為必須參數, 非預期throw(訊息不帶值), 有效則取轉換值(lodash times對字串型數字會自行轉型, 但檢測之值即使用之值)
    if (!iseint(n, { use: 'count' })) {
        throw new Error('invalid n: must be a non-negative integer')
    }
    n = Number(n)

    let r = times(n, constant(o))

    return r
}


export default repObj
