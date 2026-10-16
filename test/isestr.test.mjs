import assert from 'assert'
import isestr from '../src/isestr.mjs'


describe(`isestr`, function() {

    it(`should return true when input '2019-01-01'`, function() {
        let r = isestr('2019-01-01')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '2019-21-01'`, function() {
        let r = isestr('2019-21-01')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '1.25'`, function() {
        let r = isestr('1.25')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '125'`, function() {
        let r = isestr('125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 125`, function() {
        let r = isestr(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isestr(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isestr(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isestr(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '125abc'`, function() {
        let r = isestr('125abc')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'abc125'`, function() {
        let r = isestr('abc125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '12a5'`, function() {
        let r = isestr('12a5')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input ''`, function() {
        let r = isestr('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isestr(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isestr([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isestr([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isestr([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isestr([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isestr(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isestr({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isestr({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isestr({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isestr(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isestr(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isestr(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`isestr 包裝物件(R-WRAPPER-01)`, function() {

    it(`should return false when input new String('')`, function() {
        //R-WRAPPER-01 規則2: isestr對包裝物件拆包後判定(以v.length > 0); JSDoc「包裝物件依其原始值判定」, 同isestr('')為false
        assert.strict.deepStrictEqual(isestr(new String('')), false)
    })

    it(`should return true when input new String('a') and new String(' ')`, function() {
        //R-WRAPPER-01 規則1: 包裝物件視同字串; 規則2: 依其原始值判定, 非空即為有效字串(同isestr('a')、isestr(' '))
        assert.strict.deepStrictEqual(isestr(new String('a')), true)
        assert.strict.deepStrictEqual(isestr(new String(' ')), true)
    })

})
