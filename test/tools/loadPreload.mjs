//loadPreload.mjs: 負載試驗之預載模組, 由loadTrial以NODE_OPTIONS之--import載入測試行程(含mocha平行之各worker與測試所起之node子行程)
//  WSEMI_LT_LAG='L:P': 每P毫秒阻塞事件迴圈L毫秒(可重現之事件迴圈延遲); 計時器為unref, 不撐住行程, 亦不計入process.getActiveResourcesInfo
//  WSEMI_LT_PROBE=<資料夾>: 量測本行程之事件迴圈延遲(monitorEventLoopDelay), 每秒與結束時寫入<資料夾>/probe-<pid>.json, 作為負載之證據
//  WSEMI_LT_DIAG=<資料夾>: 追蹤仍撐住行程之資源及其建立堆疊, 每秒與結束時寫入<資料夾>/diag-<pid>.json, 供「測完不退出」時定位(見下); 測試可於偵測到異常當下呼叫globalThis.__ltDiagDump(tag)另存當下快照
//  (各套件自wsemi複製本檔與loadTrial.mjs, 兩檔須同時複製: 環境變數名稱為兩檔之間之約定)
import fs from 'fs'
import path from 'path'
import { createHook } from 'async_hooks'
import { monitorEventLoopDelay, performance } from 'perf_hooks'


let lag = process.env.WSEMI_LT_LAG
if (lag) {
    let [l, p] = lag.split(':').map(Number)
    let t = setInterval(() => {
        let tEnd = performance.now() + l
        while (performance.now() < tEnd) {
            //忙等, 阻塞事件迴圈l毫秒
        }
    }, p)
    t.unref()
}


//WSEMI_LT_DIAG=<資料夾>: 追蹤本行程仍存活之資源(以async_hooks登記計時器、socket等之建立堆疊), 每秒將「仍撐住行程者」之清單(含建立堆疊)寫入<資料夾>/diag-<pid>.json,
//  供「測完不退出」時由最後一份快照定位是哪個物件留下資源; 快照時間以performance.timeOrigin+performance.now()計, 不受假時鐘(mock.timers取代Date)影響
let dirDiag = process.env.WSEMI_LT_DIAG
if (dirDiag) {
    let live = new Map()
    let skip = new Set(['PROMISE', 'TickObject', 'Microtask', 'Immediate', 'TIMERWRAP', 'PerformanceObserver', 'ELDHISTOGRAM', 'FSREQCALLBACK', 'FSREQPROMISE', 'FILEHANDLE', 'FILEHANDLECLOSEREQ', 'WRITEWRAP', 'SHUTDOWNWRAP'])
    let now = () => performance.timeOrigin + performance.now()
    createHook({
        init(asyncId, type, triggerAsyncId, resource) {
            if (skip.has(type)) {
                return
            }
            let lim = Error.stackTraceLimit
            Error.stackTraceLimit = 30
            let st = new Error().stack
            Error.stackTraceLimit = lim
            live.set(asyncId, { type, resource, at: now(), stack: st })
        },
        destroy(asyncId) {
            live.delete(asyncId)
        },
    }).enable()
    let saveDiag = (tag) => {
        //tag為字串時另存為diag-<pid>-<tag>.json(測試於偵測到異常當下呼叫globalThis.__ltDiagDump(tag), 保留當下快照); 定時與結束時之呼叫參數為計時器/事件, 一律寫diag-<pid>.json
        let fnDiag = path.join(dirDiag, typeof tag === 'string' ? `diag-${process.pid}-${tag.replace(/[^\w-]/g, '_')}.json` : `diag-${process.pid}.json`)
        try {
            fs.mkdirSync(dirDiag, { recursive: true })
            let items = []
            let t = now()
            for (let [asyncId, v] of live) {
                let r = v.resource
                //Timeout有hasRef, unref者不撐住行程; 其餘資源(socket、handle)無hasRef者視為撐住
                if (r && typeof r.hasRef === 'function' && !r.hasRef()) {
                    continue
                }
                let frames = String(v.stack).split('\n').slice(1).map((s) => s.trim()).filter((s) => !s.includes('loadPreload.mjs') && !s.includes('node:internal/async_hooks'))
                items.push({ asyncId, type: v.type, ageMs: Math.round(t - v.at), idle: r && r._idleTimeout, repeat: r && r._repeat, frames: frames.slice(0, 14) })
            }
            fs.writeFileSync(fnDiag, JSON.stringify({ pid: process.pid, argv: process.argv.slice(1, 3), at: t, active: process.getActiveResourcesInfo(), items }, null, 1))
        }
        catch (err) {
            //診斷為輔助證據, 寫入失敗不影響測試
        }
    }
    let td = setInterval(() => saveDiag(), 1000)
    td.unref()
    process.on('exit', () => saveDiag())
    globalThis.__ltDiagDump = saveDiag
}


let dir = process.env.WSEMI_LT_PROBE
if (dir) {
    let h = monitorEventLoopDelay({ resolution: 10 })
    h.enable()
    let fn = path.join(dir, `probe-${process.pid}.json`)
    let ms = (v) => Math.round(v / 1e4) / 100
    let save = () => {
        try {
            fs.mkdirSync(dir, { recursive: true })
            fs.writeFileSync(fn, JSON.stringify({ pid: process.pid, argv: process.argv.slice(1, 3), count: h.count, mean: ms(h.mean), p50: ms(h.percentile(50)), p99: ms(h.percentile(99)), max: ms(h.max) }))
        }
        catch (err) {
            //量測為輔助證據, 寫入失敗不影響測試
        }
    }
    let t = setInterval(save, 1000)
    t.unref()
    process.on('exit', save)
}
