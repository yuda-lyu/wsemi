import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isu16arr from './isu16arr.mjs'
import pickOpt from './_pickOpt.mjs'
import diagIfAsked from './_diagIfAsked.mjs'


/**
 * Uint16Array轉Uint8Array
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/u16arr2u8arr.test.mjs Github}
 * @memberOf wsemi
 * @param {Uint16Array} u16a 輸入Uint16Array
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入轉換失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，狀態模式之msg為固定詞彙(不含原生錯誤之文字)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入轉換失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi u16arr2u8arr] can not convert u16a to u8a'，同getDiag)，預設null
 * @returns {Uint8Array|Object} 回傳Uint8Array，輸入非Uint16Array時回傳空Uint8Array；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空Uint8Array(長度0)，而空Uint8Array(長度0)亦為合法輸入之結果(如u16arr2u8arr(new Uint16Array(0)))，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(u16arr2u8arr(new Uint16Array([66, 97, 115])))
 * // => new Uint8Array([66, 97, 115])
 *
 * console.log(u16arr2u8arr('abc', { returnWithStateAndMsg: true }))
 * // => { state: 'error', msg: 'invalid u16a: must be a Uint16Array' }
 *
 */
function u16arr2u8arr(u16a, opt = {}) {

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
            return new Uint8Array()
        }
    }

    //check
    if (!isu16arr(u16a)) {
        return retError('invalid u16a: must be a Uint16Array')
    }

    //u8a, 須攔截非預期錯誤(如過大資料配置失敗RangeError), 否則會外拋至呼叫端
    let u8a = null
    try {
        u8a = new Uint8Array(u16a)
    }
    catch (err) {
        //訊息為固定詞彙(V19、V20, 不轉出原生錯誤之文字), 細節經opt之診斷出口(預設靜默)
        diagIfAsked(opt, '[wsemi u16arr2u8arr] can not convert u16a to u8a', err)
        return retError('can not convert u16a to u8a')
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
