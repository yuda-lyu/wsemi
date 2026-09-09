import AES from 'crypto-js/aes.js'
import encutf8 from 'crypto-js/enc-utf8.js'
import encb64 from 'crypto-js/enc-base64.js'
import enchex from 'crypto-js/enc-hex.js'
import get from 'lodash-es/get.js'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


/**
 * AES字串轉一般字串
 * 為str2aes之解密函數，使用AES-128-CBC解密，字串採用PKCS#7填充
 * str與base64須與加密時str2aes所用之設定相同，否則解不出原文而回傳空字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/aes2str.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入AES加密字串，非有效字串時回傳空字串
 * @param {String} key 輸入加密key，非有效字串時回傳空字串
 * @param {Boolean} [base64=false] 輸入來源字串是否為base64格式，須與加密時str2aes所用之設定相同，非布林值時回退為false，預設為false
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳經AES解密後字串，str或key非有效字串、或key錯誤而解不出明文時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件，可據此分辨解密失敗與明文為空
 * @example
 *
 * let str = '53616c7465645f5f47214797ac01bc03cceb69ebced4948501ab94ca9644a6dfd277456aead4432cb9c9d74c38c42c79'
 * let key = '1234567890abcdefghijk'
 * console.log(aes2str(str, key))
 * // => 'test中文abcdefghijklmn'
 *
 */
function aes2str(str, key, base64 = false, opt = {}) {

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

    //c, 須攔截非預期錯誤(如str非合法密文時crypto-js會拋錯), 否則會外拋至呼叫端
    let c = ''
    try {
        if (base64) {
            let o = AES.decrypt(str, key)
            c = o.toString(encutf8)
        }
        else {
            let reb64 = enchex.parse(str)
            let bytes = reb64.toString(encb64)
            let decrypt = AES.decrypt(bytes, key)
            c = decrypt.toString(encutf8)
        }
    }
    catch (err) {
        return retError(err.toString())
    }

    //check, key錯誤或str非本函數之對應密文時, crypto-js多不拋錯而回空字串, 與「明文本就是空字串」無從分辨
    //因str2aes已擋下空字串輸入, 故經str2aes產出者其明文必非空, 可據此判定失敗
    if (c === '') {
        return retError('can not decrypt str with key, or str is not a valid cipher text')
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


export default aes2str
