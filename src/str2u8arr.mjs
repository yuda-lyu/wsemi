import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'
import str2b64 from './str2b64.mjs'
import b642u8arr from './b642u8arr.mjs'


/**
 * 字串轉Uint8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/str2u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {String} str 輸入一般字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Uint8Array|Object} 回傳Uint8Array，輸入非有效字串或轉換失敗時回傳空Uint8Array；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(str2u8arr('test中文'))
 * // => Uint8Array [116, 101, 115, 116, 228, 184, 173, 230, 150, 135]
 *
 */
function str2u8arr(str, opt = {}) {

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
            return new Uint8Array()
        }
    }

    //check
    if (!isestr(str)) {
        return retError('invalid str')
    }

    //r, 內部一律以returnWithStateAndMsg取狀態, 逐一判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯; 另須攔截非預期錯誤, 否則會外拋至呼叫端
    let r = null
    try {

        let rb64 = str2b64(str, { returnWithStateAndMsg: true })
        if (rb64.state === 'error') {
            return retError(`str2b64: ${rb64.msg}`)
        }

        let ru8a = b642u8arr(rb64.msg, { returnWithStateAndMsg: true })
        if (ru8a.state === 'error') {
            return retError(`b642u8arr: ${ru8a.msg}`)
        }
        r = ru8a.msg

    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: r,
        }
    }
    else {
        return r
    }
}


export default str2u8arr
