import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'


//reLoneSurrogate, 孤立之代理碼元(高代理之後無低代理, 或低代理之前無高代理), 供不支援String.prototype.isWellFormed之環境判斷
let reLoneSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/


/**
 * 字串轉Uint8Array
 *
 * 以原生TextEncoder編碼為UTF-8，字串含孤立代理碼元(非良構之UTF-16，無法正確編碼為UTF-8)時視為轉換失敗
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Uint8Array|Object} 回傳Uint8Array，輸入非有效字串、含孤立代理碼元或轉換失敗時回傳空Uint8Array；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(str2u8arr('test中文'))
 * // => Uint8Array [116, 101, 115, 116, 228, 184, 173, 230, 150, 135]
 *
 */
function str2u8arr(str, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retError
    let retError = (msg) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            return new Uint8Array()
        }
    }

    //check
    if (!isestr(str)) {
        return retError('invalid str')
    }

    //check, 孤立代理碼元, TextEncoder會靜默換成U+FFFD而改變資料, 故視為失敗
    let bWellFormed = typeof str.isWellFormed === 'function' ? str.isWellFormed() : !reLoneSurrogate.test(str)
    if (!bWellFormed) {
        return retError('invalid str, contains lone surrogates')
    }

    //r, 須攔截非預期錯誤, 否則會外拋至呼叫端
    let r = null
    try {
        r = new TextEncoder().encode(str)
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: r,
        }
    }
    else {
        return r
    }
}


export default str2u8arr
