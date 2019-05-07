import AES from 'crypto-js/aes'
import encutf8 from 'crypto-js/enc-utf8'
import isstr from './isstr.mjs'
import j2o from './j2o.mjs'


/**
 * base64解密取得原始資料
 *
 * @export
 * @param {String} key 輸入加密key
 * @param {String} data 輸入加密base64字串
 * @returns {*} 回傳任意物件
 */
export default function p2o(key, data) {

    //check
    if (!isstr(key)) {
        return ''
    }
    if (!isstr(data)) {
        return ''
    }

    let b = AES.decrypt(data, key).toString(encutf8)
    let p = j2o(b)
    let r = p.data
    return r
}
