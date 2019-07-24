import assert from 'assert'
import round from '../src/round.mjs'


describe(`round`, function() {

    it(`should return '' when input new ArrayBuffer(1)`, function() {
        let ab = new ArrayBuffer(1)
        let r = round(ab)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input new Uint8Array(1)`, function() {
        let u8a = new Uint8Array(1)
        let r = round(u8a)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:56+08:00:789'`, function() {
        let r = round('2019-01-01T12:34:56+08:00:789')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:66:789+08:00'`, function() {
        let r = round('2019-01-01T12:34:66:789+08:00')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:56+08:00'`, function() {
        let r = round('2019-01-01T12:34:56+08:00')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019-01-01T12:34:66+08:00'`, function() {
        let r = round('2019-01-01T12:34:66+08:00')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019-21-01T12:34:56+08:00'`, function() {
        let r = round('2019-21-01T12:34:56+08:00')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019-01-01'`, function() {
        let r = round('2019-01-01')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019-21-01'`, function() {
        let r = round('2019-21-01')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019-01'`, function() {
        let r = round('2019-01')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '2019-21'`, function() {
        let r = round('2019-21')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input function() {}`, function() {
        let r = round(function() {})
        assert.strict.deepEqual(r, '')
    })

    it(`should return 0 when input 0`, function() {
        let r = round(0)
        assert.strict.deepEqual(r, 0)
    })

    it(`should return 125 when input 125`, function() {
        let r = round(125)
        assert.strict.deepEqual(r, 125)
    })

    it(`should return -125 when input -125`, function() {
        let r = round(-125)
        assert.strict.deepEqual(r, -125)
    })

    it(`should return 1 when input 1.25`, function() {
        let r = round(1.25)
        assert.strict.deepEqual(r, 1)
    })

    it(`should return 2 when input 1.5`, function() {
        let r = round(1.5)
        assert.strict.deepEqual(r, 2)
    })

    it(`should return 3 when input 2.5`, function() {
        let r = round(2.5)
        assert.strict.deepEqual(r, 3)
    })

    it(`should return -1 when input -1.25`, function() {
        let r = round(-1.25)
        assert.strict.deepEqual(r, -1)
    })

    it(`should return -1 when input -1.5`, function() {
        let r = round(-1.5)
        assert.strict.deepEqual(r, -1)
    })

    it(`should return -2 when input -2.5`, function() {
        let r = round(-2.5)
        assert.strict.deepEqual(r, -2)
    })

    it(`should return 0 when input '0'`, function() {
        let r = round('0')
        assert.strict.deepEqual(r, 0)
    })

    it(`should return 125 when input '125'`, function() {
        let r = round('125')
        assert.strict.deepEqual(r, 125)
    })

    it(`should return -125 when input '-125'`, function() {
        let r = round('-125')
        assert.strict.deepEqual(r, -125)
    })

    it(`should return 1.25 when input '1.25'`, function() {
        let r = round('1')
        assert.strict.deepEqual(r, 1)
    })

    it(`should return 2 when input '1.5'`, function() {
        let r = round('1.5')
        assert.strict.deepEqual(r, 2)
    })

    it(`should return 3 when input '2.5'`, function() {
        let r = round('2.5')
        assert.strict.deepEqual(r, 3)
    })

    it(`should return -1 when input '-1.25'`, function() {
        let r = round('-1.25')
        assert.strict.deepEqual(r, -1)
    })

    it(`should return -1 when input '-1.5'`, function() {
        let r = round('-1.5')
        assert.strict.deepEqual(r, -1)
    })

    it(`should return -2 when input '-2.5'`, function() {
        let r = round('-2.5')
        assert.strict.deepEqual(r, -2)
    })

    it(`should return '' when input '125abc'`, function() {
        let r = round('125abc')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input 'abc125'`, function() {
        let r = round('abc125')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input 'abC125'`, function() {
        let r = round('abC125')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input 'ABC125'`, function() {
        let r = round('ABC125')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input 'abc'`, function() {
        let r = round('abc')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input 'ABC'`, function() {
        let r = round('ABC')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '中文'`, function() {
        let r = round('中文')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input 'abc中文'`, function() {
        let r = round('abc中文')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input 'ABC中文'`, function() {
        let r = round('ABC中文')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '1234中文'`, function() {
        let r = round('1234中文')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '12.34中文'`, function() {
        let r = round('12.34中文')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '12a5'`, function() {
        let r = round('12a5')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = round('')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input false`, function() {
        let r = round(false)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = round([])
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input [{}]`, function() {
        let r = round([{}])
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input [{ a: 123 }]`, function() {
        let r = round([{ a: 123 }])
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input ['']`, function() {
        let r = round([''])
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input ['abc']`, function() {
        let r = round(['abc'])
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = round({})
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input { a: 123 }`, function() {
        let r = round({ a: 123 })
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = round({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = round(null)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = round(undefined)
        assert.strict.deepEqual(r, '')
    })

})
