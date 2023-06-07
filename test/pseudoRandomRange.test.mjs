import assert from 'assert'
import pseudoRandomRange from '../src/pseudoRandomRange.mjs'


describe(`pseudoRandomRange`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故seed=start1(1)須手動測試

    it(`should return 0.6964691872708499 when input null, null, 123`, function() {
        let r = pseudoRandomRange(null, null, 123)
        let rr = 0.6964691872708499
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.8510874302592129 when input null, null, 12.3`, function() {
        let r = pseudoRandomRange(null, null, 12.3)
        let rr = 0.8510874302592129
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.3307915215846151 when input null, null, 'abc'`, function() {
        let r = pseudoRandomRange(null, null, 'abc')
        let rr = 0.3307915215846151
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.3307915215846151 when input null, null, 'abc'`, function() {
        let r = pseudoRandomRange(null, null, 'abc')
        let rr = 0.3307915215846151
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.5120985466055572 when input null, null, 'def'`, function() {
        let r = pseudoRandomRange(null, null, 'def')
        let rr = 0.5120985466055572
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.4488659054040909 when input null, null, 'BH-01:S-123'`, function() {
        let r = pseudoRandomRange(null, null, 'BH-01:S-123')
        let rr = 0.4488659054040909
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 321.81090682316574 when input 12.3, 456.7, 123`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 123)
        let rr = 321.81090682316574
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 390.52325400719417 when input 12.3, 456.7, 12.3`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 12.3)
        let rr = 390.52325400719417
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 159.30375219220295 when input 12.3, 456.7, 'abc'`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 'abc')
        let rr = 159.30375219220295
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 159.30375219220295 when input 12.3, 456.7, 'abc'`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 'abc')
        let rr = 159.30375219220295
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 239.87659411150963 when input 12.3, 456.7, 'def'`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 'def')
        let rr = 239.87659411150963
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 211.776008361578 when input 12.3, 456.7, 'bh-01:s-123'`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 'bh-01:s-123')
        let rr = 211.776008361578
        assert.strict.deepStrictEqual(r, rr)
    })

})
