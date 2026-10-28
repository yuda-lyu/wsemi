import assert from 'assert'
import { fileURLToPath } from 'url'
//import setIntervalHp from '../src/setIntervalHp.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


//setIntervalHp以getTimeHp(hrtime, 非Date)計時, 假時鐘控制不了, 故計時相關案於子行程(test/tools/hpTraceRunner.mjs)以觀察回調(opt.onTrace)之事件同步(R-TRACE-01)
let runner = fileURLToPath(new URL('./tools/hpTraceRunner.mjs', import.meta.url))
let cache = {}
function runHp(caseName) {
    if (!cache[caseName]) {
        cache[caseName] = runChildCase(runner, caseName).r
    }
    return cache[caseName]
}

//tol, 事件間隔以hrtime(奈秒BigInt)換算毫秒浮點數之誤差容許(浮點數轉換之捨入, 非時間裕度)
let tol = 0.01


describe(`setIntervalHp`, function() {

    it(`no test for timer`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})


describe(`setIntervalHp settle(R-PM-SETTLE-01)`, function() {

    it(`setIntervalHp: async回呼reject不產生未處理之rejection, 以console.log記錄 [規則2、10]`, function() {
        let { r } = runPmSettle('hpAsyncReject')
        let { called, loggedInterval } = r.out
        assert.strict.deepStrictEqual({ called, loggedInterval }, { called: true, loggedInterval: true })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

})


describe(`setIntervalHp 非函數(R-PM-SETTLE-01規則12)`, function() {

    it(`fun非函數時每次到期皆以console.log記錄Error('fn is not a function'), 呼叫停止函數後不再記錄 [規則12]`, function() {
        let r = runHp('intervalNonFun')
        let { seq, logsAt2, minElapsed, minGap, after } = r.out
        //R-PM-SETTLE-01 規則12: setIntervalHp每次到期記錄(寫入JSDoc); JSDoc setIntervalHp「fun非函數時每次到期皆以console.log記錄Error('fn is not a function')，直至呼叫停止函數」
        //每次到期皆記錄: 第2次到期之結果(即將記錄)時已記錄2筆, 到期與結果一一對應(fun非函數之state為invalid)
        assert.strict.deepStrictEqual(seq, ['start', 'fire#1', 'result#1:invalid', 'fire#2', 'result#2:invalid', 'stop'])
        assert.strict.deepStrictEqual(logsAt2, ['fn is not a function', 'fn is not a function'])
        //JSDoc interval「時間間隔」: 到期不早於interval(下界, 不受負載影響), 相鄰兩次到期之間隔亦不小於interval
        assert.strict.deepStrictEqual(minElapsed >= 20, true)
        assert.strict.deepStrictEqual(minGap >= 20 - tol, true)
        //呼叫停止函數後不再到期與記錄(觀察窗內, 停止本身已由'stop'事件斷言)
        assert.strict.deepStrictEqual(after, { events: 0, logs: 0 })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})


describe(`setIntervalHp interval驗證與重疊調用`, function() {

    let msg = 'interval is not a positive finite number'

    it(`should not start for an invalid interval, log the Error once, and return a callable stop function`, function() {
        let r = runHp('intervalInvalid')
        let labels = ['0', '-5', 'NaN', 'Infinity', '-Infinity', '"abc"', '""', '" "', 'null', 'true', '{}', '[]']
        //JSDoc interval「須為正有限數」、@returns「interval為無效值時不啟動計時、不調用fun，以console.log記錄Error('interval is not a positive finite number')一次，此時仍回傳停止函數(呼叫無作用)」
        //記錄、回傳與事件(無start)為呼叫當下同步可見; 觀察窗(100ms)後仍無調用fun、無通知、無額外記錄(否定斷言)
        assert.strict.deepStrictEqual(r.out.items, labels.map((v) => ({ v, ret: 'function', stopOk: true, logs: [msg], events: 0, calls: 0 })))
        assert.strict.deepStrictEqual(r.out.totalLogs, labels.length)
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`should start for a valid interval (omitted, integer, decimal, numeric string with spaces), fire no earlier than it, and log nothing`, function() {
        let r = runHp('intervalValid')
        //JSDoc interval「預設1」「須為正有限數(通常為正整數，數字字串亦可)」; elapsed「必不小於interval」(下界, 不受負載影響)
        assert.strict.deepStrictEqual(r.out.out, ['undefined', '1', '0.5', '"20"', '" 20 "', '20.5'].map((v) => ({ v, elapsedOk: true })))
        assert.strict.deepStrictEqual(r.out.logs, [])
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`should call fun again at each expiry without waiting for the previous async call, so slow calls overlap like setInterval`, function() {
        let r = runHp('intervalOverlap')
        //JSDoc @returns「到期即調用fun，不等待前一次調用之Promise完成(與原生setInterval相同)，故fun為非同步函數且執行時間長於interval時，各次調用會重疊執行」
        //前2次調用之Promise在第3次調用前皆未settle: 第3個fire事件時已調用3次、3次皆執行中, 且此前無任何result事件
        assert.strict.deepStrictEqual(r.out.seq, ['start', 'fire#1', 'fire#2', 'fire#3'])
        assert.strict.deepStrictEqual(r.out.atThird, { calls: 3, active: 3, maxActive: 3 })
        //停止後釋放3次調用, 不再通知、不記錄
        assert.strict.deepStrictEqual({ activeAfter: r.out.activeAfter, logs: r.out.logs }, { activeAfter: 0, logs: [] })
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})


describe(`setIntervalHp 觀察回調(onTrace)`, function() {

    it(`should notify each expiry, its result (success, error, cancelled) and stop in order, log only errors, and never fire earlier than interval`, function() {
        let r = runHp('intervalStates')
        let { seq, order, logs, calls, minElapsed, minGap } = r.out
        //JSDoc 'fire'為即將調用fun、'result'為該次調用已有結果而即將記錄(error才console.log)、'stop'為呼叫停止函數; n為對應之到期次數
        assert.strict.deepStrictEqual(seq, ['start', 'fire#1', 'result#1:success', 'fire#2', 'result#2:error', 'fire#3', 'result#3:cancelled', 'fire#4', 'result#4:error', 'stop'])
        //fire於調用fun之前、result於調用fun之後(每次到期各1次調用)
        assert.strict.deepStrictEqual(order, ['start', 'fire', 'call1', 'result', 'fire', 'call2', 'result', 'fire', 'call3', 'result', 'fire', 'call4', 'result', 'stop'])
        assert.strict.deepStrictEqual(calls, 4)
        //JSDoc 「fun同步拋錯或其Promise被reject時以console.log記錄」: 同步拋錯與reject各記錄1筆, 成功與取消不記錄
        assert.strict.deepStrictEqual(logs, ['boom2', 'boom4'])
        //JSDoc elapsed「必不小於interval」與相鄰到期之間隔(以調用後重新起算, 故不小於interval)
        assert.strict.deepStrictEqual(minElapsed >= 50, true)
        assert.strict.deepStrictEqual(minGap >= 50 - tol, true)
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`should not notify after the stop function is called, even for a call whose result settles later, and notify stop only once`, function() {
        let r = runHp('intervalStop')
        let { seq, nStop, calls, logs } = r.out
        //JSDoc 'stop'僅首次通知、停止後不再通知(含停止前已調用而尚未有結果者); 回傳之停止函數呼叫後不再調用fun
        assert.strict.deepStrictEqual(seq, ['start', 'fire#1', 'stop'])
        assert.strict.deepStrictEqual(nStop, 3)
        assert.strict.deepStrictEqual(calls, 1)
        assert.strict.deepStrictEqual(logs, [])
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(第3參數可省略, 同舊版之setIntervalHp(fun, interval)); P4: 回調之拋錯與回傳值不影響計時與調用、不產生未處理之rejection
        //假時鐘控制不了hrtime計時, 故五種模式於真實計時器下各跑同一情境, 以事件(fun之第3次調用、記錄筆數)為同步點
        let r = runHp('intervalP34')
        let exp = { calls: [1, 2, 3], logs: ['boom2', 'fn is not a function', 'fn is not a function'], stops: ['function', 'function'] }
        assert.strict.deepStrictEqual(r.out.results, [exp, exp, exp, exp, exp])
        //紀錄器確實收到事件
        assert.strict.deepStrictEqual(r.out.recTypes, ['fire', 'result', 'start', 'stop'])
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

    it(`should notify through onTrace with frozen events of primitive fields and no receiver`, function() {
        //R-TRACE-01 P4: 事件為凍結物件、各type之欄位固定且皆為原始值、回調不帶接收者
        let r = runHp('intervalStates')
        assert.strict.deepStrictEqual(r.out.keys, {
            start: 'type',
            fire: 'type,n,elapsed',
            result: 'type,n,state',
            stop: 'type',
        })
        assert.strict.deepStrictEqual(r.out.primitive, true)
        assert.strict.deepStrictEqual(r.out.plain, true)
    })

})
