import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'
import aes2str from './aes2str.mjs'
import j2o from './j2o.mjs'
import pickOpt from './_pickOpt.mjs'
import diagIfAsked from './_diagIfAsked.mjs'


/**
 * base64解密取得原始資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pb642obj.test.mjs Github}
 * @memberOf wsemi
 * @param {String} b64 輸入加密base64字串
 * @param {String} key 輸入加密key
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入轉換失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，狀態模式之msg為固定詞彙(不含原生錯誤之文字)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入轉換失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi pb642obj] can not convert b64 to data'，同getDiag)，預設null
 * @returns {*} 回傳任意物件，b64或key非有效字串、或解密失敗時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空字串''；須可靠辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * let key = '1234567890abcdef'
 * let str = U2FsdGVkX1+yPgYSW6mKi1VqyslaSKYHKRaw8Pu4QduzHggojRZA6b/T/oB7ltXf //(is random)
 * console.log(pb642obj(str, key))
 * // => [1, '3', 'abc']
 *
 */
function pb642obj(b64, key, opt = {}) {

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
    if (!isestr(b64)) {
        return retError('invalid b64: must be a non-empty string')
    }
    if (!isestr(key)) {
        return retError('invalid key: must be a non-empty string')
    }

    //data, 須攔截非預期錯誤, 否則會外拋至呼叫端
    let data = null
    try {

        //aes2str
        let c = aes2str(b64, key, true)

        //data, 解密失敗時aes2str回空字串, j2o('')得{}, 取p.data即undefined; 因obj2pb64已擋下data為undefined之輸入, 故成功路徑之data必非undefined, 可據此判定失敗
        let p = j2o(c)
        data = p.data
        if (data === undefined) {
            return retError('can not decrypt b64 with key, or the decrypted data is invalid')
        }

    }
    catch (err) {
        //訊息為固定詞彙(V19、V20, 不轉出原生錯誤之文字), 細節經opt之診斷出口(預設靜默)
        diagIfAsked(opt, '[wsemi pb642obj] can not convert b64 to data', err)
        return retError('can not convert b64 to data')
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: data,
        }
    }
    else {
        return data
    }
}


export default pb642obj
