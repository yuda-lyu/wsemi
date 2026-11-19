import assert from 'assert'
import isernot from '../src/isernot.mjs'


describe(`isernot`, function() {

    it(`should return true when input '2019-01-01'`, function() {
        let r = isernot('2019-01-01')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '2019-21-01'`, function() {
        let r = isernot('2019-21-01')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '1.25'`, function() {
        let r = isernot('1.25')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '125'`, function() {
        let r = isernot('125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 125`, function() {
        let r = isernot(125)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input -125`, function() {
        let r = isernot(-125)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 1.25`, function() {
        let r = isernot(1.25)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input -1.25`, function() {
        let r = isernot(-1.25)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '125abc'`, function() {
        let r = isernot('125abc')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'abc125'`, function() {
        let r = isernot('abc125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '12a5'`, function() {
        let r = isernot('12a5')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input ''`, function() {
        let r = isernot('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input false`, function() {
        let r = isernot(false)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input []`, function() {
        let r = isernot([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input [{}]`, function() {
        let r = isernot([{}])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input [{ a: 123 }]`, function() {
        let r = isernot([{ a: 123 }])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input ['']`, function() {
        let r = isernot([''])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input ['abc']`, function() {
        let r = isernot(['abc'])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input {}`, function() {
        let r = isernot({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input { a: 123 }`, function() {
        let r = isernot({ a: 123 })
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isernot({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input null`, function() {
        let r = isernot(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isernot(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isernot(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`isernot 包裝物件(R-WRAPPER-01, W-20: 判斷函數只收原始值)`, function() {

    it(`should treat new String(''), new Number(NaN) as not empty (an object is a value, only the primitive '' and NaN are empty): isernot is true`, function() {
        //W-20: isstr0、isnan只收原始值, 包裝物件非空字串、非NaN, 故不屬無值; 修前此2格isernot為false
        assert.strict.deepStrictEqual(isernot(''), false)
        assert.strict.deepStrictEqual(isernot(NaN), false)
        assert.strict.deepStrictEqual(isernot(new String('')), true)
        assert.strict.deepStrictEqual(isernot(new Number(NaN)), true)
    })

    it(`should keep the other wrappers (new String('a'), new Number(0), new Boolean(false)) as values: isernot is true`, function() {
        for (let v of [new String('a'), new String(' '), new Number(0), new Number(1), new Boolean(false), new Boolean(true)]) {
            assert.strict.deepStrictEqual(isernot(v), true)
        }
    })

})
