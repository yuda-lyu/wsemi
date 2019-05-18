import encbase64 from 'crypto-js/enc-base64'
import libwa from 'crypto-js/lib-typedarrays'
import isu8arr from './isu8arr.mjs'


/**
 * Uint8Array轉base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2b64.test.js Github}
 * @memberOf wsemi
 * @param {Array} u8a 輸入Uint8Array
 * @returns {String} 回傳base64字串
 * @example
 * u8arr2b64(new Uint8Array([1, 2.3, '45', 'abc']))
 * // => 'AQItAA=='
 */
function u8arr2b64(u8a) {

    //check
    if (!isu8arr(u8a)) {
        return ''
    }

    let wa = libwa.create(u8a)
    let b64 = wa.toString(encbase64)
    return b64
}


export default u8arr2b64
