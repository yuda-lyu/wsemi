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


describe(`setTimeoutHp 非函數(dspec §11 W-15甲①; 原R-PM-SETTLE-01規則12)`, function() {

    it(`fun非函數(12值)時同步拋Error('invalid fun: must be a function'), 不啟動計時器、不通知onTrace、不輸出opt.debug警告、不記錄 [W-15甲①]`, function() {
        let { r } = runPmSettle('nonFunHp')
        //dspec §11 W-15甲①「建立物件或立即啟動之參數無效即同步拋錯、先於任何副作用(setTimeoutHp／setIntervalHp不啟動計時器…)」; 訊息為V19固定格式不回顯值(V20)
        //替身計數計時器之啟動點(timers為0), onTrace未收到任何事件(events為[]), interval為無效值且opt.debug為true時funLog未收到警告(warns為[]): fun之檢測先於interval之檢測
        let bad = { threw: true, isError: true, msg: 'invalid fun: must be a function', timers: 0, warns: [], events: [] }
        let keys = ['undefined', 'null', 'zero', 'num', 'str', 'bool', 'obj', 'arr', 'pm', 'asyncGen', 'revokedObj', 'revokedFn']
        let all = Object.fromEntries(keys.map((k) => [k, bad]))
        assert.strict.deepStrictEqual(r.out.out.timeout, all)
        assert.strict.deepStrictEqual(r.out.out.interval, all)
        //陽性對照: 有效fun時替身確實攔得到計時器之啟動(1次)、opt.debug警告(interval為'abc'者1則)與onTrace之start事件, 證明上列0與[]不是替身或回調失效
        assert.strict.deepStrictEqual(r.out.ctl.timeout, { timers: 1, warns: 1, events: ['start'] })
        //全程無console.log記錄(原到期才記錄Error('fn is not a function')), 無未處理之rejection與未捕捉例外(R-PM-SETTLE-01規則2)
        assert.strict.deepStrictEqual(r.out.logs, [])
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})


describe(`setTimeoutHp interval驗證`, function() {

    it(`should treat an unexpected interval as not given (default 1ms) and start normally: fire once no earlier than 1ms, call fun once, log nothing, return null`, function() {
        let r = runHp('timeoutInvalid')
        let labels = ['0', '-5', 'NaN', 'Infinity', '-Infinity', '"abc"', '""', '" "', 'null', 'true', '{}', '[]']
        //第221項第二批g1timer組(dspec K3, 使用者2026-10-31): interval為opt類參數, JSDoc「非預期之輸入視為未給而改用預設1毫秒並照常啟動，不報錯、不記錄」且回傳null
        //(舊版: 不啟動、不調用fun、以console.log記錄Error('interval is not a positive finite number')各一次)
        //start事件為呼叫當下同步可見(startedSync為1); 其後fire(僅通知一次)與result:success各一次、fun被調用一次, 到期不早於1ms(下界, 不受負載影響), 全程無記錄
        assert.strict.deepStrictEqual(r.out.items, labels.map((v) => ({ v, ret: null, startedSync: 1, seq: ['start', 'fire', 'result:success'], elapsedOk: true, calls: 1 })))
        assert.strict.deepStrictEqual(r.out.totalLogs, 0)
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

    it(`should notify start, expiry and an invalid result once for a fun revoked after creation, log it once, never fire earlier than interval, and return null`, function() {
        let r = runHp('timeoutRevokedAfterStart')
        let { ret, seq, nLogsAt, minElapsed, after } = r.out
        //JSDoc 回傳null; 'fire'僅通知一次、'result'的state為'invalid'(到期時fun已無法判定為函數, 如建立後才被撤銷之Proxy, 即將console.log記錄); 建立時之無效fun已同步拋錯(見nonFunHp案)
        assert.strict.deepStrictEqual(ret, null)
        assert.strict.deepStrictEqual(seq, ['start', 'fire', 'result:invalid'])
        assert.strict.deepStrictEqual(nLogsAt, 1)
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
        let pick = (o) => ({ seq: o.seq, order: o.order, calls: o.calls, logs: o.logs.length === 1 && o.calls === 0 ? ['<one log>'] : o.logs })
        assert.strict.deepStrictEqual(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, pick(v)])), {
            sync: ok('success', 1, []),
            async: ok('success', 1, []),
            syncThrow: ok('error', 1, ['b1']),
            asyncReject: ok('error', 1, ['b2']),
            cancelled: ok('cancelled', 1, []),
            revoked: ok('invalid', 0, ['<one log>']), //建立後才被撤銷之函數Proxy: 不調用、記錄一筆(內容為引擎之原生錯誤, 不斷言)
        })
        //JSDoc elapsed「必不小於interval」
        assert.strict.deepStrictEqual(Object.values(out).every((v) => v.minElapsed >= 20), true)
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(第3參數可省略, 同舊版之setTimeoutHp(fun, interval)); P4: 回調之拋錯與回傳值不影響計時與調用、不產生未處理之rejection
        //假時鐘控制不了hrtime計時, 故五種模式於真實計時器下各跑同一情境, 以事件(fun被調用、記錄筆數)為同步點
        let r = runHp('timeoutP34')
        //fun非函數(W-15甲①)於五種模式皆同步拋Error('invalid fun: must be a function')且不記錄(logs只有boom)
        let exp = { rets: [null, null], calls: 1, logs: ['boom'], thrownC: 'invalid fun: must be a function' }
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
