import assert from 'assert'
import isnum from '../src/isnum.mjs'


describe(`isnum`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isnum('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isnum('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isnum('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isnum('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isnum(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 0`, function() {
        let r = isnum(0)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 125`, function() {
        let r = isnum(125)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input -125`, function() {
        let r = isnum(-125)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 1.25`, function() {
        let r = isnum(1.25)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input -1.25`, function() {
        let r = isnum(-1.25)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '0'`, function() {
        let r = isnum('0')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '125'`, function() {
        let r = isnum('125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '-125'`, function() {
        let r = isnum('-125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '1.25'`, function() {
        let r = isnum('1.25')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '-1.25'`, function() {
        let r = isnum('-1.25')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isnum('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isnum('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isnum('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isnum('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isnum(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isnum([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isnum([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isnum([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isnum([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isnum(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isnum({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isnum({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isnum({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isnum(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isnum(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isnum(NaN)
        assert.strict.deepStrictEqual(r, false) //NaN為Number不視為有效數字故為false
    })

})
