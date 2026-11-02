import isestr from './isestr.mjs'
import strright from './strright.mjs'
import optVal from './_optVal.mjs'


//n: 類opt參數(預設0即不刪), 有效整數且為個數(iseint, use: 'count'), 非預期(含Infinity、負數、小數、'0x2'、包裝物件、超出個數範圍)改用預設0, 視為刪0字而回傳原字串; 位置參數無opt物件可帶debug, 故不警告
let RULE_N = { fn: 'strdelleft', name: 'n', kind: 'eint', chk: { use: 'count' } }


/**
 * 刪除字串左邊n個字元
 *
 * n為類opt參數(預設0，即刪0字而回傳原字串)，須為有效整數(iseint，數字字串亦可，去頭尾空白後取值)且為個數(0~4294967295)，非預期之輸入(未給、null、負數、小數、Infinity、'0x2'、包裝物件等)視為未給而改用預設0，回傳原字串，不報錯；n大於字串長度則回傳''
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strdelleft.test.mjs Github}
 * @memberOf wsemi
 * @param {String} c 輸入要被刪除的字串，非有效字串回傳''
 * @param {Integer|String} [n=0] 輸入刪除左邊n個字元，類opt參數(有效整數，0~4294967295，數字字串亦可)，非預期之輸入視為未給而改用預設0(不刪)，預設0
 * @returns {String} 回傳處理後字串
 * @example
 *
 * console.log(strdelleft('test中文', 2))
 * // => 'st中文'
 *
 * console.log(strdelleft('test中文', '2'))
 * // => 'st中文'
 *
 * console.log(strdelleft('test中文', 9))
 * // => ''
 *
 * console.log(strdelleft('test中文', Infinity))
 * // => 'test中文'
 *
 * console.log(strdelleft('test中文', -1))
 * // => 'test中文'
 *
 */
function strdelleft(c, n) {

    //check
    if (!isestr(c)) {
        return ''
    }

    //n為類opt參數, 非預期改用預設0(不刪), 有效則取轉換值
    n = optVal(n, 0, RULE_N)

    //check
    if (n === 0) {
        return c
    }

    //n大於長度時c.length - n為負, strright對無效個數會取整串, 故須Math.max(0, …)使結果為''
    return strright(c, Math.max(0, c.length - n))
}


export default strdelleft
