import assert from 'assert'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import istime from '../src/istime.mjs'
import isday from '../src/isday.mjs'
import time2hour from '../src/time2hour.mjs'


//排程第428項: 不帶時區之時刻(istime、istimems)、日與月(isday、ismonth)與checkTZ所收之非有效偏移(istimeTZ、istimemsTZ)改為逐欄驗證, 不經本機時間往返比對;
//  轉換函數(time2*、timems2*、getTimeRange、day2cht)直接取字串中之欄位, 不經本機時間解析
//  規格來源: 各函數JSDoc(「逐欄驗證…不經本機時間往返比對，故結果不受執行環境之時區影響」「直接取字串中之時刻欄位…不經本機時間解析」)與主控裁示(原誤判為無效者改為有效屬缺陷修正)
//  驗法: 子行程(test/tools/timeWallGapRunner.mjs)於有夏令之時區(America/New_York、Europe/London、Australia/Sydney、America/Sao_Paulo〔午夜起跳〕)、
//  整日跳過之時區(Pacific/Apia 2011-12-30)、曾有夏令而今無之時區(Asia/Taipei 1979)與UTC執行; 各時區之結果須相同
//  修前紅: 環境變數WSEMI_TIME428_SRC指向修前之src資料夾時, 子行程改載該處之模組


let runner = fileURLToPath(new URL('./tools/timeWallGapRunner.mjs', import.meta.url))
let run = (tz, calls, gaps = []) => {
    let r = spawnSync(process.execPath, [runner, JSON.stringify(calls), JSON.stringify(gaps)], { env: { ...process.env, TZ: tz }, encoding: 'utf8', windowsHide: true, timeout: 60000 })
    assert.strict.deepStrictEqual(r.status, 0, r.stderr)
    let o = JSON.parse(r.stdout)
    assert.strict.deepStrictEqual(o.tz, tz) //確認子行程之系統時區即所設者(TZ未生效時不得當作已驗)
    return o
}

//各時區之「本地不存在之時刻」(夏令空窗或整日跳過), 依時區資料庫
let GAPS = [
    ['America/New_York', '2026-03-08T02:30:00'], //春季02:00→03:00
    ['Europe/London', '2026-03-29T01:30:00'], //春季01:00→02:00
    ['Australia/Sydney', '2026-10-04T02:30:00'], //春季02:00→03:00
    ['America/Sao_Paulo', '2018-11-04T00:30:00'], //午夜起跳00:00→01:00
    ['Pacific/Apia', '2011-12-30T12:00:00'], //換日線調整, 2011-12-30整日跳過
    ['Asia/Taipei', '1979-07-01T00:48:15'], //1979年夏令00:00→01:00
]
let TZS = [...GAPS.map((g) => g[0]), 'UTC']

//calls, 對每個空窗時刻: [呼叫, 期望值](期望值取自JSDoc: 有效即true; 轉換即字串中之欄位)
let gapCalls = []
for (let [, t] of GAPS) {
    let d = t.slice(0, 10)
    let ms = `${t}.783`
    let later = `${d}T23:59:59` //同日之較晚時刻
    let y = Number(t.slice(0, 4))
    let mo = Number(t.slice(5, 7))
    let dd = Number(t.slice(8, 10))
    gapCalls.push(
        [['istime', t], true],
        [['istimems', ms], true],
        [['isday', d], true],
        [['ismonth', t.slice(0, 7)], true],
        [['istimeTZ', `${t}+99:99`], true], //checkTZ所收之非有效偏移(寬鬆收錄不變)
        [['istimeTZ', `${t}|08:00`], true],
        [['istimemsTZ', `${ms}+24:00`], true],
        [['isDate', t], true],
        [['isDate', ms], true],
        [['time2day', t], d],
        [['time2hour', t], t.slice(0, 13)],
        [['time2min', t], t.slice(0, 16)],
        [['time2min', t, { returnWithStateAndMsg: true }], { state: 'success', msg: t.slice(0, 16) }],
        [['timems2day', ms], d],
        [['timems2hour', ms], t.slice(0, 13)],
        [['timems2min', ms], t.slice(0, 16)],
        [['timems2time', ms], t],
        [['getTimeRange', t], `${t.slice(0, 16)} 至 無`],
        [['getTimeRange', t, later], `${t.slice(0, 16)} 至 23:59`],
        [['getTimeRange', later, t], `${later.slice(0, 16)} 至 ${t.slice(11, 16)} (起始時間大於結束時間)`],
        [['day2cht', d], `民國 ${y - 1911} 年 ${mo} 月 ${dd} 日`],
        [['day2cht', d, true], `${mo}月${dd}日`],
    )
}

//controls, 非空窗之有效輸入與無效輸入(修前修後皆同, 各時區相同)
let controlCalls = [
    [['istime', '2019-01-01T12:34:56'], true],
    [['istime', '2020-02-29T23:59:59'], true],
    [['istime', '0050-03-04T05:06:07'], true],
    [['istime', '2019-02-29T00:00:00'], false],
    [['istime', '2019-01-01T24:00:00'], false],
    [['istime', '2019-01-01T12:60:00'], false],
    [['istime', '2019-01-01 12:34:56'], false],
    [['istime', '2019-01-01T12:34:56Z'], false],
    [['istimems', '2019-01-01T12:34:56.789'], true],
    [['istimems', '2019-01-01T12:34:56.78'], false],
    [['isday', '2020-02-29'], true],
    [['isday', '2019-02-29'], false],
    [['isday', '2019-04-31'], false],
    [['isday', '2019-1-01'], false],
    [['ismonth', '2019-12'], true],
    [['ismonth', '2019-13'], false],
    [['ismonth', '2019-00'], false],
    [['istimeTZ', '2019-01-01T12:34:56+08:00'], true],
    [['istimeTZ', '2019-02-29T12:34:56|08:00'], false],
    [['istimemsTZ', '2019-01-01T12:34:56.789Z'], true],
    [['time2day', '2019-02-30T00:00:00'], ''],
    [['time2hour', '2019-01-01T12:34:56'], '2019-01-01T12'],
    [['timems2time', '2019-01-01T12:34:56.789'], '2019-01-01T12:34:56'],
    [['getTimeRange', '2019-01-01T09:00:00', '2019-01-03T12:00:00'], '2019-01-01T09:00 至 2019-01-03T12:00'],
    [['day2cht', '2019-01-02'], '民國 108 年 1 月 2 日'],
    [['day2cht', '2019-02-29'], ''],
]


describe(`排程第428項: 判斷與轉換不經本機時間往返(多時區矩陣)`, function() {

    let cache = {}
    let runAll = (tz) => {
        if (!cache[tz]) {
            let calls = [...gapCalls, ...controlCalls].map((x) => x[0])
            cache[tz] = run(tz, calls, GAPS.map((g) => g[1]))
        }
        return cache[tz]
    }

    it(`前提: each gap input does not exist as a local time in its own time zone (otherwise the matrix proves nothing), and none of them is a gap in UTC`, function() {
        for (let i = 0; i < GAPS.length; i++) {
            let [tz] = GAPS[i]
            assert.strict.deepStrictEqual(runAll(tz).isGap[i], true, `${GAPS[i][1]} should be a gap in ${tz}`)
        }
        assert.strict.deepStrictEqual(runAll('UTC').isGap, GAPS.map(() => false))
    })

    for (let tz of TZS) {
        it(`[${tz}] judges should accept every gap time and conversions should take the wall-clock fields (JSDoc), the same as in every other time zone`, function() {
            let r = runAll(tz).results
            for (let i = 0; i < gapCalls.length; i++) {
                assert.strict.deepStrictEqual(r[i], gapCalls[i][1], `${tz} ${JSON.stringify(gapCalls[i][0])}`)
            }
        })
        it(`[${tz}] non-gap valid inputs and invalid inputs should keep their results`, function() {
            let r = runAll(tz).results.slice(gapCalls.length)
            for (let i = 0; i < controlCalls.length; i++) {
                assert.strict.deepStrictEqual(r[i], controlCalls[i][1], `${tz} ${JSON.stringify(controlCalls[i][0])}`)
            }
        })
    }

    it(`(in-process) the current environment should give the same results`, function() {
        assert.strict.deepStrictEqual(istime('2026-03-08T02:30:00'), true)
        assert.strict.deepStrictEqual(istime('1979-07-01T00:48:15'), true)
        assert.strict.deepStrictEqual(isday('2011-12-30'), true)
        assert.strict.deepStrictEqual(time2hour('1979-07-01T00:48:15'), '1979-07-01T00')
    })

})
