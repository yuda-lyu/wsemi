import assert from 'assert'
import arrpick from '../src/arrpick.mjs'


describe(`arrpick`, function() {

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
        let r = arrpick(inp, ['a', 'b'])
        let rr = out1
        assert.strict.deepEqual(r, rr)
    })

    let out2 = [
        { a: 'a123', c: 'abc' },
        { a: '1b23', c: '123XYZ' },
        { a: '12c3', c: null }
    ]

    it(`should return ${JSON.stringify(out2)} when input ${JSON.stringify(inp)}, ['a', 'c', 'x']`, function() {
        let r = arrpick(inp, ['a', 'c', 'x'])
        let rr = out2
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ''`, function() {
        let r = arrpick('')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input []`, function() {
        let r = arrpick([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input {}`, function() {
        let r = arrpick({})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input null`, function() {
        let r = arrpick(null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input undefined`, function() {
        let r = arrpick(undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], ''`, function() {
        let r = arrpick([], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], []`, function() {
        let r = arrpick([], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], {}`, function() {
        let r = arrpick([], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], null`, function() {
        let r = arrpick([], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], undefined`, function() {
        let r = arrpick([], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], ''`, function() {
        let r = arrpick(['abc'], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], []`, function() {
        let r = arrpick(['abc'], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], {}`, function() {
        let r = arrpick(['abc'], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], null`, function() {
        let r = arrpick(['abc'], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], undefined`, function() {
        let r = arrpick(['abc'], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

})
