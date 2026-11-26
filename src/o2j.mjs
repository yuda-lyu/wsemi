import get from 'lodash-es/get.js'
import diagIfAsked from './_diagIfAsked.mjs'
import isbol from './isbol.mjs'
import isundefined from './isundefined.mjs'
import pickOpt from './_pickOpt.mjs'


/**
 * 任意資料轉json文字
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/o2j.test.mjs Github}
 * @memberOf wsemi
 * @param {*} v 輸入任意資料；Error依JSON原生只保留可列舉自有欄位(一般Error為{})，記錄錯誤請先以getErrorMessage轉字串
 * @param {Boolean} [bFormat=false] 輸入是否格式化布林值，預設為false
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串(序列化失敗為固定訊息'invalid v: must be serializable to JSON'，不含原生錯誤之文字：循環參照之原生訊息帶構造器名與屬性名，toJSON所拋之文字亦可能含輸入內容)，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入序列化失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入序列化失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi o2j] can not serialize')，同getDiag，預設null
 * @returns {String|Object} 回傳json格式字串，輸入為undefined或序列化失敗(如含BigInt、循環參照)時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空字串''；須可靠辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(o2j([1, '3', 'abc']))
 * // => '[1,"3","abc"]'
 *
 * console.log(o2j({ a: 12.34, b: 'abc' }))
 * // => '{"a":12.34,"b":"abc"}'
 *
 * console.log(o2j({ a: 12.34, b: 'abc' }, true))
 * // => {
 *   "a": 12.34,
 *   "b": "abc"
 * }
 *
 * //取回序列化失敗之原生錯誤並接為Error.cause: 狀態模式之msg為固定訊息(不含原生錯誤之文字)，原生錯誤只經opt.funLog(label, safe, detail)交出，detail為經getDiag遮罩後之副本；
 * //以旗標而非cause是否為null判斷有無取回(拋出值可為null、undefined等任意值)；此funLog只為取回原因，不給logDetail，故不會另輸出至console
 * let hasCause = false
 * let cause = null
 * let circ = {}
 * circ.self = circ
 * let r = o2j(circ, false, {
 *     returnWithStateAndMsg: true,
 *     funLog: (label, safe, detail) => {
 *         hasCause = true
 *         cause = detail
 *     },
 * })
 * console.log(r)
 * // => { state: 'error', msg: 'invalid v: must be serializable to JSON' }
 * let err = hasCause ? new Error(r.msg, { cause }) : new Error(r.msg)
 * console.log(err.message, err.cause instanceof TypeError)
 * // => invalid v: must be serializable to JSON true
 *
 */
function o2j(v, bFormat = false, opt = {}) {

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
    if (isundefined(v)) {
        return retError('invalid v: must not be undefined')
    }

    //c, 序列化失敗(如含BigInt、循環參照)原為catch吞掉回'', 與「本就轉出空字串」無從分辨
    let c = ''
    try {
        if (bFormat) {
            c = JSON.stringify(v, null, 2)
        }
        else {
            c = JSON.stringify(v)
        }
    }
    catch (err) {
        //try內會執行呼叫端之toJSON、getter與Proxy陷阱, 可拋出任意值(含null、無原型物件); 原生訊息帶輸入內容(循環參照之構造器名與屬性名、toJSON所拋之文字), 故回固定訊息(V19、V20), 細節經opt之診斷出口(預設靜默)
        diagIfAsked(opt, '[wsemi o2j] can not serialize', err)
        return retError('invalid v: must be serializable to JSON')
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: c,
        }
    }
    else {
        return c
    }
}


export default o2j
