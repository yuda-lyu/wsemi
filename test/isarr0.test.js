import assert from 'assert'
import isarr0 from '../src/isarr0.mjs'


describe('isarr0', function() {

    it("should return false when input '1.25'", function() {
        let r = isarr0('1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125'", function() {
        let r = isarr0('125')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 125', function() {
        let r = isarr0(125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -125', function() {
        let r = isarr0(-125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 1.25', function() {
        let r = isarr0(1.25)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -1.25', function() {
        let r = isarr0(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125abc'", function() {
        let r = isarr0('125abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc125'", function() {
        let r = isarr0('abc125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12a5'", function() {
        let r = isarr0('12a5')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ''", function() {
        let r = isarr0('')
        assert.strict.deepEqual(r, false)
    })

    it('should return true when input []', function() {
        let r = isarr0([])
        assert.strict.deepEqual(r, true)
    })

    it('should return false when input [{}]', function() {
        let r = isarr0([{}])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{ a: 123 }]', function() {
        let r = isarr0([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['']", function() {
        let r = isarr0([''])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['abc']", function() {
        let r = isarr0(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input {}', function() {
        let r = isarr0({})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123 }', function() {
        let r = isarr0({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123, b: null, c: [45.67] }', function() {
        let r = isarr0({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input null', function() {
        let r = isarr0(null)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input undefined', function() {
        let r = isarr0(undefined)
        assert.strict.deepEqual(r, false)
    })

})
