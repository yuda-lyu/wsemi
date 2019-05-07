import encbase64 from 'crypto-js/enc-base64'
import isstr from './isstr.mjs'


/**
 * base64字串轉binary(Uint8Array)
 *
 * @export
 * @param {String} b64 輸入base64字串
 * @returns {Array} 回傳binary(Uint8Array)
 */
export default function b642bin(b64) {

    //check
    if (!isstr(b64)) {
        return []
    }

    let wa = encbase64.parse(b64)

    //words, sigBytes
    let words = wa.words
    let sigBytes = wa.sigBytes

    //bin
    let bin = new Uint8Array(sigBytes)
    for (var i = 0; i < sigBytes; i++) {
        let byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
        bin[i] = byte
    }

    return bin
}
