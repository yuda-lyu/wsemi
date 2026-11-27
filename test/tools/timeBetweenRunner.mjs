//timeBetweenRunner.mjs: timeBetween675.test.mjs之子行程執行器, 由測試以TZ環境變數設定系統時區後執行, 印出各呼叫之結果(JSON)
//  argv[2]: JSON之呼叫清單[[函數名, ...引數]]; 函數名為getTimeBetween、getTimeObject、addMonth、timemsTZ2past或timemsTZ2expire
//  getTimeObject之回傳(dayjs物件)以其牆鐘欄位字串表示: 非null時回傳{ fmt: 物件依單位format之字串, wall: 物件之本機牆鐘'YYYY-MM-DDTHH:mm:ss' }, null回傳null
//  修前紅驗證: 環境變數WSEMI_TIME675_SRC指向舊版src資料夾時改載該處之模組
import path from 'path'
import { pathToFileURL } from 'url'


let root = process.env.WSEMI_TIME675_SRC ? path.resolve(process.env.WSEMI_TIME675_SRC) : path.resolve(import.meta.dirname, '..', '..', 'src')
let names = ['getTimeBetween', 'getTimeObject', 'addMonth', 'timemsTZ2past', 'timemsTZ2expire']
let fns = {}
for (let n of names) {
    fns[n] = (await import(pathToFileURL(path.join(root, `${n}.mjs`)).href)).default
}

let calls = JSON.parse(process.argv[2])

let results = calls.map(([fn, ...args]) => {
    try {
        let r = fns[fn](...args)
        if (fn === 'getTimeObject') {
            return r === null ? null : { wall: r.format('YYYY-MM-DDTHH:mm:ss') }
        }
        return r
    }
    catch (err) {
        return `THROW:${err && err.message}`
    }
})

//argv[3](選用): JSON之鑑別前提清單['YYYY-MM-DDTHH:mm:ss'], 回傳各牆鐘時刻於本機時區之性質:
//  isGap: 以本機時間建立後欄位改變, 即該時刻於本機時區不存在(夏令空窗或整日跳過)
//  isDup: 該牆鐘時刻於本機時區出現兩次(夏令結束之重疊時段; 建立之時刻加1小時後欄位仍相同)
let walls = process.argv[3] ? JSON.parse(process.argv[3]) : []
let fields = (dt) => [dt.getFullYear(), dt.getMonth() + 1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds()].join(',')
let parse = (t) => {
    let [d, h] = t.split('T')
    let [y, mo, dd] = d.split('-').map(Number)
    let [hh, mi, ss] = h.split(':').map(Number)
    return { y, mo, dd, hh, mi, ss }
}
let isGap = walls.map((t) => {
    let p = parse(t)
    let dt = new Date(p.y, p.mo - 1, p.dd, p.hh, p.mi, p.ss)
    return fields(dt) !== [p.y, p.mo, p.dd, p.hh, p.mi, p.ss].join(',')
})
let isDup = walls.map((t) => {
    let p = parse(t)
    let dt = new Date(p.y, p.mo - 1, p.dd, p.hh, p.mi, p.ss)
    let want = [p.y, p.mo, p.dd, p.hh, p.mi, p.ss].join(',')
    return fields(dt) === want && fields(new Date(dt.getTime() + 3600000)) === want
})

process.stdout.write(JSON.stringify({
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    results,
    isGap,
    isDup,
}))
