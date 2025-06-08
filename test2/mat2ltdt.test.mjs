import assert from 'assert'
import mat2ltdt from '../src/mat2ltdt.mjs'


describe(`mat2ltdt`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in: [['a', 'b'], [12, 34.56], ['x', '12.34']],
        out: [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 1
        let r = mat2ltdt(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        in: [['a', 'b'], [12, 34.56, 999], ['x', '12.34', 'abc']],
        out: [{ a: 12, b: 34.56 }, { a: 'x', b: '12.34' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 2
        let r = mat2ltdt(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        in: [['a', 'b', 'c'], [12, 34.56], ['x', '12.34']],
        out: [{ a: 12, b: 34.56, c: '' }, { a: 'x', b: '12.34', c: '' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}`, function() {
        k = 3
        let r = mat2ltdt(o[k].in)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = mat2ltdt('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = mat2ltdt([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = mat2ltdt({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = mat2ltdt(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = mat2ltdt(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input NaN`, function() {
        let r = mat2ltdt(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
