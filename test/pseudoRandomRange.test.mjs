import assert from 'assert'
import pseudoRandomRange from '../src/pseudoRandomRange.mjs'


describe(`pseudoRandomRange`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故本函數須手動測試
    it(`need test manually`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    // it(`should return 0.4170219984371215 when input undefined`, function() {
    //     let r = pseudoRandomRange()
    //     let rr = 0.4170219984371215
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return 0.5665697017684579 when input 0, 1`, function() {
    //     let r = pseudoRandomRange(0, 1)
    //     let rr = 0.5665697017684579
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return 257.074588704668 when input 12.3, 456.7`, function() {
    //     let r = pseudoRandomRange(12.3, 456.7)
    //     let rr = 257.074588704668
    //     assert.strict.deepStrictEqual(r, rr)
    // })

})
