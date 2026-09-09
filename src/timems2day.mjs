import ot from 'dayjs'
import get from 'lodash-es/get.js'
import isbol from './isbol.mjs'
import istimems from './istimems.mjs'


/**
 * 毫秒時間取至日時間
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/timems2day.test.mjs Github}
 * @memberOf wsemi
 * @param {String} t 輸入毫秒時間字串，不含時區
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.returnWithStateAndMsg=false] 輸入是否回傳含狀態與訊息物件布林值，若為true則回傳{ state, msg }物件，state為'success'或'error'，msg於success時為回傳結果、於error時為錯誤訊息字串，預設false
 * @returns {String|Object} 回傳日時間字串，t非有效毫秒時間字串或轉換失敗時回傳空字串；若opt.returnWithStateAndMsg為true則回傳{ state, msg }物件
 * @example
 *
 * console.log(timems2day('2019-01-01T12:34:56.987'))
 * // => '2019-01-01'
 *
 */
function timems2day(t, opt = {}) {

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
    if (!istimems(t)) {
        return retError('invalid t')
    }

    //r, 須攔截非預期錯誤(如dayjs解析或格式化異常), 否則會外拋至呼叫端
    let r = ''
    try {
        let d = ot(t, 'YYYY-MM-DDTHH:mm:ss.SSS')
        r = d.format('YYYY-MM-DD')
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


export default timems2day
