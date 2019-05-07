import encbase64 from 'crypto-js/enc-base64'
import libwa from 'crypto-js/lib-typedarrays'
import isarr from './isarr.mjs'


/**
 * binary(Uint8Array)轉base64字串
 *
 * @export
 * @param {Array} bin 輸入binary(Uint8Array)
 * @returns {String} 回傳base64字串
 */
export default function bin2b64(bin) {

    //check
    if (!isarr(bin)) { //待確認是否有例外
        return ''
    }

    let wa = libwa.create(bin)
    let b64 = wa.toString(encbase64)
    return b64
}
