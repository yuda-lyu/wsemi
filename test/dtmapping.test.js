import assert from 'assert'
import dtmapping from '../src/dtmapping.mjs'


describe(`dtmapping`, function() {

    it(`should return { a: 'a123', b: 234 } when input { a: 'a123', b: 234, c: '345' }, ['a', 'b']`, function() {
        let r = dtmapping({ a: 'a123', b: 234, c: '345' }, ['a', 'b'])
        let rr = { a: 'a123', b: 234 }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 'a123', b: 234, x: '' } when input { a: 'a123', b: 234, c: '345' }, ['a', 'b', 'x']`, function() {
        let r = dtmapping({ a: 'a123', b: 234, c: '345' }, ['a', 'b', 'x'])
        let rr = { a: 'a123', b: 234, x: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { x: '', y: '' } when input { a: 'a123', b: 234, c: '345' }, ['x', 'y']`, function() {
        let r = dtmapping({ a: 'a123', b: 234, c: '345' }, ['x', 'y'])
        let rr = { x: '', y: '' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, ''`, function() {
        let r = dtmapping({ a: 'a123', b: 234, c: '345' }, '')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, []`, function() {
        let r = dtmapping({ a: 'a123', b: 234, c: '345' }, [])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, {}`, function() {
        let r = dtmapping({ a: 'a123', b: 234, c: '345' }, {})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, null`, function() {
        let r = dtmapping({ a: 'a123', b: 234, c: '345' }, null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input { a: 'a123', b: 234, c: '345' }, undefined`, function() {
        let r = dtmapping({ a: 'a123', b: 234, c: '345' }, undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input '100abc'`, function() {
        let r = dtmapping('100abc')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input ''`, function() {
        let r = dtmapping('')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input []`, function() {
        let r = dtmapping([])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = dtmapping({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input null`, function() {
        let r = dtmapping(null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input undefined`, function() {
        let r = dtmapping(undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

})
