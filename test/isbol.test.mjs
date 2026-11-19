import assert from 'assert'
import isbol from '../src/isbol.mjs'


describe(`isbol`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isbol('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isbol('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isbol('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isbol('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isbol(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isbol(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isbol(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isbol(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isbol('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isbol('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isbol('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isbol('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input false`, function() {
        let r = isbol(false)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input []`, function() {
        let r = isbol([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isbol([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isbol([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isbol([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isbol(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isbol({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isbol({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isbol({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isbol(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isbol(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isbol(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`isbol 包裝物件(R-WRAPPER-01, W-20: 判斷函數只收原始值)`, function() {

    it(`should return false for the wrapper of every primitive that gives true (the primitive itself stays true)`, function() {
        //W-20(dspec §11 包裝物件): new String、new Number、new Boolean判為false; 修前此2格之包裝物件為true
        for (let p of [true, false]) {
            assert.strict.deepStrictEqual([typeof p, String(p), isbol(p), isbol(Object(p))], [typeof p, String(p), true, false])
        }
    })

    it(`should return false for the wrapper of every primitive on the whole axis`, function() {
        for (let p of ['', ' ', 'a', '0', '1', '1.5', '-1', 'NaN', 'true', 'false', 0, 1, -1, 1.5, NaN, Infinity, true, false]) {
            assert.strict.deepStrictEqual([typeof p, String(p), isbol(Object(p))], [typeof p, String(p), false])
        }
    })

    it(`should return false when input an object spoofing Symbol.toStringTag as Boolean (typeof based, not tag based)`, function() {
        assert.strict.deepStrictEqual(isbol({ [Symbol.toStringTag]: 'Boolean' }), false)
    })

})
