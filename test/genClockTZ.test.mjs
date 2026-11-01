import fs from 'fs'
import assert from 'assert'
import { mock } from 'node:test'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import genClockTZ from '../src/genClockTZ.mjs'


let __dirname = dirname(fileURLToPath(import.meta.url))
let runner = join(__dirname, 'tools', 'genClockTZRunner.mjs')


//以假時鐘固定現在時刻(只假冒Date, 不動計時器), 於fn內取值
let at = (iso, fn) => {
    mock.timers.enable({ apis: ['Date'], now: Date.parse(iso) })
    try {
        return fn()
    }
    finally {
        mock.timers.reset()
    }
}


describe(`genClockTZ`, function() {

    afterEach(function() {
        mock.timers.reset()
    })

    it(`should be exported by index from its own module`, function() {
        //R-SCOPE-01: 對外匯出; index於Node內無法整份載入(viewerjs之css), 故檢查匯出行
        let c = fs.readFileSync(new URL('../src/index.mjs', import.meta.url), 'utf8')
        assert.strict.deepStrictEqual(c.includes(`export { default as genClockTZ } from './genClockTZ.mjs'`), true)
        assert.strict.deepStrictEqual(typeof genClockTZ, 'function')
    })

    //規格(建議檔§1): timeZone必填、無效即拋且訊息含IANA; 輸入參數規格K2(必須參數不合即拋)、V20(不回顯輸入值)
    describe(`建立(timeZone為必須參數)`, function() {

        it(`should throw an Error whose message contains IANA when timeZone is missing or not a non-empty string`, function() {
            let p = Proxy.revocable({}, {})
            p.revoke()
            let bads = [undefined, null, '', 5, true, {}, [], ['Asia/Taipei'], () => 'Asia/Taipei', Symbol('x'), 10n, NaN, Object('Asia/Taipei'), p.proxy] //包裝物件與已撤銷之Proxy亦拋(不收String包裝物件, 不因讀取而拋出非預期之TypeError)
            for (let v of bads) {
                assert.throws(() => genClockTZ(v), (err) => {
                    return err instanceof Error && err.message.includes('IANA')
                }, `timeZone=${String(typeof v)}`)
            }
            assert.throws(() => genClockTZ(), /IANA/)
        })

        it(`should throw an Error whose message contains IANA when timeZone is a string but not a valid IANA time zone, without echoing the value`, function() {
            for (let v of ['Not/AZone', 'Asia/Taipeii', ' ', 'UTC+8', 'GMT+99']) {
                let msg = ''
                try {
                    genClockTZ(v)
                }
                catch (err) {
                    msg = err.message
                }
                assert.ok(msg.includes('IANA'), `timeZone=${v}`)
                assert.ok(!msg.includes(v.trim()) || v.trim() === '', `message must not echo the value: ${v}`)
            }
        })

        it(`should return an object with timeZone equal to the given string and the full method set`, function() {
            let clock = genClockTZ('Asia/Taipei')
            assert.strict.deepStrictEqual(clock.timeZone, 'Asia/Taipei')
            let ks = Object.keys(clock).sort()
            assert.strict.deepStrictEqual(ks, ['date8', 'day8', 'formatTime', 'getDate', 'getDay', 'getISO', 'getNow', 'getTimestamp', 'iso8', 'stamp8', 'timeZone'])
        })

        it(`should accept valid IANA names of several kinds (area/city, UTC, Etc/GMT offset)`, function() {
            for (let v of ['Asia/Taipei', 'UTC', 'America/New_York', 'Etc/GMT+8', 'Europe/London', 'Australia/Lord_Howe']) {
                assert.doesNotThrow(() => genClockTZ(v), v)
            }
        })

    })

    //規格(建議檔§1表): 各方法之格式; 偏移取自注入時區
    describe(`格式(同一時刻 2026-08-18T04:00:00Z)`, function() {

        let iso = '2026-08-18T04:00:00Z'

        it(`should format Asia/Taipei (+08:00) as iso8 YYYY-MM-DDTHH:mm:ssZ, stamp8 YYYYMMDDHHmmss, date8 YYYY-MM-DD, day8 YYYYMMDD, getTimestamp YYYY-MM-DD HH:mm:ss`, function() {
            let r = at(iso, () => {
                let c = genClockTZ('Asia/Taipei')
                return { iso8: c.iso8(), stamp8: c.stamp8(), date8: c.date8(), day8: c.day8(), ts: c.getTimestamp() }
            })
            assert.strict.deepStrictEqual(r, {
                iso8: '2026-08-18T12:00:00+08:00',
                stamp8: '20260818120000',
                date8: '2026-08-18',
                day8: '20260818',
                ts: '2026-08-18 12:00:00',
            })
        })

        it(`should take the UTC offset from the injected zone (UTC +00:00, America/New_York -04:00 in summer, -05:00 in winter, Asia/Kolkata +05:30)`, function() {
            let r = {
                utc: at(iso, () => genClockTZ('UTC').iso8()),
                ny: at(iso, () => genClockTZ('America/New_York').iso8()),
                nyWinter: at('2026-01-15T12:00:00Z', () => genClockTZ('America/New_York').iso8()),
                kolkata: at(iso, () => genClockTZ('Asia/Kolkata').iso8()),
            }
            assert.strict.deepStrictEqual(r, {
                utc: '2026-08-18T04:00:00+00:00',
                ny: '2026-08-18T00:00:00-04:00',
                nyWinter: '2026-01-15T07:00:00-05:00',
                kolkata: '2026-08-18T09:30:00+05:30',
            })
        })

        it(`should give a different calendar day in different zones at the same instant (2026-08-18T20:00:00Z is 08-19 in Taipei, 08-18 in New York)`, function() {
            let r = at('2026-08-18T20:00:00Z', () => {
                let tp = genClockTZ('Asia/Taipei')
                let ny = genClockTZ('America/New_York')
                return { tp: [tp.date8(), tp.day8(), tp.stamp8()], ny: [ny.date8(), ny.day8(), ny.stamp8()] }
            })
            assert.strict.deepStrictEqual(r, {
                tp: ['2026-08-19', '20260819', '20260819040000'],
                ny: ['2026-08-18', '20260818', '20260818160000'],
            })
        })

        it(`should keep the same instant across the four formats (stamp8, date8, day8, iso8, getTimestamp are one moment written differently)`, function() {
            let r = at('2026-12-31T16:30:45Z', () => {
                let c = genClockTZ('Asia/Taipei')
                return { iso8: c.iso8(), stamp8: c.stamp8(), date8: c.date8(), day8: c.day8(), ts: c.getTimestamp() }
            })
            assert.strict.deepStrictEqual(r, {
                iso8: '2027-01-01T00:30:45+08:00',
                stamp8: '20270101003045',
                date8: '2027-01-01',
                day8: '20270101',
                ts: '2027-01-01 00:30:45',
            })
        })

        it(`should read the current time on every call (not frozen at creation)`, function() {
            mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-08-18T04:00:00Z') })
            let c = genClockTZ('Asia/Taipei')
            let a = c.stamp8()
            mock.timers.setTime(Date.parse('2026-08-18T04:00:07Z'))
            let b = c.stamp8()
            mock.timers.reset()
            assert.strict.deepStrictEqual([a, b], ['20260818120000', '20260818120007'])
        })

    })

    //規格(建議檔§1): 兩套方法名並列(同一物件); 作為函數傳遞(w-data-pipeline以clock.iso8鴨子型別取用)
    describe(`兩套方法名`, function() {

        it(`should provide the pipeline-style and scheduler-style names as the same functions (iso8=getISO, stamp8=getNow)`, function() {
            let c = genClockTZ('Asia/Taipei')
            assert.strict.deepStrictEqual(c.getISO === c.iso8, true)
            assert.strict.deepStrictEqual(c.getNow === c.stamp8, true)
            let r = at('2026-08-18T04:00:00Z', () => ({ a: [c.iso8(), c.getISO()], b: [c.stamp8(), c.getNow()] }))
            assert.strict.deepStrictEqual(r, {
                a: ['2026-08-18T12:00:00+08:00', '2026-08-18T12:00:00+08:00'],
                b: ['20260818120000', '20260818120000'],
            })
        })

        it(`should work when methods are detached from the object (no this dependency)`, function() {
            let { iso8, getISO, stamp8, getNow, date8, day8, getDay, getDate, formatTime, getTimestamp } = genClockTZ('Asia/Taipei')
            let r = at('2026-08-18T04:00:00Z', () => ({
                iso8: iso8(),
                getISO: getISO(),
                stamp8: stamp8(),
                getNow: getNow(),
                date8: date8(),
                day8: day8(),
                getDay: getDay('20260101000000'),
                getDate: getDate(1),
                formatTime: formatTime('20260808214408'),
                ts: getTimestamp(),
            }))
            assert.strict.deepStrictEqual(r, {
                iso8: '2026-08-18T12:00:00+08:00',
                getISO: '2026-08-18T12:00:00+08:00',
                stamp8: '20260818120000',
                getNow: '20260818120000',
                date8: '2026-08-18',
                day8: '20260818',
                getDay: '20260101',
                getDate: '2026-08-19',
                formatTime: '2026/08/08 21:44',
                ts: '2026-08-18 12:00:00',
            })
        })

        it(`should keep two clocks independent (each anchored to its own zone)`, function() {
            let r = at('2026-08-18T04:00:00Z', () => {
                let a = genClockTZ('Asia/Taipei')
                let b = genClockTZ('America/New_York')
                return [a.iso8(), b.iso8(), a.iso8(), a.timeZone, b.timeZone]
            })
            assert.strict.deepStrictEqual(r, ['2026-08-18T12:00:00+08:00', '2026-08-18T00:00:00-04:00', '2026-08-18T12:00:00+08:00', 'Asia/Taipei', 'America/New_York'])
        })

    })

    //規格(建議檔§1表): getDay對輸入字串純切片(不重新解析); 未給或非預期輸入視為未給改用預設(K3)
    describe(`getDay(s=stamp8())`, function() {

        it(`should return the first 8 characters of the given stamp by slicing (no re-parse, no zone shift)`, function() {
            let c = genClockTZ('Asia/Taipei')
            assert.strict.deepStrictEqual(c.getDay('20260818235959'), '20260818')
            assert.strict.deepStrictEqual(c.getDay('20260818'), '20260818')
            assert.strict.deepStrictEqual(c.getDay('20260101000000'), '20260101')
            assert.strict.deepStrictEqual(c.getDay('202608181'), '20260818')
        })

        it(`should use the current stamp8 when s is not given`, function() {
            let r = at('2026-08-18T20:00:00Z', () => genClockTZ('Asia/Taipei').getDay()) //台北已是08-19
            assert.strict.deepStrictEqual(r, '20260819')
        })

        it(`should treat an unexpected s (not a string starting with 8 digits) as not given and use the current stamp8`, function() {
            let c = genClockTZ('Asia/Taipei')
            let p = Proxy.revocable({}, {})
            p.revoke()
            let bads = [undefined, null, '', 'abc', '2026-08-18', 20260818, 5, true, {}, [], ['20260818'], '2026081', ' 20260818', Object('20260818'), p.proxy]
            //假時鐘「今天」(20260819)刻意不同於各輸入中看似日期者(20260818), 才分辨得出「視為未給」與「被收下」
            let r = at('2026-08-19T04:00:00Z', () => bads.map((v) => c.getDay(v)))
            assert.strict.deepStrictEqual(r, bads.map(() => '20260819'))
        })

    })

    //規格(建議檔§1表): getDate(offsetDay=0)可取昨日(-1)/明日(1)
    describe(`getDate(offsetDay=0)`, function() {

        it(`should return today in the injected zone by default, yesterday for -1 and tomorrow for 1`, function() {
            let r = at('2026-08-18T04:00:00Z', () => {
                let c = genClockTZ('Asia/Taipei')
                return [c.getDate(), c.getDate(0), c.getDate(-1), c.getDate(1), c.getDate(30), c.getDate(-30)]
            })
            assert.strict.deepStrictEqual(r, ['2026-08-18', '2026-08-18', '2026-08-17', '2026-08-19', '2026-09-17', '2026-07-19'])
        })

        it(`should cross month, year and leap-day boundaries by calendar days`, function() {
            let rs = [
                at('2026-02-28T04:00:00Z', () => genClockTZ('Asia/Taipei').getDate(1)), //非閏年
                at('2028-02-28T04:00:00Z', () => genClockTZ('Asia/Taipei').getDate(1)), //閏年
                at('2028-02-28T04:00:00Z', () => genClockTZ('Asia/Taipei').getDate(2)),
                at('2026-12-31T04:00:00Z', () => genClockTZ('Asia/Taipei').getDate(1)),
                at('2026-01-01T04:00:00Z', () => genClockTZ('Asia/Taipei').getDate(-1)),
                at('2026-03-01T04:00:00Z', () => genClockTZ('Asia/Taipei').getDate(-1)),
            ]
            assert.strict.deepStrictEqual(rs, ['2026-03-01', '2028-02-29', '2028-03-01', '2027-01-01', '2025-12-31', '2026-02-28'])
        })

        it(`should compute the offset by calendar days across daylight saving changes (America/New_York 2026-03-08 and 2026-11-01)`, function() {
            let rs = [
                at('2026-03-08T12:00:00Z', () => genClockTZ('America/New_York').getDate(1)), //春季轉夏令: 當日只有23小時
                at('2026-03-08T12:00:00Z', () => genClockTZ('America/New_York').getDate(-1)),
                at('2026-03-07T12:00:00Z', () => genClockTZ('America/New_York').getDate(1)),
                at('2026-11-01T12:00:00Z', () => genClockTZ('America/New_York').getDate(1)), //秋季轉冬令: 當日有25小時
                at('2026-10-31T12:00:00Z', () => genClockTZ('America/New_York').getDate(1)),
            ]
            assert.strict.deepStrictEqual(rs, ['2026-03-09', '2026-03-07', '2026-03-08', '2026-11-02', '2026-11-01'])
        })

        it(`should accept numeric strings and whole-number floats like 2.0 as the offset (K4: use the converted value)`, function() {
            let rs = at('2026-08-18T04:00:00Z', () => {
                let c = genClockTZ('Asia/Taipei')
                return [c.getDate('1'), c.getDate(' -1 '), c.getDate(2.0)]
            })
            assert.strict.deepStrictEqual(rs, ['2026-08-19', '2026-08-17', '2026-08-20'])
        })

        it(`should treat an unexpected offsetDay (not an integer, or one pushing the year out of 0000-9999) as not given and use 0`, function() {
            let c = genClockTZ('Asia/Taipei')
            let bads = [undefined, null, 'x', '', 1.5, NaN, Infinity, -Infinity, true, {}, [], [1], 1e300, 9007199254740991, -9007199254740991, 3000000, -800000, 10n]
            let rs = at('2026-08-18T04:00:00Z', () => bads.map((v) => c.getDate(v)))
            assert.strict.deepStrictEqual(rs, bads.map(() => '2026-08-18'))
        })

    })

    //規格(建議檔§1表): formatTime(s)輸入為getNow()格式, 純切片組字; 輸入規格K2(必須參數不合即拋)
    describe(`formatTime(s)`, function() {

        it(`should compose YYYY/MM/DD HH:mm from a getNow() style stamp by slicing`, function() {
            let c = genClockTZ('Asia/Taipei')
            assert.strict.deepStrictEqual(c.formatTime('20260808214408'), '2026/08/08 21:44')
            assert.strict.deepStrictEqual(c.formatTime('202608082144'), '2026/08/08 21:44') //至少12位
            assert.strict.deepStrictEqual(c.formatTime('20260808214408123'), '2026/08/08 21:44') //多餘位數忽略
            assert.strict.deepStrictEqual(c.formatTime('00010203040506'), '0001/02/03 04:05')
        })

        it(`should compose from a stamp made by stamp8 without any zone conversion`, function() {
            let r = at('2026-08-18T04:00:00Z', () => {
                let c = genClockTZ('America/New_York')
                return c.formatTime(c.stamp8())
            })
            assert.strict.deepStrictEqual(r, '2026/08/18 00:00')
        })

        it(`should throw an Error when s is not a string of at least 12 digits (required parameter), without echoing the value`, function() {
            let c = genClockTZ('Asia/Taipei')
            let p = Proxy.revocable({}, {})
            p.revoke()
            let bads = [undefined, null, '', 'abc', '2026-08-08 21:44', '2026080821', '2026080821x4', 20260808214408, 5, true, {}, [], ['20260808214408'], ' 20260808214408', Object('20260808214408'), p.proxy]
            for (let v of bads) {
                assert.throws(() => c.formatTime(v), (err) => {
                    return err instanceof Error && err.message === 'invalid s: must be a stamp string of at least 12 digits (YYYYMMDDHHmm...)'
                }, `s=${typeof v}`)
            }
            assert.throws(() => c.formatTime(), /invalid s/)
        })

    })

    //規格(建議檔§1/§6.2): 偏移與日期取自注入時區, 不隨系統時區(子行程以TZ環境變數設定系統時區)
    describe(`不隨系統時區(R:建議檔§6.2)`, function() {

        this.timeout(120000)

        let run = (caseName, tzEnv) => {
            let cp = spawnSync(process.execPath, [runner, caseName], { encoding: 'utf8', env: { ...process.env, TZ: tzEnv }, timeout: 60000 })
            let line = String(cp.stdout || '').split(/\r?\n/).find((l) => l.startsWith('@@R@@'))
            assert.ok(line, `${caseName}/${tzEnv}: no result line, status=${cp.status}, stderr=${String(cp.stderr || '').slice(0, 300)}`)
            return JSON.parse(line.slice(5))
        }

        it(`should give the same results under system time zones UTC, Asia/Tokyo and America/Los_Angeles, while now2str follows the system zone`, function() {
            let expected = {
                taipei: { iso8: '2026-08-18T12:00:00+08:00', stamp8: '20260818120000', date8: '2026-08-18', day8: '20260818', ts: '2026-08-18 12:00:00', getDate: ['2026-08-17', '2026-08-18', '2026-08-19'] },
                ny: { iso8: '2026-08-18T00:00:00-04:00', stamp8: '20260818000000', date8: '2026-08-18', day8: '20260818', ts: '2026-08-18 00:00:00', getDate: ['2026-08-17', '2026-08-18', '2026-08-19'] },
            }
            let rs = {}
            for (let tzEnv of ['UTC', 'Asia/Tokyo', 'America/Los_Angeles']) {
                rs[tzEnv] = run('zones', tzEnv)
            }
            for (let tzEnv of Object.keys(rs)) {
                assert.strict.deepStrictEqual({ taipei: rs[tzEnv].taipei, ny: rs[tzEnv].ny }, expected, `system zone ${tzEnv}`)
            }
            //對照: now2str系列隨系統時區(證明本測試的確改變了系統時區)
            assert.strict.deepStrictEqual(rs['UTC'].now2str, '2026-08-18T04:00:00+00:00')
            assert.strict.deepStrictEqual(rs['Asia/Tokyo'].now2str, '2026-08-18T13:00:00+09:00')
            assert.strict.deepStrictEqual(rs['America/Los_Angeles'].now2str, '2026-08-17T21:00:00-07:00')
        })

        it(`should not change the behavior of existing dayjs-based functions (now2str family, timeTZ2 family) after a clock is created`, function() {
            for (let tzEnv of ['UTC', 'Asia/Tokyo', 'America/Los_Angeles']) {
                let r = run('sideEffects', tzEnv)
                assert.strict.deepStrictEqual(r.after, r.before, `system zone ${tzEnv}`)
                assert.ok(r.before.now2str.length > 0 && r.before.timeTZ2day.length > 0, 'battery must be non-empty')
            }
        })

        //審查發現(dayjs tz外掛把目標牆鐘當系統本地時間解析, 落在系統時區夏令轉換間隙時差1小時): 逐5分鐘掃系統時區夏令轉換前後, iso8()所表示之瞬間須等於實際瞬間
        it(`should denote the exact current instant (iso8 parses back to it) and agree with stamp8 across the system zone's daylight saving gaps, for zones with whole/half-hour and DST offsets`, function() {
            for (let tzEnv of ['America/Los_Angeles', 'Europe/London', 'Australia/Lord_Howe', 'Asia/Taipei']) {
                let r = run('sweep', tzEnv)
                assert.ok(r.checks > 1000, `${tzEnv}: checks=${r.checks}`)
                assert.strict.deepStrictEqual(r.mismatches, [], `system zone ${tzEnv}`)
            }
        })

    })

    //規格(建議檔§6.2): 實際現在時間(不假冒Date), 以iso8()之偏移還原瞬間作獨立對照(只比對瞬間,不依賴任何時區資料庫之對照實作)
    describe(`實際現在時間(不假冒Date)`, function() {

        it(`should give an iso8 whose instant equals the real current time (within a few seconds) in every zone, and stamp8/date8/day8/getTimestamp that agree with iso8`, function() {
            for (let z of ['Asia/Taipei', 'America/New_York', 'UTC', 'Asia/Kolkata', 'Australia/Lord_Howe']) {
                let c = genClockTZ(z)
                let t0 = Date.now()
                let iso = c.iso8()
                let t1 = Date.now()
                let ms = Date.parse(iso)
                assert.ok(ms >= Math.floor(t0 / 1000) * 1000 && ms <= t1, `${z}: ${iso} vs ${t0}..${t1}`)
                //四種寫法同一時刻(以同一瞬間之假時鐘對照,避免跨秒)
                let r = at(iso, () => ({ stamp8: c.stamp8(), date8: c.date8(), day8: c.day8(), ts: c.getTimestamp() }))
                let digits = iso.slice(0, 19).replace(/\D/g, '')
                assert.strict.deepStrictEqual(r, { stamp8: digits, date8: iso.slice(0, 10), day8: digits.slice(0, 8), ts: iso.slice(0, 10) + ' ' + iso.slice(11, 19) }, z)
            }
        })

    })

})
