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
