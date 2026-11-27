import assert from 'assert'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import calDayDiff from '../src/_calDayDiff.mjs'


//排程第675項(同機制盤點): timemsTZ2past、timemsTZ2expire之「N天前／後、N周、N個月、N年」改以兩日之日曆差計算(日期欄位於UTC日曆運算, 不經本機時間);
//  原以dayjs於本機時間建立兩日之午夜物件再diff, 於本機時區之午夜不存在之日(夏令於00:00起跳之時區, 如Africa/Cairo、America/Sao_Paulo之夏令起始日)少算1天
//  規格來源: 兩函數JSDoc之範例(t為5天前之日期得'5天前'等: 天數為兩日之日曆日差)與主控派工第675項之盤點要求
//  驗法: 子行程(test/tools/timeBetweenRunner.mjs)以TZ環境變數設定時區; 各時區之案例用其自己之偏移(使本機日期明確), 期望值為手寫之日曆差
//  修前紅: 環境變數WSEMI_TIME675_SRC指向修前之src資料夾時, 子行程改載該處之模組


let runner = fileURLToPath(new URL('./tools/timeBetweenRunner.mjs', import.meta.url))
let run = (tz, calls, walls = []) => {
    let r = spawnSync(process.execPath, [runner, JSON.stringify(calls), JSON.stringify(walls)], { env: { ...process.env, TZ: tz }, encoding: 'utf8', windowsHide: true, timeout: 60000 })
    assert.strict.deepStrictEqual(r.status, 0, r.stderr)
    let o = JSON.parse(r.stdout)
    assert.strict.deepStrictEqual(o.tz, tz)
    return o
}

//各時區之案例: [說明, t(較早), tNow(較晚), 期望之past訊息, 期望之expire訊息(以tNow為t、t為tNow)]
//  午夜不存在之日: Africa/Cairo 2026-04-24(夏令00:00→01:00)、America/Sao_Paulo 2018-11-04(夏令00:00→01:00)
let ZONES = {
    'Africa/Cairo': {
        gap: '2026-04-24T00:00:00', //該日00:00於本機不存在
        cases: [
            ['夏令起始日當日→3日後', '2026-04-24T12:00:00.000+03:00', '2026-04-27T12:00:00.000+03:00', '3天前', '3天後'],
            ['夏令起始日當日→8日後(1周)', '2026-04-24T12:00:00.000+03:00', '2026-05-02T12:00:00.000+03:00', '1周前', '1周後'],
            ['夏令起始日當日→2個月後', '2026-04-24T12:00:00.000+03:00', '2026-06-24T12:00:00.000+03:00', '2個月前', '2個月後'],
            ['夏令起始日前一日(+02:00)→起始日後3日', '2026-04-23T12:00:00.000+02:00', '2026-04-26T12:00:00.000+03:00', '3天前', '3天後'],
            ['夏令起始日當日→次日(24小時)', '2026-04-24T12:00:00.000+03:00', '2026-04-25T12:00:00.000+03:00', '昨天12:00', '24小時後，明天12:00'],
        ],
    },
    'America/Sao_Paulo': {
        gap: '2018-11-04T00:00:00',
        cases: [
            ['夏令起始日當日→3日後', '2018-11-04T12:00:00.000-02:00', '2018-11-07T12:00:00.000-02:00', '3天前', '3天後'],
            ['夏令起始日前一日(-03:00)→起始日後4日', '2018-11-03T12:00:00.000-03:00', '2018-11-07T12:00:00.000-02:00', '4天前', '4天後'],
        ],
    },
    'America/New_York': { //夏令02:00起跳(午夜存在), 對照: 結果同日曆差
        gap: null,
        cases: [
            ['夏令起始日前一日→3日後', '2026-03-07T12:00:00.000-05:00', '2026-03-10T12:00:00.000-04:00', '3天前', '3天後'],
            ['夏令結束日前一日→3日後', '2026-10-31T12:00:00.000-04:00', '2026-11-03T12:00:00.000-05:00', '3天前', '3天後'],
        ],
    },
    'Asia/Taipei': { //無夏令對照
        gap: null,
        cases: [
            ['3日', '2026-03-07T12:00:00.000+08:00', '2026-03-10T12:00:00.000+08:00', '3天前', '3天後'],
            ['月底至下月: 1月31日→3月1日(1個月)', '2026-01-31T12:00:00.000+08:00', '2026-03-01T12:00:00.000+08:00', '1個月前', '1個月後'],
            ['閏年2月29日→隔年2月28日(月底夾取: 加12個月為2月28日, 滿1年)', '2024-02-29T12:00:00.000+08:00', '2025-02-28T12:00:00.000+08:00', '1年前', '1年後'],
            ['閏年2月29日→隔年2月27日(未滿1年: 11個月)', '2024-02-29T12:00:00.000+08:00', '2025-02-27T12:00:00.000+08:00', '11個月前', '11個月後'],
            ['2年', '2024-03-10T12:00:00.000+08:00', '2026-03-10T12:00:00.000+08:00', '2年前', '2年後'],
        ],
    },
    'UTC': {
        gap: null,
        cases: [
            ['3日', '2026-03-07T12:00:00.000Z', '2026-03-10T12:00:00.000Z', '3天前', '3天後'],
            ['月底至下月: 1月31日→3月1日(1個月)', '2026-01-31T12:00:00.000Z', '2026-03-01T12:00:00.000Z', '1個月前', '1個月後'],
        ],
    },
}

describe(`排程第675項(同機制盤點): timemsTZ2past、timemsTZ2expire之天、周、月、年為日曆差`, function() {

    for (let [tz, z] of Object.entries(ZONES)) {
        it(`[${tz}] should count days, weeks, months and years by the calendar difference of the two local dates`, function() {
            let calls = []
            for (let [, t, tNow] of z.cases) {
                calls.push(['timemsTZ2past', t, tNow])
                calls.push(['timemsTZ2expire', tNow, t])
            }
            let o = run(tz, calls, z.gap ? [z.gap] : [])
            if (z.gap) {
                assert.strict.deepStrictEqual(o.isGap, [true], `${z.gap} should not exist as a local time in ${tz} (otherwise the case proves nothing)`)
            }
            for (let i = 0; i < z.cases.length; i++) {
                let [name, , , wantPast, wantExpire] = z.cases[i]
                assert.strict.deepStrictEqual(o.results[2 * i].msg, wantPast, `${tz} past ${name}`)
                assert.strict.deepStrictEqual(o.results[2 * i + 1].msg, wantExpire, `${tz} expire ${name}`)
            }
        })
    }

    it(`calDayDiff (internal) should give the calendar difference with the month-end clamp, leap days and the year 0000 to 0099 range`, function() {
        let d = (later, earlier) => calDayDiff(later, earlier)
        assert.strict.deepStrictEqual(d('2026-03-01', '2026-01-31'), { days: 29, weeks: 4, months: 1, years: 0 })
        assert.strict.deepStrictEqual(d('2026-02-28', '2026-01-31'), { days: 28, weeks: 4, months: 1, years: 0 })
        assert.strict.deepStrictEqual(d('2026-02-27', '2026-01-31'), { days: 27, weeks: 3, months: 0, years: 0 }) //周數取整數部分(27/7=3.86得3)
        assert.strict.deepStrictEqual(d('2025-02-28', '2024-02-29'), { days: 365, weeks: 52, months: 12, years: 1 })
        assert.strict.deepStrictEqual(d('2025-02-27', '2024-02-29'), { days: 364, weeks: 52, months: 11, years: 0 })
        assert.strict.deepStrictEqual(d('0000-03-01', '0000-01-01'), { days: 60, weeks: 8, months: 2, years: 0 }) //年0000為閏年(不對映為1900)
        assert.strict.deepStrictEqual(d('0100-01-31', '0099-12-31'), { days: 31, weeks: 4, months: 1, years: 0 })
        assert.strict.deepStrictEqual(d('2026-03-10', '2026-03-10'), { days: 0, weeks: 0, months: 0, years: 0 })
        //較晚早於較早、非標準寫法: null(呼叫端退回dayjs之算法)
        assert.strict.deepStrictEqual(d('2026-03-09', '2026-03-10'), null)
        assert.strict.deepStrictEqual(d('10000-01-01', '2026-03-10'), null)
        assert.strict.deepStrictEqual(d('2026-02-30', '2026-01-01'), null)
    })

    it(`source scan: timemsTZ2past and timemsTZ2expire should take the day counts from calDayDiff (and keep dayjs only for instants and as the fallback)`, function() {
        let srcDir = process.env.WSEMI_TIME675_SRC ? path.resolve(process.env.WSEMI_TIME675_SRC) : path.resolve(import.meta.dirname, '..', 'src')
        for (let n of ['timemsTZ2past', 'timemsTZ2expire']) {
            let code = fs.readFileSync(path.join(srcDir, `${n}.mjs`), 'utf8')
            assert.ok(/calDayDiff\(/.test(code), `${n} uses calDayDiff`)
        }
    })

})
