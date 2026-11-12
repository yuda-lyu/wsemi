/* eslint-disable no-new-wrappers -- 測試刻意以包裝物件(new Number(Infinity))驗證轉換結果 */
import assert from 'assert'
import cdbl from '../src/cdbl.mjs'


describe(`cdbl`, function() {

    it(`should return 1.25 when input '25'`, function() {
        let r = cdbl('25')
        assert.strict.deepStrictEqual(r, 25)
    })

    it(`should return 1.25 when input '1.25'`, function() {
        let r = cdbl('1.25')
        assert.strict.deepStrictEqual(r, 1.25)
    })

    it(`should return 2.25 when input 2.25`, function() {
        let r = cdbl(2.25)
        assert.strict.deepStrictEqual(r, 2.25)
    })

    it(`should return '' when input ''`, function() {
        let r = cdbl('')
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input []`, function() {
        let r = cdbl([])
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input {}`, function() {
        let r = cdbl({})
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input null`, function() {
        let r = cdbl(null)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input undefined`, function() {
        let r = cdbl(undefined)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input NaN`, function() {
        let r = cdbl(NaN)
        assert.strict.deepStrictEqual(r, 0)
    })

    //Q1-h(使用者2026-11-12定「甲」): cdbl轉成可用、可計算之數值, ±Infinity維持夾為±Number.MAX_VALUE(不視為無法轉型而回0、不回Infinity), 以測試鎖定
    it(`should return Number.MAX_VALUE when input Infinity [Q1-h 甲]`, function() {
        assert.strict.deepStrictEqual(cdbl(Infinity), Number.MAX_VALUE)
    })

    it(`should return -Number.MAX_VALUE when input -Infinity [Q1-h 甲]`, function() {
        assert.strict.deepStrictEqual(cdbl(-Infinity), -Number.MAX_VALUE)
    })

    it(`should return ±Number.MAX_VALUE when input strings 'Infinity'、'+Infinity'、'-Infinity'、'1e400'、'-1e400'、'1.8e308' and new Number(Infinity) [Q1-h 甲]`, function() {
        let cs = [
            ['Infinity', Number.MAX_VALUE],
            ['+Infinity', Number.MAX_VALUE],
            ['-Infinity', -Number.MAX_VALUE],
            ['1e400', Number.MAX_VALUE],
            ['-1e400', -Number.MAX_VALUE],
            ['1.8e308', Number.MAX_VALUE],
            [new Number(Infinity), Number.MAX_VALUE],
        ]
        let rs = cs.map(([v]) => cdbl(v))
        assert.strict.deepStrictEqual(rs, cs.map(([, e]) => e))
    })

    it(`should keep Number.MAX_VALUE and -Number.MAX_VALUE as is [Q1-h 甲]`, function() {
        assert.strict.deepStrictEqual([cdbl(Number.MAX_VALUE), cdbl(-Number.MAX_VALUE)], [Number.MAX_VALUE, -Number.MAX_VALUE])
    })

    it(`should always return a finite number(never Infinity or NaN) for numeric, Infinity, overflow, underflow and non-numeric inputs [Q1-h 結果恆為有限數]`, function() {
        let vs = [Infinity, -Infinity, 'Infinity', '-Infinity', '1e400', '-1e400', '1e-400', NaN, 'NaN', null, undefined, '', '-', true, {}, [], '0x10', 1.5, '2.5', -3]
        let bad = vs.filter((v) => !Number.isFinite(cdbl(v))).map((v) => String(v))
        assert.strict.deepStrictEqual(bad, [])
    })

    it(`should not be used to exclude Infinity: isenum/iseint judge Infinity as false while cdbl(Infinity) is a finite number [Q1-h JSDoc「要排除Infinity者先以isenum／iseint判斷」]`, async function() {
        let isenum = (await import('../src/isenum.mjs')).default
        let iseint = (await import('../src/iseint.mjs')).default
        assert.strict.deepStrictEqual([isenum(Infinity), iseint(Infinity), Number.isFinite(cdbl(Infinity))], [false, false, true])
    })

})
