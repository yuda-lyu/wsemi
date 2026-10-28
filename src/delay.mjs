import cst from './_const.mjs'
import genPm from './genPm.mjs'
import isnum from './isnum.mjs'
import getTrace from './getTrace.mjs'


/**
 * Promise延遲毫秒
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/delay.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} [ms=10] 輸入延遲毫秒整數，預設10ms
 * @param {Object} [opt=null] 輸入設定物件，預設null
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'start'時為開始延遲(含ms為實際使用之延遲毫秒數，已套用預設值與計時器上限)，'done'時為延遲完畢而即將resolve(含ms同上)；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響延遲，預設null
 * @returns {Promise} 回傳Promise，resolve代表延遲完畢
 * @example
 * need test in browser
 *
 * delay(1000)
 * // => 延遲1s才執行
 *
 */
function delay(ms = 10, opt = null) {

    //check
    if (!isnum(ms)) {
        ms = 10
    }
    ms = Math.min(ms, cst.TIMER_TIME_MAX) //夾至計時器上限, 見_const.mjs

    //trace, 觀察回調(opt.onTrace), 未給時為null; 本函數被多處以delay(ms)呼叫, 未傳opt時不取回調(免多一次取值與預設物件)
    let trace = opt ? getTrace(opt) : null

    let pm = genPm()
    if (trace) {
        trace('start', { ms })
    }
    setTimeout(function() {
        if (trace) {
            trace('done', { ms })
        }
        pm.resolve()
    }, ms)
    return pm
}


export default delay
