import assert from 'assert'
//import importResources from '../src/importResources.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


describe(`importResources`, function() {

    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

})


describe(`importResources settle(R-PM-SETTLE-01)`, function() {

    it(`importResources: pathItem.func拋錯時reject該錯誤, 不懸置且無未處理之rejection [規則1、2]`, function() {
        let { r } = runPmSettle('importResourcesFuncThrows')
        assert.strict.deepStrictEqual(r.out, { s: 'reject', msg: 'func boom' })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`importResources: 載入中之後到者與首位同成敗, 失敗後之呼叫可重新載入 [規則1、5]`, function() {
        let { r } = runPmSettle('importResourcesConcurrent')
        //retry之funcCalls為2: 失敗後之呼叫確實重新載入(再次呼叫func), 而非直接回'loaded'
        assert.strict.deepStrictEqual(r.out, { first: { s: 'reject', msg: 'func boom 1' }, concurrent: { s: 'reject', msg: 'func boom 1' }, retry: { s: 'resolve', funcCalls: 2 } })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`importResources: 不同組共用同一路徑時, 該路徑載入中之後到者亦與首位同成敗 [規則1、5]`, function() {
        let { r } = runPmSettle('importResourcesSharedPath')
        assert.strict.deepStrictEqual(r.out, { first: { s: 'reject', msg: 'func boom c' }, otherGroup: { s: 'reject', msg: 'func boom c' } })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

})
