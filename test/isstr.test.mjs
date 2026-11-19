import assert from 'assert'
import isstr from '../src/isstr.mjs'
import { converters, judgeWrapExpect, fullTable, wrapViolations } from './tools/wrapperCases.mjs'


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
describe(`isstr 包裝物件(R-WRAPPER-01, W-20: 判斷函數只收原始值)`, function() {

    it(`should return false for the wrapper of every primitive that gives true (the primitive itself stays true)`, function() {
        //W-20(dspec §11 包裝物件): new String、new Number、new Boolean判為false; 修前此16格之包裝物件為true
        for (let p of ['', ' ', 'a', 'abc', '0', '1', '1.5', '-1', 'NaN', 'true', 'false', 'TRUE', '2020-01-01', '2020-01-01T00:00:00', '2020-01-01T00:00:00+08:00', 'a@b.cc']) {
            assert.strict.deepStrictEqual([typeof p, String(p), isstr(p), isstr(Object(p))], [typeof p, String(p), true, false])
        }
    })

    it(`should return false for the wrapper of every primitive on the whole axis`, function() {
        for (let p of ['', ' ', 'a', '0', '1', '1.5', '-1', 'NaN', 'true', 'false', 0, 1, -1, 1.5, NaN, Infinity, true, false]) {
            assert.strict.deepStrictEqual([typeof p, String(p), isstr(Object(p))], [typeof p, String(p), false])
        }
    })

    it(`should return false when input an object spoofing Symbol.toStringTag as String (typeof based, not tag based)`, function() {
        assert.strict.deepStrictEqual(isstr({ [Symbol.toStringTag]: 'String' }), false)
    })

})


describe(`包裝物件全表 f(p) 與 f(Object(p))(R-WRAPPER-01, W-20: 判斷函數只收原始值, 轉型函數照舊拆包)`, function() {

    //全表: src內is*與cbol、cdbl、cint、cstr(扣除環境與DOM、Blob、Promise判斷) × 23個原始值, 見tools/wrapperCases.mjs
    let tb = null
    before(async function() {
        tb = await fullTable()
    })

    it(`should include every judge function (is*) and every converter in the table`, function() {
        //W-20: 判斷函數與轉型函數皆須入表受檢; 新增之is*函數自動入表
        let must = ['isstr', 'isestr', 'isstr0', 'isbol', 'isnbr', 'isnan', 'isnum', 'isint', 'ispint', 'isp0int', 'isnint', 'isn0int', 'isnnum', 'isn0num', 'ispnum', 'isp0num', 'isenum', 'iseint', 'iser', 'isernot', 'isDate', 'isday', 'istime', 'istimems', 'istimeTZ', 'istimemsTZ', 'isUserName', 'isUserIdentify', 'isUserPw', 'isEmail', 'isStrHasSpace', ...converters]
        let miss = must.filter((n) => tb.names.indexOf(n) < 0)
        assert.strict.deepStrictEqual(miss, [])
        assert.strict.deepStrictEqual(tb.rows.length, tb.names.length * 23)
    })

    it(`should give false for the wrapper object of every primitive in every judge function (is*), except the listed inverse or Promise or throwing validators`, function() {
        //W-20(使用者2026-11-16; dspec §11 包裝物件): 判斷函數一律只收原始值, new String、new Number、new Boolean為無效, 判斷結果為false;
        //  例外只有語意相反者(isernot為true)與驗證函數(isUserName、isUserIdentify以reject、isUserPw以拋固定訊息回報無效)
        let judgeRows = tb.rows.filter((c) => converters.indexOf(c.fn) < 0)
        let vs = wrapViolations(judgeRows)
        assert.strict.deepStrictEqual(vs, [])
        assert.strict.deepStrictEqual(Object.keys(judgeWrapExpect).sort(), ['isUserIdentify', 'isUserName', 'isUserPw', 'isernot'])
    })

    it(`should give f(Object(p)) === f(p) for every converter (cbol, cdbl, cint, cstr): converters still unwrap wrapper objects`, function() {
        //W-20: 轉型函數照舊拆包, 轉型本即盡力轉成可用之值
        let rows = tb.rows.filter((c) => converters.indexOf(c.fn) >= 0)
        assert.strict.deepStrictEqual(rows.length, converters.length * 23)
        assert.strict.deepStrictEqual(wrapViolations(rows), [])
    })

    it(`should have a primitive axis that distinguishes the converters (cdbl, cint, cstr, cbol give different results across the axis)`, function() {
        //鑑別力前提: 若各原始值對轉型函數結果皆相同, 上案之f(Object(p)) === f(p)測不到拆包與否
        for (let n of converters) {
            let rs = new Set(tb.rows.filter((c) => c.fn === n).map((c) => c.resPrim))
            assert.strict.ok(rs.size >= 2, n)
        }
    })

})
