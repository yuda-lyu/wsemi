import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isstr from './isstr.mjs'
import b642u8arr from './b642u8arr.mjs'


/**
 * base64字串轉Uint16Array
 *
 * 以逐位元組(little-endian)方式解碼，為u16arr2b64之反向；不可經u8arr2u16arr轉換，該函數為逐元素轉換無法還原大於255之元素
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/b642u16arr.test.mjs Github}
 * @memberOf wsemi
 * @param {String} b64 輸入base64字串
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {Uint16Array|Object} 回傳Uint16Array，輸入非字串或解出之位元組長度非偶數(無法組成Uint16Array)時回傳空Uint16Array；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(b642u16arr('CwBPAAYA'))
 * // => new Uint16Array([11, 79, 6])
 *
 */
function b642u16arr(b64, opt = {}) {

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
            return new Uint16Array()
        }
    }

    //check
    if (!isstr(b64)) {
        return retError('invalid b64')
    }

    //u16a, 內部一律以returnWithStateAndMsg取狀態, 判識後才把結果交給下一步, 錯誤訊息前置來源函數名以利分辨是哪一步出錯; 另須攔截非預期錯誤, 否則會外拋至呼叫端
    let u16a = null
    try {

        //u8a
        let ru8a = b642u8arr(b64, { returnWithStateAndMsg: true })
        if (ru8a.state === 'error') {
            return retError(`b642u8arr: ${ru8a.msg}`)
        }
        let u8a = ru8a.msg

        //check, 位元組長度須為偶數才能組成Uint16Array
        if (u8a.byteLength % 2 !== 0) {
            return retError(`byteLength[${u8a.byteLength}] is not even, can not be restored to Uint16Array`)
        }

        //以位元組重建; b642u8arr產出之Uint8Array其byteOffset為0且涵蓋整個buffer, 故可直接取buffer, 否則須先複製以取得對齊
        let bb = (u8a.byteOffset === 0 && u8a.byteLength === u8a.buffer.byteLength) ? u8a : new Uint8Array(u8a)
        u16a = new Uint16Array(bb.buffer)

    }
    catch (err) {
        return retError(err.toString())
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: u16a,
        }
    }
    else {
        return u16a
    }
}


export default b642u16arr
