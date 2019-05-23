import assert from 'assert'
import isStrHasCapital from '../src/isStrHasCapital.mjs'


describe(`isStrHasCapital`, function() {

    it(`should return false when input '2019/01/01'`, function() {
        let r = isStrHasCapital('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019/21/01'`, function() {
        let r = isStrHasCapital('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019/01'`, function() {
        let r = isStrHasCapital('2019/01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019/21'`, function() {
        let r = isStrHasCapital('2019/21')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isStrHasCapital(function() {})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isStrHasCapital(0)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isStrHasCapital(125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isStrHasCapital(-125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isStrHasCapital(1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isStrHasCapital(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = isStrHasCapital('0')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isStrHasCapital('125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = isStrHasCapital('-125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isStrHasCapital('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isStrHasCapital('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isStrHasCapital('125abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isStrHasCapital('abc125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input 'abC125'`, function() {
        let r = isStrHasCapital('abC125')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 'ABC125'`, function() {
        let r = isStrHasCapital('ABC125')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input 'abc'`, function() {
        let r = isStrHasCapital('abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input 'ABC'`, function() {
        let r = isStrHasCapital('ABC')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input '中文'`, function() {
        let r = isStrHasCapital('中文')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc中文'`, function() {
        let r = isStrHasCapital('abc中文')
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input 'ABC中文'`, function() {
        let r = isStrHasCapital('ABC中文')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isStrHasCapital('12a5')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isStrHasCapital('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isStrHasCapital(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isStrHasCapital([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isStrHasCapital([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isStrHasCapital([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isStrHasCapital([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isStrHasCapital(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isStrHasCapital({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isStrHasCapital({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isStrHasCapital({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isStrHasCapital(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isStrHasCapital(undefined)
        assert.strict.deepEqual(r, false)
    })

})
