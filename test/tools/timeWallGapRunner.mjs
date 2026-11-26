//timeWallGapRunner.mjs: timeWallGap428.test.mjs之子行程執行器, 由測試以TZ環境變數設定系統時區後執行, 印出各呼叫之結果(JSON)
//  argv[2]: JSON之呼叫清單[[函數名, ...引數]]; argv[3](選用): JSON之鑑別前提清單['YYYY-MM-DDTHH:mm:ss'], 回傳各時刻於本機時區是否不存在(以本機時間建立Date後欄位改變)
//  修前紅驗證: 環境變數WSEMI_TIME428_SRC指向舊版src資料夾時改載該處之模組
import path from 'path'
import { pathToFileURL } from 'url'


let root = process.env.WSEMI_TIME428_SRC ? path.resolve(process.env.WSEMI_TIME428_SRC) : path.resolve(import.meta.dirname, '..', '..', 'src')
let names = ['istime', 'istimems', 'isday', 'ismonth', 'istimeTZ', 'istimemsTZ', 'isDate',
    'time2day', 'time2hour', 'time2min', 'timems2day', 'timems2hour', 'timems2min', 'timems2time',
    'getTimeRange', 'day2cht']
let fns = {}
for (let n of names) {
    fns[n] = (await import(pathToFileURL(path.join(root, `${n}.mjs`)).href)).default
}

let calls = JSON.parse(process.argv[2])
let gaps = process.argv[3] ? JSON.parse(process.argv[3]) : []

let results = calls.map(([fn, ...args]) => {
    try {
        return fns[fn](...args)
    }
    catch (err) {
        return `THROW:${err && err.message}`
    }
})

//isGap, 以本機時間建立該牆鐘時刻, 欄位與所給者不同即該時刻於本機時區不存在(夏令空窗或整日跳過)
let isGap = gaps.map((t) => {
    let [d, h] = t.split('T')
    let [y, mo, dd] = d.split('-').map(Number)
    let [hh, mi, ss] = h.split(':').map(Number)
    let dt = new Date(y, mo - 1, dd, hh, mi, ss)
    return !(dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === dd && dt.getHours() === hh && dt.getMinutes() === mi && dt.getSeconds() === ss)
})

process.stdout.write(JSON.stringify({
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    results,
    isGap,
}))
