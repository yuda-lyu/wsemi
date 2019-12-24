import isestr from './isestr.mjs'
import aes2str from './aes2str.mjs'
import j2o from './j2o.mjs'


/**
 * base64解密取得原始資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pb642obj.test.js Github}
 * @memberOf wsemi
 * @param {String} key 輸入加密key
 * @param {String} b64 輸入加密base64字串
 * @returns {*} 回傳任意物件
 * @example
 * let key = '1234567890abcdef'
 * let str = U2FsdGVkX1+yPgYSW6mKi1VqyslaSKYHKRaw8Pu4QduzHggojRZA6b/T/oB7ltXf //(is random)
 * console.log(pb642obj(str, key))
 * // => [1, '3', 'abc']
 */
function pb642obj(b64, key) {

    //check
    if (!isestr(b64)) {
        return ''
    }
    if (!isestr(key)) {
        return ''
    }

    //aes2str
    let c = aes2str(b64, key, true)

    //data
    let p = j2o(c)
    let data = p.data

    return data
}


export default pb642obj
