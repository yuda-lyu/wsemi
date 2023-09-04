import assert from 'assert'
import ispnum from '../src/ispnum.mjs'


describe(`ispnum`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = ispnum('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = ispnum('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = ispnum('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = ispnum('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = ispnum(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = ispnum(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 125`, function() {
        let r = ispnum(125)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input -125`, function() {
        let r = ispnum(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 1.25`, function() {
        let r = ispnum(1.25)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input -1.25`, function() {
        let r = ispnum(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = ispnum('0')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '125'`, function() {
        let r = ispnum('125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '-125'`, function() {
        let r = ispnum('-125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '1.25'`, function() {
        let r = ispnum('1.25')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = ispnum('-1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = ispnum('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = ispnum('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = ispnum('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = ispnum('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = ispnum(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = ispnum([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = ispnum([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = ispnum([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = ispnum([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = ispnum(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = ispnum({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = ispnum({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = ispnum({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = ispnum(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = ispnum(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = ispnum(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
