import assert from 'assert'
import rep from '../src/rep.mjs'


describe('rep', function() {

    it("should return 'abcabc' when input 'abc', 2", function() {
        let r = rep('abc', 2)
        assert.strict.deepEqual(r, 'abcabc')
    })

    it("should return '' when input 'abc', 0", function() {
        let r = rep('abc', 0)
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input 'abc', -1", function() {
        let r = rep('abc', -1)
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input ''", function() {
        let r = rep('')
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input []", function() {
        let r = rep([])
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input {}", function() {
        let r = rep({})
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input null", function() {
        let r = rep(null)
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input undefined", function() {
        let r = rep(undefined)
        assert.strict.deepEqual(r, '')
    })

})
