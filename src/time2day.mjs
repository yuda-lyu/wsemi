import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import istime from './istime.mjs'
import pickOpt from './_pickOpt.mjs'
import diagIfAsked from './_diagIfAsked.mjs'


/**
 * 秒時間取至日時間
 *
 * 失敗之辨識：回傳''即失敗，有效輸入必得非空字串(狀態模式另以state === 'error'判定)
 * 轉換方式：直接取字串中之時刻欄位(所給之牆鐘時刻)，不經本機時間解析，故結果不受執行環境之時區(含夏令空窗)影響；本機時區之夏令空窗內之時刻亦為有效
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/time2day.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串，不含時區
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @param {Boolean} [opt.logDetail=false] 輸入轉換失敗時是否輸出遮罩後之細節布林值(經getDiag之出口)，須為true才生效，狀態模式之msg為固定詞彙(不含原生錯誤之文字)，預設false(靜默)
 * @param {Function} [opt.funLog=null] 輸入轉換失敗時之診斷輸出函數，格式為(label, safe, detail)=>{}，給予時診斷交給它(label為'[wsemi time2day] can not convert time'，同getDiag)，預設null
 * @returns {String|Object} 回傳日時間字串，t非有效秒時間字串或轉換失敗時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(time2day('2019-01-01T12:34:56'))
 * // => '2019-01-01'
 *
 */
function time2day(t, opt = {}) {

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
    if (!istime(t)) {
        return retError('invalid t: must be a time string YYYY-MM-DDTHH:mm:ss')
    }

    //r, 須攔截非預期錯誤, 否則會外拋至呼叫端
    let r = ''
    try {
        //直接取字串中之時刻欄位(所給之牆鐘時刻), 不經本機時間解析(原以本機時間解析再format, 於本機時區之夏令空窗內差1小時; 排程第428項); t已經istime驗證為標準寫法
        r = t.slice(0, 10) //'YYYY-MM-DD'
    }
    catch (err) {
        //訊息為固定詞彙(V19、V20, 不轉出原生錯誤之文字), 細節經opt之診斷出口(預設靜默)
        diagIfAsked(opt, '[wsemi time2day] can not convert time', err)
        return retError('can not convert time')
    }

    if (returnWithStateAndMsg) {
        return {
            state: 'success',
            msg: r,
        }
    }
    else {
        return r
    }
}


export default time2day
