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

    it(`should return 34 when input null, null, 'abc'`, function() {
        let r = pseudoRandomIntRange(null, null, 'abc')
        let rr = 34
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 34 when input null, null, 'abc'`, function() {
        let r = pseudoRandomIntRange(null, null, 'abc')
        let rr = 34
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 52 when input null, null, 'def'`, function() {
        let r = pseudoRandomIntRange(null, null, 'def')
        let rr = 52
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 46 when input null, null, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntRange(null, null, 'BH-01:S-123')
        let rr = 46
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

    it(`should return 34 when input 0, 100, 'abc'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'abc')
        let rr = 34
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 34 when input 0, 100, 'abc'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'abc')
        let rr = 34
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 52 when input 0, 100, 'def'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'def')
        let rr = 52
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 46 when input 0, 100, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntRange(0, 100, 'BH-01:S-123')
        let rr = 46
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

    it(`should return 1594 when input 123, 4567, 'abc'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'abc')
        let rr = 1594
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1594 when input 123, 4567, 'abc'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'abc')
        let rr = 1594
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2400 when input 123, 4567, 'def'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'def')
        let rr = 2400
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2119 when input 123, 4567, 'BH-01:S-123'`, function() {
        let r = pseudoRandomIntRange(123, 4567, 'BH-01:S-123')
        let rr = 2119
        assert.strict.deepStrictEqual(r, rr)
    })

})
