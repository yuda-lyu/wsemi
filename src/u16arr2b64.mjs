import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isu16arr from './isu16arr.mjs'
import u8arr2b64 from './u8arr2b64.mjs'
import pickOpt from './_pickOpt.mjs'
import diagIfAsked from './_diagIfAsked.mjs'


/**
 * Uint16Array轉base64字串
 *
 * 以逐位元組(little-endian)方式編碼，故各元素之高位元組不會遺失；不可經u16arr2u8arr轉換，該函數為逐元素轉換會將大於255之元素截斷
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u16arr2b64.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint16Array} u16a 輸入Uint16Array
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入轉換失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，狀態模式之msg為固定詞彙(不含原生錯誤之文字)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入轉換失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi u16arr2b64] can not convert u16a to b64'，同getDiag)，預設null
 * @returns {String|Object} 回傳base64字串，輸入非Uint16Array時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空字串''，而空字串''亦為合法輸入之結果(如u16arr2b64(new Uint16Array(0)))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(u16arr2b64(new Uint16Array([11, 79, 6])))
 * // => 'CwBPAAYA'
 *
 * console.log(u16arr2b64('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid u16a: must be a Uint16Array' }
 *
 */
function u16arr2b64(u16a, opt = {}) {

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
            return ''
        }
    }

    //check
    if (!isu16arr(u16a)) {
        return retError('invalid u16a: must be a Uint16Array')
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
        //訊息為固定詞彙(V19、V20, 不轉出原生錯誤之文字), 細節經opt之診斷出口(預設靜默)
        diagIfAsked(opt, '[wsemi u16arr2b64] can not convert u16a to b64', err)
        return retError('can not convert u16a to b64')
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
