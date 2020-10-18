import assert from 'assert'
import dtpick from '../src/dtpick.mjs'


describe(`dtpick`, function() {

    it(`should return { a: 'a123', b: 234 } when input { a: 'a123', b: 234, c: '345' }, ['a', 'b']`, function() {
        let r = dtpick({ a: 'a123', b: 234, c: '345' }, ['a', 'b'])
        let rr = { a: 'a123', b: 234 }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 'a123', b: 234 } when input { a: 'a123', b: 234, c: '345' }, ['a', 'b', 'x']`, function() {
        let r = dtpick({ a: 'a123', b: 234, c: '345' }, ['a', 'b', 'x'])
        let rr = { a: 'a123', b: 234 }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, ['x', 'y']`, function() {
        let r = dtpick({ a: 'a123', b: 234, c: '345' }, ['x', 'y'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, ''`, function() {
        let r = dtpick({ a: 'a123', b: 234, c: '345' }, '')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, []`, function() {
        let r = dtpick({ a: 'a123', b: 234, c: '345' }, [])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, {}`, function() {
        let r = dtpick({ a: 'a123', b: 234, c: '345' }, {})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, null`, function() {
        let r = dtpick({ a: 'a123', b: 234, c: '345' }, null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, undefined`, function() {
        let r = dtpick({ a: 'a123', b: 234, c: '345' }, undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input '100abc'`, function() {
        let r = dtpick('100abc')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input ''`, function() {
        let r = dtpick('')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input []`, function() {
        let r = dtpick([])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = dtpick({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input null`, function() {
        let r = dtpick(null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input undefined`, function() {
        let r = dtpick(undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

})
