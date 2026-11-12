import encutf8 from 'crypto-js/enc-utf8.js'
import encbase64 from 'crypto-js/enc-base64.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


/**
 * base64字串轉一般字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/b642str.test.mjs Github}
 * @memberOf wsemi
 * @param {String} b64 輸入base64字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳一般字串，輸入非有效字串或解碼失敗時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空字串''；須可靠辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)；注意：本函數不驗證base64格式，非base64字元於解碼時被略過，格式不合之輸入仍可能以success回傳解碼結果
 * @example
 *
 * console.log(b642str('dGVzdOS4reaWhw=='))
 * // => 'test中文'
 *
 */
function b642str(b64, opt = {}) {

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
    if (!isestr(b64)) {
        return retError('invalid b64')
    }

    //str, 須攔截非預期錯誤(如b64非合法UTF-8時crypto-js會拋錯), 否則會外拋至呼叫端
    let str = ''
    try {
        let wa = encbase64.parse(b64)
        str = wa.toString(encutf8)
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: str,
        }
    }
    else {
        return str
    }
}


export default b642str
