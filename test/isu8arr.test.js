import assert from 'assert'
import isu8arr from '../src/isu8arr.mjs'


describe('isu8arr', function() {

    it("should return true when input new Uint8Array([1, 2.3, '45', 'abc'])", function() {
        let u8a = new Uint8Array([1, 2.3, '45', 'abc'])
        let r = isu8arr(u8a)
        assert.strict.deepEqual(r, true)
    })

    it("should return false when input '2019/01/01 12:34:56:789'", function() {
        let r = isu8arr('2019/01/01 12:34:56:789')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01/01 12:34:66:789'", function() {
        let r = isu8arr('2019/01/01 12:34:66:789')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01/01 12:34:56'", function() {
        let r = isu8arr('2019/01/01 12:34:56')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01/01 12:34:66'", function() {
        let r = isu8arr('2019/01/01 12:34:66')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21/01 12:34:56'", function() {
        let r = isu8arr('2019/21/01 12:34:56')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01/01'", function() {
        let r = isu8arr('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21/01'", function() {
        let r = isu8arr('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/01'", function() {
        let r = isu8arr('2019/01')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '2019/21'", function() {
        let r = isu8arr('2019/21')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input function() {}', function() {
        let r = isu8arr(function() {})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 0', function() {
        let r = isu8arr(0)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 125', function() {
        let r = isu8arr(125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -125', function() {
        let r = isu8arr(-125)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input 1.25', function() {
        let r = isu8arr(1.25)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input -1.25', function() {
        let r = isu8arr(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '0'", function() {
        let r = isu8arr('0')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125'", function() {
        let r = isu8arr('125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '-125'", function() {
        let r = isu8arr('-125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '1.25'", function() {
        let r = isu8arr('1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '-1.25'", function() {
        let r = isu8arr('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '125abc'", function() {
        let r = isu8arr('125abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc125'", function() {
        let r = isu8arr('abc125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abC125'", function() {
        let r = isu8arr('abC125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'ABC125'", function() {
        let r = isu8arr('ABC125')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc'", function() {
        let r = isu8arr('abc')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'ABC'", function() {
        let r = isu8arr('ABC')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '中文'", function() {
        let r = isu8arr('中文')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'abc中文'", function() {
        let r = isu8arr('abc中文')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input 'ABC中文'", function() {
        let r = isu8arr('ABC中文')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '1234中文'", function() {
        let r = isu8arr('1234中文')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12.34中文'", function() {
        let r = isu8arr('12.34中文')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input '12a5'", function() {
        let r = isu8arr('12a5')
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ''", function() {
        let r = isu8arr('')
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input false', function() {
        let r = isu8arr(false)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input []', function() {
        let r = isu8arr([])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{}]', function() {
        let r = isu8arr([{}])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input [{ a: 123 }]', function() {
        let r = isu8arr([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['']", function() {
        let r = isu8arr([''])
        assert.strict.deepEqual(r, false)
    })

    it("should return false when input ['abc']", function() {
        let r = isu8arr(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input {}', function() {
        let r = isu8arr({})
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123 }', function() {
        let r = isu8arr({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input { a: 123, b: null, c: [45.67] }', function() {
        let r = isu8arr({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input null', function() {
        let r = isu8arr(null)
        assert.strict.deepEqual(r, false)
    })

    it('should return false when input undefined', function() {
        let r = isu8arr(undefined)
        assert.strict.deepEqual(r, false)
    })

})
