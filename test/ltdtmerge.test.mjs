import assert from 'assert'
import ltdtmerge from '../src/ltdtmerge.mjs'


describe('ltdtmerge', function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        ltdt1: [{ a: 12, b: 34.56 }, {}],
        ltdt2: [{ a: '123', c: 'mn' }, { aa: 'a123', bb: 'bmn' }],
        out: [{ a: '123', b: 34.56, c: 'mn' }, { aa: 'a123', bb: 'bmn' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt1)}, ${JSON.stringify(o[k].ltdt2)}`, function() {
        k = 1
        let r = ltdtmerge(o[k].ltdt1, o[k].ltdt2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input [{ a: 12, b: 34.56 }, { a: \'123\', b: \'xyz\', c: \'mn\' }], \'\'', function() {
        let r = ltdtmerge([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input [{ a: 12, b: 34.56 }, { a: \'123\', b: \'xyz\', c: \'mn\' }], []', function() {
        let r = ltdtmerge([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input [{ a: 12, b: 34.56 }, { a: \'123\', b: \'xyz\', c: \'mn\' }], {}', function() {
        let r = ltdtmerge([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input [{ a: 12, b: 34.56 }, { a: \'123\', b: \'xyz\', c: \'mn\' }], null', function() {
        let r = ltdtmerge([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input [{ a: 12, b: 34.56 }, { a: \'123\', b: \'xyz\', c: \'mn\' }], undefined', function() {
        let r = ltdtmerge([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input \'\'', function() {
        let r = ltdtmerge('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input []', function() {
        let r = ltdtmerge([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input {}', function() {
        let r = ltdtmerge({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input null', function() {
        let r = ltdtmerge(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input undefined', function() {
        let r = ltdtmerge(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input NaN', function() {
        let r = ltdtmerge(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
