import assert from 'assert'
//import setIntervalHp from '../src/setIntervalHp.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


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
        let { r } = runPmSettle('nonFunHp')
        let { intervalLogsAtLeast2, noMoreAfterStop } = r.out
        //R-PM-SETTLE-01 規則12: setIntervalHp每次到期記錄(寫入JSDoc); JSDoc setIntervalHp:23「fun非函數時每次到期皆以console.log記錄Error('fn is not a function')，直至呼叫停止函數」
        assert.strict.deepStrictEqual({ intervalLogsAtLeast2, noMoreAfterStop }, { intervalLogsAtLeast2: true, noMoreAfterStop: true })
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})
