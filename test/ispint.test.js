import assert from 'assert'
import ispint from '../src/ispint.mjs'


describe('ispint', function() {

    it("should return false when input '2019/01/01'", function() {
        let r = ispint('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21/01'", function() {
        let r = ispint('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01'", function() {
        let r = ispint('2019/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21'", function() {
        let r = ispint('2019/21')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input function() {}', function() {
        let r = ispint(function() {})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 0', function() {
        let r = ispint(0)
        assert.strict.deepEqual(r, false)
    })

    it('should return true when input 125', function() {
        let r = ispint(125)
        assert.strict.deepEqual(r, true)
    })

    it('should return false when input -125', function() {
        let r = ispint(-125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 1.25', function() {
        let r = ispint(1.25)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -1.25', function() {
        let r = ispint(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '0'", function() {
        let r = ispint('0')
        assert.strict.deepEqual(r, false)
    })

    it("should return true when input '125'", function() {
        let r = ispint('125')
        assert.strict.deepEqual(r, true)
    })

    it("should return false when input '-125'", function() {
        let r = ispint('-125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '1.25'", function() {
        let r = ispint('1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '-1.25'", function() {
        let r = ispint('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125abc'", function() {
        let r = ispint('125abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc125'", function() {
        let r = ispint('abc125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12a5'", function() {
        let r = ispint('12a5')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ''", function() {
        let r = ispint('')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input false', function() {
        let r = ispint(false)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input []', function() {
        let r = ispint([])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{}]', function() {
        let r = ispint([{}])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{ a: 123 }]', function() {
        let r = ispint([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['']", function() {
        let r = ispint([''])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['abc']", function() {
        let r = ispint(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input {}', function() {
        let r = ispint({})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123 }', function() {
        let r = ispint({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123, b: null, c: [45.67] }', function() {
        let r = ispint({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input null', function() {
        let r = ispint(null)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input undefined', function() {
        let r = ispint(undefined)
        assert.strict.deepEqual(r, false)
    })

})
