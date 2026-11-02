import assert from 'assert'
import ismonth from '../src/ismonth.mjs'
import isday from '../src/isday.mjs'
import istime from '../src/istime.mjs'
import istimeTZ from '../src/istimeTZ.mjs'
import istimems from '../src/istimems.mjs'
import istimemsTZ from '../src/istimemsTZ.mjs'
import isDate from '../src/isDate.mjs'
import day2cht from '../src/day2cht.mjs'
import getTimeRange from '../src/getTimeRange.mjs'
import time2day from '../src/time2day.mjs'
import time2hour from '../src/time2hour.mjs'
import time2min from '../src/time2min.mjs'
import timems2day from '../src/timems2day.mjs'
import timems2hour from '../src/timems2hour.mjs'
import timems2min from '../src/timems2min.mjs'
import timems2time from '../src/timems2time.mjs'
import timeTZ2day from '../src/timeTZ2day.mjs'
import timeTZ2hour from '../src/timeTZ2hour.mjs'
import timeTZ2min from '../src/timeTZ2min.mjs'
import timemsTZ2day from '../src/timemsTZ2day.mjs'
import timemsTZ2hour from '../src/timemsTZ2hour.mjs'
import timemsTZ2min from '../src/timemsTZ2min.mjs'
import timemsTZ2time from '../src/timemsTZ2time.mjs'
import timemsTZ2past from '../src/timemsTZ2past.mjs'
import timemsTZ2expire from '../src/timemsTZ2expire.mjs'


//判斷月、日、時間(含時區、毫秒)字串之函數對無效日期字串之判定(ws272b; ws270回報: ismonth('Invalid Date')為true)
//  成因: 判定寫成 ot(v, ft).format(ft) === v, dayjs對無效日期format亦回傳字串'Invalid Date', 輸入若恰為'Invalid Date'(或去除時區後為'Invalid Date')即相等而誤判為true
//  規格: 判斷類函數(dspec §5.3 C2)之布林須反映「是否為該格式之真實存在之日期時間」; 無效日期一律false
//  各函數各有'Invalid Date'案例(無缺陷者作為回歸)
//isDate為寬鬆判斷(dspec §3.5: 以原生new Date解析, 收數字、Date物件, 且V8舊式解析器會忽略未知字詞而收'Invalid Date.000'、'2020-02-30'等), 不屬「格式化後比對」之嚴格判斷, 故只納入'Invalid Date'本身及其僅含時區後綴、時間後綴之字串(原生解析為無效日期者)作為回歸
const FNS = [
    ['ismonth', ismonth, '2020-01', false],
    ['isday', isday, '2020-01-02', false],
    ['istime', istime, '2020-01-02T03:04:05', false],
    ['istimeTZ', istimeTZ, '2020-01-02T03:04:05Z', false],
    ['istimems', istimems, '2020-01-02T03:04:05.006', false],
    ['istimemsTZ', istimemsTZ, '2020-01-02T03:04:05.006Z', false],
    ['isDate', isDate, '2020-01-02', true],
]

//isDate(寬鬆)須為false之無效日期字串(原生解析為無效日期者)
const LENIENT_INVALID_LABELS = ['Invalid Date', 'Invalid DateZ', 'Invalid Date+08:00', 'Invalid Date-05:30', 'Invalid DateT00:00:00', 'invalid date (lowercase)', 'Invalid Date with trailing space', 'Invalid Date with leading space']

//無效日期字串: 'Invalid Date'本身及其附加時區後綴者(去除時區後為'Invalid Date')
const INVALID_DATE_STR = [
    ['Invalid Date', 'Invalid Date'],
    ['Invalid DateZ', 'Invalid DateZ'],
    ['Invalid Date+08:00', 'Invalid Date+08:00'],
    ['Invalid Date-05:30', 'Invalid Date-05:30'],
    ['Invalid Date.000', 'Invalid Date.000'],
    ['Invalid Date.000Z', 'Invalid Date.000Z'],
    ['Invalid DateT00:00:00', 'Invalid DateT00:00:00'],
    ['invalid date (lowercase)', 'invalid date'],
    ['Invalid Date with trailing space', 'Invalid Date '],
    ['Invalid Date with leading space', ' Invalid Date'],
]

//格式正確但不存在之日期時間(收緊前後皆為false, 作為回歸)
const IMPOSSIBLE_STR = [
    ['2020-13', '2020-13'],
    ['2020-00', '2020-00'],
    ['2020-02-30', '2020-02-30'],
    ['2021-02-29', '2021-02-29'],
    ['2020-01-32', '2020-01-32'],
    ['2020-01-02T24:00:00', '2020-01-02T24:00:00'],
    ['2020-01-02T03:60:05', '2020-01-02T03:60:05'],
    ['2020-01-02T03:04:60', '2020-01-02T03:04:60'],
    ['NaN-NaN', 'NaN-NaN'],
    ['NaN', 'NaN'],
    [`''`, ''],
]


//wsemi內部以這些判斷作為入口守門之轉換函數: 'Invalid Date'修前通過守門而輸出'Invalid Date'或無意義之物件, 修後走格式錯誤之處置（日期轉換回''、過期判斷回err）
describe(`internal callers of the date-time is* functions reject 'Invalid Date' strings`, function() {

    it(`should return '' (formerly the string 'Invalid Date') for time2day, time2hour, time2min, timems2day, timems2hour, timems2min, timems2time`, function() {
        for (let f of [time2day, time2hour, time2min, timems2day, timems2hour, timems2min, timems2time]) {
            assert.strict.deepStrictEqual(f('Invalid Date'), '')
        }
    })

    it(`should return '' (formerly the string 'Invalid Date') for timeTZ2day, timeTZ2hour, timeTZ2min, timemsTZ2day, timemsTZ2hour, timemsTZ2min, timemsTZ2time`, function() {
        for (let f of [timeTZ2day, timeTZ2hour, timeTZ2min, timemsTZ2day, timemsTZ2hour, timemsTZ2min, timemsTZ2time]) {
            assert.strict.deepStrictEqual(f('Invalid DateZ'), '')
        }
    })

    it(`should return the format error (formerly msg 剛剛／即將到來) for timemsTZ2past and timemsTZ2expire`, function() {
        assert.strict.deepStrictEqual(timemsTZ2past('Invalid DateZ'), { today: null, msg: '', err: '時間格式錯誤' })
        assert.strict.deepStrictEqual(timemsTZ2expire('Invalid DateZ'), { today: null, msg: '', err: '時間格式錯誤' })
    })

    it(`should return '' for day2cht (formerly 民國 NaN 年 NaN 月 NaN 日) and a non-range for getTimeRange`, function() {
        assert.strict.deepStrictEqual(day2cht('Invalid Date'), '')
        assert.notStrictEqual(getTimeRange('Invalid Date'), 'Invalid Date 至 無')
        assert.strict.deepStrictEqual(getTimeRange('Invalid Date'), '') //ws286b: tstart無效回''(原回中文訊息)
    })

    it(`should keep the converters on real date-times`, function() {
        assert.strict.deepStrictEqual(time2day('2020-01-02T03:04:05'), '2020-01-02')
        assert.strict.deepStrictEqual(timems2day('2020-01-02T03:04:05.006'), '2020-01-02')
        assert.strict.deepStrictEqual(timeTZ2day('2020-01-02T03:04:05Z'), '2020-01-02')
    })

})


describe(`is* date-time functions on invalid dates`, function() {

    for (let [name, f, ok, lenient] of FNS) {

        describe(name, function() {

            it(`should return true for a real date-time ${ok} (control)`, function() {
                assert.strict.deepStrictEqual(f(ok), true)
            })

            for (let [label, v] of INVALID_DATE_STR) {
                if (lenient && !LENIENT_INVALID_LABELS.includes(label)) {
                    continue
                }
                it(`should return false for the invalid date string ${label}`, function() {
                    assert.strict.deepStrictEqual(f(v), false)
                })
            }

            if (!lenient) {

                for (let [label, v] of IMPOSSIBLE_STR) {
                    it(`should return false for the impossible date string ${label}`, function() {
                        assert.strict.deepStrictEqual(f(v), false)
                    })
                }

                it(`should return false for non-string input and for an invalid Date object`, function() {
                    for (let v of [null, undefined, NaN, 123, true, [], {}, new Date(NaN)]) {
                        assert.strict.deepStrictEqual(f(v), false)
                    }
                })

            }
            else {

                it(`should return false for an invalid Date object and for non-date inputs null, undefined, NaN`, function() {
                    for (let v of [null, undefined, NaN, new Date(NaN)]) {
                        assert.strict.deepStrictEqual(f(v), false)
                    }
                })

            }

        })

    }

})
