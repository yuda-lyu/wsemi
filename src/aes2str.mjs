import AES from 'crypto-js/aes.js'
import encutf8 from 'crypto-js/enc-utf8.js'
import encb64 from 'crypto-js/enc-base64.js'
import enchex from 'crypto-js/enc-hex.js'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


/**
 * 一般字串轉AES字串
 * 使用AES-128-CBC加密，字串採用PKCS#7填充
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/aes2str.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @param {String} key 輸入加密key
 * @param {Boolean} [base64=false] 輸入是否轉為base64字串，預設為false
 * @returns {String} 回傳經AES轉換後字串，採Hex/base64顯示
 * @example
 *
 * let str = '53616c7465645f5f47214797ac01bc03cceb69ebced4948501ab94ca9644a6dfd277456aead4432cb9c9d74c38c42c79'
 * let key = '1234567890abcdefghijk'
 * console.log(aes2str(str, key))
 * // => 'test中文abcdefghijklmn'
 *
 */
function aes2str(str, key, base64 = false) {

    //check
    if (!isestr(str)) {
        return ''
    }
    if (!isestr(key)) {
        return ''
    }
    if (!isbol(base64)) {
        return ''
    }

    let c = ''
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

    return c
}


export default aes2str
