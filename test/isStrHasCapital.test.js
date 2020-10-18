import assert from 'assert'
import isStrHasCapital from '../src/isStrHasCapital.mjs'


describe(`isStrHasCapital`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isStrHasCapital('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isStrHasCapital('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isStrHasCapital('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isStrHasCapital('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isStrHasCapital(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isStrHasCapital(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isStrHasCapital(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isStrHasCapital(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isStrHasCapital(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isStrHasCapital(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = isStrHasCapital('0')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isStrHasCapital('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = isStrHasCapital('-125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isStrHasCapital('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isStrHasCapital('-1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isStrHasCapital('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isStrHasCapital('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 'abC125'`, function() {
        let r = isStrHasCapital('abC125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'ABC125'`, function() {
        let r = isStrHasCapital('ABC125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'abc'`, function() {
        let r = isStrHasCapital('abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 'ABC'`, function() {
        let r = isStrHasCapital('ABC')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '中文'`, function() {
        let r = isStrHasCapital('中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc中文'`, function() {
        let r = isStrHasCapital('abc中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 'ABC中文'`, function() {
        let r = isStrHasCapital('ABC中文')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isStrHasCapital('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isStrHasCapital('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isStrHasCapital(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isStrHasCapital([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isStrHasCapital([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isStrHasCapital([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isStrHasCapital([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isStrHasCapital(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isStrHasCapital({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isStrHasCapital({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isStrHasCapital({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isStrHasCapital(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isStrHasCapital(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

})
