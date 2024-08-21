import assert from 'assert'
import pseudoRandomsRange from '../src/pseudoRandomsRange.mjs'


describe(`pseudoRandomsRange`, function() {

    //因平行化測試故呼叫順序不同, 導致連續相依性測試會無法一致, 故seed=start1(1)須手動測試

    it(`should return [ 0.6964691872708499, 0.28155276202596724 ] when input null, null, 2, 123`, function() {
        let r = pseudoRandomsRange(null, null, 2, 123)
        let rr = [0.6964691872708499, 0.28155276202596724]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0.8510874302592129, 0.5495069304015487 ] when input null, null, 2, 12.3`, function() {
        let r = pseudoRandomsRange(null, null, 2, 12.3)
        let rr = [0.8510874302592129, 0.5495069304015487]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0.6314232510048896, 0.7160592079162598 ] when input null, null, 2, 'abc'`, function() {
        let r = pseudoRandomsRange(null, null, 2, 'abc')
        let rr = [0.6314232510048896, 0.7160592079162598]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0.6314232510048896, 0.7160592079162598 ] when input null, null, 2, 'abc'`, function() {
        let r = pseudoRandomsRange(null, null, 2, 'abc')
        let rr = [0.6314232510048896, 0.7160592079162598]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0.9743434484116733, 0.6514900834299624 ] when input null, null, 2, 'def'`, function() {
        let r = pseudoRandomsRange(null, null, 2, 'def')
        let rr = [0.9743434484116733, 0.6514900834299624]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0.007978770649060607, 0.5637312876060605 ] when input null, null, 2, 'BH01S123'`, function() {
        let r = pseudoRandomsRange(null, null, 2, 'BH01S123')
        let rr = [0.007978770649060607, 0.5637312876060605]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0.9579511017072946, 0.24845449766144156 ] when input null, null, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomsRange(null, null, 2, 'BH-01:S-123')
        let rr = [0.9579511017072946, 0.24845449766144156]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 321.81090682316574, 137.42204744433985 ] when input 12.3, 456.7, 2, 123`, function() {
        let r = pseudoRandomsRange(12.3, 456.7, 2, 123)
        let rr = [321.81090682316574, 137.42204744433985]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 390.52325400719417, 256.5008798704483 ] when input 12.3, 456.7, 2, 12.3`, function() {
        let r = pseudoRandomsRange(12.3, 456.7, 2, 12.3)
        let rr = [390.52325400719417, 256.5008798704483]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 292.90449274657294, 330.51671199798585 ] when input 12.3, 456.7, 2, 'abc'`, function() {
        let r = pseudoRandomsRange(12.3, 456.7, 2, 'abc')
        let rr = [292.90449274657294, 330.51671199798585]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 292.90449274657294, 330.51671199798585 ] when input 12.3, 456.7, 2, 'abc'`, function() {
        let r = pseudoRandomsRange(12.3, 456.7, 2, 'abc')
        let rr = [292.90449274657294, 330.51671199798585]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 445.2982284741476, 301.8221930762753 ] when input 12.3, 456.7, 2, 'def'`, function() {
        let r = pseudoRandomsRange(12.3, 456.7, 2, 'def')
        let rr = [445.2982284741476, 301.8221930762753]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 15.845765676442534, 262.82218421213327 ] when input 12.3, 456.7, 2, 'BH01S123'`, function() {
        let r = pseudoRandomsRange(12.3, 456.7, 2, 'BH01S123')
        let rr = [15.845765676442534, 262.82218421213327]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 438.0134695987217, 122.71317876074463 ] when input 12.3, 456.7, 2, 'BH-01:S-123'`, function() {
        let r = pseudoRandomsRange(12.3, 456.7, 2, 'BH-01:S-123')
        let rr = [438.0134695987217, 122.71317876074463]
        assert.strict.deepStrictEqual(r, rr)
    })

})
