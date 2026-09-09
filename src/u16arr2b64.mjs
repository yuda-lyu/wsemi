import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isu16arr from './isu16arr.mjs'
import u8arr2b64 from './u8arr2b64.mjs'


/**
 * Uint16Array轉base64字串
 *
 * 以逐位元組(little-endian)方式編碼，故各元素之高位元組不會遺失；不可經u16arr2u8arr轉換，該函數為逐元素轉換會將大於255之元素截斷
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u16arr2b64.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint16Array} u16a 輸入Uint16Array
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳base64字串，輸入非Uint16Array時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(u16arr2b64(new Uint16Array([11, 79, 6])))
 * // => 'CwBPAAYA'
 *
 * console.log(u16arr2b64('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid u16a' }
 *
 */
function u16arr2b64(u16a, opt = {}) {

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
    if (!isu16arr(u16a)) {
        return retError('invalid u16a')
    }

    //b64, 內部一律以returnWithStateAndMsg取狀態, 逐一判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯; 另須攔截非預期錯誤, 否則會外拋至呼叫端
    let b64 = ''
    try {

        //u8a, 取逐位元組視圖, 不可用u16arr2u8arr(逐元素轉換會截斷大於255之元素)
        let u8a = new Uint8Array(u16a.buffer, u16a.byteOffset, u16a.byteLength)

        let rb64 = u8arr2b64(u8a, { returnWithStateAndMsg: true })
        if (rb64.state === 'error') {
            return retError(`u8arr2b64: ${rb64.msg}`)
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


export default u16arr2b64
