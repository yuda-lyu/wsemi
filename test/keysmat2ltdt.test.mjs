import assert from 'assert'
import keysmat2ltdt from '../src/keysmat2ltdt.mjs'


describe(`keysmat2ltdt`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        keys: ['a', 'b'],
        mdata: [[12, 34.56], ['123', 'xyz']],
        out: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].mdata)}`, function() {
        let r = keysmat2ltdt(o[k].keys, o[k].mdata)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        keys: ['a', 'b'],
        mdata: [12, 34.56],
        out: []
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].mdata)}`, function() {
        let r = keysmat2ltdt(o[k].keys, o[k].mdata)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ['a', 'b'], ''`, function() {
        let r = keysmat2ltdt(['a', 'b'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ['a', 'b'], []`, function() {
        let r = keysmat2ltdt(['a', 'b'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ['a', 'b'], {}`, function() {
        let r = keysmat2ltdt(['a', 'b'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ['a', 'b'], null`, function() {
        let r = keysmat2ltdt(['a', 'b'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ['a', 'b'], undefined`, function() {
        let r = keysmat2ltdt(['a', 'b'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = keysmat2ltdt('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = keysmat2ltdt([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = keysmat2ltdt({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = keysmat2ltdt(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = keysmat2ltdt(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
