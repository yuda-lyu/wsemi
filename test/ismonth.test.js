import assert from 'assert'
import ismonth from '../src/ismonth.mjs'


describe('ismonth', function() {

    it("should return false when input '2019/01/01'", function() {
        let r = ismonth('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21/01'", function() {
        let r = ismonth('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return true when input '2019/01'", function() {
        let r = ismonth('2019/01')
        assert.strict.deepEqual(r, true)
    })

    it("should return false when input '2019/21'", function() {
        let r = ismonth('2019/21')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input function() {}', function() {
        let r = ismonth(function() {})
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '1.25'", function() {
        let r = ismonth('1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125'", function() {
        let r = ismonth('125')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 125', function() {
        let r = ismonth(125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -125', function() {
        let r = ismonth(-125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 1.25', function() {
        let r = ismonth(1.25)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -1.25', function() {
        let r = ismonth(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125abc'", function() {
        let r = ismonth('125abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc125'", function() {
        let r = ismonth('abc125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12a5'", function() {
        let r = ismonth('12a5')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ''", function() {
        let r = ismonth('')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input false', function() {
        let r = ismonth(false)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input []', function() {
        let r = ismonth([])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{}]', function() {
        let r = ismonth([{}])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{ a: 123 }]', function() {
        let r = ismonth([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['']", function() {
        let r = ismonth([''])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['abc']", function() {
        let r = ismonth(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input {}', function() {
        let r = ismonth({})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123 }', function() {
        let r = ismonth({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123, b: null, c: [45.67] }', function() {
        let r = ismonth({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input null', function() {
        let r = ismonth(null)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input undefined', function() {
        let r = ismonth(undefined)
        assert.strict.deepEqual(r, false)
    })

})
