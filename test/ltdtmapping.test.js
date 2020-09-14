import assert from 'assert'
import ltdtmapping from '../src/ltdtmapping.mjs'


describe(`ltdtmapping`, function() {

    let inp = [
        { a: 'a123', b: 123, c: 'abc' },
        { a: '1b23', b: 456, c: '123XYZ' },
        { a: '12c3', b: 789.0123, c: null }
    ]
    let out1 = [
        { a: 'a123', b: 123 },
        { a: '1b23', b: 456 },
        { a: '12c3', b: 789.0123 }
    ]

    it(`should return ${JSON.stringify(out1)} when input ${JSON.stringify(inp)}, ['a', 'b']`, function() {
        let r = ltdtmapping(inp, ['a', 'b'])
        let rr = out1
        assert.strict.deepStrictEqual(r, rr)
    })

    let out2 = [
        { a: 'a123', c: 'abc', x: '' },
        { a: '1b23', c: '123XYZ', x: '' },
        { a: '12c3', c: null, x: '' }
    ]
    it(`should return ${JSON.stringify(out2)} when input ${JSON.stringify(inp)}, ['a', 'c', 'x']`, function() {
        let r = ltdtmapping(inp, ['a', 'c', 'x'])
        let rr = out2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ''`, function() {
        let r = ltdtmapping('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input []`, function() {
        let r = ltdtmapping([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input {}`, function() {
        let r = ltdtmapping({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input null`, function() {
        let r = ltdtmapping(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input undefined`, function() {
        let r = ltdtmapping(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], ''`, function() {
        let r = ltdtmapping([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], []`, function() {
        let r = ltdtmapping([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], {}`, function() {
        let r = ltdtmapping([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], null`, function() {
        let r = ltdtmapping([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], undefined`, function() {
        let r = ltdtmapping([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], ''`, function() {
        let r = ltdtmapping(['abc'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], []`, function() {
        let r = ltdtmapping(['abc'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], {}`, function() {
        let r = ltdtmapping(['abc'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], null`, function() {
        let r = ltdtmapping(['abc'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], undefined`, function() {
        let r = ltdtmapping(['abc'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
