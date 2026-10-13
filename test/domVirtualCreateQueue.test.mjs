import assert from 'assert'
//import domVirtualCreateQueue from '../src/domVirtualCreateQueue.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


describe(`domVirtualCreateQueue`, function() {

    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})


describe(`domVirtualCreateQueue settle(R-PM-SETTLE-01)`, function() {

    it(`domVirtualCreateQueue: 失敗後下一個照常且不殘留 [規則3、5]`, function() {
        let { r } = runPmSettle('domVirtualCreateQueueNext')
        assert.strict.deepStrictEqual(r.out, { t1: 'reject', t2: { s: 'resolve', v: 'b64' }, left: 0 })
    })

})
