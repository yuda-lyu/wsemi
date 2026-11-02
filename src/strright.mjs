import isestr from './isestr.mjs'
import optVal from './_optVal.mjs'


//n: 類opt參數(預設即整串, 比照strleft), 有效整數且為個數(iseint, use: 'count'), 非預期(含Infinity、負數、小數、'0x2'、包裝物件、超出個數範圍)改用預設即第一參數之長度(整串); 位置參數無opt物件可帶debug, 故不警告
let RULE_N = { fn: 'strright', name: 'n', kind: 'eint', chk: { use: 'count' } }


/**
 * 取字串右邊n個字元
 *
 * n為類opt參數(預設即整串，比照strleft)，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為個數(0~4294967295)，非預期之輸入(未給、null、負數、小數、Infinity、'0x2'、包裝物件等)視為未給而改用預設，即取整串，不報錯
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strright.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被取的字串，非有效字串回傳''
 * @param {Integer|String} [n=c.length] 輸入取右邊n個字元，類opt參數(有效整數，0~4294967295，數字字串亦可)，非預期之輸入視為未給而改用預設，預設為c之長度(整串)
 * @returns {String} 回傳處理後字串
 * @example
 *
 * console.log(strright('test中文', 2))
 * // => '中文'
 *
 * console.log(strright('test中文', '2'))
 * // => '中文'
 *
 * console.log(strright('test中文', 0))
 * // => ''
 *
 * console.log(strright('test中文', Infinity))
 * // => 'test中文'
 *
 * console.log(strright('test中文', -1))
 * // => 'test中文'
 *
 */
function strright(c, n) {

    //check
    if (!isestr(c)) {
        return ''
    }

    //n為類opt參數, 非預期改用預設(整串), 有效則取轉換值
    n = optVal(n, c.length, RULE_N)

    //check
    if (n === 0) {
        return ''
    }

    let i = c.length - n
    if (i < 0) {
        i = 0
    }

    return c.substring(i, i + n)
}


export default strright
