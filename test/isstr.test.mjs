import assert from 'assert'
import isstr from '../src/isstr.mjs'
import { rule2Fns, rule3Cells, diffTable } from './tools/wrapperCases.mjs'


describe(`isstr`, function() {

    it(`should return true when input '2019-01-01'`, function() {
        let r = isstr('2019-01-01')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '2019-21-01'`, function() {
        let r = isstr('2019-21-01')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '2019-01'`, function() {
        let r = isstr('2019-01')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '2019-21'`, function() {
        let r = isstr('2019-21')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input function() {}`, function() {
        let r = isstr(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isstr(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isstr(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isstr(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isstr(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isstr(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '0'`, function() {
        let r = isstr('0')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '125'`, function() {
        let r = isstr('125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '-125'`, function() {
        let r = isstr('-125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '1.25'`, function() {
        let r = isstr('1.25')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '-1.25'`, function() {
        let r = isstr('-1.25')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '125abc'`, function() {
        let r = isstr('125abc')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'abc125'`, function() {
        let r = isstr('abc125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '12a5'`, function() {
        let r = isstr('12a5')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input ''`, function() {
        let r = isstr('')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input false`, function() {
        let r = isstr(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isstr([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isstr([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isstr([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isstr([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isstr(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isstr({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isstr({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isstr({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isstr(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isstr(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isstr(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`isstr 包裝物件(R-WRAPPER-01)`, function() {

    it(`should return true when input new String('') and new String('a')`, function() {
        //R-WRAPPER-01 規則1: isstr依內部標籤判型, 包裝物件視同其型別(既有, 下游依賴new String('boxed')為有效字串)
        assert.strict.deepStrictEqual(isstr(new String('')), true)
        assert.strict.deepStrictEqual(isstr(new String('a')), true)
    })

    it(`should return false when input new Number(1) and new Boolean(true)`, function() {
        //R-WRAPPER-01 規則1: 包裝物件依內部標籤視同其型別, 數字與布林之包裝物件非字串
        assert.strict.deepStrictEqual(isstr(new Number(1)), false)
        assert.strict.deepStrictEqual(isstr(new Boolean(true)), false)
    })

})


describe(`包裝物件全表 f(p) 與 f(Object(p))(R-WRAPPER-01)`, function() {

    //全表: src內is*與cbol、cdbl、cint、cstr(扣除環境與DOM、Blob、Promise判斷) × 23個原始值, 見tools/wrapperCases.mjs
    let tb = null
    before(async function() {
        tb = await diffTable()
    })

    //key, 格之排序鍵
    let key = (c) => `${c.fn}|${c.prim}`
    let sortCells = (cs) => [...cs].sort((a, b) => key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)

    it(`should include every function covered by R-WRAPPER-01 規則2 in the table`, function() {
        //R-WRAPPER-01 規則2: 值判定函數與cbol, 及其上之iser、isernot、isnum族、cstr、isUserName、isUserIdentify皆須入表受檢
        let miss = rule2Fns.filter((n) => tb.names.indexOf(n) < 0)
        assert.strict.deepStrictEqual(miss, [])
    })

    it(`should give f(p) === f(Object(p)) for every function covered by R-WRAPPER-01 規則2 except cells listed in 規則3`, function() {
        //R-WRAPPER-01 規則2: 值判定函數對包裝物件拆包後判定, 其上之函數隨之一致; 規則3: cbol(new Number(1))為false屬設計限制
        let ks3 = rule3Cells.map(key)
        let diffs = tb.rows.filter((c) => rule2Fns.indexOf(c.fn) >= 0 && ks3.indexOf(key(c)) < 0)
        assert.strict.deepStrictEqual(diffs, [])
    })

    it(`should differ exactly at the 3 cells listed in R-WRAPPER-01 規則3 over the whole table`, function() {
        //R-WRAPPER-01 規則3: 其餘函數不保證拆包, 全表差異只容許cbol(new Number(1))、isday、istime之包裝字串3格(帳本盤點指令之判準)
        assert.strict.deepStrictEqual(sortCells(tb.rows), sortCells(rule3Cells))
    })

})
