import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import istimemsTZ from './istimemsTZ.mjs'
import tz from './_tz.mjs'


/**
 * 毫秒時間(含時區)取至日時間
 *
 * 失敗之辨識：回傳''即失敗，有效輸入必得非空字串(狀態模式另以state === 'error'判定)
 * 轉換方式：直接取字串中之時刻欄位(所給之牆鐘時刻，即該時區之時刻)，不經本機時間解析，故結果不受執行環境之時區(含夏令空窗)影響
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timemsTZ2day.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入毫秒時間字串，含時區
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳日時間字串，t非有效毫秒時間字串或轉換失敗時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(timemsTZ2day('2019-01-01T12:34:56.987+08:00'))
 * // => '2019-01-01'
 *
 * console.log(timemsTZ2day('2019-01-01T12:34:56.987Z'))
 * // => '2019-01-01'
 *
 */
function timemsTZ2day(t, opt = {}) {

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
            return ''
        }
    }

    //check
    if (!istimemsTZ(t)) {
        return retError('invalid t')
    }

    //r, 須攔截非預期錯誤(如delTZ或dayjs解析格式化異常), 否則會外拋至呼叫端
    let r = ''
    try {

        //delTZ
        t = tz.delTZ(t)

        //直接取字串中之時刻欄位(所給之牆鐘時刻), 不經本機時間解析(原以本機時間解析再format, 於本機時區之夏令空窗內差1小時; 使用者2026-11-15裁定表〈十五〉); t已經istimemsTZ驗證為標準寫法
        r = t.slice(0, 10) //'YYYY-MM-DD'

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


export default timemsTZ2day
