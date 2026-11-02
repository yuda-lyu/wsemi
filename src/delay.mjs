import genPm from './genPm.mjs'
import getTrace from './getTrace.mjs'
import optVal from './_optVal.mjs'


//ms: opt類參數(位置參數, JSDoc與程式碼有預設10), 有效數字且為計時毫秒(isenum, use: 'timer', 0~2147483647, 可帶小數; 交給setTimeout), 非預期改用預設10
let RULE_MS = { fn: 'delay', name: 'ms', kind: 'enum', chk: { use: 'timer' } }


/**
 * Promise延遲毫秒
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/delay.test.mjs Github}
 * @memberOf wsemi
 * @param {Number} [ms=10] 輸入延遲毫秒數，須為有效數字且在0至2147483647(計時器上限)之內，可帶小數，數字字串(去頭尾空白後為十進位寫法)亦可，預設10ms；非預期(NaN、負數、Infinity、超過2147483647、'0x10'、包裝物件、非數字等)視為未給而改用預設10ms，不報錯、不夾至上限
 * @param {Object} [opt=null] 輸入設定物件，預設null
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'start'時為開始延遲(含ms為實際使用之延遲毫秒數，已套用預設值)，'done'時為延遲完畢而即將resolve(含ms同上)；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響延遲，預設null
 * @param {Boolean} [opt.debug=false] 輸入是否於ms為非預期之輸入時輸出警告布林值，須為true才生效，警告為固定詞彙(不含輸入值)，同一行程只警告一次，預設false
 * @param {Function} [opt.funLog=null] 輸入警告輸出函數，格式為(msg, { fn, reason, key })=>{}，未給則用console.warn，預設null
 * @returns {Promise} 回傳Promise，resolve代表延遲完畢
 * @example
 * need test in browser
 *
 * delay(1000)
 * // => 延遲1s才執行
 *
 */
function delay(ms = 10, opt = null) {

    //check, 有效則取Number(ms), 非預期(含超出計時器上限、Infinity)改用預設, 不夾至上限
    ms = optVal(ms, 10, RULE_MS, opt)

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
