//genClockTZRunner.mjs: genClockTZ.test.mjs之子行程執行器, 由測試以TZ環境變數設定系統時區後執行
//  node <runner> <caseName>, 結果以一行'@@R@@'開頭之JSON輸出至stdout
//  案例: zones(固定現在時刻, 輸出台北與紐約時鐘各值及now2str)、sideEffects(建立時鐘前後, 既有dayjs函數之輸出須不變)
import { mock } from 'node:test'
import ot from 'dayjs'
import genClockTZ from '../../src/genClockTZ.mjs'
import now2str from '../../src/now2str.mjs'
import nowms2str from '../../src/nowms2str.mjs'
import nowDay2str from '../../src/nowDay2str.mjs'
import timeTZ2day from '../../src/timeTZ2day.mjs'
import timeTZ2min from '../../src/timeTZ2min.mjs'
import timemsTZ2day from '../../src/timemsTZ2day.mjs'
import timemsTZ2time from '../../src/timemsTZ2time.mjs'
import timeTZ2past from '../../src/timeTZ2past.mjs'


let caseName = process.argv[2]

let out = (o) => {
    process.stdout.write('@@R@@' + JSON.stringify(o) + '\n')
}

//固定現在時刻 2026-08-18T04:00:00Z
mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-08-18T04:00:00Z') })

let vals = (c) => {
    return {
        iso8: c.iso8(),
        stamp8: c.stamp8(),
        date8: c.date8(),
        day8: c.day8(),
        ts: c.getTimestamp(),
        getDate: [c.getDate(-1), c.getDate(0), c.getDate(1)],
    }
}

//既有dayjs函數之輸出(本地模式format/parse/加減)
let battery = () => {
    let t = '2026-03-08T01:59:59+08:00'
    return {
        now2str: now2str(),
        nowms2str: nowms2str(),
        nowDay2str: nowDay2str(),
        dayjsLocal: ot('2026-08-18T12:34:56').format('YYYY-MM-DDTHH:mm:ssZ'),
        dayjsAdd: ot('2026-03-07T12:00:00').add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
        dayjsDiff: ot('2026-03-09').diff(ot('2026-03-07'), 'hour'),
        dayjsUtcOffset: ot('2026-08-18T12:00:00').utcOffset(),
        timeTZ2day: timeTZ2day(t),
        timeTZ2min: timeTZ2min(t),
        timemsTZ2day: timemsTZ2day('2026-08-18T12:34:56.789+08:00'),
        timemsTZ2time: timemsTZ2time('2026-08-18T12:34:56.789+08:00'),
        timeTZ2past: timeTZ2past('2026-08-18T03:59:00Z'),
    }
}

if (caseName === 'zones') {
    out({
        taipei: vals(genClockTZ('Asia/Taipei')),
        ny: vals(genClockTZ('America/New_York')),
        now2str: now2str(),
    })
}
else if (caseName === 'sweep') {
    //於系統時區夏令轉換(2026年3月/10月/11月)前後各3小時, 逐5分鐘固定現在時刻, 檢查各時區時鐘之iso8()所表示之瞬間須等於該時刻(秒), 且stamp8與iso8之牆鐘數字相同
    mock.timers.reset()
    let zones = ['Asia/Taipei', 'America/New_York', 'Australia/Lord_Howe', 'Asia/Kolkata', 'UTC', 'Europe/London', 'Pacific/Auckland', 'America/Los_Angeles']
    let centers = ['2026-03-08T10:00:00Z', '2026-03-29T01:00:00Z', '2026-03-29T00:00:00Z', '2026-10-25T01:00:00Z', '2026-11-01T09:00:00Z', '2026-04-04T15:00:00Z', '2026-10-03T15:00:00Z']
    let fixedOffsets = { 'Asia/Taipei': '+08:00', 'Asia/Kolkata': '+05:30', 'UTC': '+00:00' }
    let mismatches = []
    let checks = 0
    for (let c of centers) {
        for (let k = -36; k <= 36; k++) {
            let ms = Date.parse(c) + k * 5 * 60 * 1000 + 7000
            mock.timers.enable({ apis: ['Date'], now: ms })
            for (let z of zones) {
                let clock = genClockTZ(z)
                let iso = clock.iso8()
                let st = clock.stamp8()
                checks++
                //無夏令時間之時區,其偏移為固定值(獨立於實作之對照): 瞬間相同但偏移標示錯(系統夏令間隙被誤當目標時區之牆鐘)亦須抓到
                let fixed = fixedOffsets[z]
                if (Date.parse(iso) !== Math.floor(ms / 1000) * 1000 || st !== iso.slice(0, 19).replace(/\D/g, '') || (fixed !== undefined && !iso.endsWith(fixed))) {
                    mismatches.push([c, k, z, iso, st])
                }
            }
            mock.timers.reset()
        }
    }
    out({ checks, mismatches: mismatches.slice(0, 5) })
}
else if (caseName === 'sideEffects') {
    let before = battery()
    genClockTZ('Asia/Taipei').iso8()
    genClockTZ('America/New_York').getDate(1)
    let after = battery()
    out({ before, after })
}
else {
    throw new Error(`unknown case: ${caseName}`)
}
mock.timers.reset()
