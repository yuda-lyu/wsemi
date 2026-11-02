import assert from 'assert'
import getTimeRange from '../src/getTimeRange.mjs'


//ws286b: tstart無效、tend有給但無效(含null、'')一律回傳''(原回中文訊息'無起始時間'、'結束時間格式錯誤'當資料); tend未給(undefined)視同tstart、正常輸出(含「起始時間大於結束時間」之文字)不變
//  規格: dspec〈輸入參數之檢測機制〉§5.3 C19(不以人讀訊息作回傳值)、使用者2026-11-02定(回'', 不加雙模式)
describe(`getTimeRange`, function() {

    it(`sould return '2019-01-01T09:00 至 無' when input '2019-01-01T09:00:00'`, function() {
        let r = getTimeRange('2019-01-01T09:00:00')
        let rr = '2019-01-01T09:00 至 無'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-01T09:00 至 12:34' when input '2019-01-01T09:00:00', '2019-01-01T12:34:56'`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', '2019-01-01T12:34:56')
        let rr = '2019-01-01T09:00 至 12:34'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-01T09:00 至 12:00' when input '2019-01-01T09:00:00', '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', '2019-01-01T12:00:00')
        let rr = '2019-01-01T09:00 至 12:00'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-01T19:00 至 12:00 (起始時間大於結束時間)' when input '2019-01-01T19:00:00', '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange('2019-01-01T19:00:00', '2019-01-01T12:00:00')
        let rr = '2019-01-01T19:00 至 12:00 (起始時間大於結束時間)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-01T09:00 至 2019-01-03T12:00' when input '2019-01-01T09:00:00', '2019-01-03T12:00:00'`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', '2019-01-03T12:00:00')
        let rr = '2019-01-01T09:00 至 2019-01-03T12:00'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-03T09:00 至 2019-01-01T12:00 (起始時間大於結束時間)' when input '2019-01-03T09:00:00', '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange('2019-01-03T09:00:00', '2019-01-01T12:00:00')
        let rr = '2019-01-03T09:00 至 2019-01-01T12:00 (起始時間大於結束時間)'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input '2019-01-01T09:00:00', ''`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', '')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input '2019-01-01T09:00:00', []`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', [])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input '2019-01-01T09:00:00', {}`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', {})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input '2019-01-01T09:00:00', null`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '2019-01-01T09:00 至 無' when input '2019-01-01T09:00:00', undefined`, function() {
        let r = getTimeRange('2019-01-01T09:00:00', undefined)
        let rr = '2019-01-01T09:00 至 無'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input '', '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange('', '2019-01-01T12:00:00')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input [], '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange([], '2019-01-01T12:00:00')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}, '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange({}, '2019-01-01T12:00:00')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null, '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange(null, '2019-01-01T12:00:00')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined, '2019-01-01T12:00:00'`, function() {
        let r = getTimeRange(undefined, '2019-01-01T12:00:00')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = getTimeRange('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = getTimeRange([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = getTimeRange({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = getTimeRange(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = getTimeRange(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input NaN`, function() {
        let r = getTimeRange(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    //無效值表: tstart、tend兩邊皆回'', 且輸出不得含舊中文訊息(不以人讀訊息作回傳值)
    //  tend為undefined是『未給』(視同tstart)而非無效, 故不在tend一側之表內
    describe(`invalid values table (no legacy Chinese message in the output)`, function() {

        let T = '2019-01-01T09:00:00'
        let INVALID = [
            ['empty string', ''],
            ['space', ' '],
            ['text', 'abc'],
            ['Invalid Date', 'Invalid Date'],
            ['date only', '2019-01-01'],
            ['no seconds', '2019-01-01T09:00'],
            ['with Z', '2019-01-01T09:00:00Z'],
            ['space separator', '2019-01-01 09:00:00'],
            ['month 13', '2019-13-45T00:00:00'],
            ['Feb 30', '2019-02-30T00:00:00'],
            ['padded', ' 2019-01-01T09:00:00 '],
            ['0', 0],
            ['123', 123],
            ['NaN', NaN],
            ['true', true],
            ['null', null],
            ['[]', []],
            ['{}', {}],
            ['Date object', new Date(0)],
        ]
        let LEGACY = ['無起始時間', '結束時間格式錯誤']

        for (let [label, v] of INVALID) {
            it(`should return '' (no legacy message) when tstart is invalid: ${label}`, function() {
                for (let args of [[v, T], [v]]) {
                    let r = getTimeRange(...args)
                    assert.strict.deepStrictEqual(r, '')
                    for (let m of LEGACY) {
                        assert.strict.deepStrictEqual(r.includes(m), false)
                    }
                }
            })

            it(`should return '' (no legacy message) when tend is given but invalid: ${label}`, function() {
                let r = getTimeRange(T, v)
                assert.strict.deepStrictEqual(r, '')
                for (let m of LEGACY) {
                    assert.strict.deepStrictEqual(r.includes(m), false)
                }
            })

            it(`should return '' when both tstart and tend are invalid: ${label}`, function() {
                assert.strict.deepStrictEqual(getTimeRange(v, v), '')
            })
        }

        it(`should treat an omitted tend (undefined) as the same as tstart, not as invalid`, function() {
            assert.strict.deepStrictEqual(getTimeRange(T, undefined), '2019-01-01T09:00 至 無')
            assert.strict.deepStrictEqual(getTimeRange(T), '2019-01-01T09:00 至 無')
            assert.strict.deepStrictEqual(getTimeRange(undefined, undefined), '')
        })

        it(`should keep the normal outputs, including the text of start greater than end`, function() {
            assert.strict.deepStrictEqual(getTimeRange(T, '2019-01-01T08:00:00'), '2019-01-01T09:00 至 08:00 (起始時間大於結束時間)')
            assert.strict.deepStrictEqual(getTimeRange(T, '2018-12-31T08:00:00'), '2019-01-01T09:00 至 2018-12-31T08:00 (起始時間大於結束時間)')
            assert.strict.deepStrictEqual(getTimeRange(T, '2019-01-02T08:00:00'), '2019-01-01T09:00 至 2019-01-02T08:00')
        })

    })

})
