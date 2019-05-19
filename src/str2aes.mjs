import AES from 'crypto-js/aes'
// import encutf8 from 'crypto-js/enc-utf8'
// import padPkcs7 from 'crypto-js/pad-pkcs7'
import enchex from 'crypto-js/enc-hex'
import encb64 from 'crypto-js/enc-base64'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'


/**
 * 一般字串轉AES字串
 * 使用AES-128-CBC加密，字串採用PKCS#7填充
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2aes.test.js Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @param {String} key 輸入加密key
 * @param {Boolean} [base64=false] 輸入是否轉為base64字串，預設為false
 * @returns {String} 回傳經AES轉換後字串，採Hex/base64顯示
 * @example
 * let str = 'test中文abcdefghijklmn'
 * let key = '1234567890abcdefghijk'
 * str2aes(str, key)
 * // => 53616c7465645f5f9d7366e54b51e9352dbccf6a6ec9b3af0595b19b345ea903b713143f5d66417f4cd968c628863f61 (is random)
 *
 * str2aes(str, key, true)
 * // => U2FsdGVkX19c7rKkQ38SfqZLaQEKzLD0PhXzzdYeGbngewsPmzS8PcOwHQIsf2Zo (is random)
 */
function str2aes(str, key, base64 = false) {

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

    let o = AES.encrypt(str, key)
    let c = ''
    if (base64) {
        c = o.toString()
    }
    else {
        let b64 = o.toString()
        let e64 = encb64.parse(b64)
        c = e64.toString(enchex)
    }

    return c
}


export default str2aes
