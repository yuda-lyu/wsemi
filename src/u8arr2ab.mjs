import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isu8arr from './isu8arr.mjs'


/**
 * Uint8Array轉ArrayBuffer
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2ab.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {ArrayBuffer|Object} 回傳ArrayBuffer，輸入非Uint8Array時回傳空ArrayBuffer；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(u8arr2ab(new Uint8Array([66, 97, 115])))
 * // (new Uint8Array([66, 97, 115])).buffer
 *
 * console.log(u8arr2ab('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid u8a' }
 *
 */
function u8arr2ab(u8a, opt = {}) {

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
            return new ArrayBuffer()
        }
    }

    //check
    if (!isu8arr(u8a)) {
        return retError('invalid u8a')
    }

    //ab, 須攔截非預期錯誤, 否則會外拋至呼叫端
    let ab = null
    try {
        ab = u8a.buffer
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: ab,
        }
    }
    else {
        return ab
    }
}


export default u8arr2ab
