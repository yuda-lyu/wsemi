import repeat from 'lodash-es/repeat.js'
import isstr from './isstr.mjs'
import iseint from './iseint.mjs'


/**
 * 產生重複n次字串
 *
 * n為必須參數(本函數之意圖即重複，重複次數不可省)，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為個數(0~4294967295，0代表重複0次而回傳'')；非預期之輸入(未給、null、負數、小數、Infinity、'0x2'、包裝物件等)throw Error('invalid n: must be a non-negative integer')，訊息不帶輸入值
 * c為必須參數，須為字串，非字串throw Error('invalid c: must be a string')，訊息不帶輸入值，先於n之檢查；c為''回傳''，但n仍須有效(rep('', 'x')因n無效throw)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/rep.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入欲重複的字串，必須參數，非字串throw Error，''回傳''
 * @param {Integer|String} n 輸入重複次數，必須參數(有效整數，0~4294967295，數字字串亦可)，非預期之輸入throw Error
 * @returns {String} 回傳重複n次後之字串
 * @example
 *
 * console.log(rep('abc', 2))
 * // => 'abcabc'
 *
 * console.log(rep('abc', '2'))
 * // => 'abcabc'
 *
 * console.log(rep('abc', 0))
 * // => ''
 *
 * try {
 *     rep('abc', Infinity)
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid n: must be a non-negative integer
 *
 * try {
 *     rep(123, 2)
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid c: must be a string
 *
 * console.log(rep('', 2))
 * // => ''
 *
 */
function rep(c, n) {

    //check, c為必須參數(字串, ''合法), 非字串throw(訊息不帶值)
    if (!isstr(c)) {
        throw new Error('invalid c: must be a string')
    }

    //n為必須參數, 非預期throw(訊息不帶值), 有效則取轉換值(字串型數字不可原樣交給下游)
    if (!iseint(n, { use: 'count' })) {
        throw new Error('invalid n: must be a non-negative integer')
    }
    n = Number(n)

    let r = repeat(c, n)

    return r
}


export default rep
