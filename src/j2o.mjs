import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import isestr from './isestr.mjs'
import pickOpt from './_pickOpt.mjs'
import diagIfAsked from './_diagIfAsked.mjs'


/**
 * json文字轉任意資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/j2o.test.mjs Github}
 * @memberOf wsemi
 * @param {String} v 輸入json格式字串
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入解析失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，狀態模式之msg為固定詞彙(不含原生錯誤之文字，SyntaxError之位置與片段亦只經此出口)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入解析失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi j2o] can not parse'，同getDiag)，預設null
 * @returns {*} 回傳任意資料，輸入非有效字串或解析失敗時回傳空物件；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * 失敗之辨識：預設模式於本函數所偵測之失敗(輸入無效或轉換失敗)時不拋錯而回傳空物件{}，而空物件{}亦為合法輸入之結果(如j2o('{}')，與解析失敗之j2o('{bad')同為{})，故不可由回傳值判斷成敗；須辨識失敗時請設opt.returnWithStateAndMsg為true，以回傳之state === 'error'判定(只涵蓋本函數所偵測之失敗，msg為錯誤訊息)
 * @example
 *
 * console.log(j2o('[1,"3","abc"]'))
 * // => [1, '3', 'abc']
 *
 * console.log(j2o('{"a":12.34,"b":"abc"}'))
 * // => { a: 12.34, b: 'abc' }
 *
 */
function j2o(v, opt = {}) {

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
            return {}
        }
    }

    //check
    if (!isestr(v)) {
        return retError('invalid v: must be a non-empty string')
    }

    //c, 解析失敗原為catch吞掉回{}, 與「輸入本就是{}」無從分辨
    let c = {}
    try {
        c = JSON.parse(v)
    }
    catch (err) {
        //SyntaxError之訊息帶輸入片段(V20), 改為固定訊息; 其餘(引擎自身之非預期錯誤)亦為固定詞彙(V19、V20, 不轉出原生錯誤之文字), 細節經opt之診斷出口(預設靜默)
        diagIfAsked(opt, '[wsemi j2o] can not parse', err)
        return retError(err instanceof SyntaxError ? 'invalid v: must be a valid JSON text' : 'can not convert v to obj')
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


export default j2o
