import assert from 'assert'
import addMonth from '../src/addMonth.mjs'


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

    it(`should return '' when g is the string 'Invalid Date' (ismonth accepts it, the result date is invalid)`, function() {
        assert.strict.deepStrictEqual(addMonth('Invalid Date', 1), '')
    })

})
