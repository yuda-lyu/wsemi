//execCliTraceKit.mjs: execCli、execCliSession、execCliJsonRpc之觀察回調(opt.onTrace)測試共用, 規則見sgud/rule/rulebook_timer.md之R-TRACE-01
//  fiveOnTrace: P3/P4之五種回調(未傳、紀錄器、拋錯、回傳rejection之Promise、非函數)
//  watchUnhandled: 收集unhandledRejection, 用於證明回調之rejection不外洩
//  keysByType / allPrimitive: 事件欄位之形狀(各type之欄位名排序後串接、欄位皆為原始值)
//  recMeta: 紀錄器, 另記每事件回調時之this與是否凍結(P4)
//  scHolder: 子進程腳本(供「close遲遲不來」之路徑): 啟動一個繼承stdout/stderr之孫行程後自行結束並印出孫行程pid, 子進程已結束但管線被孫行程握住, 故close事件不會觸發, 只能靠逾時樹殺與強制定案
//  isAlive / waitGone / killPid: 孫行程之存活探測、等其消失、殺掉並回驗(以模組載入時保存之真實計時器輪詢, 假時鐘下亦有效; 只防懸置)
import { traceRec } from './timeKit.mjs'


const realSetTimeout = setTimeout


//fiveOnTrace, P3/P4之五種回調: 未傳(undefined)、紀錄器on、同步拋錯、回傳rejection之Promise、非函數
function fiveOnTrace(on) {
    return [undefined, on, () => {
        throw new Error('trace boom')
    }, () => Promise.reject(new Error('trace reject')), 'abc']
}


//watchUnhandled, 回傳{ list, stop }: list為收到之unhandledRejection字串
function watchUnhandled() {
    let list = []
    let on = (v) => list.push(String(v))
    process.on('unhandledRejection', on)
    return { list, stop: () => process.off('unhandledRejection', on) }
}


//keysByType, 事件陣列轉為{ type: '欄位名排序後以逗號串接' }
function keysByType(events) {
    let o = {}
    for (let e of events) {
        o[e.type] = Object.keys(e).sort().join(',')
    }
    return o
}


//allPrimitive, 事件之欄位值皆為原始值(數字、字串、布林或null)
function allPrimitive(events) {
    return events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v)))
}


//badProp, 於obj定義讀取即拋Error(msg)之可列舉屬性key(模擬opt之選項不可讀), 回傳obj
function badProp(obj, key, msg) {
    return Object.defineProperty(obj, key, {
        enumerable: true,
        get: () => {
            throw new Error(msg)
        },
    })
}


//recMeta, 觀察回調紀錄器: on傳給opt.onTrace; meta記每事件回調時之[this, 是否凍結]
function recMeta(opt = {}) {
    let tr = traceRec(opt)
    let meta = []
    let on = function(e) {
        meta.push([this, Object.isFrozen(e)])
        tr.on(e)
    }
    return { on, events: tr.events, mark: tr.mark, wait: tr.wait, types: tr.types, meta }
}


//scHolder, 子進程腳本: 孫行程繼承stdout與stderr(管線寫端被握住)並存活25秒(上限, 測試會提早殺掉), 子進程印出'gpid:<孫行程pid>'後不等孫行程自然結束(unref)
//  孫行程須detached: Windows下libuv把非detached之子行程歸入全域job object(KILL_ON_JOB_CLOSE), 建立者結束時一併被殺, 管線即隨之關閉而close照常觸發
let scHolder = [
    'const cp = require("child_process")',
    'const g = cp.spawn(process.execPath, ["-e", "setTimeout(() => {}, 25000)"], { detached: true, stdio: ["ignore", "inherit", "inherit"], windowsHide: true })',
    'g.unref()',
    'process.stdout.write("gpid:" + g.pid + "\\n")',
].join(';')


//gpidOf, 自輸出片段取孫行程pid, 無則null
function gpidOf(chunk) {
    let m = /gpid:(\d+)/.exec(String(chunk))
    return m ? Number(m[1]) : null
}


//isAlive, pid是否仍存活(process.kill(pid, 0)只探測不送訊號)
function isAlive(pid) {
    try {
        process.kill(pid, 0)
        return true
    }
    catch (err) {
        return err.code === 'EPERM'
    }
}


//waitGone, 以真實計時器輪詢等pid消失(上限limitMs, 只防懸置), 回傳是否已消失
async function waitGone(pid, limitMs = 10000) {
    let start = performance.now()
    for (;;) {
        if (!isAlive(pid)) {
            return true
        }
        if (performance.now() - start > limitMs) {
            return false
        }
        await new Promise((resolve) => realSetTimeout(resolve, 20))
    }
}


//killPid, 殺掉pid並回驗已消失, 回傳是否已消失
async function killPid(pid) {
    if (!pid) {
        return true
    }
    try {
        process.kill(pid, 'SIGKILL')
    }
    catch (err) {}
    return await waitGone(pid)
}


export { fiveOnTrace, watchUnhandled, keysByType, allPrimitive, badProp, recMeta, scHolder, gpidOf, isAlive, waitGone, killPid }
