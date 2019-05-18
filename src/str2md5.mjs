import MD5 from 'crypto-js/md5'
import encb64 from 'crypto-js/enc-base64'
import enchex from 'crypto-js/enc-hex'
import isestr from './isestr.mjs'
import isbol from './isbol.mjs'


/**
 * 一般字串轉MD5字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2md5.test.js Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @param {Boolean} [base64=false] 輸入是否轉為base64字串，預設為false
 * @returns {String} 回傳經MD5轉換後字串
 * @example
 * str2md5('test中文')
 * // => '5393554e94bf0eb6436f240a4fd71282'
 */
function str2md5(str, base64 = false) {

    //check
    if (!isestr(str)) {
        return ''
    }
    if (!isbol(base64)) {
        return ''
    }

    let o = MD5(str)
    let c = ''
    if (base64) {
        c = o.toString(encb64)
    }
    else {
        c = o.toString(enchex)
    }

    return c
}


export default str2md5
