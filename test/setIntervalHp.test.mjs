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
