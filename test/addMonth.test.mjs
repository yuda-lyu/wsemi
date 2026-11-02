import assert from 'assert'
import addMonth from '../src/addMonth.mjs'
import ismonth from '../src/ismonth.mjs'


describe(`addMonth`, function() {

    it(`should return '2019-03' when input '2019-01',2`, function() {
        let r = addMonth('2019-01', 2)
        assert.strict.deepStrictEqual(r, '2019-03')
    })

    it(`should return '2019-01' when input '2018-12',1`, function() {
        let r = addMonth('2018-12', 1)
        assert.strict.deepStrictEqual(r, '2019-01')
    })

    it(`should return '2018-11' when input '2018-12',-1`, function() {
        let r = addMonth('2018-12', -1)
        assert.strict.deepStrictEqual(r, '2018-11')
    })

    it(`should return '' when input 123.456,1`, function() {
        let r = addMonth(123.456, 1)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '123.456',1`, function() {
        let r = addMonth('123.456', 1)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '',1`, function() {
        let r = addMonth('', 1)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input [],1`, function() {
        let r = addMonth([], 1)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {},1`, function() {
        let r = addMonth({}, 1)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null,1`, function() {
        let r = addMonth(null, 1)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined,1`, function() {
        let r = addMonth(undefined, 1)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 123.456`, function() {
        let r = addMonth(123.456)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '123.456'`, function() {
        let r = addMonth('123.456')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = addMonth('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = addMonth([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = addMonth({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = addMonth(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = addMonth(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = addMonth(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

    //第221項已知缺陷先修(ws270): n為必須參數, 改iseint(n, { use: 'safe' })並Number()取值; 計算後日期無效(超出dayjs可表示範圍)亦回傳''(修前輸出字串'Invalid Date')

    describe(`valid n (iseint safe, converted by Number())`, function() {

        for (let [label, g, n, rr] of [
            [`'2019-01', '3'`, '2019-01', '3', '2019-04'],
            [`'2019-01', ' 3 '`, '2019-01', ' 3 ', '2019-04'],
            [`'2019-01', '3.0'`, '2019-01', '3.0', '2019-04'],
            [`'2019-01', '1e1'`, '2019-01', '1e1', '2019-11'],
            [`'2019-01', -2`, '2019-01', -2, '2018-11'],
            [`'2019-01', '-2'`, '2019-01', '-2', '2018-11'],
            [`'2019-01', 0`, '2019-01', 0, '2019-01'],
            [`'2019-01', '0'`, '2019-01', '0', '2019-01'],
            [`'2019-01', 12`, '2019-01', 12, '2020-01'],
            [`'2019-01', -12`, '2019-01', -12, '2018-01'],
            [`'2019-01', 1200`, '2019-01', 1200, '2119-01'],
        ]) {
            it(`should return '${rr}' when input ${label}`, function() {
                assert.strict.deepStrictEqual(addMonth(g, n), rr)
            })
        }

    })

    describe(`invalid n (iseint false) should return ''`, function() {

        for (let [label, n] of [
            ['Infinity', Infinity],
            ['-Infinity', -Infinity],
            [`'Infinity'`, 'Infinity'],
            ['1.5', 1.5],
            [`'1.5'`, '1.5'],
            [`'0x2'`, '0x2'],
            ['2 ** 53 (not safe)', 2 ** 53],
            ['1e21', 1e21],
            [`'1e21'`, '1e21'],
            ['new Number(2)', new Number(2)], // eslint-disable-line no-new-wrappers
            ['2n', 2n],
            ['true', true],
            ['NaN', NaN],
            [`'abc'`, 'abc'],
            [`''`, ''],
            [`'   '`, '   '],
            ['undefined (n not given)', undefined],
            ['null', null],
            ['true', true],
            ['false', false],
            [`'true'`, 'true'],
            ['[]', []],
            ['[2]', [2]],
            ['{}', {}],
        ]) {
            it(`should return '' when input '2020-01', ${label}`, function() {
                assert.strict.deepStrictEqual(addMonth('2020-01', n), '')
            })
        }

    })

    describe(`result date invalid (beyond the dayjs range) should return '' instead of 'Invalid Date'`, function() {

        for (let [label, n] of [
            ['1e9', 1e9],
            ['-1e9', -1e9],
            ['1e15', 1e15],
            ['-1e15', -1e15],
            ['Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER],
            ['Number.MIN_SAFE_INTEGER', Number.MIN_SAFE_INTEGER],
            [`'1000000000000000'`, '1000000000000000'],
        ]) {
            it(`should return '' when input '2020-01', ${label}`, function() {
                assert.strict.deepStrictEqual(addMonth('2020-01', n), '')
            })
        }

    })

    it(`should return '' when g is the string 'Invalid Date' (ismonth rejects it since ws272b; formerly ismonth accepted it and the result date was invalid)`, function() {
        assert.strict.deepStrictEqual(addMonth('Invalid Date', 1), '')
    })

    //ws270回報: 計算結果年份超出0~9999時format得'10353-05'、'-6314-09'等不符月時間格式之字串, 應回傳''
    describe(`result year beyond 0 to 9999 should return '' (not '10353-05' or '-6314-09')`, function() {

        it(`should return '' when input '2020-01', 100000 (formerly '10353-05')`, function() {
            assert.strict.deepStrictEqual(addMonth('2020-01', 100000), '')
        })

        it(`should return '' when input '2020-01', -100000 (formerly '-6314-09')`, function() {
            assert.strict.deepStrictEqual(addMonth('2020-01', -100000), '')
        })

        //邊界: 9999-12 加0仍有效, 加1為10000年
        it(`should return '9999-12' when input '9999-12', 0, and '' when input '9999-12', 1`, function() {
            assert.strict.deepStrictEqual(addMonth('9999-12', 0), '9999-12')
            assert.strict.deepStrictEqual(addMonth('9999-12', 1), '')
            assert.strict.deepStrictEqual(addMonth('9999-12', 12), '')
        })

        it(`should return '9999-12' when input '9999-01', 11, and '' when input '9999-01', 12`, function() {
            assert.strict.deepStrictEqual(addMonth('9999-01', 11), '9999-12')
            assert.strict.deepStrictEqual(addMonth('9999-01', 12), '')
        })

        it(`should return '9999-12' when input '9998-12', 12, and '' when input '9998-12', 13`, function() {
            assert.strict.deepStrictEqual(addMonth('9998-12', 12), '9999-12')
            assert.strict.deepStrictEqual(addMonth('9998-12', 13), '')
        })

        //下界: 0100-01減1200個月為0000-01(年份0在0~9999內), 再減1為負年; ismonth收0000~9999年(ws272c起, 不再受dayjs兩位數年份對映為1900~1999影響)
        it(`should return '0000-01' when input '0100-01', -1200, and '' when input '0100-01', -1201 (year -1)`, function() {
            assert.strict.deepStrictEqual(addMonth('0100-01', -1200), '0000-01')
            assert.strict.deepStrictEqual(addMonth('0100-01', -1201), '')
            assert.strict.deepStrictEqual(addMonth('0100-01', -2400), '')
        })

        it(`should accept the inputs '0000-01' to '0099-12' (year 0000 to 0099), and return '' only when the result year is below 0`, function() {
            assert.strict.deepStrictEqual(addMonth('0000-01', 0), '0000-01')
            assert.strict.deepStrictEqual(addMonth('0000-01', -1), '')
            assert.strict.deepStrictEqual(addMonth('0000-01', 1), '0000-02')
            assert.strict.deepStrictEqual(addMonth('0000-12', 1), '0001-01')
            assert.strict.deepStrictEqual(addMonth('0099-12', 1), '0100-01')
            assert.strict.deepStrictEqual(addMonth('0099-12', -1), '0099-11')
            assert.strict.deepStrictEqual(addMonth('0050-06', 25), '0052-07')
        })

        //格式: 回傳值若非''必為YYYY-MM四位數年份, 且為ismonth所收(0000~9999年)
        it(`should return a string accepted by ismonth whenever the result is not '' (sweep of n around the boundaries)`, function() {
            for (let g of ['2020-01', '9999-12', '1000-06', '0100-01']) {
                for (let n = -130000; n <= 130000; n += 997) {
                    let r = addMonth(g, n)
                    if (r !== '') {
                        assert.ok(/^\d{4}-\d{2}$/.test(r), `${g} ${n} -> ${r}`)
                        assert.ok(ismonth(r), `${g} ${n} -> ${r} should be accepted by ismonth (ws272c)`)
                    }
                }
            }
        })

        it(`should return the expected year for results inside the range (round trip n and -n)`, function() {
            assert.strict.deepStrictEqual(addMonth('2020-01', 2), '2020-03')
            assert.strict.deepStrictEqual(addMonth(addMonth('2020-01', 7000), -7000), '2020-01')
            assert.strict.deepStrictEqual(addMonth('2020-01', 95748), '9999-01') //(9999 - 2020) * 12 = 95748
            assert.strict.deepStrictEqual(addMonth('2020-01', 95759), '9999-12')
            assert.strict.deepStrictEqual(addMonth('2020-01', 95760), '') //10000-01
        })

    })

})
