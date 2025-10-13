import assert from 'assert'
import isfile from '../src/isfile.mjs'


describe(`isfile`, function() {

    //nodejs沒有File，只有瀏覽器才有

    it(`should return false when input new ArrayBuffer(1)`, function() {
        let ab = new ArrayBuffer(1)
        let r = isfile(ab)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input new Uint8Array(1)`, function() {
        let u8a = new Uint8Array(1)
        let r = isfile(u8a)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56:789+08:00'`, function() {
        let r = isfile('2019-01-01T12:34:56:789+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:66:789+08:00'`, function() {
        let r = isfile('2019-01-01T12:34:66:789+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56+08:00'`, function() {
        let r = isfile('2019-01-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:66+08:00'`, function() {
        let r = isfile('2019-01-01T12:34:66+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56+08:00'`, function() {
        let r = isfile('2019-21-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01'`, function() {
        let r = isfile('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isfile('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isfile('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isfile('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isfile(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isfile(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isfile(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isfile(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isfile(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isfile(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = isfile('0')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isfile('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = isfile('-125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isfile('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isfile('-1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isfile('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isfile('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abC125'`, function() {
        let r = isfile('abC125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC125'`, function() {
        let r = isfile('ABC125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc'`, function() {
        let r = isfile('abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC'`, function() {
        let r = isfile('ABC')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '中文'`, function() {
        let r = isfile('中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc中文'`, function() {
        let r = isfile('abc中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC中文'`, function() {
        let r = isfile('ABC中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1234中文'`, function() {
        let r = isfile('1234中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12.34中文'`, function() {
        let r = isfile('12.34中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isfile('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isfile('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isfile(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isfile([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isfile([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isfile([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isfile([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isfile(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isfile({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isfile({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isfile({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isfile(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isfile(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isfile(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
