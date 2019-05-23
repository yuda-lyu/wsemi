import assert from 'assert'
import getObjSize from '../src/getObjSize.mjs'


describe(`getObjSize`, function() {

    it(`should return 12 when input 'abc123'`, function() {
        let r = getObjSize('abc123')
        let rr = 12
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 8 when input 123.456`, function() {
        let r = getObjSize(123.456)
        let rr = 8
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 22 when input { a: 123, b: 'xyz', c: '45op', d: null }`, function() {
        let r = getObjSize({ a: 123, b: 'xyz', c: '45op', d: null })
        let rr = 22
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 10 when input [1, '3']`, function() {
        let r = getObjSize([1, '3'])
        let rr = 10
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 16 when input [1, '3', 'abc']`, function() {
        let r = getObjSize([1, '3', 'abc'])
        let rr = 16
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 16 when input [1, '3', 'abc', null]`, function() {
        let r = getObjSize([1, '3', 'abc', null])
        let rr = 16
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 16 when input [1, '3', 'abc', null, undefined]`, function() {
        let r = getObjSize([1, '3', 'abc', null, undefined])
        let rr = 16
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 44 when input [{ a: 123, b: 'xyz', c: '45op', d: null }, { aa: 123.456, bb: 'xyz', d: '45op', e: null, f: undefined }]`, function() {
        let r = getObjSize([{ a: 123, b: 'xyz', c: '45op', d: null }, { aa: 123.456, bb: 'xyz', d: '45op', e: null, f: undefined }])
        let rr = 44
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 0 when input ''`, function() {
        let r = getObjSize('')
        let rr = 0
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 0 when input []`, function() {
        let r = getObjSize([])
        let rr = 0
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 0 when input {}`, function() {
        let r = getObjSize({})
        let rr = 0
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 0 when input null`, function() {
        let r = getObjSize(null)
        let rr = 0
        assert.strict.deepEqual(r.int, rr)
    })

    it(`should return 0 when input undefined`, function() {
        let r = getObjSize(undefined)
        let rr = 0
        assert.strict.deepEqual(r.int, rr)
    })

})
