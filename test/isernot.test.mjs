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
describe(`isernot 包裝物件(R-WRAPPER-01)`, function() {

    it(`should return false when input new String('') and new Number(NaN)`, function() {
        //R-WRAPPER-01 規則2: isernot隨iser一致, 同isernot('')、isernot(NaN)為false
        assert.strict.deepStrictEqual(isernot(new String('')), false)
        assert.strict.deepStrictEqual(isernot(new Number(NaN)), false)
    })

    it(`should return true when input new String('a') and new Number(0)`, function() {
        //R-WRAPPER-01 規則2: 依其原始值判定, 同isernot('a')、isernot(0)為true
        assert.strict.deepStrictEqual(isernot(new String('a')), true)
        assert.strict.deepStrictEqual(isernot(new Number(0)), true)
    })

})
