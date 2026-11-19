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
describe(`isestr 包裝物件(R-WRAPPER-01, W-20: 判斷函數只收原始值)`, function() {

    it(`should return false for the wrapper of every primitive that gives true (the primitive itself stays true)`, function() {
        //W-20(dspec §11 包裝物件): new String、new Number、new Boolean判為false; 修前此15格之包裝物件為true
        for (let p of [' ', 'a', 'abc', '0', '1', '1.5', '-1', 'NaN', 'true', 'false', 'TRUE', '2020-01-01', '2020-01-01T00:00:00', '2020-01-01T00:00:00+08:00', 'a@b.cc']) {
            assert.strict.deepStrictEqual([typeof p, String(p), isestr(p), isestr(Object(p))], [typeof p, String(p), true, false])
        }
    })

    it(`should return false for the wrapper of every primitive on the whole axis`, function() {
        for (let p of ['', ' ', 'a', '0', '1', '1.5', '-1', 'NaN', 'true', 'false', 0, 1, -1, 1.5, NaN, Infinity, true, false]) {
            assert.strict.deepStrictEqual([typeof p, String(p), isestr(Object(p))], [typeof p, String(p), false])
        }
    })

})
