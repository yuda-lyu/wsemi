import AES from 'crypto-js/aes'
import isstr from './isstr.mjs'
import o2j from './o2j.mjs'


/**
 * 資料加密儲存為base64
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/obj2pb64.test.js Github}
 * @memberOf wsemi
 * @param {String} key 輸入加密key
 * @param {*} data 輸入任意物件
 * @returns {String} 回傳加密base64字串
 * @example
 *
 */
function obj2pb64(key, data) {

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


export default obj2pb64
