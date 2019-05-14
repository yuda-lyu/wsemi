import assert from 'assert'
import istime from '../src/istime.mjs'


describe('istime', function() {

    it("should return false when input '2019/01/01 12:34:56:789'", function() {
        let r = istime('2019/01/01 12:34:56:789')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01/01 12:34:66:789'", function() {
        let r = istime('2019/01/01 12:34:66:789')
        assert.strict.deepEqual(r, false)
    })

    it("should return true when input '2019/01/01 12:34:56'", function() {
        let r = istime('2019/01/01 12:34:56')
        assert.strict.deepEqual(r, true)
    })

    it("should return false when input '2019/01/01 12:34:66'", function() {
        let r = istime('2019/01/01 12:34:66')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21/01 12:34:56'", function() {
        let r = istime('2019/21/01 12:34:56')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01/01'", function() {
        let r = istime('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21/01'", function() {
        let r = istime('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01'", function() {
        let r = istime('2019/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21'", function() {
        let r = istime('2019/21')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input function() {}', function() {
        let r = istime(function() {})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 0', function() {
        let r = istime(0)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 125', function() {
        let r = istime(125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -125', function() {
        let r = istime(-125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 1.25', function() {
        let r = istime(1.25)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -1.25', function() {
        let r = istime(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '0'", function() {
        let r = istime('0')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125'", function() {
        let r = istime('125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '-125'", function() {
        let r = istime('-125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '1.25'", function() {
        let r = istime('1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '-1.25'", function() {
        let r = istime('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125abc'", function() {
        let r = istime('125abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc125'", function() {
        let r = istime('abc125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abC125'", function() {
        let r = istime('abC125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'ABC125'", function() {
        let r = istime('ABC125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc'", function() {
        let r = istime('abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'ABC'", function() {
        let r = istime('ABC')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '中文'", function() {
        let r = istime('中文')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc中文'", function() {
        let r = istime('abc中文')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'ABC中文'", function() {
        let r = istime('ABC中文')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '1234中文'", function() {
        let r = istime('1234中文')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12.34中文'", function() {
        let r = istime('12.34中文')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12a5'", function() {
        let r = istime('12a5')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ''", function() {
        let r = istime('')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input false', function() {
        let r = istime(false)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input []', function() {
        let r = istime([])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{}]', function() {
        let r = istime([{}])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{ a: 123 }]', function() {
        let r = istime([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['']", function() {
        let r = istime([''])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['abc']", function() {
        let r = istime(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input {}', function() {
        let r = istime({})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123 }', function() {
        let r = istime({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123, b: null, c: [45.67] }', function() {
        let r = istime({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input null', function() {
        let r = istime(null)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input undefined', function() {
        let r = istime(undefined)
        assert.strict.deepEqual(r, false)
    })

})
