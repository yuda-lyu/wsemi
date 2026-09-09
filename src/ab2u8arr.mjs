import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isab from './isab.mjs'


/**
 * ArrayBuffer轉Unit8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/ab2u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {ArrayBuffer} ab 輸入ArrayBuffer
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Unit8Array|Object} 回傳Unit8Array，輸入非ArrayBuffer時回傳空Unit8Array；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * let ab = (new Uint8Array([66, 97, 115])).buffer
 * console.log(ab2u8arr(ab))
 * // => new Uint8Array([66, 97, 115])
 *
 */
function ab2u8arr(ab, opt = {}) {

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
    if (!isab(ab)) {
        return retError('invalid ab')
    }

    //u8a, 須攔截非預期錯誤, 否則會外拋至呼叫端
    let u8a = null
    try {
        u8a = new Uint8Array(ab)
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


export default ab2u8arr
