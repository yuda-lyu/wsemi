import isestr from './isestr.mjs'
import iseint from './iseint.mjs'
import optVal from './_optVal.mjs'


//n: opt類參數(JSDoc [n=1]), 有效整數且為個數(iseint, use: 'count', min: 1), 非預期(含0、負數、小數、Infinity)改用預設1; 位置參數無opt物件可帶debug, 故不警告
let RULE_N = { fn: 'strmid', name: 'n', kind: 'eint', chk: { use: 'count', min: 1 } }


/**
 * 取字串中位置s開始後n個字元
 *
 * s為必須參數，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為索引(0~4294967294)，無效回傳''；n為opt類參數，須為有效整數且為個數(1~4294967295)，非預期之輸入(0、負數、小數、Infinity、'0x10'、包裝物件等)視為未給而改用預設1
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strmid.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被取的字串
 * @param {Integer|String} s 輸入要由第s個位置開始，須為有效整數且為索引(0~4294967294，數字字串亦可)，無效回傳''
 * @param {Integer|String} [n=1] 輸入開始後n個字元，opt類參數(有效整數，1~4294967295，數字字串亦可)，非預期之輸入視為未給而改用預設，不報錯，預設1
 * @returns {String} 回傳處理後字串
 * @example
 *
 * console.log(strmid('test中文', 2, 1))
 * // => 's'
 *
 * console.log(strmid('test中文', 2, 3))
 * // => 'st中'
 *
 * console.log(strmid('abcdef', '1', '2'))
 * // => 'bc'
 *
 * console.log(strmid('abcdef', 1, Infinity))
 * // => 'b'
 *
 */
function strmid(c, s, n = 1) {

    //check
    if (!isestr(c)) {
        return ''
    }

    //s為必須參數(起始位置), 有效則取轉換值, 其後只用轉換值(字串型數字不可與n以+相加)
    if (!iseint(s, { use: 'index' })) {
        return ''
    }
    s = Number(s)

    //n為opt類參數, 非預期改用預設1
    n = optVal(n, 1, RULE_N)

    return c.substring(s, (s + n))
}

export default strmid
