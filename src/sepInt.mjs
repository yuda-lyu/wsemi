import floor from 'lodash-es/floor.js'
import reverse from 'lodash-es/reverse.js'
import iseint from './iseint.mjs'
import isbol from './isbol.mjs'


/**
 * 由整數v切分n個正整數，回傳切分後之整數陣列
 *
 * v與n為必須參數，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)，n為切分數量須為1~4294967295(個數)，無效(含Infinity、0、小數、'0x10'、包裝物件)throw Error，v無效為Error('invalid v: must be an integer')，n無效為Error('invalid n: must be a positive integer')，訊息不帶輸入值，先檢v再檢n
 * breverse非布林則改用預設true(不報錯)
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/sepInt.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer|String} v 輸入要被切分的整數，必須參數，須為有效整數(安全整數，數字字串亦可)，無效throw Error
 * @param {Integer|String} n 輸入要切分數量的整數，必須參數，須為有效整數且為1~4294967295(個數，數字字串亦可)，無效throw Error
 * @param {Boolean} [breverse=true] 輸入是否要反轉順序，預設true為由小至大，反序則為由大至小，非布林則改用預設true
 * @returns {Array} 回傳切分後的整數陣列
 * @example
 *
 * console.log(sepInt(10, 3))
 * // => [3, 3, 4]
 *
 * console.log(sepInt('10', '3'))
 * // => [3, 3, 4]
 *
 * console.log(sepInt(10, 3, false))
 * // => [4, 3, 3]
 *
 * console.log(sepInt(10, 3, 'x'))
 * // => [3, 3, 4]
 *
 * try {
 *     sepInt(10, Infinity)
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => invalid n: must be a positive integer
 *
 */
function sepInt(v, n, breverse = true) {

    //check, v與n為必須參數, 判定有效整數後取轉換值使用(檢測之值即使用之值), 無效throw(訊息不帶值)
    if (!iseint(v)) {
        throw new Error('invalid v: must be an integer')
    }
    if (!iseint(n, { use: 'count', min: 1 })) {
        throw new Error('invalid n: must be a positive integer')
    }
    if (!isbol(breverse)) { //非布林改用預設
        breverse = true
    }
    v = Number(v)
    n = Number(n)

    let q = floor(v / n)
    let s = v - q * n
    let r = []
    for (let i = 1; i <= n; i++) {
        let w = q
        if (i <= s) {
            w = q + 1
        }
        r.push(w)
    }
    if (breverse) {
        r = reverse(r)
    }

    return r
}


export default sepInt
