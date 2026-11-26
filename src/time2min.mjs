import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import istime from './istime.mjs'
import pickOpt from './_pickOpt.mjs'


/**
 * 秒時間取至分時間
 *
 * 失敗之辨識：回傳''即失敗，有效輸入必得非空字串(狀態模式另以state === 'error'判定)
 * 轉換方式：直接取字串中之時刻欄位(所給之牆鐘時刻)，不經本機時間解析，故結果不受執行環境之時區(含夏令空窗)影響；本機時區之夏令空窗內之時刻亦為有效
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/time2min.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入秒時間字串，不含時區
 * @param {Object} [opt={}] 輸入設定物件，讀取拋錯(已撤銷之Proxy、存取器拋錯)者視為未給，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳分時間字串，t非有效秒時間字串或轉換失敗時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(time2min('2019-01-01T12:34:56'))
 * // => '2019-01-01T12:34'
 *
 */
function time2min(t, opt = {}) {

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
        r = t.slice(0, 16) //'YYYY-MM-DDTHH:mm'
    }
    catch (err) {
        return retError(err.toString())
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


export default time2min
