import assert from 'assert'
import ltdtkeysheads2mat from '../src/ltdtkeysheads2mat.mjs'


describe(`ltdtkeysheads2mat`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }],
        keys: ['a', 'b'],
        kphead: { a: 'c1', b: 'c2' },
        out: [['c1', 'c2'], [12, 34.56], ['123', 'xyz']]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].kphead)}`, function() {
        k = 1
        let r = ltdtkeysheads2mat(o[k].ltdt, o[k].keys, o[k].kphead)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }],
        keys: ['a', 'b'],
        kphead: {},
        out: []
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].kphead)}`, function() {
        k = 2
        let r = ltdtkeysheads2mat(o[k].ltdt, o[k].keys, o[k].kphead)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }],
        keys: [],
        kphead: { a: 'c1', b: 'c2' },
        out: []
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].kphead)}`, function() {
        k = 3
        let r = ltdtkeysheads2mat(o[k].ltdt, o[k].keys, o[k].kphead)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }],
        keys: [],
        kphead: {},
        out: []
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt)}, ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].kphead)}`, function() {
        k = 4
        let r = ltdtkeysheads2mat(o[k].ltdt, o[k].keys, o[k].kphead)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], ''`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], []`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], {}`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], null`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], undefined`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ['a', 'b'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], ''`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], []`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], {}`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], null`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], undefined`, function() {
        let r = ltdtkeysheads2mat([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = ltdtkeysheads2mat('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = ltdtkeysheads2mat([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = ltdtkeysheads2mat({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = ltdtkeysheads2mat(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = ltdtkeysheads2mat(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
