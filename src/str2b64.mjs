import encutf8 from 'crypto-js/enc-utf8.js'
import encbase64 from 'crypto-js/enc-base64.js'
import isestr from './isestr.mjs'


//crypto-js沒有支援chunk或stream機制, 無法處理大量資料


/**
 * 一般字串轉base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2b64.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @returns {String} 回傳base64字串
 * @example
 *
 * console.log(str2b64('test中文'))
 * // => 'dGVzdOS4reaWhw=='
 *
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
