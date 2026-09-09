import AES from 'crypto-js/aes.js'
// import encutf8 from 'crypto-js/enc-utf8.js'
// import padPkcs7 from 'crypto-js/pad-pkcs7.js'
import enchex from 'crypto-js/enc-hex.js'
import encb64 from 'crypto-js/enc-base64.js'
import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


/**
 * 一般字串轉AES字串
 * 使用AES-128-CBC加密，字串採用PKCS#7填充
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2aes.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串，非有效字串時回傳空字串
 * @param {String} key 輸入加密key，非有效字串時回傳空字串
 * @param {Boolean} [base64=false] 輸入是否轉為base64字串，非布林值時回退為false，預設為false
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳經AES轉換後字串，採Hex/base64顯示，str或key非有效字串時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * let str = 'test中文abcdefghijklmn'
 * let key = '1234567890abcdefghijk'
 * console.log(str2aes(str, key))
 * // => 53616c7465645f5f9d7366e54b51e9352dbccf6a6ec9b3af0595b19b345ea903b713143f5d66417f4cd968c628863f61 (is random)
 *
 * console.log(str2aes(str, key, true))
 * // => U2FsdGVkX19c7rKkQ38SfqZLaQEKzLD0PhXzzdYeGbngewsPmzS8PcOwHQIsf2Zo (is random)
 *
 */
function str2aes(str, key, base64 = false, opt = {}) {
    // let str='123abc中文'
    // let key='123'
    // let iv='abc'

    // console.log('key1', key)
    // key = CryptoJS.enc.Utf8.parse(key)
    // console.log('key2', key)

    // console.log('iv1', iv)
    // iv = CryptoJS.enc.Utf8.parse(iv)
    // console.log('iv2', iv)

    // let o = CryptoJS.AES.encrypt(str, key, { iv: iv })
    // //console.log('ciphertext', o.ciphertext)
    // //console.log('key', o.key.words, o.key.sigBytes)
    // //console.log('iv', o.iv.words, o.iv.sigBytes)
    // //console.log('blockSize', o.blockSize)
    // //console.log('salt', o.salt)

    // let r = o.toString()
    // console.log('output', r)
    // //可固定輸出: DJ5FkpmWJPA/GJRB3/WYRQ==

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
    if (!isestr(key)) {
        return retError('invalid key')
    }

    //check
    if (!isbol(base64)) {
        base64 = false
    }

    //c, 須攔截非預期錯誤(如crypto-js對過大資料拋錯), 否則會外拋至呼叫端
    let c = ''
    try {
        let o = AES.encrypt(str, key)
        if (base64) {
            c = o.toString()
        }
        else {
            let b64 = o.toString()
            let e64 = encb64.parse(b64)
            c = e64.toString(enchex)
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

export default str2aes
