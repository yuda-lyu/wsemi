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

    it(`should return 0.6314232510048896 when input null, null, 'abc'`, function() {
        let r = pseudoRandomRange(null, null, 'abc')
        let rr = 0.6314232510048896
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.6314232510048896 when input null, null, 'abc'`, function() {
        let r = pseudoRandomRange(null, null, 'abc')
        let rr = 0.6314232510048896
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.9743434484116733 when input null, null, 'def'`, function() {
        let r = pseudoRandomRange(null, null, 'def')
        let rr = 0.9743434484116733
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.007978770649060607 when input null, null, 'BH01S123'`, function() {
        let r = pseudoRandomRange(null, null, 'BH01S123')
        let rr = 0.007978770649060607
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.9579511017072946 when input null, null, 'BH-01:S-123'`, function() {
        let r = pseudoRandomRange(null, null, 'BH-01:S-123')
        let rr = 0.9579511017072946
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

    it(`should return 292.90449274657294 when input 12.3, 456.7, 'abc'`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 'abc')
        let rr = 292.90449274657294
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 292.90449274657294 when input 12.3, 456.7, 'abc'`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 'abc')
        let rr = 292.90449274657294
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 445.2982284741476 when input 12.3, 456.7, 'def'`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 'def')
        let rr = 445.2982284741476
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 15.845765676442534 when input 12.3, 456.7, 'BH01S123'`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 'BH01S123')
        let rr = 15.845765676442534
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 438.0134695987217 when input 12.3, 456.7, 'BH-01:S-123'`, function() {
        let r = pseudoRandomRange(12.3, 456.7, 'BH-01:S-123')
        let rr = 438.0134695987217
        assert.strict.deepStrictEqual(r, rr)
    })

})
