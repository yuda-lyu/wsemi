import assert from 'assert'
import pseudoRandomIntsRange from '../src/pseudoRandomIntsRange.mjs'


describe(`pseudoRandomIntsRange`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故seed=start1(1)須手動測試

    it(`should return [ 71, 29 ] when input null, null, 2, 123`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 123)
        let rr = [71, 29]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 86, 56 ] when input null, null, 2, 12.3`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 12.3)
        let rr = [86, 56]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 64, 73 ] when input null, null, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 'abc')
        let rr = [64, 73]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 64, 73 ] when input null, null, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 'abc')
        let rr = [64, 73]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 99, 66 ] when input null, null, 2, 'def'`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 'def')
        let rr = [99, 66]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 1, 57 ] when input null, null, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 'BH01S123')
        let rr = [1, 57]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 97, 26 ] when input null, null, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 'BH-01:S-123')
        let rr = [97, 26]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 71, 29 ] when input 0, 100, 2, 123`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 123)
        let rr = [71, 29]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 86, 56 ] when input 0, 100, 2, 12.3`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 12.3)
        let rr = [86, 56]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 64, 73 ] when input 0, 100, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 'abc')
        let rr = [64, 73]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 64, 73 ] when input 0, 100, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 'abc')
        let rr = [64, 73]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 99, 66 ] when input 0, 100, 2, 'def'`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 'def')
        let rr = [99, 66]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 1, 57 ] when input 0, 100, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 'BH01S123')
        let rr = [1, 57]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 97, 26 ] when input 0, 100, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 'BH-01:S-123')
        let rr = [97, 26]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 3219, 1375 ] when input 123, 4567, 2, 123`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 123)
        let rr = [3219, 1375]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 3907, 2566 ] when input 123, 4567, 2, 12.3`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 12.3)
        let rr = [3907, 2566]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 2930, 3306 ] when input 123, 4567, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 'abc')
        let rr = [2930, 3306]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 2930, 3306 ] when input 123, 4567, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 'abc')
        let rr = [2930, 3306]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 4454, 3019 ] when input 123, 4567, 2, 'def'`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 'def')
        let rr = [4454, 3019]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 159, 2629 ] when input 123, 4567, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 'BH01S123')
        let rr = [159, 2629]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 4382, 1228 ] when input 123, 4567, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 'BH-01:S-123')
        let rr = [4382, 1228]
        assert.strict.deepStrictEqual(r, rr)
    })

})
