import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'
import aes2str from './aes2str.mjs'
import j2o from './j2o.mjs'


/**
 * base64解密取得原始資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pb642obj.test.mjs Github}
 * @memberOf wsemi
 * @param {String} key 輸入加密key
 * @param {String} b64 輸入加密base64字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {*} 回傳任意物件，b64或key非有效字串時回傳空字串，解密失敗時回傳undefined；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * let key = '1234567890abcdef'
 * let str = U2FsdGVkX1+yPgYSW6mKi1VqyslaSKYHKRaw8Pu4QduzHggojRZA6b/T/oB7ltXf //(is random)
 * console.log(pb642obj(str, key))
 * // => [1, '3', 'abc']
 *
 */
function pb642obj(b64, key, opt = {}) {

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(opt, 'returnWithStateAndMsg', null)
    if (!isbol(returnWithStateAndMsg)) {
        returnWithStateAndMsg = false
    }

    //retError
    let retError = (msg) => {
        if (returnWithStateAndMsg) {
            return {
                state: 'error',
                msg,
            }
        }
        else {
            return ''
        }
    }

    //check
    if (!isestr(b64)) {
        return retError('invalid b64')
    }
    if (!isestr(key)) {
        return retError('invalid key')
    }

    //data, 須攔截非預期錯誤, 否則會外拋至呼叫端
    let data = null
    try {

        //aes2str
        let c = aes2str(b64, key, true)

        //data, 解密失敗時aes2str回空字串, j2o('')得{}, 取p.data即undefined; 因obj2pb64已擋下data為undefined之輸入, 故成功路徑之data必非undefined, 可據此判定失敗
        let p = j2o(c)
        data = p.data
        if (data === undefined) {
            return retError('can not decrypt b64 with key, or the decrypted data is invalid')
        }

    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: data,
        }
    }
    else {
        return data
    }
}


export default pb642obj
