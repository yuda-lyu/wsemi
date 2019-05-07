import encutf8 from 'crypto-js/enc-utf8'
import encbase64 from 'crypto-js/enc-base64'
import isstr from './isstr.mjs'


/**
 * 一般字串轉base64字串
 *
 * @export
 * @param {String} str 輸入一般字串
 * @returns {String} 回傳base64字串
 */
export default function str2b64(str) {

    //check
    if (!isstr(str)) {
        return ''
    }

    let words = encutf8.parse(str)
    let base64 = encbase64.stringify(words)
    return base64
}
