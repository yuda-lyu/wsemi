import assert from 'assert'
import pseudoRandomIntsNdpRange from '../src/pseudoRandomIntsNdpRange.mjs'


describe(`pseudoRandomIntsNdpRange`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故seed=start1(1)須手動測試

    it(`should return [ 94, 76 ] when input null, null, 2, 123`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 123)
        let rr = [94, 76]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 69, 82 ] when input null, null, 2, 12.3`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 12.3)
        let rr = [69, 82]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 20, 28 ] when input null, null, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 'abc')
        let rr = [20, 28]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 20, 28 ] when input null, null, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 'abc')
        let rr = [20, 28]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 64, 34 ] when input null, null, 2, 'def'`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 'def')
        let rr = [64, 34]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0, 26 ] when input null, null, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 'BH01S123')
        let rr = [0, 26]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 71, 77 ] when input null, null, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsNdpRange(null, null, 2, 'BH-01:S-123')
        let rr = [71, 77]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 94, 76 ] when input 0, 100, 2, 123`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 123)
        let rr = [94, 76]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 69, 82 ] when input 0, 100, 2, 12.3`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 12.3)
        let rr = [69, 82]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 20, 28 ] when input 0, 100, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 'abc')
        let rr = [20, 28]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 20, 28 ] when input 0, 100, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 'abc')
        let rr = [20, 28]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 64, 34 ] when input 0, 100, 2, 'def'`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 'def')
        let rr = [64, 34]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0, 26 ] when input 0, 100, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 'BH01S123')
        let rr = [0, 26]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 71, 77 ] when input 0, 100, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsNdpRange(0, 100, 2, 'BH-01:S-123')
        let rr = [71, 77]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 2528, 3854 ] when input 123, 4567, 2, 123`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 123)
        let rr = [2528, 3854]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 1818, 4334 ] when input 123, 4567, 2, 12.3`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 12.3)
        let rr = [1818, 4334]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 478, 3303 ] when input 123, 4567, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 'abc')
        let rr = [478, 3303]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 478, 3303 ] when input 123, 4567, 2, 'abc'`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 'abc')
        let rr = [478, 3303]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 983, 3133 ] when input 123, 4567, 2, 'def'`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 'def')
        let rr = [983, 3133]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 2866, 183 ] when input 123, 4567, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 'BH01S123')
        let rr = [2866, 183]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 3888, 249 ] when input 123, 4567, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsNdpRange(123, 4567, 2, 'BH-01:S-123')
        let rr = [3888, 249]
        assert.strict.deepStrictEqual(r, rr)
    })

})
