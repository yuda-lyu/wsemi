import assert from 'assert'
import isStrHasNumber from '../src/isStrHasNumber.mjs'


describe(`isStrHasNumber`, function() {

    it(`should return true when input '2019-01-01'`, function() {
        let r = isStrHasNumber('2019-01-01')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '2019-21-01'`, function() {
        let r = isStrHasNumber('2019-21-01')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '2019-01'`, function() {
        let r = isStrHasNumber('2019-01')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '2019-21'`, function() {
        let r = isStrHasNumber('2019-21')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input function() {}`, function() {
        let r = isStrHasNumber(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isStrHasNumber(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isStrHasNumber(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isStrHasNumber(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isStrHasNumber(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isStrHasNumber(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '0'`, function() {
        let r = isStrHasNumber('0')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '125'`, function() {
        let r = isStrHasNumber('125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '-125'`, function() {
        let r = isStrHasNumber('-125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '1.25'`, function() {
        let r = isStrHasNumber('1.25')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '-1.25'`, function() {
        let r = isStrHasNumber('-1.25')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '125abc'`, function() {
        let r = isStrHasNumber('125abc')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'abc125'`, function() {
        let r = isStrHasNumber('abc125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'abC125'`, function() {
        let r = isStrHasNumber('abC125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'ABC125'`, function() {
        let r = isStrHasNumber('ABC125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'abc'`, function() {
        let r = isStrHasNumber('abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC'`, function() {
        let r = isStrHasNumber('ABC')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '中文'`, function() {
        let r = isStrHasNumber('中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc中文'`, function() {
        let r = isStrHasNumber('abc中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC中文'`, function() {
        let r = isStrHasNumber('ABC中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '1234中文'`, function() {
        let r = isStrHasNumber('1234中文')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '12.34中文'`, function() {
        let r = isStrHasNumber('12.34中文')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '12a5'`, function() {
        let r = isStrHasNumber('12a5')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input ''`, function() {
        let r = isStrHasNumber('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isStrHasNumber(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isStrHasNumber([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isStrHasNumber([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isStrHasNumber([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isStrHasNumber([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isStrHasNumber(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isStrHasNumber({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isStrHasNumber({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isStrHasNumber({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isStrHasNumber(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isStrHasNumber(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isStrHasNumber(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
