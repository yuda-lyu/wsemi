import encbase64 from 'crypto-js/enc-base64'
import isstr from './isstr.mjs'


/**
 * base64字串轉Uint8Array
 *
 * @export
 * @param {String} b64 輸入base64字串
 * @returns {Array} 回傳Uint8Array
 */
export default function b642u8arr(b64) {

    //check
    if (!isstr(b64)) {
        return new Uint8Array()
    }

    let wa = encbase64.parse(b64)

    //words, sigBytes
    let words = wa.words
    let sigBytes = wa.sigBytes

    //u8a
    let u8a = new Uint8Array(sigBytes)
    for (var i = 0; i < sigBytes; i++) {
        let byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
        u8a[i] = byte
    }

    return u8a
}
