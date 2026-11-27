import assert from 'assert'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import getTimeBetween from '../src/getTimeBetween.mjs'
import getTimeObject from '../src/getTimeObject.mjs'
import { loadStubbed } from './tools/domStubKit.mjs'


//排程第675項: getTimeBetween、getTimeObject改為不經本機時間之計算(同第428項之機制; 原以本機時間之dayjs物件diff與add, 於有夏令之時區跨空窗或重疊時段序列缺項或重複, 空窗內之時刻回傳null)
//  規格來源: 兩函數JSDoc(不含時區之牆鐘時刻, 逐欄驗證後以日曆欄位運算, 結果不受執行環境之時區影響, 各時區之結果相同)與主控派工第675項
//  驗法: 子行程(test/tools/timeBetweenRunner.mjs)於有夏令之時區(America/New_York、Europe/London、Australia/Sydney〔空窗與重疊皆有〕、America/Sao_Paulo〔午夜起跳〕)、
//    整日跳過之時區(Pacific/Apia 2011-12-30、Pacific/Kiritimati 1994-12-31)、曾有夏令而今無之時區(Asia/Taipei 1979)與無夏令之Asia/Taipei、UTC執行; 各時區之結果須相同且等於下列手寫之期望值
//  修前紅: 環境變數WSEMI_TIME675_SRC指向修前之src資料夾時, 子行程改載該處之模組


let runner = fileURLToPath(new URL('./tools/timeBetweenRunner.mjs', import.meta.url))
let run = (tz, calls, walls = []) => {
    let r = spawnSync(process.execPath, [runner, JSON.stringify(calls), JSON.stringify(walls)], { env: { ...process.env, TZ: tz }, encoding: 'utf8', windowsHide: true, timeout: 60000 })
    assert.strict.deepStrictEqual(r.status, 0, r.stderr)
    let o = JSON.parse(r.stdout)
    assert.strict.deepStrictEqual(o.tz, tz) //確認子行程之系統時區即所設者(TZ未生效時不得當作已驗)
    return o
}

let TZS = ['America/New_York', 'Europe/London', 'Australia/Sydney', 'America/Sao_Paulo', 'Pacific/Apia', 'Pacific/Kiritimati', 'Asia/Taipei', 'UTC']

//鑑別前提: 各牆鐘時刻於其時區之性質(gap: 本地不存在; dup: 本地出現兩次)
let GAPS = [
    ['America/New_York', '2026-03-08T02:30:00'],
    ['Europe/London', '2026-03-29T01:30:00'],
    ['Australia/Sydney', '2026-10-04T02:30:00'],
    ['America/Sao_Paulo', '2018-11-04T00:30:00'], //午夜起跳, 'days'單位之2018-11-04 00:00不存在
    ['Pacific/Apia', '2011-12-30T12:00:00'], //整日跳過
    ['Pacific/Kiritimati', '1994-12-31T12:00:00'], //整日跳過
    ['Asia/Taipei', '1979-07-01T00:48:15'], //1979年夏令00:00→01:00
]
let DUPS = [
    ['America/New_York', '2026-11-01T01:30:00'],
    ['Europe/London', '2026-10-25T01:30:00'],
    ['Australia/Sydney', '2026-04-05T02:30:00'],
]

//期望值(手寫, 各時區皆同): 逐項為[說明, 呼叫, 期望]
let H = (d, a, b) => {
    let r = []
    for (let h = a; h <= b; h++) {
        r.push(`${d}T${String(h).padStart(2, '0')}`)
    }
    return r
}
let BETWEEN = [
    ['New_York春季空窗(hours)', ['getTimeBetween', '2026-03-08T00', '2026-03-08T04', 'hours'], H('2026-03-08', 0, 4)],
    ['New_York秋季重疊(hours)', ['getTimeBetween', '2026-11-01T00', '2026-11-01T03', 'hours'], H('2026-11-01', 0, 3)],
    ['London春季空窗(hours)', ['getTimeBetween', '2026-03-29T00', '2026-03-29T03', 'hours'], H('2026-03-29', 0, 3)],
    ['London秋季重疊(hours)', ['getTimeBetween', '2026-10-25T00', '2026-10-25T03', 'hours'], H('2026-10-25', 0, 3)],
    ['Sydney春季空窗(hours)', ['getTimeBetween', '2026-10-04T01', '2026-10-04T04', 'hours'], H('2026-10-04', 1, 4)],
    ['Sydney秋季重疊(hours)', ['getTimeBetween', '2026-04-05T01', '2026-04-05T04', 'hours'], H('2026-04-05', 1, 4)],
    ['Taipei 1979空窗(hours, 起點於本機不存在)', ['getTimeBetween', '1979-07-01T00', '1979-07-01T03', 'hours'], H('1979-07-01', 0, 3)],
    ['跨空窗(minutes, 迄點於本機不存在)', ['getTimeBetween', '2026-03-08T01:58', '2026-03-08T02:02', 'minutes'],
        ['2026-03-08T01:58', '2026-03-08T01:59', '2026-03-08T02:00', '2026-03-08T02:01', '2026-03-08T02:02']],
    ['跨空窗(seconds)', ['getTimeBetween', '2026-03-08T01:59:58', '2026-03-08T02:00:02', 'seconds'],
        ['2026-03-08T01:59:58', '2026-03-08T01:59:59', '2026-03-08T02:00:00', '2026-03-08T02:00:01', '2026-03-08T02:00:02']],
    ['Sao_Paulo午夜起跳(days)', ['getTimeBetween', '2018-11-03', '2018-11-05', 'days'], ['2018-11-03', '2018-11-04', '2018-11-05']],
    ['Apia整日跳過(days)', ['getTimeBetween', '2011-12-29', '2012-01-01', 'days'], ['2011-12-29', '2011-12-30', '2011-12-31', '2012-01-01']],
    ['Kiritimati整日跳過(days)', ['getTimeBetween', '1994-12-30', '1995-01-02', 'days'], ['1994-12-30', '1994-12-31', '1995-01-01', '1995-01-02']],
    ['months', ['getTimeBetween', '2011-11', '2012-02', 'months'], ['2011-11', '2011-12', '2012-01', '2012-02']],
    ['years', ['getTimeBetween', '2017', '2019', 'years'], ['2017', '2018', '2019']],
    ['年份0050(hours, 跨日)', ['getTimeBetween', '0050-03-04T22', '0050-03-05T01', 'hours'], ['0050-03-04T22', '0050-03-04T23', '0050-03-05T00', '0050-03-05T01']],
    ['閏日(days)', ['getTimeBetween', '2020-02-28', '2020-03-01', 'days'], ['2020-02-28', '2020-02-29', '2020-03-01']],
    ['跨年(months)', ['getTimeBetween', '2019-11', '2020-02', 'months'], ['2019-11', '2019-12', '2020-01', '2020-02']],
    ['預設單位days', ['getTimeBetween', '2019-01-01', '2019-01-03'], ['2019-01-01', '2019-01-02', '2019-01-03']],
    ['非預期單位視為未給改用days', ['getTimeBetween', '2019-01-01', '2019-01-03', 'weeks'], ['2019-01-01', '2019-01-02', '2019-01-03']],
    //無效與無可切分(各時區皆為[])
    ['起訖相同', ['getTimeBetween', '2026-03-08T02', '2026-03-08T02', 'hours'], []],
    ['起始大於結束', ['getTimeBetween', '2026-03-08T04', '2026-03-08T00', 'hours'], []],
    ['不存在之日(2月30日)', ['getTimeBetween', '2019-02-30', '2019-03-02', 'days'], []],
    ['格式與單位不符', ['getTimeBetween', '2019-01-01', '2019-01-03', 'hours'], []],
    ['空字串', ['getTimeBetween', '', '2019-01-03', 'days'], []],
]
//每時區各列一組「長序列」之結構不變式, 於呼叫後由測試依手寫公式核對(長度、嚴格遞增、無重複)
let LONG = [
    ['2026-03-08T00', '2026-03-09T00', 'hours', 25],
    ['2026-11-01T00', '2026-11-02T00', 'hours', 25],
    ['2026-03-08T01:00', '2026-03-08T03:00', 'minutes', 121],
    ['2026-03-01', '2026-04-01', 'days', 32],
    ['2011-12-01', '2012-01-31', 'days', 62],
]

let OBJECT = [
    //空窗內之時刻與整日跳過之日為有效(非null), 其餘有效輸入回傳之物件牆鐘欄位同輸入
    ['gap: New_York 02:30', ['getTimeObject', '2026-03-08T02:30:00', 'seconds'], 'nonnull'],
    ['gap: Taipei 1979', ['getTimeObject', '1979-07-01T00:48:15', 'seconds'], 'nonnull'],
    ['gap: Apia整日跳過', ['getTimeObject', '2011-12-30', 'days'], 'nonnull'],
    ['gap: Kiritimati整日跳過', ['getTimeObject', '1994-12-31', 'days'], 'nonnull'],
    ['gap: Sao_Paulo午夜起跳', ['getTimeObject', '2018-11-04', 'days'], 'nonnull'],
    ['gap: hours單位', ['getTimeObject', '2026-03-08T02', 'hours'], 'nonnull'],
    ['dup: New_York重疊', ['getTimeObject', '2026-11-01T01:30:00', 'seconds'], '2026-11-01T01:30:00'],
    ['一般時刻', ['getTimeObject', '2019-01-01T12:34:56', 'seconds'], '2019-01-01T12:34:56'],
    ['一般日', ['getTimeObject', '2019-12-31', 'days'], '2019-12-31T00:00:00'],
    ['預設單位days', ['getTimeObject', '2019-01-01'], '2019-01-01T00:00:00'],
    ['月', ['getTimeObject', '2019-02', 'months'], '2019-02-01T00:00:00'],
    ['年', ['getTimeObject', '2019', 'years'], '2019-01-01T00:00:00'],
    ['閏日', ['getTimeObject', '2020-02-29', 'days'], '2020-02-29T00:00:00'],
    //無效輸入(各時區皆為null)
    ['2019-02-29', ['getTimeObject', '2019-02-29', 'days'], null],
    ['時24', ['getTimeObject', '2019-01-01T24:00:00', 'seconds'], null],
    ['月13', ['getTimeObject', '2019-13', 'months'], null],
    ['格式與單位不符', ['getTimeObject', '2019-01-01', 'seconds'], null],
    ['非標準寫法', ['getTimeObject', '2019-1-1', 'days'], null],
    ['含時區', ['getTimeObject', '2019-01-01T12:34:56+08:00', 'seconds'], null],
    ['非字串', ['getTimeObject', 20190101, 'days'], null],
]


describe(`排程第675項: getTimeBetween、getTimeObject不經本機時間(多時區矩陣)`, function() {

    let cache = {}
    let runAll = (tz) => {
        if (!cache[tz]) {
            let calls = [...BETWEEN, ...OBJECT].map((x) => x[1])
            for (let [a, b, unit] of LONG) {
                calls.push(['getTimeBetween', a, b, unit])
            }
            cache[tz] = run(tz, calls, [...GAPS, ...DUPS].map((g) => g[1]))
        }
        return cache[tz]
    }

    it(`前提: each gap input does not exist and each overlap input occurs twice as a local time in its own time zone, and none is a gap or an overlap in UTC (otherwise the matrix proves nothing)`, function() {
        let all = [...GAPS, ...DUPS]
        for (let i = 0; i < GAPS.length; i++) {
            let [tz] = GAPS[i]
            assert.strict.deepStrictEqual(runAll(tz).isGap[i], true, `${GAPS[i][1]} should be a gap in ${tz}`)
        }
        for (let j = 0; j < DUPS.length; j++) {
            let [tz] = DUPS[j]
            assert.strict.deepStrictEqual(runAll(tz).isDup[GAPS.length + j], true, `${DUPS[j][1]} should occur twice in ${tz}`)
        }
        let u = runAll('UTC')
        assert.strict.deepStrictEqual(u.isGap, all.map(() => false))
        assert.strict.deepStrictEqual(u.isDup, all.map(() => false))
    })

    for (let tz of TZS) {
        it(`[${tz}] getTimeBetween should give the complete sequence of wall-clock times (no missing, no duplicated, empty array when invalid), the same as in every other time zone`, function() {
            let r = runAll(tz).results
            for (let i = 0; i < BETWEEN.length; i++) {
                assert.strict.deepStrictEqual(r[i], BETWEEN[i][2], `${tz} ${BETWEEN[i][0]} ${JSON.stringify(BETWEEN[i][1])}`)
            }
        })
        it(`[${tz}] getTimeBetween long sequences should have the exact length and be strictly increasing without duplicates`, function() {
            let r = runAll(tz).results.slice(BETWEEN.length + OBJECT.length)
            for (let i = 0; i < LONG.length; i++) {
                let [a, b, unit, n] = LONG[i]
                assert.strict.deepStrictEqual(r[i].length, n, `${tz} ${a}~${b} ${unit}`)
                assert.strict.deepStrictEqual(r[i][0], a)
                assert.strict.deepStrictEqual(r[i][n - 1], b)
                for (let k = 1; k < n; k++) {
                    assert.ok(r[i][k] > r[i][k - 1], `${tz} ${a}~${b} ${unit} index ${k}`)
                }
            }
        })
        it(`[${tz}] getTimeObject should be valid (not null) for gap and overlap times, keep the wall-clock fields of the other valid inputs, and be null for invalid inputs`, function() {
            let r = runAll(tz).results.slice(BETWEEN.length, BETWEEN.length + OBJECT.length)
            for (let i = 0; i < OBJECT.length; i++) {
                let exp = OBJECT[i][2]
                let got = r[i]
                if (exp === 'nonnull') {
                    assert.ok(got !== null && typeof got === 'object' && typeof got.wall === 'string', `${tz} ${OBJECT[i][0]} ${JSON.stringify(OBJECT[i][1])}`)
                }
                else if (exp === null) {
                    assert.strict.deepStrictEqual(got, null, `${tz} ${OBJECT[i][0]}`)
                }
                else {
                    assert.strict.deepStrictEqual(got, { wall: exp }, `${tz} ${OBJECT[i][0]}`)
                }
            }
        })
    }

    it(`getTimeObject should still throw Error('invalid dayjs') when dayjs is not available (UMD without the dayjs global), for a valid and for an invalid string alike (the failure form before the change); getTimeBetween no longer needs dayjs`, async function() {
        let f = await loadStubbed('getTimeObject', { noDayjs: true })
        assert.throws(() => f('2019-01-01', 'days'), (err) => err instanceof Error && err.message === 'invalid dayjs')
        assert.throws(() => f('2019-02-30', 'days'), (err) => err instanceof Error && err.message === 'invalid dayjs')
        //非字串仍於dayjs檢查之前回null(同修前: isestr檢查先於解析)
        assert.strict.deepStrictEqual(f(20190101, 'days'), null)
        //getTimeBetween不經dayjs(日曆欄位運算), dayjs不可用時亦得結果(修前: 經getTimeObject而拋invalid dayjs)
        let g = await loadStubbed('getTimeBetween', { noDayjs: true })
        assert.strict.deepStrictEqual(g('2019-01-01', '2019-01-03', 'days'), ['2019-01-01', '2019-01-02', '2019-01-03'])
    })

    it(`(in-process) the current environment should give the same results`, function() {
        assert.strict.deepStrictEqual(getTimeBetween('2026-03-08T00', '2026-03-08T04', 'hours'), H('2026-03-08', 0, 4))
        assert.strict.deepStrictEqual(getTimeBetween('2011-12-29', '2012-01-01', 'days'), ['2011-12-29', '2011-12-30', '2011-12-31', '2012-01-01'])
        assert.ok(getTimeObject('2026-03-08T02:30:00', 'seconds') !== null)
        assert.strict.deepStrictEqual(getTimeObject('2019-02-29', 'days'), null)
    })

})
