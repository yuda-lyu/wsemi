import assert from 'assert'
import { fileURLToPath } from 'url'
//import setTimeoutHp from '../src/setTimeoutHp.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


//setTimeoutHp以getTimeHp(hrtime, 非Date)計時, 假時鐘控制不了, 故觀察回調(opt.onTrace)之案於子行程(test/tools/hpTraceRunner.mjs)以事件同步(R-TRACE-01)
let runner = fileURLToPath(new URL('./tools/hpTraceRunner.mjs', import.meta.url))
let cache = {}
function runHp(caseName) {
    if (!cache[caseName]) {
        cache[caseName] = runChildCase(runner, caseName).r
    }
    return cache[caseName]
}


describe(`setTimeoutHp`, function() {

    it(`no test for timer`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})


describe(`setTimeoutHp settle(R-PM-SETTLE-01)`, function() {

    it(`setTimeoutHp: async回呼reject不產生未處理之rejection, 以console.log記錄 [規則2、10]`, function() {
        let { r } = runPmSettle('hpAsyncReject')
        let { loggedTimeout } = r.out
        assert.strict.deepStrictEqual(loggedTimeout, true)
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

})


describe(`setTimeoutHp 非函數(R-PM-SETTLE-01規則12)`, function() {

    it(`fun非函數時到期以console.log記錄Error('fn is not a function')一次, 回傳null [規則12]`, function() {
        let { r } = runPmSettle('nonFunHp')
        let { timeoutLogs, timeoutRet } = r.out
        //R-PM-SETTLE-01 規則12: setTimeoutHp到期記錄(寫入JSDoc); JSDoc setTimeoutHp:23「回傳null(無停止函數)…fun非函數時到期以console.log記錄Error('fn is not a function')」
        assert.strict.deepStrictEqual({ timeoutLogs, timeoutRet }, { timeoutLogs: 1, timeoutRet: null })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})


describe(`setTimeoutHp interval驗證`, function() {

    let msg = 'interval is not a positive finite number'

    it(`should not start for an invalid interval, log the Error once, and return null`, function() {
        let r = runHp('timeoutInvalid')
        let labels = ['0', '-5', 'NaN', 'Infinity', '-Infinity', '"abc"', '""', '" "', 'null', 'true', '{}', '[]']
        //JSDoc interval「須為正有限數」、@returns「interval為無效值時不啟動計時、不調用fun，以console.log記錄Error('interval is not a positive finite number')一次」且回傳null
        //記錄、回傳與事件(無start)為呼叫當下同步可見; 觀察窗(100ms)後仍無調用fun、無通知、無額外記錄(否定斷言)
        assert.strict.deepStrictEqual(r.out.items, labels.map((v) => ({ v, ret: null, logs: [msg], events: 0, calls: 0 })))
        assert.strict.deepStrictEqual(r.out.totalLogs, labels.length)
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`should start for a valid interval (omitted, integer, decimal, numeric string with spaces), fire no earlier than it, and log nothing`, function() {
        let r = runHp('timeoutValid')
        //JSDoc interval「預設1」「須為正有限數(通常為正整數，數字字串亦可)」; elapsed「必不小於interval」(下界, 不受負載影響)
        assert.strict.deepStrictEqual(r.out.out, ['undefined', '1', '0.5', '"20"', '" 20 "', '20.5'].map((v) => ({ v, elapsedOk: true })))
        assert.strict.deepStrictEqual(r.out.logs, [])
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})


describe(`setTimeoutHp 觀察回調(onTrace)`, function() {

    it(`should notify start, expiry and an invalid result once for a non-function fun, log it once, never fire earlier than interval, and return null`, function() {
        let r = runHp('timeoutNonFun')
        let { ret, seq, logsAt, minElapsed, after } = r.out
        //JSDoc 回傳null; 'fire'僅通知一次、'result'的state為'invalid'(fun非函數, 即將console.log記錄)
        assert.strict.deepStrictEqual(ret, null)
        assert.strict.deepStrictEqual(seq, ['start', 'fire', 'result:invalid'])
        assert.strict.deepStrictEqual(logsAt, ['fn is not a function'])
        //JSDoc elapsed「必不小於interval」(下界, 不受負載影響)
        assert.strict.deepStrictEqual(minElapsed >= 30, true)
        //到期後不再調用與記錄(觀察窗內; 到期只一次已由事件序列斷言)
        assert.strict.deepStrictEqual(after, { events: 0, logs: 0 })
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`should notify the result state (success, error, cancelled, invalid) after calling fun once and before logging, and log only errors and invalid`, function() {
        let r = runHp('timeoutStates')
        let { out } = r.out
        //JSDoc 'fire'為即將調用fun、'result'為該次調用已有結果而即將記錄; fun同步拋錯或其Promise被reject時console.log記錄, 取消與成功不記錄
        let ok = (state, calls, logs) => ({
            seq: ['start', 'fire', `result:${state}`],
            order: calls === 1 ? ['start', 'fire', 'call', 'result'] : ['start', 'fire', 'result'],
            calls,
            logs,
        })
        let pick = (o) => ({ seq: o.seq, order: o.order, calls: o.calls, logs: o.logs })
        assert.strict.deepStrictEqual(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, pick(v)])), {
            sync: ok('success', 1, []),
            async: ok('success', 1, []),
            syncThrow: ok('error', 1, ['b1']),
            asyncReject: ok('error', 1, ['b2']),
            cancelled: ok('cancelled', 1, []),
            nonFun: ok('invalid', 0, ['fn is not a function']),
        })
        //JSDoc elapsed「必不小於interval」
        assert.strict.deepStrictEqual(Object.values(out).every((v) => v.minElapsed >= 20), true)
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(第3參數可省略, 同舊版之setTimeoutHp(fun, interval)); P4: 回調之拋錯與回傳值不影響計時與調用、不產生未處理之rejection
        //假時鐘控制不了hrtime計時, 故五種模式於真實計時器下各跑同一情境, 以事件(fun被調用、記錄筆數)為同步點
        let r = runHp('timeoutP34')
        let exp = { rets: [null, null, null], calls: 1, logs: ['boom', 'fn is not a function'] }
        assert.strict.deepStrictEqual(r.out.results, [exp, exp, exp, exp, exp])
        //紀錄器確實收到事件
        assert.strict.deepStrictEqual(r.out.recTypes, ['fire', 'result', 'start'])
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`should notify through onTrace with frozen events of primitive fields and no receiver`, function() {
        //R-TRACE-01 P4: 事件為凍結物件、各type之欄位固定且皆為原始值、回調不帶接收者
        let r = runHp('timeoutStates')
        assert.strict.deepStrictEqual(r.out.fields, {
            keys: {
                start: 'type',
                fire: 'type,elapsed',
                result: 'type,state',
            },
            primitive: true,
            plain: true,
        })
    })

})
