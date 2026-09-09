import MD5 from 'crypto-js/md5.js'
import encb64 from 'crypto-js/enc-base64.js'
import enchex from 'crypto-js/enc-hex.js'
import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


/**
 * 一般字串轉MD5字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2md5.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串，非有效字串時回傳空字串
 * @param {Boolean} [base64=false] 輸入是否轉為base64字串，非布林值時回退為false，預設為false
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳經MD5轉換後字串，str非有效字串時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(str2md5('test中文'))
 * // => '5393554e94bf0eb6436f240a4fd71282'
 *
 */
function str2md5(str, base64 = false, opt = {}) {

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

    //check
    if (!isbol(base64)) {
        base64 = false
    }

    //c, 須攔截非預期錯誤(如crypto-js對過大資料拋錯), 否則會外拋至呼叫端
    let c = ''
    try {
        let o = MD5(str)
        if (base64) {
            c = o.toString(encb64)
        }
        else {
            c = o.toString(enchex)
        }
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: c,
        }
    }
    else {
        return c
    }
}


export default str2md5
