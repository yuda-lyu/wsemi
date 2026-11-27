import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isu8arr from './isu8arr.mjs'
import pickOpt from './_pickOpt.mjs'
import diagIfAsked from './_diagIfAsked.mjs'


/**
 * Uint8Array轉ArrayBuffer
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u8arr2ab.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint8Array} u8a 輸入Uint8Array
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入轉換失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，狀態模式之msg為固定詞彙(不含原生錯誤之文字)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入轉換失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi u8arr2ab] can not convert u8a to ab'，同getDiag)，預設null
 * @returns {ArrayBuffer|Object} 回傳ArrayBuffer，僅含該Uint8Array所視之範圍(依byteOffset與byteLength切出)而非其底層buffer全部，故輸入為大buffer之視圖(如nodejs之Buffer)時不會夾帶無關資料；輸入非Uint8Array時回傳空ArrayBuffer；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空ArrayBuffer(byteLength為0)，而空ArrayBuffer(byteLength為0)亦為合法輸入之結果(如u8arr2ab(new Uint8Array(0)))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(u8arr2ab(new Uint8Array([66, 97, 115])))
 * // (new Uint8Array([66, 97, 115])).buffer
 *
 * console.log(u8arr2ab('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid u8a: must be a Uint8Array' }
 *
 */
function u8arr2ab(u8a, opt = {}) {

    //opt, 取快照: 讀取拋錯(已撤銷之Proxy、getter拋錯、陷阱拋錯)之opt或其鍵視為未給, 不拋錯(C1/K3: 無法轉型回預設值, 不拋錯)
    let optSnap = pickOpt(opt, ['returnWithStateAndMsg'], [])

    //returnWithStateAndMsg
    let returnWithStateAndMsg = get(optSnap, 'returnWithStateAndMsg', null)
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
        return retError('invalid u8a: must be a Uint8Array')
    }

    //ab, 須攔截非預期錯誤, 否則會外拋至呼叫端
    //不可直接回u8a.buffer, 因Uint8Array可能只是大buffer之一段視圖(如nodejs之Buffer.from小資料會共用64KB pool), 直接回底層buffer會夾帶無關記憶體
    let ab = null
    try {
        ab = u8a.buffer.slice(u8a.byteOffset, u8a.byteOffset + u8a.byteLength)
    }
    catch (err) {
        //訊息為固定詞彙(V19、V20, 不轉出原生錯誤之文字), 細節經opt之診斷出口(預設靜默)
        diagIfAsked(opt, '[wsemi u8arr2ab] can not convert u8a to ab', err)
        return retError('can not convert u8a to ab')
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
