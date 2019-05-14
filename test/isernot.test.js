import assert from 'assert'
import isernot from '../src/isernot.mjs'


describe('isernot', function() {

    it("should return true when input '2019/01/01'", function() {
        let r = isernot('2019/01/01')
        assert.strict.deepEqual(r, true)
    })

    it("should return true when input '2019/21/01'", function() {
        let r = isernot('2019/21/01')
        assert.strict.deepEqual(r, true)
    })

    it("should return true when input '1.25'", function() {
        let r = isernot('1.25')
        assert.strict.deepEqual(r, true)
    })

    it("should return true when input '125'", function() {
        let r = isernot('125')
        assert.strict.deepEqual(r, true)
    })

    it('should return true when input 125', function() {
        let r = isernot(125)
        assert.strict.deepEqual(r, true)
    })

    it('should return true when input -125', function() {
        let r = isernot(-125)
        assert.strict.deepEqual(r, true)
    })

    it('should return true when input 1.25', function() {
        let r = isernot(1.25)
        assert.strict.deepEqual(r, true)
    })

    it('should return true when input -1.25', function() {
        let r = isernot(-1.25)
        assert.strict.deepEqual(r, true)
    })

    it("should return true when input '125abc'", function() {
        let r = isernot('125abc')
        assert.strict.deepEqual(r, true)
    })

    it("should return true when input 'abc125'", function() {
        let r = isernot('abc125')
        assert.strict.deepEqual(r, true)
    })

    it("should return true when input '12a5'", function() {
        let r = isernot('12a5')
        assert.strict.deepEqual(r, true)
    })

    it("should return false when input ''", function() {
        let r = isernot('')
        assert.strict.deepEqual(r, false)
    })

    it('should return true when input false', function() {
        let r = isernot(false)
        assert.strict.deepEqual(r, true)
    })

    it('should return false when input []', function() {
        let r = isernot([])
        assert.strict.deepEqual(r, false)
    })

    it('should return true when input [{}]', function() {
        let r = isernot([{}])
        assert.strict.deepEqual(r, true)
    })

    it('should return true when input [{ a: 123 }]', function() {
        let r = isernot([{ a: 123 }])
        assert.strict.deepEqual(r, true)
    })

    it("should return true when input ['']", function() {
        let r = isernot([''])
        assert.strict.deepEqual(r, true)
    })

    it("should return true when input ['abc']", function() {
        let r = isernot(['abc'])
        assert.strict.deepEqual(r, true)
    })

    it('should return false when input {}', function() {
        let r = isernot({})
        assert.strict.deepEqual(r, false)
    })

    it('should return true when input { a: 123 }', function() {
        let r = isernot({ a: 123 })
        assert.strict.deepEqual(r, true)
    })

    it('should return true when input { a: 123, b: null, c: [45.67] }', function() {
        let r = isernot({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, true)
    })

    it('should return false when input null', function() {
        let r = isernot(null)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input undefined', function() {
        let r = isernot(undefined)
        assert.strict.deepEqual(r, false)
    })

})
