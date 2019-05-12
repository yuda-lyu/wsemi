import encutf8 from 'crypto-js/enc-utf8'
import encbase64 from 'crypto-js/enc-base64'
import isestr from './isestr.mjs'


/**
 * base64字串轉一般字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/b642str.test.js Github}
 *
 * @example
 *
 * @memberOf wsemi
 * @param {String} b64 輸入base64字串
 * @returns {String} 回傳一般字串
 */
function b642str(b64) {

    //check
    if (!isestr(b64)) {
        return ''
    }

    let wa = encbase64.parse(b64)
    let str = wa.toString(encutf8)
    return str
}


export default b642str
