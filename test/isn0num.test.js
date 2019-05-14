import assert from 'assert'
import isn0num from '../src/isn0num.mjs'


describe('isn0num', function() {

    it("should return false when input '2019/01/01'", function() {
        let r = isn0num('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21/01'", function() {
        let r = isn0num('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01'", function() {
        let r = isn0num('2019/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21'", function() {
        let r = isn0num('2019/21')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input function() {}', function() {
        let r = isn0num(function() {})
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '1.25'", function() {
        let r = isn0num('1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125'", function() {
        let r = isn0num('125')
        assert.strict.deepEqual(r, false)
    })

    it('should return true when input 0', function() {
        let r = isn0num(0)
        assert.strict.deepEqual(r, true)
    })

    it('should return false when input 125', function() {
        let r = isn0num(125)
        assert.strict.deepEqual(r, false)
    })

    it('should return true when input -125', function() {
        let r = isn0num(-125)
        assert.strict.deepEqual(r, true)
    })

    it('should return false when input 1.25', function() {
        let r = isn0num(1.25)
        assert.strict.deepEqual(r, false)
    })

    it('should return true when input -1.25', function() {
        let r = isn0num(-1.25)
        assert.strict.deepEqual(r, true)
    })

    it("should return false when input '125abc'", function() {
        let r = isn0num('125abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc125'", function() {
        let r = isn0num('abc125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12a5'", function() {
        let r = isn0num('12a5')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ''", function() {
        let r = isn0num('')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input false', function() {
        let r = isn0num(false)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input []', function() {
        let r = isn0num([])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{}]', function() {
        let r = isn0num([{}])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{ a: 123 }]', function() {
        let r = isn0num([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['']", function() {
        let r = isn0num([''])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['abc']", function() {
        let r = isn0num(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input {}', function() {
        let r = isn0num({})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123 }', function() {
        let r = isn0num({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123, b: null, c: [45.67] }', function() {
        let r = isn0num({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input null', function() {
        let r = isn0num(null)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input undefined', function() {
        let r = isn0num(undefined)
        assert.strict.deepEqual(r, false)
    })

})
