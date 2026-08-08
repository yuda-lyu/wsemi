import get from 'lodash-es/get.js'
import cint from './cint.mjs'
import isfun from './isfun.mjs'
import isestr from './isestr.mjs'
import isp0int from './isp0int.mjs'
import strleft from './strleft.mjs'


/**
 * 字串超長時裁切至指定長度並補上刪節號，可另指定函數生成附註訊息
 *
 * 未超長則原樣回傳，不補刪節號
 * 輸入非有效字串回傳空字串，maxLen非有效非負整數則原樣回傳字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/strTruncate.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入待裁切字串
 * @param {Integer} maxLen 輸入裁切後最大保留長度非負整數，不含刪節號與附註訊息
 * @param {Object} [opt={}] 輸入設定物件
 * @param {Function} [opt.funWithMsg=null] 輸入生成附註訊息之函數，格式為(str, maxLen)=>String，其中str為原始未裁切字串，回傳字串將接於刪節號之後，回傳非有效字串視為無附註，預設null代表僅補刪節號
 * @returns {String} 回傳裁切後字串
 * @example
 *
 * console.log(strTruncate('abcdefghij', 3))
 * // => abc...
 *
 * console.log(strTruncate('abcdefghij', 20))
 * // => abcdefghij
 *
 * console.log(strTruncate('abcdefghij', 3, { funWithMsg: (str) => `(truncated, total ${str.length} chars)` }))
 * // => abc...(truncated, total 10 chars)
 *
 * console.log(strTruncate('abcdefghij', 3, { funWithMsg: (str, maxLen) => `(剩餘${str.length - maxLen}字)` }))
 * // => abc...(剩餘7字)
 *
 * console.log(strTruncate('', 3))
 * // =>
 *
 * console.log(strTruncate('abcdefghij', -1))
 * // => abcdefghij
 *
 */
function strTruncate(str, maxLen, opt = {}) {

    //check
    if (!isestr(str)) {
        return ''
    }
    if (!isp0int(maxLen)) {
        return str
    }

    //maxLen
    maxLen = cint(maxLen)

    //check, 未超長就原樣回傳, 不補刪節號
    if (str.length <= maxLen) {
        return str
    }

    //funWithMsg
    let funWithMsg = get(opt, 'funWithMsg')

    //se, 由funWithMsg生成附註訊息, 回傳非有效字串視為無附註
    let se = ''
    if (isfun(funWithMsg)) {
        let t = funWithMsg(str, maxLen) //str為原始未裁切字串, 故可於訊息內取用原始長度
        if (isestr(t)) {
            se = t
        }
    }

    let r = strleft(str, maxLen) + `...${se}`

    return r
}


export default strTruncate
