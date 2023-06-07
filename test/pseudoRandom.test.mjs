import assert from 'assert'
import pseudoRandom from '../src/pseudoRandom.mjs'


describe(`pseudoRandom`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故本函數須手動測試
    it(`need test manually`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    // it(`should return 0.6964691872708499 when input 123`, function() {
    //     let r = pseudoRandom(123)
    //     let rr = 0.6964691872708499
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return 0.4488659054040909 when input 'abc'`, function() {
    //     let r = pseudoRandom('abc')
    //     let rr = 0.4488659054040909
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return 0.4170219984371215 when input 'start1(1)'`, function() {
    //     let r = pseudoRandom('start1')
    //     let rr = 0.4170219984371215
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return 0.5665697017684579 when input 'start1(2)'`, function() {
    //     let r = pseudoRandom('start1')
    //     let rr = 0.5665697017684579
    //     assert.strict.deepStrictEqual(r, rr)
    // })

})
