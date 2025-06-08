import assert from 'assert'
import isErr from '../src/isErr.mjs'


describe(`isErr`, function() {

    it(`should return false when input new Error('')`, function() {
        let r = isErr(new Error(''))
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input new TypeError('')`, function() {
        let r = isErr(new TypeError(''))
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '2019-01-01'`, function() {
        let r = isErr('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isErr('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isErr('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isErr('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isErr(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isErr(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isErr(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isErr(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isErr('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isErr('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isErr('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isErr('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input false`, function() {
        let r = isErr(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isErr([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isErr([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isErr([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isErr([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isErr(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isErr({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isErr({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isErr({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isErr(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isErr(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isErr(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
