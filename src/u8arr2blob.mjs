import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isu8arr from './isu8arr.mjs'


/**
 * Unit8Array資料轉Blob資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2blob.test.mjs Github}
 * @memberOf wsemi
 * @param {Unit8Array} u8a 輸入Unit8Array資料
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Blob|Object} 回傳Blob資料，輸入非Unit8Array時回傳空Blob；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 * need test in browser
 *
 * let u8a = new Uint8Array([1, 2.3, '45', 'abc'])
 * let bb = u8arr2blob(u8a)
 * console.log(bb)
 * // => Blob {size: 4, type: ""}
 *
 * console.log(u8arr2blob('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid u8a' }
 *
 */
function u8arr2blob(u8a, opt = {}) {

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
            return new Blob()
        }
    }

    //check
    if (!isu8arr(u8a)) {
        return retError('invalid u8a')
    }

    //bb, 須攔截非預期錯誤(如執行環境無Blob), 否則會外拋至呼叫端
    let bb = null
    try {
        bb = new Blob([u8a])
    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: bb,
        }
    }
    else {
        return bb
    }
}


export default u8arr2blob
