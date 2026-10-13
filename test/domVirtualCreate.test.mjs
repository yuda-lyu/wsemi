import assert from 'assert'
//import domVirtualCreate from '../src/domVirtualCreate.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


describe(`domVirtualCreate`, function() {

    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})


describe(`domVirtualCreate settle(R-PM-SETTLE-01)`, function() {

    it(`domVirtualCreate: 成功與失敗皆移除臨時元素, 失敗reject原值 [規則5]`, function() {
        let { r } = runPmSettle('domVirtualCreateCleanup')
        assert.strict.deepStrictEqual(r.out, {
            syncThrow: { s: 'reject', same: true, left: 0 },
            asyncReject: { s: 'reject', same: true, left: 0 },
            ok: { s: 'resolve', v: 'b64', left: 0 },
        })
    })

    it(`domVirtualCreate: fun自行移除臨時元素後失敗, 仍reject原錯誤 [規則5]`, function() {
        let { r } = runPmSettle('domVirtualCreateSelfRemove')
        assert.strict.deepStrictEqual(r.out, { s: 'reject', same: true, left: 0 })
    })

})
