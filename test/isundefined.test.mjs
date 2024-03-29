import assert from 'assert'
import isundefined from '../src/isundefined.mjs'


describe(`isundefined`, function() {

    it(`should return false when input new Uint8Array([1, 2.3, '45', 'abc'])`, function() {
        let u8a = new Uint8Array([1, 2.3, '45', 'abc'])
        let r = isundefined(u8a)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56:789+08:00'`, function() {
        let r = isundefined('2019-01-01T12:34:56:789+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:66:789+08:00'`, function() {
        let r = isundefined('2019-01-01T12:34:66:789+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56+08:00'`, function() {
        let r = isundefined('2019-01-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:66+08:00'`, function() {
        let r = isundefined('2019-01-01T12:34:66+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56+08:00'`, function() {
        let r = isundefined('2019-21-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01'`, function() {
        let r = isundefined('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isundefined('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isundefined('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isundefined('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isundefined(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isundefined(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isundefined(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isundefined(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isundefined(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isundefined(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = isundefined('0')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isundefined('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = isundefined('-125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isundefined('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isundefined('-1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isundefined('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isundefined('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abC125'`, function() {
        let r = isundefined('abC125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC125'`, function() {
        let r = isundefined('ABC125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc'`, function() {
        let r = isundefined('abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC'`, function() {
        let r = isundefined('ABC')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '中文'`, function() {
        let r = isundefined('中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc中文'`, function() {
        let r = isundefined('abc中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC中文'`, function() {
        let r = isundefined('ABC中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1234中文'`, function() {
        let r = isundefined('1234中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12.34中文'`, function() {
        let r = isundefined('12.34中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isundefined('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isundefined('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isundefined(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isundefined([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isundefined([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isundefined([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isundefined([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isundefined(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isundefined({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isundefined({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isundefined({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isundefined(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input undefined`, function() {
        let r = isundefined(undefined)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input NaN`, function() {
        let r = isundefined(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
