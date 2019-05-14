import SHA512 from 'crypto-js/sha512'
import enchex from 'crypto-js/enc-hex'
import isstr from './isstr.mjs'


/**
 * 一般字串轉SHA512字串
 * Secure Hash Algorithm 512位，採Hex顯示
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2sha512.test.js Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @returns {String} 回傳經SHA512轉換後字串，採Hex顯示
 * @example
 *
 */
function str2sha512(str) {

    //check
    if (!isstr(str)) {
        return ''
    }

    let hex = SHA512(str).toString(enchex)
    return hex
}


export default str2sha512
