import isestr from './isestr.mjs'
import o2j from './o2j.mjs'
import str2aes from './str2aes.mjs'


/**
 * 任意資料由key進行AES加密轉為為base64
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/obj2pb64.test.js Github}
 * @memberOf wsemi
 * @param {*} data 輸入任意資料
 * @param {String} key 輸入加密key
 * @returns {String} 回傳加密base64字串
 * @example
 *
 */
function obj2pb64(data, key) {

    //check
    if (data === undefined) {
        return ''
    }
    if (!isestr(key)) {
        return ''
    }

    //先封裝成物件再轉字串
    let p = {
        data: data
    }
    let c = o2j(p)

    //str2aes
    let b64 = str2aes(c, key, true)

    return b64
}


export default obj2pb64
