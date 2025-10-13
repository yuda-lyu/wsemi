import assert from 'assert'
import ceil from '../src/ceil.mjs'


describe(`ceil`, function() {

    it(`should return 9.84 when input 9.83501, 2`, function() {
        let r = ceil(9.83501, 2)
        assert.strict.deepStrictEqual(r, 9.84)
    })

    it(`should return 9.84 when input 9.8350, 2`, function() {
        let r = ceil(9.8350, 2)
        assert.strict.deepStrictEqual(r, 9.84)
    })

    it(`should return 9.83 when input 9.82501, 2`, function() {
        let r = ceil(9.82501, 2)
        assert.strict.deepStrictEqual(r, 9.83)
    })

    it(`should return 9.83 when input 9.8250, 2`, function() {
        let r = ceil(9.8250, 2)
        assert.strict.deepStrictEqual(r, 9.83)
    })

    it(`should return 9.83 when input 9.8249, 2`, function() {
        let r = ceil(9.8249, 2)
        assert.strict.deepStrictEqual(r, 9.83)
    })

    it(`should return 12.65 when input 12.6449, 2`, function() {
        let r = ceil(12.6449, 2)
        assert.strict.deepStrictEqual(r, 12.65)
    })

    it(`should return 12.65 when input 12.645, 2`, function() {
        let r = ceil(12.645, 2)
        assert.strict.deepStrictEqual(r, 12.65)
    })

    it(`should return 12.65 when input 12.6451, 2`, function() {
        let r = ceil(12.6451, 2)
        assert.strict.deepStrictEqual(r, 12.65)
    })

    it(`should return 12.65 when input 12.65, 2`, function() {
        let r = ceil(12.65, 2)
        assert.strict.deepStrictEqual(r, 12.65)
    })

    it(`should return 12.64 when input 12.64, 2`, function() {
        let r = ceil(12.64, 2)
        assert.strict.deepStrictEqual(r, 12.64)
    })

    it(`should return 12.6 when input 12.6, 2`, function() {
        let r = ceil(12.6, 2)
        assert.strict.deepStrictEqual(r, 12.6)
    })

    it(`should return 12 when input 12, 2`, function() {
        let r = ceil(12, 2)
        assert.strict.deepStrictEqual(r, 12)
    })
    it(`should return '' when input new ArrayBuffer(1)`, function() {
        let ab = new ArrayBuffer(1)
        let r = ceil(ab)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input new Uint8Array(1)`, function() {
        let u8a = new Uint8Array(1)
        let r = ceil(u8a)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:56:789+08:00'`, function() {
        let r = ceil('2019-01-01T12:34:56:789+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:66:789+08:00'`, function() {
        let r = ceil('2019-01-01T12:34:66:789+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:56+08:00'`, function() {
        let r = ceil('2019-01-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:66+08:00'`, function() {
        let r = ceil('2019-01-01T12:34:66+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-01T12:34:56+08:00'`, function() {
        let r = ceil('2019-21-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-01'`, function() {
        let r = ceil('2019-01-01')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-01'`, function() {
        let r = ceil('2019-21-01')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01'`, function() {
        let r = ceil('2019-01')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21'`, function() {
        let r = ceil('2019-21')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input function() {}`, function() {
        let r = ceil(function() {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return 0 when input 0`, function() {
        let r = ceil(0)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 125 when input 125`, function() {
        let r = ceil(125)
        assert.strict.deepStrictEqual(r, 125)
    })

    it(`should return -125 when input -125`, function() {
        let r = ceil(-125)
        assert.strict.deepStrictEqual(r, -125)
    })

    it(`should return 2 when input 1.25`, function() {
        let r = ceil(1.25)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 2 when input 1.5`, function() {
        let r = ceil(1.5)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 3 when input 2.5`, function() {
        let r = ceil(2.5)
        assert.strict.deepStrictEqual(r, 3)
    })

    it(`should return -1 when input -1.25`, function() {
        let r = ceil(-1.25)
        assert.strict.deepStrictEqual(r, -1)
    })

    it(`should return -1 when input -1.5`, function() {
        let r = ceil(-1.5)
        assert.strict.deepStrictEqual(r, -1)
    })

    it(`should return -2 when input -2.5`, function() {
        let r = ceil(-2.5)
        assert.strict.deepStrictEqual(r, -2)
    })

    it(`should return 0 when input '0'`, function() {
        let r = ceil('0')
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 125 when input '125'`, function() {
        let r = ceil('125')
        assert.strict.deepStrictEqual(r, 125)
    })

    it(`should return -125 when input '-125'`, function() {
        let r = ceil('-125')
        assert.strict.deepStrictEqual(r, -125)
    })

    it(`should return 1 when input '1.25'`, function() {
        let r = ceil('1')
        assert.strict.deepStrictEqual(r, 1)
    })

    it(`should return 2 when input '1.5'`, function() {
        let r = ceil('1.5')
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 3 when input '2.5'`, function() {
        let r = ceil('2.5')
        assert.strict.deepStrictEqual(r, 3)
    })

    it(`should return -1 when input '-1.25'`, function() {
        let r = ceil('-1.25')
        assert.strict.deepStrictEqual(r, -1)
    })

    it(`should return -1 when input '-1.5'`, function() {
        let r = ceil('-1.5')
        assert.strict.deepStrictEqual(r, -1)
    })

    it(`should return -2 when input '-2.5'`, function() {
        let r = ceil('-2.5')
        assert.strict.deepStrictEqual(r, -2)
    })

    it(`should return '' when input '125abc'`, function() {
        let r = ceil('125abc')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc125'`, function() {
        let r = ceil('abc125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abC125'`, function() {
        let r = ceil('abC125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC125'`, function() {
        let r = ceil('ABC125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc'`, function() {
        let r = ceil('abc')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC'`, function() {
        let r = ceil('ABC')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '中文'`, function() {
        let r = ceil('中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc中文'`, function() {
        let r = ceil('abc中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC中文'`, function() {
        let r = ceil('ABC中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1234中文'`, function() {
        let r = ceil('1234中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '12.34中文'`, function() {
        let r = ceil('12.34中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '12a5'`, function() {
        let r = ceil('12a5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = ceil('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input false`, function() {
        let r = ceil(false)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = ceil([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input [{}]`, function() {
        let r = ceil([{}])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input [{ a: 123 }]`, function() {
        let r = ceil([{ a: 123 }])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ['']`, function() {
        let r = ceil([''])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ['abc']`, function() {
        let r = ceil(['abc'])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = ceil({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input { a: 123 }`, function() {
        let r = ceil({ a: 123 })
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = ceil({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = ceil(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = ceil(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = ceil(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

})
