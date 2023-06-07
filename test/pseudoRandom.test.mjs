import assert from 'assert'
import pseudoRandom from '../src/pseudoRandom.mjs'


describe(`pseudoRandom`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故seed=start1(1)須手動測試

    it(`should return 0.6964691872708499 when input 123`, function() {
        let r = pseudoRandom(123)
        let rr = 0.6964691872708499
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.8510874302592129 when input 12.3`, function() {
        let r = pseudoRandom(12.3)
        let rr = 0.8510874302592129
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.3307915215846151 when input 'abc(1)'`, function() {
        let r = pseudoRandom('abc')
        let rr = 0.3307915215846151
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.3307915215846151 when input 'abc(2)'`, function() {
        let r = pseudoRandom('abc')
        let rr = 0.3307915215846151
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.5120985466055572 when input 'def'`, function() {
        let r = pseudoRandom('def')
        let rr = 0.5120985466055572
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.4488659054040909 when input 'BH-01:S-123'`, function() {
        let r = pseudoRandom('BH-01:S-123')
        let rr = 0.4488659054040909
        assert.strict.deepStrictEqual(r, rr)
    })

})
