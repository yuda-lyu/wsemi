import encutf8 from 'crypto-js/enc-utf8'
import encbase64 from 'crypto-js/enc-base64'
import isestr from './isestr.mjs'


/**
 * 一般字串轉base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2b64.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @returns {String} 回傳base64字串
 */
function str2b64(str) {

    //check
    if (!isestr(str)) {
        return ''
    }

    let words = encutf8.parse(str)
    let base64 = encbase64.stringify(words)
    return base64
}


export default str2b64
