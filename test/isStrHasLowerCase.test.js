import assert from 'assert'
import isStrHasLowerCase from '../src/isStrHasLowerCase.mjs'


describe(`isStrHasLowerCase`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isStrHasLowerCase('2019-01-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isStrHasLowerCase('2019-21-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isStrHasLowerCase('2019-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isStrHasLowerCase('2019-21')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isStrHasLowerCase(function() {})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isStrHasLowerCase(0)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isStrHasLowerCase(125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isStrHasLowerCase(-125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isStrHasLowerCase(1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isStrHasLowerCase(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = isStrHasLowerCase('0')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isStrHasLowerCase('125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = isStrHasLowerCase('-125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isStrHasLowerCase('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isStrHasLowerCase('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input '125abc'`, function() {
        let r = isStrHasLowerCase('125abc')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 'abc125'`, function() {
        let r = isStrHasLowerCase('abc125')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 'abC125'`, function() {
        let r = isStrHasLowerCase('abC125')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input 'ABC125'`, function() {
        let r = isStrHasLowerCase('ABC125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input 'abc'`, function() {
        let r = isStrHasLowerCase('abc')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input 'ABC'`, function() {
        let r = isStrHasLowerCase('ABC')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '中文'`, function() {
        let r = isStrHasLowerCase('中文')
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input 'abc中文'`, function() {
        let r = isStrHasLowerCase('abc中文')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input 'ABC中文'`, function() {
        let r = isStrHasLowerCase('ABC中文')
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input '12a5'`, function() {
        let r = isStrHasLowerCase('12a5')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input ''`, function() {
        let r = isStrHasLowerCase('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isStrHasLowerCase(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isStrHasLowerCase([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isStrHasLowerCase([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isStrHasLowerCase([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isStrHasLowerCase([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isStrHasLowerCase(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isStrHasLowerCase({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isStrHasLowerCase({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isStrHasLowerCase({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isStrHasLowerCase(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isStrHasLowerCase(undefined)
        assert.strict.deepEqual(r, false)
    })

})
