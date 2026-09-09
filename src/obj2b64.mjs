import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import o2j from './o2j.mjs'
import str2b64 from './str2b64.mjs'


/**
 * 任意資料轉base64字串
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/obj2b64.test.mjs Github}
 * @memberOf wsemi
 * @param {*} data 輸入任意資料
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳base64字串，輸入為undefined或序列化失敗時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(obj2b64({ a: 1 }))
 * // => 'eyJhIjoxfQ=='
 *
 * console.log(obj2b64(undefined, { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'o2j: invalid v' }
 *
 */
function obj2b64(data, opt = {}) {

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

    //b64, 內部一律以returnWithStateAndMsg取狀態, 逐一判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯; 另須攔截非預期錯誤, 否則會外拋至呼叫端
    let b64 = ''
    try {

        let rj = o2j(data, false, { returnWithStateAndMsg: true })
        if (rj.state === 'error') {
            return retError(`o2j: ${rj.msg}`)
        }

        let rb64 = str2b64(rj.msg, { returnWithStateAndMsg: true })
        if (rb64.state === 'error') {
            return retError(`str2b64: ${rb64.msg}`)
        }
        b64 = rb64.msg

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


export default obj2b64
