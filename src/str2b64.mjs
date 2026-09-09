import encutf8 from 'crypto-js/enc-utf8.js'
import encbase64 from 'crypto-js/enc-base64.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


/**
 * 一般字串轉base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2b64.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳base64字串，輸入非有效字串時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(str2b64('test中文'))
 * // => 'dGVzdOS4reaWhw=='
 *
 */
function str2b64(str, opt = {}) {

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
            return ''
        }
    }

    //check
    if (!isestr(str)) {
        return retError('invalid str')
    }

    //base64, 須攔截非預期錯誤(如crypto-js對過大資料拋錯), 否則會外拋至呼叫端
    let base64 = ''
    try {
        let words = encutf8.parse(str)
        base64 = encbase64.stringify(words)
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: base64,
        }
    }
    else {
        return base64
    }
}


export default str2b64
