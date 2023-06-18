import assert from 'assert'
import pseudoRandomIntRange from '../src/pseudoRandomIntRange.mjs'


describe(`pseudoRandomIntRange`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故seed=start1(1)須手動測試

    it(`should return 71 when input null, null, 123`, function() {
        let r = pseudoRandomIntRange(null, null, 123)
        let rr = 71
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 86 when input null, null, 12.3`, function() {
        let r = pseudoRandomIntRange(null, null, 12.3)
        let rr = 86
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 64 when input null, null, 'abc'`, function() {
        let r = pseudoRandomIntRange(null, null, 'abc')
        let rr = 64
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 64 when input null, null, 'abc'`, function() {
        let r = pseudoRandomIntRange(null, null, 'abc')
        let rr = 64
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 99 when input null, null, 'def'`, function() {
        let r = pseudoRandomIntRange(null, null, 'def')
        let rr = 99
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input null, null, 'BH01S123'`, function() {
        let r = pseudoRandomIntRange(null, null, 'BH01S123')
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 97 when input null, null, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntRange(null, null, 'BH-01:S-123')
        let rr = 97
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 71 when input 0, 100, 123`, function() {
        let r = pseudoRandomIntRange(0, 100, 123)
        let rr = 71
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 86 when input 0, 100, 12.3`, function() {
        let r = pseudoRandomIntRange(0, 100, 12.3)
        let rr = 86
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 64 when input 0, 100, 'abc'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'abc')
        let rr = 64
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 64 when input 0, 100, 'abc'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'abc')
        let rr = 64
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 99 when input 0, 100, 'def'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'def')
        let rr = 99
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 97 when input 0, 100, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'BH-01:S-123')
        let rr = 97
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 3219 when input 123, 4567, 123`, function() {
        let r = pseudoRandomIntRange(123, 4567, 123)
        let rr = 3219
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 3907 when input 123, 4567, 12.3`, function() {
        let r = pseudoRandomIntRange(123, 4567, 12.3)
        let rr = 3907
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2930 when input 123, 4567, 'abc'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'abc')
        let rr = 2930
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2930 when input 123, 4567, 'abc'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'abc')
        let rr = 2930
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 4454 when input 123, 4567, 'def'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'def')
        let rr = 4454
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 159 when input 123, 4567, 'BH01S123'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'BH01S123')
        let rr = 159
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 4382 when input 123, 4567, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'BH-01:S-123')
        let rr = 4382
        assert.strict.deepStrictEqual(r, rr)
    })

})
