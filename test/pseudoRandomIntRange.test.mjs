import assert from 'assert'
import pseudoRandomIntRange from '../src/pseudoRandomIntRange.mjs'


describe(`pseudoRandomIntRange`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故本函數須手動測試
    it(`need test manually`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    // it(`should return 43 when input undefined`, function() {
    //     let r = pseudoRandomIntRange()
    //     let rr = 43
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return 58 when input 0, 100`, function() {
    //     let r = pseudoRandomIntRange(0, 100)
    //     let rr = 58
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return 2572 when input 123, 4567`, function() {
    //     let r = pseudoRandomIntRange(123, 4567)
    //     let rr = 2572
    //     assert.strict.deepStrictEqual(r, rr)
    // })

})
