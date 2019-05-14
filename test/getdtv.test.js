import assert from 'assert'
import getdtv from '../src/getdtv.mjs'


describe('getdtv', function() {

    it("should return 123 when input { a: 123, b: 'xyz', c: '45op', d: null }, 'a'", function() {
        let r = getdtv({ a: 123, b: 'xyz', c: '45op', d: null }, 'a')
        let rr = 123
        assert.strict.deepEqual(r, rr)
    })

    it("should return '45op' when input { a: 123, b: 'xyz', c: '45op', d: null }, 'c'", function() {
        let r = getdtv({ a: 123, b: 'xyz', c: '45op', d: null }, 'c')
        let rr = '45op'
        assert.strict.deepEqual(r, rr)
    })

    it("should return null when input { a: 123, b: 'xyz', c: '45op', d: null }, 'd'", function() {
        let r = getdtv({ a: 123, b: 'xyz', c: '45op', d: null }, 'd')
        let rr = null
        assert.strict.deepEqual(r, rr)
    })

    it("should return 'WzEsIjMiLCJhYmMiXQ==' when input [1, '3', 'abc', null], 'abc'", function() {
        let r = getdtv([1, '3', 'abc', null], 'abc')
        assert.strict.deepEqual(r, '')
    })

    it("should return 123 when input { a: 123, b: 'xyz', c: '45op', d: null }", function() {
        let r = getdtv({ a: 123, b: 'xyz', c: '45op', d: null })
        assert.strict.deepEqual(r, '')
    })

    it("sould return '' when input ''", function() {
        let r = getdtv('')
        assert.strict.deepEqual(r, '')
    })

    it("sould return '' when input []", function() {
        let r = getdtv([])
        assert.strict.deepEqual(r, '')
    })

    it("sould return '' when input {}", function() {
        let r = getdtv({})
        assert.strict.deepEqual(r, '')
    })

    it("sould return '' when input null", function() {
        let r = getdtv(null)
        assert.strict.deepEqual(r, '')
    })

    it("sould return '' when input undefined", function() {
        let r = getdtv(undefined)
        assert.strict.deepEqual(r, '')
    })

})
