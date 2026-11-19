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
describe(`isp0num 包裝物件(R-WRAPPER-01, W-20: 判斷函數只收原始值)`, function() {

    it(`should return false for the wrapper of every primitive that gives true (the primitive itself stays true)`, function() {
        //W-20(dspec §11 包裝物件): new String、new Number、new Boolean判為false; 修前此7格之包裝物件為true
        for (let p of ['0', '1', '1.5', 0, 1, 1.5, Infinity]) {
            assert.strict.deepStrictEqual([typeof p, String(p), isp0num(p), isp0num(Object(p))], [typeof p, String(p), true, false])
        }
    })

    it(`should return false for the wrapper of every primitive on the whole axis`, function() {
        for (let p of ['', ' ', 'a', '0', '1', '1.5', '-1', 'NaN', 'true', 'false', 0, 1, -1, 1.5, NaN, Infinity, true, false]) {
            assert.strict.deepStrictEqual([typeof p, String(p), isp0num(Object(p))], [typeof p, String(p), false])
        }
    })

})
