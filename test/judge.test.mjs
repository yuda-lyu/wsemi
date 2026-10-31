import assert from 'assert'
import judge from '../src/judge.mjs'
import Decimal from 'decimal.js'


describe(`judge`, function() {

    it(`should return true when input 0, '>=', 0, { withPreciseNum: false }`, function() {
        let r = judge(0, '>=', 0, { withPreciseNum: false })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input 1, '>=', 1, { withPreciseNum: false }`, function() {
        let r = judge(1, '>=', 1, { withPreciseNum: false })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input 0.3, '>=', 0.1 + 0.2, { withPreciseNum: false }`, function() {
        let r = judge(0.3, '>=', 0.1 + 0.2, { withPreciseNum: false })
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input 0.3, '>=', 0.1 + 0.2, { withPreciseNum: true }`, function() {
        let r = judge(0.3, '>=', 0.1 + 0.2, { withPreciseNum: true })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input 0.3, '>=', Decimal.sum(0.1, 0.2).toString(), { withPreciseNum: false }`, function() {
        let r = judge(0.3, '>=', Decimal.sum(0.1, 0.2).toString(), { withPreciseNum: false })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input Decimal.sum(0.1, 0.2).toString(), '>=', 0.3, { withPreciseNum: false }`, function() {
        let r = judge(Decimal.sum(0.1, 0.2).toString(), '>=', 0.3, { withPreciseNum: false })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input 4.67 + 7.12 + 94.4, '>=',  94.4 + 7.12 + 4.67, { withPreciseNum: false }`, function() {
        let r = judge(4.67 + 7.12 + 94.4, '>=', 94.4 + 7.12 + 4.67, { withPreciseNum: false })
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input 4.67 + 7.12 + 94.4, '>=',  94.4 + 7.12 + 4.67, { withPreciseNum: true }`, function() {
        let r = judge(4.67 + 7.12 + 94.4, '>=', 94.4 + 7.12 + 4.67, { withPreciseNum: true })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input Decimal.sum(4.67, 7.12, 94.4).toString(), '>=', Decimal.sum(94.4, 7.12, 4.67).toString(), { withPreciseNum: false }`, function() {
        let r = judge(Decimal.sum(4.67, 7.12, 94.4).toString(), '>=', Decimal.sum(94.4, 7.12, 4.67).toString(), { withPreciseNum: false })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = ''
        try {
            r = judge('')
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input false`, function() {
        let r = ''
        try {
            r = judge(false)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = ''
        try {
            r = judge([])
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = ''
        try {
            r = judge({})
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = ''
        try {
            r = judge(null)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = ''
        try {
            r = judge(undefined)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    //小數值不得被歸零(排程第218項): preciseNum改為12位有效數字後, 小於1e-9之小數值與0可區分
    it(`should compare values below 1e-9 with 0 correctly`, function() {
        assert.strict.deepStrictEqual(judge(1e-11, '>', 0), true)
        assert.strict.deepStrictEqual(judge(1e-11, '>=', 0), true)
        assert.strict.deepStrictEqual(judge(1e-11, '===', 0), false)
        assert.strict.deepStrictEqual(judge(1e-11, '!==', 0), true)
        assert.strict.deepStrictEqual(judge(1e-11, '<', 0), false)
        assert.strict.deepStrictEqual(judge(1e-11, '<=', 0), false)
        assert.strict.deepStrictEqual(judge(0, '<', 1e-11), true)
        assert.strict.deepStrictEqual(judge(-1e-11, '<', 0), true)
        assert.strict.deepStrictEqual(judge(-1e-11, '<=', 0), true)
    })

    it(`should compare two values below 1e-9 correctly`, function() {
        assert.strict.deepStrictEqual(judge(2e-11, '>', 1e-11), true)
        assert.strict.deepStrictEqual(judge(1e-11, '===', 1e-11), true)
        assert.strict.deepStrictEqual(judge(1e-10, '>', 1e-11), true)
        assert.strict.deepStrictEqual(judge(1e-11, '<', 1e-10), true)
    })

    it(`should compare numeric strings below 1e-9 correctly`, function() {
        assert.strict.deepStrictEqual(judge('1e-11', '>', '0'), true)
        assert.strict.deepStrictEqual(judge(' 1e-11 ', '>', 0), true)
        assert.strict.deepStrictEqual(judge('0.00000000001', '===', 1e-11), true)
    })

    it(`should compare small values the same with withPreciseNum false`, function() {
        assert.strict.deepStrictEqual(judge(1e-11, '>', 0, { withPreciseNum: false }), true)
        assert.strict.deepStrictEqual(judge(1e-11, '===', 0, { withPreciseNum: false }), false)
    })

    it(`should treat float errors as equal with 12 significant digits`, function() {
        assert.strict.deepStrictEqual(judge(0.1 + 0.2, '===', 0.3), true)
        assert.strict.deepStrictEqual(judge(0.1 + 0.2, '>', 0.3), false)
        assert.strict.deepStrictEqual(judge(0.3, '>=', 0.1 + 0.2), true)
        assert.strict.deepStrictEqual(judge(4.67 + 7.12 + 94.4, '===', 94.4 + 7.12 + 4.67), true)
        assert.strict.deepStrictEqual(judge(12345678.123456789, '===', 12345678.12345679), true) //超過12位有效數字之差異視為相等
        assert.strict.deepStrictEqual(judge(12345678.12344, '===', 12345678.12341), true) //同捨入為12345678.1234
        assert.strict.deepStrictEqual(judge(12345678.1234, '===', 12345678.1235), false) //第12位有效數字內之差異可區分
        assert.strict.deepStrictEqual(judge(0.123456789012, '<', 0.123456789013), true) //第12位有效數字內之差異可區分
        assert.strict.deepStrictEqual(judge(0.123456789012345, '===', 0.123456789012346), true) //第13位起之差異視為相等
    })

    //對應JSDoc: 比較以12位有效數字為界, 第12位內之差異可區分, 第13位起視為相等(含累積誤差)
    it(`should absorb accumulated float error: 0.1 summed 1000 times equals 100`, function() {
        let s = 0
        for (let i = 0; i < 1000; i++) {
            s += 0.1
        }
        assert.strict.deepStrictEqual(s !== 100, true) //前提: 99.9999999999986, 浮點累積確有誤差
        assert.strict.deepStrictEqual(judge(s, '===', 100), true)
        assert.strict.deepStrictEqual(judge(s, '!==', 100), false)
        assert.strict.deepStrictEqual(judge(s, '<', 100), false)
        assert.strict.deepStrictEqual(judge(s, '>', 100), false)
        assert.strict.deepStrictEqual(judge(s, '>=', 100), true)
        assert.strict.deepStrictEqual(judge(s, '<=', 100), true)
    })

    //對應JSDoc: 第13位(1e-12)視為相等, 第11位(1e-10)、第12位(1e-11)可區分
    it(`should treat 1 + 1e-12 as equal to 1 but distinguish 1 + 1e-11 and 1 + 1e-10`, function() {
        assert.strict.deepStrictEqual(judge(1 + 1e-12, '===', 1), true)
        assert.strict.deepStrictEqual(judge(1 + 1e-12, '>', 1), false)
        assert.strict.deepStrictEqual(judge(1 + 1e-12, '>=', 1), true)
        assert.strict.deepStrictEqual(judge(1 + 1e-11, '===', 1), false)
        assert.strict.deepStrictEqual(judge(1 + 1e-11, '>', 1), true)
        assert.strict.deepStrictEqual(judge(1 + 1e-10, '===', 1), false)
        assert.strict.deepStrictEqual(judge(1 + 1e-10, '>', 1), true)
        assert.strict.deepStrictEqual(judge(1, '<', 1 + 1e-10), true)
    })

    //對應JSDoc: 量級——小量級為相對精度, 大量級(非整數)之整數位亦只比12位
    it(`should compare small and large magnitudes by 12 significant digits`, function() {
        assert.strict.deepStrictEqual(judge(3.2e-10, '>', 3.1e-10), true) //小量級不歸零
        assert.strict.deepStrictEqual(judge(3.2e-10, '===', 3.2000000000001e-10), true) //第14位有效數字之差異視為相等
        assert.strict.deepStrictEqual(judge(3.2e-10, '===', 3.20000000001e-10), false) //第12位有效數字之差異可區分
        assert.strict.deepStrictEqual(judge(123456789012345.6, '===', 123456789012345.7), true) //大量級之非整數, 第13位起視為相等
        assert.strict.deepStrictEqual(judge(1.23456789012345e20, '===', 1.23456789012e20), false) //整數走整數路徑, 原樣精確比較
        assert.strict.deepStrictEqual(judge(1.2345678901249, '===', 1.2345678901251), false) //捨入後比較: 相差極微但跨越第12位進位邊界者仍被區分(JSDoc已載)
    })

    //第221項第一批: 判定由isnum改isenum, 包裝物件不解包(R-WRAPPER-01規則4), 屬無效輸入throw(修前放行為true)
    it(`should throw x1 is not a number when input wrapper objects (isenum does not unwrap)`, function() {
        assert.throws(() => judge(new Number(1.5), '===', 1.5), { message: 'x1 is not a number' }) // eslint-disable-line no-new-wrappers
        assert.throws(() => judge(new Number(1.5), '>', 1), { message: 'x1 is not a number' }) // eslint-disable-line no-new-wrappers
    })

    it(`should return '' when input NaN`, function() {
        let r = ''
        try {
            r = judge(NaN)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

})
