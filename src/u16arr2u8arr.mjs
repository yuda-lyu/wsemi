import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isu16arr from './isu16arr.mjs'


/**
 * Uint16Array轉Uint8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u16arr2u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint16Array} u16a 輸入Uint16Array
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Uint8Array|Object} 回傳Uint8Array，輸入非Uint16Array時回傳空Uint8Array；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(u16arr2u8arr(new Uint16Array([66, 97, 115])))
 * // => new Uint8Array([66, 97, 115])
 *
 * console.log(u16arr2u8arr('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid u16a' }
 *
 */
function u16arr2u8arr(u16a, opt = {}) {

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
    if (!isu16arr(u16a)) {
        return retError('invalid u16a')
    }

    //u8a, 須攔截非預期錯誤(如過大資料配置失敗RangeError), 否則會外拋至呼叫端
    let u8a = null
    try {
        u8a = new Uint8Array(u16a)
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: u8a,
        }
    }
    else {
        return u8a
    }
}


export default u16arr2u8arr
