import assert from 'assert'
import ltdtpick from '../src/ltdtpick.mjs'


describe(`ltdtpick`, function() {

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
        let r = ltdtpick(inp, ['a', 'b'])
        let rr = out1
        assert.strict.deepStrictEqual(r, rr)
    })

    let out2 = [
        { a: 'a123', c: 'abc' },
        { a: '1b23', c: '123XYZ' },
        { a: '12c3', c: null }
    ]

    it(`should return ${JSON.stringify(out2)} when input ${JSON.stringify(inp)}, ['a', 'c', 'x']`, function() {
        let r = ltdtpick(inp, ['a', 'c', 'x'])
        let rr = out2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = ltdtpick('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = ltdtpick([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = ltdtpick({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = ltdtpick(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = ltdtpick(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = ltdtpick([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = ltdtpick([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = ltdtpick([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = ltdtpick([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = ltdtpick([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = ltdtpick(['abc'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = ltdtpick(['abc'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = ltdtpick(['abc'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = ltdtpick(['abc'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = ltdtpick(['abc'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
