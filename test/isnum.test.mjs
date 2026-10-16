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

    it(`should return false when input ' '`, function() {
        let r = isnum(' ')
        assert.strict.deepStrictEqual(r, false) //純空白字串非數字字串(JS之Number(' ')為0)
    })

    it(`should return false when input a string of several spaces, tabs or line breaks`, function() {
        let r = ['   ', '\t', '\n', ' \t\r\n ', ' ', '　'].map((v) => isnum(v))
        assert.strict.deepStrictEqual(r, [false, false, false, false, false, false])
    })

    it(`should return true when input a numeric string with surrounding spaces`, function() {
        let r = [' 5 ', '\t12.34\n', ' -1 '].map((v) => isnum(v))
        assert.strict.deepStrictEqual(r, [true, true, true])
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


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`isnum 包裝物件(R-WRAPPER-01)`, function() {

    it(`should return false when input new Number(NaN)`, function() {
        //R-WRAPPER-01 規則2: isnum族隨isnan拆包而一致, 同isnum(NaN)為false(JSDoc「只有數字(NaN除外)」)
        assert.strict.deepStrictEqual(isnum(new Number(NaN)), false)
    })

    it(`should return true when input new Number(1.5) and new String('1.5')`, function() {
        //R-WRAPPER-01 規則1: 包裝物件視同其型別(本庫_optNum依賴new Number(3)為數字); 規則2: 依其原始值判定
        assert.strict.deepStrictEqual(isnum(new Number(1.5)), true)
        assert.strict.deepStrictEqual(isnum(new String('1.5')), true)
    })

})
