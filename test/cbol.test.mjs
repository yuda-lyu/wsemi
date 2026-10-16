import assert from 'assert'
import cbol from '../src/cbol.mjs'


describe(`cbol`, function() {

    it(`should return true when input true`, function() {
        let r = cbol(true)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input false`, function() {
        let r = cbol(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = cbol(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 1`, function() {
        let r = cbol(1)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'true'`, function() {
        let r = cbol('true')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'tRuE'`, function() {
        let r = cbol('tRuE')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'TRUE'`, function() {
        let r = cbol('TRUE')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'abc'`, function() {
        let r = cbol('abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = cbol('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = cbol([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = cbol({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = cbol(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = cbol(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = cbol(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`cbol 包裝物件(R-WRAPPER-01)`, function() {

    it(`should return primitive false when input new Boolean(false)`, function() {
        //R-WRAPPER-01 規則2: cbol之布林分支回傳Boolean.prototype.valueOf.call(v), 不回包裝物件本身(new Boolean(false)為truthy); JSDoc「恆回傳原始布林值」
        let r = cbol(new Boolean(false))
        assert.strict.deepStrictEqual(typeof r, 'boolean')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return primitive true when input new Boolean(true)`, function() {
        //R-WRAPPER-01 規則2: 布林分支回傳原始布林; JSDoc「恆回傳原始布林值」
        let r = cbol(new Boolean(true))
        assert.strict.deepStrictEqual(typeof r, 'boolean')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input new String('true') and false when input new String('abc')`, function() {
        //R-WRAPPER-01 規則2: cbol對包裝物件拆包後判定, 字串分支同原始值(cbol('true')為true、cbol('abc')為false)
        assert.strict.deepStrictEqual(cbol(new String('true')), true)
        assert.strict.deepStrictEqual(cbol(new String('abc')), false)
    })

    it(`should return false when input new Number(1)`, function() {
        //R-WRAPPER-01 規則3: 其餘不保證拆包, cbol(new Number(1))為false(設計限制, 請傳入原始值)
        assert.strict.deepStrictEqual(cbol(new Number(1)), false)
    })

    it(`should return primitive false without throwing when input a frozen object spoofing Symbol.toStringTag as Boolean`, function() {
        //JSDoc「恆回傳原始布林值」: 凍結且偽造標籤之物件通過isbol, 但取不到原始布林值, 非布林故為false且不拋錯
        let r = null
        assert.doesNotThrow(() => {
            r = cbol(Object.freeze({ [Symbol.toStringTag]: 'Boolean' }))
        })
        assert.strict.deepStrictEqual(typeof r, 'boolean')
        assert.strict.deepStrictEqual(r, false)
    })

})
