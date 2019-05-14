import assert from 'assert'
import isnint from '../src/isnint.mjs'


describe('isnint', function() {

    it("should return false when input '2019/01/01'", function() {
        let r = isnint('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21/01'", function() {
        let r = isnint('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01'", function() {
        let r = isnint('2019/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21'", function() {
        let r = isnint('2019/21')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input function() {}', function() {
        let r = isnint(function() {})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 0', function() {
        let r = isnint(0)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 125', function() {
        let r = isnint(125)
        assert.strict.deepEqual(r, false)
    })

    it('should return true when input -125', function() {
        let r = isnint(-125)
        assert.strict.deepEqual(r, true)
    })

    it('should return false when input 1.25', function() {
        let r = isnint(1.25)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -1.25', function() {
        let r = isnint(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '0'", function() {
        let r = isnint('0')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125'", function() {
        let r = isnint('125')
        assert.strict.deepEqual(r, false)
    })

    it("should return true when input '-125'", function() {
        let r = isnint('-125')
        assert.strict.deepEqual(r, true)
    })

    it("should return false when input '1.25'", function() {
        let r = isnint('1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '-1.25'", function() {
        let r = isnint('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125abc'", function() {
        let r = isnint('125abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc125'", function() {
        let r = isnint('abc125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12a5'", function() {
        let r = isnint('12a5')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ''", function() {
        let r = isnint('')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input false', function() {
        let r = isnint(false)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input []', function() {
        let r = isnint([])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{}]', function() {
        let r = isnint([{}])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{ a: 123 }]', function() {
        let r = isnint([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['']", function() {
        let r = isnint([''])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['abc']", function() {
        let r = isnint(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input {}', function() {
        let r = isnint({})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123 }', function() {
        let r = isnint({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123, b: null, c: [45.67] }', function() {
        let r = isnint({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input null', function() {
        let r = isnint(null)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input undefined', function() {
        let r = isnint(undefined)
        assert.strict.deepEqual(r, false)
    })

})
