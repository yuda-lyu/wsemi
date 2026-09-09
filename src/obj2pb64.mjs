import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'
import o2j from './o2j.mjs'
import str2aes from './str2aes.mjs'


/**
 * 任意資料由key進行AES加密轉為為base64
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/obj2pb64.test.mjs Github}
 * @memberOf wsemi
 * @param {*} data 輸入任意資料
 * @param {String} key 輸入加密key
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳加密base64字串，data為undefined或key非有效字串時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * let key = '1234567890abcdef'
 * console.log(obj2pb64([1, '3', 'abc'], key))
 * // => U2FsdGVkX1+yPgYSW6mKi1VqyslaSKYHKRaw8Pu4QduzHggojRZA6b/T/oB7ltXf (is random)
 *
 */
function obj2pb64(data, key, opt = {}) {

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
    if (data === undefined) {
        return retError('invalid data')
    }
    if (!isestr(key)) {
        return retError('invalid key')
    }

    //b64, 內部一律以returnWithStateAndMsg取狀態, 判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯; 另須攔截非預期錯誤, 否則會外拋至呼叫端
    let b64 = ''
    try {

        //先封裝成物件再轉字串
        let p = {
            data,
        }
        let rj = o2j(p, false, { returnWithStateAndMsg: true })
        if (rj.state === 'error') {
            return retError(`o2j: ${rj.msg}`)
        }

        //str2aes
        b64 = str2aes(rj.msg, key, true)

    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: b64,
        }
    }
    else {
        return b64
    }
}


export default obj2pb64
