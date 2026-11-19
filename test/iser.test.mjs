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


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`iser 包裝物件(R-WRAPPER-01, W-20: 判斷函數只收原始值)`, function() {

    it(`should treat new String(''), new Number(NaN) as not empty (an object is a value, only the primitive '' and NaN are empty): iser is false`, function() {
        //W-20: isstr0、isnan只收原始值, 包裝物件非空字串、非NaN, 故不屬無值; 修前此2格iser為true
        assert.strict.deepStrictEqual(iser(''), true)
        assert.strict.deepStrictEqual(iser(NaN), true)
        assert.strict.deepStrictEqual(iser(new String('')), false)
        assert.strict.deepStrictEqual(iser(new Number(NaN)), false)
    })

    it(`should keep the other wrappers (new String('a'), new Number(0), new Boolean(false)) as values: iser is false`, function() {
        for (let v of [new String('a'), new String(' '), new Number(0), new Number(1), new Boolean(false), new Boolean(true)]) {
            assert.strict.deepStrictEqual(iser(v), false)
        }
    })

})
