import assert from 'assert'
import isnum from '../src/isnum.mjs'


describe('isnum', function() {

    it("should return true when input '1.25'", function() {
        let r = isnum('1.25')
        assert.strict.deepEqual(r, true)
    })

    it("should return true when input '125'", function() {
        let r = isnum('125')
        assert.strict.deepEqual(r, true)
    })

    it('should return true when input 1.25', function() {
        let r = isnum(1.25)
        assert.strict.deepEqual(r, true)
    })

    it("should return false when input '125abc'", function() {
        let r = isnum('125abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc125'", function() {
        let r = isnum('abc125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12a5'", function() {
        let r = isnum('12a5')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ''", function() {
        let r = isnum('')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input []', function() {
        let r = isnum([])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input {}', function() {
        let r = isnum({})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input null', function() {
        let r = isnum(null)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input undefined', function() {
        let r = isnum(undefined)
        assert.strict.deepEqual(r, false)
    })

})
