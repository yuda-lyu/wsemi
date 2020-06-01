import assert from 'assert'
import arr2dt from '../src/arr2dt.mjs'


describe(`arr2dt`, function() {

    it(`should return { 'a': '', 'b': '' } when input ['a','b']`, function() {
        let r = arr2dt(['a', 'b'])
        let rr = { 'a': '', 'b': '' }
        assert.strict.deepEqual(r, rr)
    })

    it(`should return { a: 'xyz', b: 'xyz' } when input ['a', 'b'], 'xyz'`, function() {
        let r = arr2dt(['a', 'b'], 'xyz')
        let rr = { a: 'xyz', b: 'xyz' }
        assert.strict.deepEqual(r, rr)
    })

    it(`should return { a: null, b: null } when ['a', 'b'], null`, function() {
        let r = arr2dt(['a', 'b'], null)
        let rr = { a: null, b: null }
        assert.strict.deepEqual(r, rr)
    })

    it(`should return { 'a': 12.3, 'b': '456a' } when input ['a', 'b'], [12.3, '456a']`, function() {
        let r = arr2dt(['a', 'b'], [12.3, '456a'])
        let rr = { 'a': 12.3, 'b': '456a' }
        assert.strict.deepEqual(r, rr)
    })

    it(`should return { 'a': null, 'b': '456a' } when input ['a', 'b'], [null, '456a']`, function() {
        let r = arr2dt(['a', 'b'], [null, '456a'])
        let rr = { 'a': null, 'b': '456a' }
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input ['a', 'b'], [12.3]`, function() {
        let r = arr2dt(['a', 'b'], [12.3])
        let rr = { }
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input ['a', 'b'], {}`, function() {
        let r = arr2dt(['a', 'b'], {})
        let rr = { a: {}, b: {} }
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input 123.456, 1`, function() {
        let r = arr2dt(123.456, 1)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input '123.456', 1`, function() {
        let r = arr2dt('123.456', 1)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input '', 1`, function() {
        let r = arr2dt('', 1)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input [], 1`, function() {
        let r = arr2dt([], 1)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input {}, 1`, function() {
        let r = arr2dt({}, 1)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input null, 1`, function() {
        let r = arr2dt(null, 1)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input undefined, 1`, function() {
        let r = arr2dt(undefined, 1)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input 123.456`, function() {
        let r = arr2dt(123.456)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input '123.456'`, function() {
        let r = arr2dt('123.456')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input ''`, function() {
        let r = arr2dt('')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input []`, function() {
        let r = arr2dt([])
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = arr2dt({})
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input null`, function() {
        let r = arr2dt(null)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it(`should return {} when input undefined`, function() {
        let r = arr2dt(undefined)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

})
