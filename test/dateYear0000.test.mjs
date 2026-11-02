import assert from 'assert'
import ismonth from '../src/ismonth.mjs'
import isday from '../src/isday.mjs'
import istime from '../src/istime.mjs'
import istimems from '../src/istimems.mjs'
import istimeTZ from '../src/istimeTZ.mjs'
import istimemsTZ from '../src/istimemsTZ.mjs'
import addMonth from '../src/addMonth.mjs'
import day2cht from '../src/day2cht.mjs'
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
import getTimeRange from '../src/getTimeRange.mjs'
import getTimeObject from '../src/getTimeObject.mjs'
import { loadStubbed } from './tools/domStubKit.mjs'


//第221項第二批第2輪第3批(ws272c): 年份0000~0099之日期字串(主控2026-11-02判定, ws272b回報範圍外第1項)
//  緣由: dayjs解析無時區字串時以new Date(y, m, d, …)建立, 年份0~99被對映為1900~1999, 致ismonth等六個判斷不收'0000-01'~'0099-12'類字串, addMonth之結果(年份0~9999)無法回送ismonth;
//  做法: 內部_dayjs.mjs對年份0000~0099之標準寫法字串以Date.setFullYear建立日期(不受對映影響), 其餘輸入原樣交dayjs; 依賴該判斷之轉換與計算函數(time2day等)改用同一包裝, 年份0000~0099之結果正確
//  規格: dspec〈輸入參數之檢測機制〉§3.5(年份限0000~9999)、§5.3 C2(判斷類永不拋錯、布林須反映真實性); 預言(oracle)為純整數之曆法運算(格里曆, 0年為閏年), 不依dayjs與Date


const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
const dim = (y, m) => [31, leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]
const p2 = (n) => String(n).padStart(2, '0')
const p4 = (n) => String(n).padStart(4, '0')


//年份樣本: 0000~0130全數(含兩位數年份對映範圍0000~0099、其前後與閏年規律: 0000閏、0100非閏、0400閏), 及世紀邊界、1900年前後(舊對映目標)、2000年、9999
const YEARS = [
    ...Array.from({ length: 131 }, (v, i) => i),
    198, 199, 200, 201, 299, 300, 399, 400, 401, 1899, 1900, 1901, 1999, 2000, 2001, 2100, 9998, 9999,
]


describe(`date strings of year 0000 to 0099 (ws272c)`, function() {

    //--- 六個判斷 ---

    it(`ismonth should accept YYYY-01 to YYYY-12 and reject month 00 and 13 for every sample year, including 0000 to 0099`, function() {
        for (let y of YEARS) {
            for (let m = 1; m <= 12; m++) {
                assert.strict.deepStrictEqual(ismonth(`${p4(y)}-${p2(m)}`), true, `${p4(y)}-${p2(m)}`)
            }
            assert.strict.deepStrictEqual(ismonth(`${p4(y)}-00`), false, `${p4(y)}-00`)
            assert.strict.deepStrictEqual(ismonth(`${p4(y)}-13`), false, `${p4(y)}-13`)
        }
    })

    it(`ismonth should reject the non-canonical writings of years 0000 to 0099 (the same as for other years)`, function() {
        for (let s of ['0000-1', '00-01', '0-01', '000-01', '0000-001', '0000/01', '0000-01-01', ' 0000-01', '0000-01 ', '+0000-01', '-0001-01', '0000-0a', 'Invalid Date', '']) {
            assert.strict.deepStrictEqual(ismonth(s), false, JSON.stringify(s))
        }
    })

    it(`isday should follow the proleptic Gregorian calendar for every sample year, including 0000 to 0099: last day valid, last day + 1 invalid, Feb 29 only in leap years (0000 and 0400 leap, 0100 not)`, function() {
        for (let y of YEARS) {
            for (let m = 1; m <= 12; m++) {
                let n = dim(y, m)
                assert.strict.deepStrictEqual(isday(`${p4(y)}-${p2(m)}-01`), true, `${p4(y)}-${p2(m)}-01`)
                assert.strict.deepStrictEqual(isday(`${p4(y)}-${p2(m)}-${p2(n)}`), true, `${p4(y)}-${p2(m)}-${p2(n)}`)
                assert.strict.deepStrictEqual(isday(`${p4(y)}-${p2(m)}-${p2(n + 1)}`), false, `${p4(y)}-${p2(m)}-${p2(n + 1)}`)
                assert.strict.deepStrictEqual(isday(`${p4(y)}-${p2(m)}-00`), false, `${p4(y)}-${p2(m)}-00`)
            }
            assert.strict.deepStrictEqual(isday(`${p4(y)}-02-29`), leap(y), `${p4(y)}-02-29`)
        }
        assert.strict.deepStrictEqual([isday('0000-02-29'), isday('0100-02-29'), isday('0400-02-29'), isday('0096-02-29'), isday('0099-02-29')], [true, false, true, true, false])
    })

    it(`istime and istimems should accept the full time range 00:00:00 to 23:59:59(.999) and reject 24:00:00, minute 60, second 60 and millisecond digits other than 3 for every sample year, including 0000 to 0099`, function() {
        for (let y of YEARS) {
            let d = `${p4(y)}-12-31`
            assert.strict.deepStrictEqual(istime(`${d}T00:00:00`), true, `${d}T00:00:00`)
            assert.strict.deepStrictEqual(istime(`${d}T23:59:59`), true, `${d}T23:59:59`)
            assert.strict.deepStrictEqual(istime(`${d}T24:00:00`), false, `${d}T24:00:00`)
            assert.strict.deepStrictEqual(istime(`${d}T00:60:00`), false, `${d}T00:60:00`)
            assert.strict.deepStrictEqual(istime(`${d}T00:00:60`), false, `${d}T00:00:60`)
            assert.strict.deepStrictEqual(istime(`${p4(y)}-02-30T00:00:00`), false, `${p4(y)}-02-30T00:00:00`)
            assert.strict.deepStrictEqual(istimems(`${d}T00:00:00.000`), true, `${d}T00:00:00.000`)
            assert.strict.deepStrictEqual(istimems(`${d}T23:59:59.999`), true, `${d}T23:59:59.999`)
            assert.strict.deepStrictEqual(istimems(`${d}T23:59:59`), false, `${d}T23:59:59 (no ms)`)
            assert.strict.deepStrictEqual(istimems(`${d}T23:59:59.99`), false, `${d}T23:59:59.99`)
            assert.strict.deepStrictEqual(istimems(`${d}T24:00:00.000`), false, `${d}T24:00:00.000`)
            assert.strict.deepStrictEqual(istime(`${d}T23:59:59.999`), false, `istime must not take the ms writing`)
        }
    })

    it(`istimeTZ and istimemsTZ should accept the time zones Z, +08:00 and -05:30 and reject a bad zone for every sample year, including 0000 to 0099`, function() {
        for (let y of YEARS) {
            let t = `${p4(y)}-07-04T12:34:56`
            for (let z of ['Z', '+08:00', '-05:30', '+00:00']) {
                assert.strict.deepStrictEqual(istimeTZ(`${t}${z}`), true, `${t}${z}`)
                assert.strict.deepStrictEqual(istimemsTZ(`${t}.789${z}`), true, `${t}.789${z}`)
            }
            for (let z of ['A', '+8:00', '+08:0', '08:00', '']) {
                assert.strict.deepStrictEqual(istimeTZ(`${t}${z}`), false, `${t}${z}`)
                assert.strict.deepStrictEqual(istimemsTZ(`${t}.789${z}`), false, `${t}.789${z}`)
            }
            assert.strict.deepStrictEqual(istimeTZ(`${p4(y)}-02-30T12:34:56Z`), false)
            assert.strict.deepStrictEqual(istimemsTZ(`${p4(y)}-13-01T12:34:56.789Z`), false)
        }
    })

    it(`the six judgers should keep rejecting 'Invalid Date' kinds of strings (ws272b cases stay green)`, function() {
        for (let s of ['Invalid Date', 'Invalid DateZ', 'Invalid Date.000', 'Invalid Date.000Z', 'Invalid Date+08:00', 'Invalid', 'NaN', 'undefined']) {
            assert.strict.deepStrictEqual([ismonth(s), isday(s), istime(s), istimems(s), istimeTZ(s), istimemsTZ(s)], [false, false, false, false, false, false], s)
        }
    })

    it(`the boundary years 0000, 0099 and 0100 should all be accepted by all six judgers`, function() {
        for (let y of ['0000', '0099', '0100']) {
            assert.strict.deepStrictEqual([ismonth(`${y}-06`), isday(`${y}-06-15`), istime(`${y}-06-15T10:20:30`), istimems(`${y}-06-15T10:20:30.456`), istimeTZ(`${y}-06-15T10:20:30+08:00`), istimemsTZ(`${y}-06-15T10:20:30.456Z`)], [true, true, true, true, true, true], y)
        }
    })

    it(`the judgers should never throw for inputs of any type (judging functions do not throw)`, function() {
        for (let v of [undefined, null, 0, NaN, {}, [], () => 1, Symbol('x'), 1n, new String('0000-01'), true]) { // eslint-disable-line no-new-wrappers
            for (let f of [ismonth, isday, istime, istimems, istimeTZ, istimemsTZ]) {
                assert.doesNotThrow(() => f(v))
            }
        }
    })

    //--- addMonth: 結果年份0~9999皆可回送ismonth, 且與純整數運算一致 ---

    it(`addMonth should equal the pure integer arithmetic for year 0000 to 0130 and the boundary years, and every non-empty result should be accepted by ismonth`, function() {
        let ns = [-1300, -121, -120, -13, -12, -11, -2, -1, 0, 1, 2, 11, 12, 13, 24, 25, 120, 121, 1200, 1201]
        for (let y of YEARS) {
            for (let m of [1, 2, 6, 11, 12]) {
                let g = `${p4(y)}-${p2(m)}`
                for (let n of ns) {
                    let total = y * 12 + (m - 1) + n
                    let ry = Math.floor(total / 12)
                    let rm = total - ry * 12 + 1
                    let exp = (ry < 0 || ry > 9999) ? '' : `${p4(ry)}-${p2(rm)}`
                    let r = addMonth(g, n)
                    assert.strict.deepStrictEqual(r, exp, `addMonth('${g}', ${n})`)
                    if (r !== '') {
                        assert.ok(ismonth(r), `ismonth('${r}')`)
                    }
                }
            }
        }
    })

    it(`addMonth should round trip over the year 0099 / 0100 boundary and from 0000-01`, function() {
        assert.strict.deepStrictEqual([addMonth('0099-12', 1), addMonth('0100-01', -1), addMonth('0000-01', 0), addMonth('0000-01', -1), addMonth('0000-01', 1200), addMonth('0100-01', -1200), addMonth('0100-01', -1201)], ['0100-01', '0099-12', '0000-01', '', '0100-01', '0000-01', ''])
        for (let y of [0, 1, 50, 99, 100]) {
            let g = `${p4(y)}-05`
            assert.strict.deepStrictEqual(addMonth(addMonth(g, 7000), -7000), g)
        }
    })

    //--- 依賴判斷之轉換函數: 年份0000~0099之結果須正確(格式化結果即輸入字串之前綴) ---

    it(`the time converters should keep the year 0000 to 0099 (and 0100, 1999, 9999) in their results: formerly the year became 19xx or the result was empty`, function() {
        for (let y of ['0000', '0001', '0004', '0050', '0099', '0100', '0101', '1999', '2000', '9999']) {
            let day = `${y}-03-04`
            let t = `${day}T12:34:56`
            let tm = `${t}.789`
            assert.strict.deepStrictEqual([time2day(t), time2hour(t), time2min(t)], [day, `${day}T12`, `${day}T12:34`], `time2* ${y}`)
            assert.strict.deepStrictEqual([timems2day(tm), timems2hour(tm), timems2min(tm), timems2time(tm)], [day, `${day}T12`, `${day}T12:34`, t], `timems2* ${y}`)
            for (let z of ['+08:00', 'Z', '-05:30']) {
                assert.strict.deepStrictEqual([timeTZ2day(`${t}${z}`), timeTZ2hour(`${t}${z}`), timeTZ2min(`${t}${z}`)], [day, `${day}T12`, `${day}T12:34`], `timeTZ2* ${y} ${z}`)
                assert.strict.deepStrictEqual([timemsTZ2day(`${tm}${z}`), timemsTZ2hour(`${tm}${z}`), timemsTZ2min(`${tm}${z}`), timemsTZ2time(`${tm}${z}`)], [day, `${day}T12`, `${day}T12:34`, t], `timemsTZ2* ${y} ${z}`)
            }
        }
    })

    it(`the time converters should return '' (or the error state) for invalid strings of years 0000 to 0099, as for other years`, function() {
        for (let s of ['0050-02-30T12:34:56', '0050-13-04T12:34:56', '0050-03-04T24:00:00', '0050-3-4T12:34:56']) {
            assert.strict.deepStrictEqual([time2day(s), time2hour(s), time2min(s)], ['', '', ''], s)
        }
        assert.strict.deepStrictEqual(time2day('0050-02-30T12:34:56', { returnWithStateAndMsg: true }), { state: 'error', msg: 'invalid t' })
    })

    it(`day2cht should use the real year for the year 0050 (formerly 1950 was shown if the year were accepted), and refuse an invalid day`, function() {
        assert.strict.deepStrictEqual(day2cht('0050-03-04'), `民國 ${50 - 1911} 年 3 月 4 日`)
        assert.strict.deepStrictEqual(day2cht('0000-12-31'), `民國 ${0 - 1911} 年 12 月 31 日`)
        assert.strict.deepStrictEqual(day2cht('0099-03-04', true), '3月4日')
        assert.strict.deepStrictEqual(day2cht('0100-02-29'), '')
        assert.strict.deepStrictEqual(day2cht('2019-01-02'), '民國 108 年 1 月 2 日')
    })

    it(`getTimeRange should give the same range text for the year 0050 as for the year 2050 shifted by the formatting only`, function() {
        assert.strict.deepStrictEqual(getTimeRange('0050-03-04T08:00:00', '0050-03-04T10:30:00'), '0050-03-04T08:00 至 10:30')
        assert.strict.deepStrictEqual(getTimeRange('0050-03-04T08:00:00', '0050-03-05T10:30:00'), '0050-03-04T08:00 至 0050-03-05T10:30')
        assert.strict.deepStrictEqual(getTimeRange('0050-03-04T08:00:00'), '0050-03-04T08:00 至 無')
        assert.strict.deepStrictEqual(getTimeRange('2050-03-04T08:00:00', '2050-03-04T10:30:00'), '2050-03-04T08:00 至 10:30')
    })

    it(`getTimeRange should treat the range over the 0099 / 0100 boundary as a range over two days (the former mapping put 0099 at 1999)`, function() {
        assert.strict.deepStrictEqual(getTimeRange('0099-12-31T23:00:00', '0100-01-01T01:00:00'), '0099-12-31T23:00 至 0100-01-01T01:00')
        assert.strict.deepStrictEqual(getTimeRange('0100-01-01T01:00:00', '0099-12-31T23:00:00'), '0100-01-01T01:00 至 0099-12-31T23:00 (起始時間大於結束時間)')
    })

    it(`timemsTZ2expire and timemsTZ2past should count days across the 0099 / 0100 boundary (3 days)`, function() {
        assert.strict.deepStrictEqual(timemsTZ2expire('0100-01-02T12:00:00.000+08:00', '0099-12-30T12:00:00.000+08:00'), { today: false, msg: '3天後', err: '' })
        assert.strict.deepStrictEqual(timemsTZ2past('0099-12-30T12:00:00.000+08:00', '0100-01-02T12:00:00.000+08:00'), { today: false, msg: '3天前', err: '' })
    })

    it(`timemsTZ2past and timemsTZ2expire should still throw Error('invalid dayjs') when dayjs is not available (UMD without the dayjs global); the former isfun(ot) guard became dead code because the wrapper is always a function`, async function() {
        //獨立複核發現: 包裝_dayjs.mjs恆為函數, 兩函數原『!isfun(ot)則throw invalid dayjs』之守門失效, 改由包裝於dayjs不可用時拋出同一錯誤; 以載入掛鉤使整條依賴鏈之dayjs為undefined
        let tNow = '2023-06-15T12:00:00.000+08:00'
        let t = '2023-06-14T12:00:00.000+08:00'
        for (let [name, args] of [['timemsTZ2past', [t, tNow]], ['timemsTZ2expire', [tNow, t]]]) {
            let f = await loadStubbed(name, { noDayjs: true })
            assert.throws(() => f(...args), (err) => err instanceof Error && err.message === 'invalid dayjs', name)
        }
        //對照: dayjs可用時照常
        assert.strict.deepStrictEqual(timemsTZ2past(t, tNow).err, '')
    })

    it(`getTimeObject should return the dayjs object of the real year for 0050 and 0099, and null for an invalid day`, function() {
        let o = getTimeObject('0050-03-04T12:34:56', 'seconds')
        assert.strict.deepStrictEqual([o.year(), o.month(), o.date(), o.hour(), o.format('YYYY-MM-DDTHH:mm:ss')], [50, 2, 4, 12, '0050-03-04T12:34:56'])
        let d = getTimeObject('0099-12-31', 'days')
        assert.strict.deepStrictEqual([d.year(), d.add(1, 'day').format('YYYY-MM-DD')], [99, '0100-01-01'])
        assert.strict.deepStrictEqual(getTimeObject('0050-02-30', 'days'), null)
        assert.strict.deepStrictEqual(getTimeObject('0100-02-29', 'days'), null)
        assert.strict.deepStrictEqual(getTimeObject('0000-02-29', 'days').year(), 0)
    })

    it(`timemsTZ2past should count the elapsed years from the real year (0050 and 0100), not from 1950`, function() {
        //同一牆上時刻(中午)比較, 不受主機時區使本地日期差一日之影響
        let tNow = '2023-06-15T12:00:00.000+08:00'
        let r50 = timemsTZ2past('0050-06-15T12:00:00.000+08:00', tNow)
        let r100 = timemsTZ2past('0100-06-15T12:00:00.000+08:00', tNow)
        assert.strict.deepStrictEqual([r50.err, r100.err], ['', ''])
        assert.strict.deepStrictEqual([r50.msg, r100.msg], ['1973年前', '1923年前'])
    })

})
