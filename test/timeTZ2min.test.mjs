import assert from 'assert'
import timeTZ2min from '../src/timeTZ2min.mjs'


describe(`timeTZ2min`, function() {

    it(`should return '' when input new ArrayBuffer(1)`, function() {
        let ab = new ArrayBuffer(1)
        let r = timeTZ2min(ab)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input new Uint8Array(1)`, function() {
        let u8a = new Uint8Array(1)
        let r = timeTZ2min(u8a)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:56:789'`, function() {
        let r = timeTZ2min('2019-01-01T12:34:56:789')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:66:789'`, function() {
        let r = timeTZ2min('2019-01-01T12:34:66:789')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '2019-01-01T12:34' when input '2019-01-01T12:34:56'`, function() {
        let r = timeTZ2min('2019-01-01T12:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:66'`, function() {
        let r = timeTZ2min('2019-01-01T12:34:66')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-01T12:34:56'`, function() {
        let r = timeTZ2min('2019-21-01T12:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:56:789+08:00'`, function() {
        let r = timeTZ2min('2019-01-01T12:34:56:789+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:66:789+08:00'`, function() {
        let r = timeTZ2min('2019-01-01T12:34:66:789+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '2019-01-01T12:34' when input '2019-01-01T12:34:56+08:00'`, function() {
        let r = timeTZ2min('2019-01-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '2019-01-01T12:34')
    })

    it(`should return '' when input '2019-01-01T12:34:66+08:00'`, function() {
        let r = timeTZ2min('2019-01-01T12:34:66+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-01T12:34:56+08:00'`, function() {
        let r = timeTZ2min('2019-21-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01'`, function() {
        let r = timeTZ2min('2019-01-01')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-01'`, function() {
        let r = timeTZ2min('2019-21-01')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01'`, function() {
        let r = timeTZ2min('2019-01')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21'`, function() {
        let r = timeTZ2min('2019-21')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input function() {}`, function() {
        let r = timeTZ2min(function() {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 0`, function() {
        let r = timeTZ2min(0)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 125`, function() {
        let r = timeTZ2min(125)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -125`, function() {
        let r = timeTZ2min(-125)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 1.25`, function() {
        let r = timeTZ2min(1.25)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 1.5`, function() {
        let r = timeTZ2min(1.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 2.5`, function() {
        let r = timeTZ2min(2.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -1.25`, function() {
        let r = timeTZ2min(-1.25)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -1.5`, function() {
        let r = timeTZ2min(-1.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -2.5`, function() {
        let r = timeTZ2min(-2.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '0'`, function() {
        let r = timeTZ2min('0')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '125'`, function() {
        let r = timeTZ2min('125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-125'`, function() {
        let r = timeTZ2min('-125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25'`, function() {
        let r = timeTZ2min('1')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.5'`, function() {
        let r = timeTZ2min('1.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2.5'`, function() {
        let r = timeTZ2min('2.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-1.25'`, function() {
        let r = timeTZ2min('-1.25')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-1.5'`, function() {
        let r = timeTZ2min('-1.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-2.5'`, function() {
        let r = timeTZ2min('-2.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '125abc'`, function() {
        let r = timeTZ2min('125abc')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc125'`, function() {
        let r = timeTZ2min('abc125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abC125'`, function() {
        let r = timeTZ2min('abC125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC125'`, function() {
        let r = timeTZ2min('ABC125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc'`, function() {
        let r = timeTZ2min('abc')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC'`, function() {
        let r = timeTZ2min('ABC')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '中文'`, function() {
        let r = timeTZ2min('中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc中文'`, function() {
        let r = timeTZ2min('abc中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC中文'`, function() {
        let r = timeTZ2min('ABC中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1234中文'`, function() {
        let r = timeTZ2min('1234中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '12.34中文'`, function() {
        let r = timeTZ2min('12.34中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '12a5'`, function() {
        let r = timeTZ2min('12a5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = timeTZ2min('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input false`, function() {
        let r = timeTZ2min(false)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = timeTZ2min([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input [{}]`, function() {
        let r = timeTZ2min([{}])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input [{ a: 123 }]`, function() {
        let r = timeTZ2min([{ a: 123 }])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ['']`, function() {
        let r = timeTZ2min([''])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ['abc']`, function() {
        let r = timeTZ2min(['abc'])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = timeTZ2min({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input { a: 123 }`, function() {
        let r = timeTZ2min({ a: 123 })
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = timeTZ2min({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = timeTZ2min(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = timeTZ2min(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = timeTZ2min(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

})
