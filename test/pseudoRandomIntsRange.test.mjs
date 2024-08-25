import assert from 'assert'
import pseudoRandomIntsRange from '../src/pseudoRandomIntsRange.mjs'


describe(`pseudoRandomIntsRange`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故seed=start1(1)須手動測試

    it(`should return [ 70, 28 ] when input null, null, 2, 123`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 123)
        let rr = [70, 28]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 85, 55 ] when input null, null, 2, 12.3`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 12.3)
        let rr = [85, 55]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 63, 72 ] when input null, null, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 'abc')
        let rr = [63, 72]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 63, 72 ] when input null, null, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 'abc')
        let rr = [63, 72]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 98, 65 ] when input null, null, 2, 'def'`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 'def')
        let rr = [98, 65]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0, 56 ] when input null, null, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 'BH01S123')
        let rr = [0, 56]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 96, 25 ] when input null, null, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsRange(null, null, 2, 'BH-01:S-123')
        let rr = [96, 25]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 70, 28 ] when input 0, 100, 2, 123`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 123)
        let rr = [70, 28]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 85, 55 ] when input 0, 100, 2, 12.3`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 12.3)
        let rr = [85, 55]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 63, 72 ] when input 0, 100, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 'abc')
        let rr = [63, 72]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 63, 72 ] when input 0, 100, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 'abc')
        let rr = [63, 72]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 98, 65 ] when input 0, 100, 2, 'def'`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 'def')
        let rr = [98, 65]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0, 56 ] when input 0, 100, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 'BH01S123')
        let rr = [0, 56]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 96, 25 ] when input 0, 100, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsRange(0, 100, 2, 'BH-01:S-123')
        let rr = [96, 25]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 3218, 1374 ] when input 123, 4567, 2, 123`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 123)
        let rr = [3218, 1374]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 3906, 2565 ] when input 123, 4567, 2, 12.3`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 12.3)
        let rr = [3906, 2565]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 2929, 3305 ] when input 123, 4567, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 'abc')
        let rr = [2929, 3305]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 2929, 3305 ] when input 123, 4567, 2, 'abc'`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 'abc')
        let rr = [2929, 3305]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 4453, 3018 ] when input 123, 4567, 2, 'def'`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 'def')
        let rr = [4453, 3018]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 158, 2628 ] when input 123, 4567, 2, 'BH01S123'`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 'BH01S123')
        let rr = [158, 2628]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 4381, 1227 ] when input 123, 4567, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntsRange(123, 4567, 2, 'BH-01:S-123')
        let rr = [4381, 1227]
        assert.strict.deepStrictEqual(r, rr)
    })

})
