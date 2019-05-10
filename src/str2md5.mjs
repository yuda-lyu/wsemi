import MD5 from 'crypto-js/md5'
import enchex from 'crypto-js/enc-hex'
import isstr from './isstr.mjs'


/**
 * 一般字串轉MD5字串
 *
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @returns {String} 回傳經MD5轉換後字串，採Hex顯示
 */
function str2md5(str) {

    //check
    if (!isstr(str)) {
        return ''
    }

    let hex = MD5(str).toString(enchex)
    return hex
}


export default str2md5
