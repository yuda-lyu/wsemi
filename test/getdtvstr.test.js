import assert from 'assert'
import getdtvstr from '../src/getdtvstr.mjs'


describe('getdtvstr', function() {

    it("should return '123' when input { a: 123, b: 'xyz', c: '45op', d: null }, 'a'", function() {
        let r = getdtvstr({ a: 123, b: 'xyz', c: '45op', d: null }, 'a')
        let rr = '123'
        assert.strict.deepEqual(r, rr)
    })

    it("should return '45op' when input { a: 123, b: 'xyz', c: '45op', d: null }, 'c'", function() {
        let r = getdtvstr({ a: 123, b: 'xyz', c: '45op', d: null }, 'c')
        let rr = '45op'
        assert.strict.deepEqual(r, rr)
    })

    it("should return null when input { a: 123, b: 'xyz', c: '45op', d: null }, 'd'", function() {
        let r = getdtvstr({ a: 123, b: 'xyz', c: '45op', d: null }, 'd')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it("should return 'WzEsIjMiLCJhYmMiXQ==' when input [1, '3', 'abc', null], 'abc'", function() {
        let r = getdtvstr([1, '3', 'abc', null], 'abc')
        assert.strict.deepEqual(r, '')
    })

    it("should return 123 when input { a: 123, b: 'xyz', c: '45op', d: null }", function() {
        let r = getdtvstr({ a: 123, b: 'xyz', c: '45op', d: null })
        assert.strict.deepEqual(r, '')
    })

    it("sould return '' when input ''", function() {
        let r = getdtvstr('')
        assert.strict.deepEqual(r, '')
    })

    it("sould return '' when input []", function() {
        let r = getdtvstr([])
        assert.strict.deepEqual(r, '')
    })

    it("sould return '' when input {}", function() {
        let r = getdtvstr({})
        assert.strict.deepEqual(r, '')
    })

    it("sould return '' when input null", function() {
        let r = getdtvstr(null)
        assert.strict.deepEqual(r, '')
    })

    it("sould return '' when input undefined", function() {
        let r = getdtvstr(undefined)
        assert.strict.deepEqual(r, '')
    })

})
