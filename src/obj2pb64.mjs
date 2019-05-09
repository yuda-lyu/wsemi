import AES from 'crypto-js/aes'
import isstr from './isstr.mjs'
import o2j from './o2j.mjs'


/**
 * 資料加密儲存為base64
 *
 * @export
 * @param {String} key 輸入加密key
 * @param {*} data 輸入任意物件
 * @returns {String} 回傳加密base64字串
 */
export default function obj2pb64(key, data) {

    //check
    if (!isstr(key)) {
        return ''
    }

    let p = {
        data: data
    }
    let b = o2j(p)
    let r = AES.encrypt(b, key).toString()
    return r
}
