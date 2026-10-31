/* eslint-disable no-new-wrappers -- 測試刻意以包裝物件驗證(isnum依內部標籤放行, R-WRAPPER-01) */
import assert from 'assert'
import vm from 'vm'
import preciseNum from '../src/preciseNum.mjs'


describe(`preciseNum`, function() {

    it(`should return '0' when input 0`, function() {
        let r = preciseNum(0)
        let rr = '0'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '1' when input 1`, function() {
        let r = preciseNum(1)
        let rr = '1'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '0.3' when input 0.3`, function() {
        let r = preciseNum(0.3)
        let rr = '0.3'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '0.3' when input 0.1 + 0.2`, function() {
        let r = preciseNum(0.1 + 0.2)
        let rr = '0.3'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '106.19' when input 4.67 + 7.12 + 94.4`, function() {
        let r = preciseNum(4.67 + 7.12 + 94.4)
        let rr = '106.19'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '106.19' when input 94.4 + 7.12 + 4.67`, function() {
        let r = preciseNum(94.4 + 7.12 + 4.67)
        let rr = '106.19'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input 0, { returnDigit: true }`, function() {
        let r = preciseNum(0, { returnDigit: true })
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input 1, { returnDigit: true }`, function() {
        let r = preciseNum(1, { returnDigit: true })
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 0.3, { returnDigit: true }`, function() {
        let r = preciseNum(0.3, { returnDigit: true })
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 0.1 + 0.2, { returnDigit: true }`, function() {
        let r = preciseNum(0.1 + 0.2, { returnDigit: true })
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2 when input 4.67 + 7.12 + 94.4, { returnDigit: true }`, function() {
        let r = preciseNum(4.67 + 7.12 + 94.4, { returnDigit: true })
        let rr = 2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2 when input 94.4 + 7.12 + 4.67, { returnDigit: true }`, function() {
        let r = preciseNum(94.4 + 7.12 + 4.67, { returnDigit: true })
        let rr = 2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '-0.3' when input -0.3`, function() {
        let r = preciseNum(-0.3)
        let rr = '-0.3'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '-0.3' when input -0.1 - 0.2`, function() {
        let r = preciseNum(-0.1 - 0.2)
        let rr = '-0.3'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '-106.19' when input -4.67 - 7.12 - 94.4`, function() {
        let r = preciseNum(-4.67 - 7.12 - 94.4)
        let rr = '-106.19'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '-106.19' when input -94.4 - 7.12 - 4.67`, function() {
        let r = preciseNum(-94.4 - 7.12 - 4.67)
        let rr = '-106.19'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input ''`, function() {
        let r = ''
        try {
            r = preciseNum('')
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input false`, function() {
        let r = ''
        try {
            r = preciseNum(false)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input []`, function() {
        let r = ''
        try {
            r = preciseNum([])
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input {}`, function() {
        let r = ''
        try {
            r = preciseNum({})
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input null`, function() {
        let r = ''
        try {
            r = preciseNum(null)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input undefined`, function() {
        let r = ''
        try {
            r = preciseNum(undefined)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    //小數值不得被歸零(排程第218項, dspec〈輸入參數之檢測機制〉§7.1〈精度之處理〉): 以decimal.js之12位有效數字取代固定eps=1e-9(使用者2026-10-31由15位改定12位)
    //對應述語P1: 小於1e-9之小數值保留其有效數字, 不回'0.0'
    it(`should return '0.00000000001' when input 1e-11`, function() {
        let r = preciseNum(1e-11)
        assert.strict.deepStrictEqual(r, '0.00000000001')
    })

    it(`should return 11 when input 1e-11, { returnDigit: true }`, function() {
        let r = preciseNum(1e-11, { returnDigit: true })
        assert.strict.deepStrictEqual(r, 11)
    })

    it(`should return '-0.00000000001' when input -1e-11`, function() {
        let r = preciseNum(-1e-11)
        assert.strict.deepStrictEqual(r, '-0.00000000001')
    })

    it(`should return '0.0000000005' when input 5e-10`, function() {
        let r = preciseNum(5e-10)
        assert.strict.deepStrictEqual(r, '0.0000000005')
    })

    it(`should return '0.000000000000001' when input 1e-15`, function() {
        let r = preciseNum(1e-15)
        assert.strict.deepStrictEqual(r, '0.000000000000001')
    })

    it(`should return 15 when input 1e-15, { returnDigit: true }`, function() {
        let r = preciseNum(1e-15, { returnDigit: true })
        assert.strict.deepStrictEqual(r, 15)
    })

    it(`should keep the smallest positive double when input 5e-324`, function() {
        let r = preciseNum(5e-324)
        assert.strict.deepStrictEqual(r.length, 326) // '0.' + 323個0 + '5'
        assert.strict.deepStrictEqual(r.endsWith('5'), true)
        assert.strict.deepStrictEqual(preciseNum(5e-324, { returnDigit: true }), 324)
    })

    //對應述語P2: 12位有效數字, 輸出格式不補尾零
    it(`should return '1.23456789012' when input 1.23456789012`, function() {
        let r = preciseNum(1.23456789012)
        assert.strict.deepStrictEqual(r, '1.23456789012')
    })

    it(`should return 11 when input 1.23456789012, { returnDigit: true }`, function() {
        let r = preciseNum(1.23456789012, { returnDigit: true })
        assert.strict.deepStrictEqual(r, 11)
    })

    it(`should round to 12 significant digits when input 12345678.123456789`, function() {
        assert.strict.deepStrictEqual(preciseNum(12345678.123456789), '12345678.1235')
        assert.strict.deepStrictEqual(preciseNum(12345678.123456789, { returnDigit: true }), 4)
    })

    //對應述語P2: 第12位有效數字保留, 第13位起捨入(ROUND_HALF_UP)
    it(`should keep the 12th and round off from the 13th significant digit`, function() {
        assert.strict.deepStrictEqual(preciseNum(1.234567890123), '1.23456789012') //第13位為3, 捨去
        assert.strict.deepStrictEqual(preciseNum(1.234567890127), '1.23456789013') //第13位為7, 進位
        assert.strict.deepStrictEqual(preciseNum(1.23456789012, { returnDigit: true }), 11)
        assert.strict.deepStrictEqual(preciseNum(1.234567890123, { returnDigit: true }), 11)
        assert.strict.deepStrictEqual(preciseNum(0.123456789012), '0.123456789012') //前導零不計有效數字, 12位完整保留
        assert.strict.deepStrictEqual(preciseNum(0.123456789012, { returnDigit: true }), 12)
        assert.strict.deepStrictEqual(preciseNum(0.1234567890123), '0.123456789012')
        assert.strict.deepStrictEqual(preciseNum(-1.234567890127), '-1.23456789013')
        assert.strict.deepStrictEqual(preciseNum(1.2345678901249), '1.23456789012') //進位邊界兩側: 相差2e-13, 捨入後相異
        assert.strict.deepStrictEqual(preciseNum(1.2345678901251), '1.23456789013')
    })

    it(`should return '1' when input 0.9999999999999999`, function() {
        assert.strict.deepStrictEqual(preciseNum(0.9999999999999999), '1')
        assert.strict.deepStrictEqual(preciseNum(0.9999999999999999, { returnDigit: true }), 0)
    })

    it(`should return '0.0000001' when input 1e-7`, function() {
        assert.strict.deepStrictEqual(preciseNum(1e-7), '0.0000001')
        assert.strict.deepStrictEqual(preciseNum(1e-7, { returnDigit: true }), 7)
    })

    //對應述語P3: 數字字串(含頭尾空白、科學記號)與數值同結果
    it(`should return same result when input numeric strings`, function() {
        assert.strict.deepStrictEqual(preciseNum('1e-11'), '0.00000000001')
        assert.strict.deepStrictEqual(preciseNum(' 1.5 '), '1.5')
        assert.strict.deepStrictEqual(preciseNum(' 1.5 '), '1.5')
        assert.strict.deepStrictEqual(preciseNum('1.5e-5'), '0.000015')
        assert.strict.deepStrictEqual(preciseNum('0.30000000000000004'), '0.3')
        assert.strict.deepStrictEqual(preciseNum('.5'), '0.5')
        assert.strict.deepStrictEqual(preciseNum('-.5'), '-0.5')
        assert.strict.deepStrictEqual(preciseNum('+.5'), '0.5')
        assert.strict.deepStrictEqual(preciseNum(' 1e-11 ', { returnDigit: true }), 11)
    })

    //對應述語P4: 整數(isint為true)路徑不變, 不經12位有效數字處理
    it(`should keep integer path unchanged`, function() {
        assert.strict.deepStrictEqual(preciseNum(5), '5')
        assert.strict.deepStrictEqual(preciseNum('5'), '5')
        assert.strict.deepStrictEqual(preciseNum(1e21), '1e+21')
        assert.strict.deepStrictEqual(preciseNum(123456789012345680), '123456789012345680')
        assert.strict.deepStrictEqual(preciseNum(123456789012345680, { returnDigit: true }), 0)
        //第221項第一批: Infinity不是有效數字(isenum), throw(修前整數路徑回'Infinity')
        assert.throws(() => preciseNum(Infinity), { message: 'v is not a number' })
    })

    it(`should return '0.3' for 0.1 + 0.2 and keep 12 digits stable`, function() {
        assert.strict.deepStrictEqual(preciseNum(0.1 + 0.2), '0.3')
        assert.strict.deepStrictEqual(preciseNum(0.1 * 3), '0.3')
        assert.strict.deepStrictEqual(preciseNum(1.1 + 2.2), '3.3')
        assert.strict.deepStrictEqual(preciseNum(1.1 + 2.2, { returnDigit: true }), 1)
    })

    //對應述語P5(第221項第一批改): 判定由isnum改isenum, 包裝物件不解包(R-WRAPPER-01規則4), 一律throw(修前放行並轉為原始數字)
    it(`should throw v is not a number when input wrapper objects (isenum does not unwrap)`, function() {
        assert.throws(() => preciseNum(new Number(1.5)), { message: 'v is not a number' })
        assert.throws(() => preciseNum(new String('1.5')), { message: 'v is not a number' })
        assert.throws(() => preciseNum(Object('1.5')), { message: 'v is not a number' })
        assert.throws(() => preciseNum(new Number(1.5), { returnDigit: true }), { message: 'v is not a number' })
        assert.throws(() => preciseNum(new Number(5)), { message: 'v is not a number' }) //整數路徑
        assert.throws(() => preciseNum(vm.runInNewContext('new Number(1.5)')), { message: 'v is not a number' }) //跨領域
        assert.throws(() => preciseNum(vm.runInNewContext('new String(" 2.25 ")')), { message: 'v is not a number' })
        assert.throws(() => preciseNum(new Number(1e-11)), { message: 'v is not a number' })
    })

    //對應述語P6(第221項第一批改): 整數路徑(isint為true)之有效數字字串原樣返回(去頭尾空白); isnum放行而isenum不收之寫法throw(修前原樣返回)
    it(`should return integer-path numeric strings as they are and throw for the ones isenum rejects`, function() {
        assert.strict.deepStrictEqual(preciseNum('1.5e3'), '1.5e3')
        assert.strict.deepStrictEqual(preciseNum(' 1.5e3 '), '1.5e3')
        assert.strict.deepStrictEqual(preciseNum('1e1'), '1e1')
        for (let s of ['0x10', 'Infinity', '-Infinity', '1e400', '0b11', '0o7']) {
            assert.throws(() => preciseNum(s), { message: 'v is not a number' }, s)
            assert.throws(() => preciseNum(s, { returnDigit: true }), { message: 'v is not a number' }, s)
        }
    })

    //對應述語P7: 12位有效數字之捨入(超過者捨入, 含數字字串; 大量級之小數)
    it(`should round to 12 significant digits for long numeric strings and large magnitudes`, function() {
        assert.strict.deepStrictEqual(preciseNum(' 0.35096605331636965 '), '0.350966053316')
        assert.strict.deepStrictEqual(preciseNum(' 0.35096605331636965 ', { returnDigit: true }), 12)
        assert.strict.deepStrictEqual(preciseNum(123456789012345.6), '123456789012000') //非整數, 大量級: 整數位亦只留12位有效數字
        assert.strict.deepStrictEqual(preciseNum(123456789012345.6, { returnDigit: true }), 0)
        assert.strict.deepStrictEqual(preciseNum(1234567890123.5), '1234567890120')
        assert.strict.deepStrictEqual(preciseNum(0.30493705000000004), '0.30493705')
        assert.strict.deepStrictEqual(preciseNum(-0.0000000000012345), '-0.0000000000012345')
        assert.strict.deepStrictEqual(preciseNum(' 1.5 '), '1.5')
    })

    //對應述語P8(使用者2026-10-31改定12位): 累積誤差與第12/13位邊界
    it(`should absorb accumulated float error: 0.1 summed 1000 times is '100'`, function() {
        let s = 0
        for (let i = 0; i < 1000; i++) {
            s += 0.1
        }
        assert.strict.deepStrictEqual(s !== 100, true) //前提: 浮點累積確有誤差(99.9999999999986)
        assert.strict.deepStrictEqual(preciseNum(s), '100')
        assert.strict.deepStrictEqual(preciseNum(s, { returnDigit: true }), 0)
    })

    it(`should treat 1 + 1e-12 (13th digit) as '1' and keep 1 + 1e-10, 1 + 1e-11 (11th, 12th digit)`, function() {
        assert.strict.deepStrictEqual(preciseNum(1 + 1e-12), '1')
        assert.strict.deepStrictEqual(preciseNum(1 + 1e-12, { returnDigit: true }), 0)
        assert.strict.deepStrictEqual(preciseNum(1 + 1e-11), '1.00000000001')
        assert.strict.deepStrictEqual(preciseNum(1 + 1e-11, { returnDigit: true }), 11)
        assert.strict.deepStrictEqual(preciseNum(1 + 1e-10), '1.0000000001')
        assert.strict.deepStrictEqual(preciseNum(1 + 1e-10, { returnDigit: true }), 10)
    })

    //對應述語P8: 量級不影響有效位數(小量級為相對精度, 大量級之整數位受12位限制; 整數路徑原樣不受限)
    it(`should keep 12 significant digits for small and large magnitudes`, function() {
        assert.strict.deepStrictEqual(preciseNum(3.2e-10), '0.00000000032')
        assert.strict.deepStrictEqual(preciseNum(3.2e-10, { returnDigit: true }), 11)
        assert.strict.deepStrictEqual(preciseNum(3.21234567891234e-10), '0.000000000321234567891') //第13位起捨入
        assert.strict.deepStrictEqual(preciseNum(3.21234567891234e-10, { returnDigit: true }), 21)
        assert.strict.deepStrictEqual(preciseNum(3.2123456789e-20), '0.000000000000000000032123456789')
        assert.strict.deepStrictEqual(preciseNum(3.2123456789e-20, { returnDigit: true }), 30) //11位有效數字, 首位在小數第20位
        assert.strict.deepStrictEqual(preciseNum(1.23456789012345e20), '123456789012345000000') //雖為大量級, 其為整數(isint為true)走整數路徑, 原樣不捨入
        assert.strict.deepStrictEqual(preciseNum(1.23456789012345e14 + 0.5), '123456789012000') //大量級之非整數(123456789012345.5)
        assert.strict.deepStrictEqual(preciseNum(123456.789012345), '123456.789012')
    })

    it(`should return 'v is not a number' when input NaN`, function() {
        let r = ''
        try {
            r = preciseNum(NaN)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

})
