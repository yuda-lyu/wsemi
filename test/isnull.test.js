import assert from 'assert'
import isnull from '../src/isnull.mjs'


describe('isnull', function() {

    it("should return false when input '2019/01/01'", function() {
        let r = isnull('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21/01'", function() {
        let r = isnull('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01'", function() {
        let r = isnull('2019/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21'", function() {
        let r = isnull('2019/21')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input function() {}', function() {
        let r = isnull(function() {})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 0', function() {
        let r = isnull(0)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 125', function() {
        let r = isnull(125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -125', function() {
        let r = isnull(-125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 1.25', function() {
        let r = isnull(1.25)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -1.25', function() {
        let r = isnull(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '0'", function() {
        let r = isnull('0')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125'", function() {
        let r = isnull('125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '-125'", function() {
        let r = isnull('-125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '1.25'", function() {
        let r = isnull('1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '-1.25'", function() {
        let r = isnull('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125abc'", function() {
        let r = isnull('125abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc125'", function() {
        let r = isnull('abc125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12a5'", function() {
        let r = isnull('12a5')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ''", function() {
        let r = isnull('')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input false', function() {
        let r = isnull(false)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input []', function() {
        let r = isnull([])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{}]', function() {
        let r = isnull([{}])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{ a: 123 }]', function() {
        let r = isnull([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['']", function() {
        let r = isnull([''])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['abc']", function() {
        let r = isnull(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input {}', function() {
        let r = isnull({})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123 }', function() {
        let r = isnull({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123, b: null, c: [45.67] }', function() {
        let r = isnull({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it('should return true when input null', function() {
        let r = isnull(null)
        assert.strict.deepEqual(r, true)
    })

    it('should return false when input undefined', function() {
        let r = isnull(undefined)
        assert.strict.deepEqual(r, false)
    })

})
