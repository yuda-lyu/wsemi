import encbase64 from 'crypto-js/enc-base64.js'
import libwa from 'crypto-js/lib-typedarrays.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isu8arr from './isu8arr.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


/**
 * Uint8Array轉base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2b64.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳base64字串，輸入非Uint8Array時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(u8arr2b64(new Uint8Array([1, 2.3, '45', 'abc'])))
 * // => 'AQItAA=='
 *
 * console.log(u8arr2b64('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid u8a' }
 *
 */
function u8arr2b64(u8a, opt = {}) {

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
    if (!isu8arr(u8a)) {
        return retError('invalid u8a')
    }

    //b64, 須攔截非預期錯誤(如crypto-js對過大資料拋錯), 否則會外拋至呼叫端
    let b64 = ''
    try {
        let wa = libwa.create(u8a)
        b64 = wa.toString(encbase64)
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: b64,
        }
    }
    else {
        return b64
    }
}


export default u8arr2b64
