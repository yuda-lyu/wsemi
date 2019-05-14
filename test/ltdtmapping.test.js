import assert from 'assert'
import ltdtmapping from '../src/ltdtmapping.mjs'


describe('ltdtmapping', function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }],
        keys: ['a', 'b', 'c'],
        out: [{ a: 12, b: 34.56, c: '' }, { a: '123', b: 'xyz', c: 'mn' }]
    }
    it('should return ' + JSON.stringify(o[k].out) + ' when input ' + JSON.stringify(o[k].ltdt) + ', ' + JSON.stringify(o[k].keys), function() {
        k = 1
        let r = ltdtmapping(o[k].ltdt, o[k].keys)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 2
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }],
        keys: ['b', 'c'],
        out: [{ b: 34.56, c: '' }, { b: 'xyz', c: 'mn' }]
    }
    it('should return ' + JSON.stringify(o[k].out) + ' when input ' + JSON.stringify(o[k].ltdt) + ', ' + JSON.stringify(o[k].keys), function() {
        k = 2
        let r = ltdtmapping(o[k].ltdt, o[k].keys)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    k = 3
    o[k] = {
        ltdt: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }],
        keys: ['x'],
        out: [{ x: '' }, { x: '' }]
    }
    it('should return ' + JSON.stringify(o[k].out) + ' when input ' + JSON.stringify(o[k].ltdt) + ', ' + JSON.stringify(o[k].keys), function() {
        k = 3
        let r = ltdtmapping(o[k].ltdt, o[k].keys)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], ''`, function() {
        let r = ltdtmapping([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], []`, function() {
        let r = ltdtmapping([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], {}`, function() {
        let r = ltdtmapping([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], null`, function() {
        let r = ltdtmapping([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], undefined`, function() {
        let r = ltdtmapping([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = ltdtmapping('')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = ltdtmapping([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = ltdtmapping({})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = ltdtmapping(null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = ltdtmapping(undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

})
