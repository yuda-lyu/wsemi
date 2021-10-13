import assert from 'assert'
import isarr from '../src/isarr.mjs'


describe(`isarr`, function() {

    it(`should return false when input '1.25'`, function() {
        let r = isarr('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isarr('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isarr(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isarr(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isarr(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isarr(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isarr('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isarr('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isarr('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isarr('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input []`, function() {
        let r = isarr([])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input [{}]`, function() {
        let r = isarr([{}])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input [{ a: 123 }]`, function() {
        let r = isarr([{ a: 123 }])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input ['']`, function() {
        let r = isarr([''])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input ['abc']`, function() {
        let r = isarr(['abc'])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input {}`, function() {
        let r = isarr({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isarr({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isarr({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isarr(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isarr(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

})
