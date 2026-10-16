import assert from 'assert'
import isnan from '../src/isnan.mjs'


describe(`isnan`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isnan('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isnan('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isnan('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isnan('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isnan(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isnan(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isnan(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isnan(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isnan(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isnan(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = isnan('0')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isnan('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = isnan('-125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isnan('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isnan('-1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isnan('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isnan('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isnan('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isnan('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isnan(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isnan([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isnan([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isnan([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isnan([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isnan(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isnan({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isnan({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isnan({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input null`, function() {
        let r = isnan(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isnan(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isnan(NaN)
        assert.strict.deepStrictEqual(r, true)
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`isnan 包裝物件(R-WRAPPER-01)`, function() {

    it(`should return true when input new Number(NaN)`, function() {
        //R-WRAPPER-01 規則2: isnan對物件以Number.prototype.valueOf.call(v)取原始值; JSDoc「包裝物件依其原始值判定」, 同isnan(NaN)為true
        assert.strict.deepStrictEqual(isnan(new Number(NaN)), true)
    })

    it(`should return false when input new Number(1) and new Number(Infinity)`, function() {
        //R-WRAPPER-01 規則2: 依其原始值判定, 非NaN之數字包裝物件為false
        assert.strict.deepStrictEqual(isnan(new Number(1)), false)
        assert.strict.deepStrictEqual(isnan(new Number(Infinity)), false)
    })

    it(`should return false when input { valueOf() { return NaN } }`, function() {
        //R-WRAPPER-01 規則2: 不呼叫物件自身之valueOf(防偽裝), 非Number物件即為false
        let o = {
            valueOf() {
                return NaN
            },
        }
        assert.strict.deepStrictEqual(isnan(o), false)
    })

    it(`should return false when input an object spoofing Symbol.toStringTag as Number`, function() {
        //R-WRAPPER-01 規則2: 不以內部標籤判定(防偽裝), 非Number物件於Number.prototype.valueOf拋錯而為false
        assert.strict.deepStrictEqual(isnan({ [Symbol.toStringTag]: 'Number' }), false)
    })

    it(`should return false when input new String('NaN')`, function() {
        //R-WRAPPER-01 規則2: 非Number物件即為false(同isnan('NaN')為false)
        assert.strict.deepStrictEqual(isnan(new String('NaN')), false)
    })

})
