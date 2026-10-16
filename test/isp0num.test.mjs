import assert from 'assert'
import isp0num from '../src/isp0num.mjs'


describe(`isp0num`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isp0num('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isp0num('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isp0num('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isp0num('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isp0num(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 0`, function() {
        let r = isp0num(0)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 125`, function() {
        let r = isp0num(125)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input -125`, function() {
        let r = isp0num(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 1.25`, function() {
        let r = isp0num(1.25)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input -1.25`, function() {
        let r = isp0num(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '0'`, function() {
        let r = isp0num('0')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '125'`, function() {
        let r = isp0num('125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '-125'`, function() {
        let r = isp0num('-125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '1.25'`, function() {
        let r = isp0num('1.25')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isp0num('-1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isp0num('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isp0num('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isp0num('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isp0num('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isp0num(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isp0num([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isp0num([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isp0num([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isp0num([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isp0num(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isp0num({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isp0num({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isp0num({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isp0num(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isp0num(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isp0num(NaN)
        assert.strict.deepStrictEqual(r, false) //NaN為Number不予判定故為false
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`isp0num 包裝物件(R-WRAPPER-01)`, function() {

    it(`should return false when input new Number(NaN)`, function() {
        //R-WRAPPER-01 規則2: isnum族隨之一致, 同isp0num(NaN)為false
        assert.strict.deepStrictEqual(isp0num(new Number(NaN)), false)
    })

    it(`should return true when input new Number(1.5)`, function() {
        //R-WRAPPER-01 規則1: 包裝物件視同其型別, 依其原始值判定(同isp0num(1.5))
        assert.strict.deepStrictEqual(isp0num(new Number(1.5)), true)
    })

})
