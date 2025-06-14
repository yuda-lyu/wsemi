import assert from 'assert'
import pseudoRandomIntRange from '../src/pseudoRandomIntRange.mjs'


describe(`pseudoRandomIntRange`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故seed=start1(1)須手動測試

    it(`should return 70 when input null, null, 123`, function() {
        let r = pseudoRandomIntRange(null, null, 123)
        let rr = 70
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 85 when input null, null, 12.3`, function() {
        let r = pseudoRandomIntRange(null, null, 12.3)
        let rr = 85
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 63 when input null, null, 'abc'`, function() {
        let r = pseudoRandomIntRange(null, null, 'abc')
        let rr = 63
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 63 when input null, null, 'abc'`, function() {
        let r = pseudoRandomIntRange(null, null, 'abc')
        let rr = 63
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 98 when input null, null, 'def'`, function() {
        let r = pseudoRandomIntRange(null, null, 'def')
        let rr = 98
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input null, null, 'BH01S123'`, function() {
        let r = pseudoRandomIntRange(null, null, 'BH01S123')
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 96 when input null, null, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntRange(null, null, 'BH-01:S-123')
        let rr = 96
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 70 when input 0, 100, 123`, function() {
        let r = pseudoRandomIntRange(0, 100, 123)
        let rr = 70
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 85 when input 0, 100, 12.3`, function() {
        let r = pseudoRandomIntRange(0, 100, 12.3)
        let rr = 85
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 63 when input 0, 100, 'abc'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'abc')
        let rr = 63
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 63 when input 0, 100, 'abc'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'abc')
        let rr = 63
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 98 when input 0, 100, 'def'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'def')
        let rr = 98
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input 0, 100, 'BH01S123'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'BH01S123')
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 96 when input 0, 100, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'BH-01:S-123')
        let rr = 96
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 3218 when input 123, 4567, 123`, function() {
        let r = pseudoRandomIntRange(123, 4567, 123)
        let rr = 3218
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 3906 when input 123, 4567, 12.3`, function() {
        let r = pseudoRandomIntRange(123, 4567, 12.3)
        let rr = 3906
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2929 when input 123, 4567, 'abc'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'abc')
        let rr = 2929
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2929 when input 123, 4567, 'abc'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'abc')
        let rr = 2929
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 4453 when input 123, 4567, 'def'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'def')
        let rr = 4453
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 158 when input 123, 4567, 'BH01S123'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'BH01S123')
        let rr = 158
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 4381 when input 123, 4567, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'BH-01:S-123')
        let rr = 4381
        assert.strict.deepStrictEqual(r, rr)
    })

})
