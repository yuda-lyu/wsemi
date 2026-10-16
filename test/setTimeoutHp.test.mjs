import assert from 'assert'
//import setTimeoutHp from '../src/setTimeoutHp.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


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
