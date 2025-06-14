import assert from 'assert'
import ot from 'dayjs'
import getTimeObject from '../src/getTimeObject.mjs'


describe(`getTimeObject`, function() {

    it(`should return null when input new ArrayBuffer(1)`, function() {
        let ab = new ArrayBuffer(1)
        let r = getTimeObject(ab)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input new Uint8Array(1)`, function() {
        let u8a = new Uint8Array(1)
        let r = getTimeObject(u8a)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01-01T12:34:56:789'`, function() {
        let r = getTimeObject('2019-01-01T12:34:56:789')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01-01T12:34:66:789'`, function() {
        let r = getTimeObject('2019-01-01T12:34:66:789')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return (ot object) when input '2019-01-01T12:34:56', 'seconds'`, function() {
        let r = getTimeObject('2019-01-01T12:34:56', 'seconds')
        let rr = ot('2019-01-01T12:34:56', 'YYYY-MM-DDTHH:mm:ss')
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input '2019-01-01T12:34:66', 'seconds'`, function() {
        let r = getTimeObject('2019-01-01T12:34:66', 'seconds')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01-01T12:34:56'`, function() {
        let r = getTimeObject('2019-01-01T12:34:56')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01-01T12:34:66'`, function() {
        let r = getTimeObject('2019-01-01T12:34:66')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-21-01T12:34:56'`, function() {
        let r = getTimeObject('2019-21-01T12:34:56')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01-01T12:34:56:789+08:00'`, function() {
        let r = getTimeObject('2019-01-01T12:34:56:789+08:00')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01-01T12:34:66:789+08:00'`, function() {
        let r = getTimeObject('2019-01-01T12:34:66:789+08:00')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01-01T12:34:56+08:00', 'seconds'`, function() {
        let r = getTimeObject('2019-01-01T12:34:56+08:00', 'seconds')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01-01T12:34:66+08:00', 'seconds'`, function() {
        let r = getTimeObject('2019-01-01T12:34:66+08:00', 'seconds')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01-01T12:34:56+08:00'`, function() {
        let r = getTimeObject('2019-01-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01-01T12:34:66+08:00'`, function() {
        let r = getTimeObject('2019-01-01T12:34:66+08:00')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-21-01T12:34:56+08:00'`, function() {
        let r = getTimeObject('2019-21-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return (ot object) when input '2019-01-01T12:34', 'minutes'`, function() {
        let r = getTimeObject('2019-01-01T12:34', 'minutes')
        let rr = ot('2019-01-01T12:34', 'YYYY-MM-DDTHH:mm')
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input '2019-01-01T12:34'`, function() {
        let r = getTimeObject('2019-01-01T12:34')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return (ot object) when input '2019-01-01T12', 'hours'`, function() {
        let r = getTimeObject('2019-01-01T12', 'hours')
        let rr = ot('2019-01-01T12', 'YYYY-MM-DDTHH')
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input '2019-01-01T12'`, function() {
        let r = getTimeObject('2019-01-01T12')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return (ot object) when input '2019-01-01', 'days'`, function() {
        let r = getTimeObject('2019-01-01', 'days')
        let rr = ot('2019-01-01', 'YYYY-MM-DD')
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return (ot object) when input '2019-01-01'`, function() {
        let r = getTimeObject('2019-01-01')
        let rr = ot('2019-01-01', 'YYYY-MM-DD')
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input '2019-21-01'`, function() {
        let r = getTimeObject('2019-21-01')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-01', 'months'`, function() {
        let r = getTimeObject('2019-01', 'months')
        let rr = ot('2019-01-01', 'YYYY-MM-DD')
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input '2019-01'`, function() {
        let r = getTimeObject('2019-01')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019-21'`, function() {
        let r = getTimeObject('2019-21')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '2019', 'years'`, function() {
        let r = getTimeObject('2019', 'years')
        let rr = ot('2019-01-01', 'YYYY-MM-DD')
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input '2019'`, function() {
        let r = getTimeObject('2019')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input function() {}`, function() {
        let r = getTimeObject(function() {})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return 0 when input 0`, function() {
        let r = getTimeObject(0)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return 125 when input 125`, function() {
        let r = getTimeObject(125)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return -125 when input -125`, function() {
        let r = getTimeObject(-125)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return 1 when input 1.25`, function() {
        let r = getTimeObject(1.25)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return 2 when input 1.5`, function() {
        let r = getTimeObject(1.5)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return 3 when input 2.5`, function() {
        let r = getTimeObject(2.5)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return -1 when input -1.25`, function() {
        let r = getTimeObject(-1.25)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return -1 when input -1.5`, function() {
        let r = getTimeObject(-1.5)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return -2 when input -2.5`, function() {
        let r = getTimeObject(-2.5)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return 0 when input '0'`, function() {
        let r = getTimeObject('0')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return 125 when input '125'`, function() {
        let r = getTimeObject('125')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return -125 when input '-125'`, function() {
        let r = getTimeObject('-125')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return 1.25 when input '1.25'`, function() {
        let r = getTimeObject('1.25')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return 2 when input '1.5'`, function() {
        let r = getTimeObject('1.5')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return 3 when input '2.5'`, function() {
        let r = getTimeObject('2.5')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return -1 when input '-1.25'`, function() {
        let r = getTimeObject('-1.25')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return -1 when input '-1.5'`, function() {
        let r = getTimeObject('-1.5')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return -2 when input '-2.5'`, function() {
        let r = getTimeObject('-2.5')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '125abc'`, function() {
        let r = getTimeObject('125abc')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input 'abc125'`, function() {
        let r = getTimeObject('abc125')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input 'abC125'`, function() {
        let r = getTimeObject('abC125')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input 'ABC125'`, function() {
        let r = getTimeObject('ABC125')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input 'abc'`, function() {
        let r = getTimeObject('abc')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input 'ABC'`, function() {
        let r = getTimeObject('ABC')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '中文'`, function() {
        let r = getTimeObject('中文')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input 'abc中文'`, function() {
        let r = getTimeObject('abc中文')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input 'ABC中文'`, function() {
        let r = getTimeObject('ABC中文')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '1234中文'`, function() {
        let r = getTimeObject('1234中文')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '12.34中文'`, function() {
        let r = getTimeObject('12.34中文')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input '12a5'`, function() {
        let r = getTimeObject('12a5')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ''`, function() {
        let r = getTimeObject('')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input false`, function() {
        let r = getTimeObject(false)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input []`, function() {
        let r = getTimeObject([])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{}]`, function() {
        let r = getTimeObject([{}])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = getTimeObject([{ a: 123 }])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['']`, function() {
        let r = getTimeObject([''])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['abc']`, function() {
        let r = getTimeObject(['abc'])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input {}`, function() {
        let r = getTimeObject({})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = getTimeObject({ a: 123 })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = getTimeObject({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input null`, function() {
        let r = getTimeObject(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input undefined`, function() {
        let r = getTimeObject(undefined)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input NaN`, function() {
        let r = getTimeObject(NaN)
        assert.strict.deepStrictEqual(r, null)
    })

})
