import encbase64 from 'crypto-js/enc-base64.js'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isstr from './isstr.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


/**
 * base64字串轉Uint8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/b642u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {String} b64 輸入base64字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Uint8Array|Object} 回傳Uint8Array，輸入非字串時回傳空Uint8Array；注意本函數不驗base64字元集，輸入非法base64會盡力解出位元組而非報錯；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(b642u8arr('AQItAA=='))
 * // => new Uint8Array([1, 2.3, '45', 'abc'])
 *
 */
function b642u8arr(b64, opt = {}) {

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
    if (!isstr(b64)) {
        return retError('invalid b64')
    }

    //u8a, 須攔截非預期錯誤, 否則會外拋至呼叫端
    let u8a = null
    try {

        let wa = encbase64.parse(b64)

        //words, sigBytes
        let words = wa.words
        let sigBytes = wa.sigBytes

        //u8a
        u8a = new Uint8Array(sigBytes)
        for (let i = 0; i < sigBytes; i++) {
            let byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
            u8a[i] = byte
        }

    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: u8a,
        }
    }
    else {
        return u8a
    }
}


export default b642u8arr
