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
 * @returns {ArrayBuffer|Object} 回傳ArrayBuffer，僅含該Uint8Array所視之範圍(依byteOffset與byteLength切出)而非其底層buffer全部，故輸入為大buffer之視圖(如nodejs之Buffer)時不會夾帶無關資料；輸入非Uint8Array時回傳空ArrayBuffer；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空ArrayBuffer(byteLength為0)，而空ArrayBuffer(byteLength為0)亦為合法輸入之結果(如u8arr2ab(new Uint8Array(0)))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
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
    //不可直接回u8a.buffer, 因Uint8Array可能只是大buffer之一段視圖(如nodejs之Buffer.from小資料會共用64KB pool), 直接回底層buffer會夾帶無關記憶體
    let ab = null
    try {
        ab = u8a.buffer.slice(u8a.byteOffset, u8a.byteOffset + u8a.byteLength)
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
