import assert from 'assert'
import iser from '../src/iser.mjs'


describe(`iser`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = iser('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = iser('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = iser('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = iser('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = iser(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = iser(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = iser(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = iser(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = iser('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = iser('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = iser('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input ''`, function() {
        let r = iser('')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input false`, function() {
        let r = iser(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input []`, function() {
        let r = iser([])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input [{}]`, function() {
        let r = iser([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = iser([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = iser([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = iser(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input {}`, function() {
        let r = iser({})
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = iser({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = iser({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input null`, function() {
        let r = iser(null)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input undefined`, function() {
        let r = iser(undefined)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input NaN`, function() {
        let r = iser(NaN)
        assert.strict.deepStrictEqual(r, true)
    })

})
