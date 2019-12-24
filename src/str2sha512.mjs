import SHA512 from 'crypto-js/sha512'
import encb64 from 'crypto-js/enc-base64'
import enchex from 'crypto-js/enc-hex'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'


/**
 * 一般字串轉SHA512字串
 * Secure Hash Algorithm 512位
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2sha512.test.js Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @param {Boolean} [base64=false] 輸入是否轉為base64字串，預設為false
 * @returns {String} 回傳經SHA512轉換後字串
 * @example
 * console.log(str2sha512('test中文'))
 * // => 'ab43333a01571e767a2eb15460c270fa123964c121b88c73e274a211d6e2cf98b10d89220e8d04e2fc573354da93400f3255e94d445dc956e177aa4201a4fc30'
 */
function str2sha512(str, base64 = false) {

    //check
    if (!isestr(str)) {
        return ''
    }
    if (!isbol(base64)) {
        return ''
    }

    let o = SHA512(str)
    let c = ''
    if (base64) {
        c = o.toString(encb64)
    }
    else {
        c = o.toString(enchex)
    }

    return c
}


export default str2sha512
