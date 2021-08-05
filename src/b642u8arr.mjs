import encbase64 from 'crypto-js/enc-base64'
import isstr from './isstr.mjs'


/**
 * base64字串轉Uint8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/b642u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {String} b64 輸入base64字串
 * @returns {Uint8Array} 回傳Uint8Array
 * @example
 *
 * console.log(b642u8arr('AQItAA=='))
 * // => new Uint8Array([1, 2.3, '45', 'abc'])
 *
 */
function b642u8arr(b64) {

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
    for (let i = 0; i < sigBytes; i++) {
        let byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
        u8a[i] = byte
    }

    return u8a
}


export default b642u8arr
