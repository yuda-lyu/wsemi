//hpTraceRunner.mjs: setIntervalHp、setTimeoutHp之子行程執行器, 以觀察回調(opt.onTrace)之事件同步並斷言(R-TRACE-01), 不以固定等待後檢查
//  setIntervalHp與setTimeoutHp以getTimeHp(hrtime, 非Date)計時, 假時鐘(mock.timers)控制不了, 故於真實計時器下以「等第N個事件」為同步點
//  每個案例於獨立子行程執行(console.log被攔截以驗證記錄, 不污染mocha之輸出), 掛unhandledRejection與uncaughtException記錄器
//  被測實作固定為本檔往上兩層之src/(由本檔位置推得); 結果以一行'@@R@@'開頭之JSON({ out, unhandled, uncaught })輸出至stdout, 由test/tools/runChildCase.mjs之runChildCase剖析
//用法: node test/tools/hpTraceRunner.mjs <caseName> [exitMode]
//  否定斷言(停止後不再調用、到期只通知一次)無事件可等, 保留短暫真實等待當觀察窗(負載下只會使窗內事件變少而漏抓, 不使正確實作失敗), 停止本身另以事件斷言
import path from 'path'
import { pathToFileURL, fileURLToPath } from 'url'
import { safeStr } from './caseKit.mjs'

let implDir = fileURLToPath(new URL('../../src/', import.meta.url))
let [caseName] = process.argv.slice(2)

async function imp(name) {
    return (await import(pathToFileURL(path.join(implDir, name + '.mjs')).href)).default
}

let unhandled = []
let uncaught = []
process.on('unhandledRejection', (r) => {
    unhandled.push(safeStr(r))
})
process.on('uncaughtException', (e) => {
    uncaught.push(safeStr(e))
})

//guardMs, 等待事件之防懸置上限, 只防懸置, 不表達規格
let guardMs = 10000

//delay, 僅用於否定斷言之觀察窗
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

//flush, 讓出數輪事件迴圈使已排定之microtask與立即回呼執行完畢(不依賴時間)
async function flush() {
    for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setImmediate(resolve))
    }
}

//mkRec, 觀察回調之紀錄器: on為回調(記錄事件、到達時之hrtime、接收者是否為undefined與事件是否凍結), wait(pred, n)等第n個符合pred之事件(已收到者亦計入)
function mkRec(order) {
    let events = []
    let stamps = []
    let meta = []
    let waiters = []
    let on = function(e) {
        meta.push([this === undefined, Object.isFrozen(e)])
        events.push(e)
        stamps.push(process.hrtime.bigint())
        if (order) {
            order.push(e.type)
        }
        for (let w of waiters.slice()) {
            let hits = events.filter(w.pred)
            if (hits.length >= w.n) {
                waiters.splice(waiters.indexOf(w), 1)
                clearTimeout(w.t)
                w.resolve(hits[w.n - 1])
            }
        }
    }
    let wait = (pred, n = 1) => {
        return new Promise((resolve, reject) => {
            let hits = events.filter(pred)
            if (hits.length >= n) {
                resolve(hits[n - 1])
                return
            }
            let w = { pred, n, resolve }
            w.t = setTimeout(() => {
                waiters.splice(waiters.indexOf(w), 1)
                reject(new Error(`mkRec: event #${n} not received within ${guardMs}ms, got ${JSON.stringify(events)}`))
            }, guardMs)
            waiters.push(w)
        })
    }
    return { events, stamps, meta, on, wait }
}

//capLog, 攔截console.log, 回傳記錄陣列、wait(n)(等記錄達n筆)與還原函數
function capLog() {
    let logs = []
    let waiters = []
    let cl = console.log
    console.log = (...a) => {
        logs.push(a.map((x) => safeStr(x)).join(' '))
        for (let w of waiters.slice()) {
            if (logs.length >= w.n) {
                waiters.splice(waiters.indexOf(w), 1)
                clearTimeout(w.t)
                w.resolve()
            }
        }
    }
    let wait = (n) => {
        return new Promise((resolve, reject) => {
            if (logs.length >= n) {
                resolve()
                return
            }
            let w = { n, resolve }
            w.t = setTimeout(() => {
                waiters.splice(waiters.indexOf(w), 1)
                reject(new Error(`capLog: ${n} logs not received within ${guardMs}ms, got ${JSON.stringify(logs)}`))
            }, guardMs)
            waiters.push(w)
        })
    }
    let restore = () => {
        console.log = cl
    }
    return { logs, wait, restore }
}

//brief, 事件轉簡式字串, 供斷言事件序列
function brief(e) {
    if (e.type === 'fire') {
        return e.n === undefined ? 'fire' : `fire#${e.n}`
    }
    if (e.type === 'result') {
        return e.n === undefined ? `result:${e.state}` : `result#${e.n}:${e.state}`
    }
    return e.type
}

//minElapsed, 各fire事件之elapsed最小值(fire無事件時為null)
function minElapsed(rec) {
    let a = rec.events.filter((e) => e.type === 'fire').map((e) => e.elapsed)
    return a.length === 0 ? null : Math.min(...a)
}

//minGap, 相鄰fire事件到達時間差(毫秒)之最小值, 只有一個fire時為null; 以到達時之hrtime量測, 與被測函數同一時鐘
function minGap(rec) {
    let t = []
    for (let i = 0; i < rec.events.length; i++) {
        if (rec.events[i].type === 'fire') {
            t.push(rec.stamps[i])
        }
    }
    let gaps = []
    for (let i = 1; i < t.length; i++) {
        gaps.push(Number(t[i] - t[i - 1]) / 1e6)
    }
    return gaps.length === 0 ? null : Math.min(...gaps)
}

//fieldInfo, 事件欄位與格式: keys為各type之欄位(依出現順序), primitive為所有欄位值皆為原始值, plain為所有事件皆凍結且回調之接收者為undefined
function fieldInfo(rec) {
    let keys = {}
    let primitive = true
    for (let e of rec.events) {
        keys[e.type] = Object.keys(e).join(',')
        for (let v of Object.values(e)) {
            if (v !== null && typeof v === 'object') {
                primitive = false
            }
        }
    }
    let plain = rec.meta.length > 0 && rec.meta.every(([noThis, frozen]) => noThis && frozen)
    return { keys, primitive, plain }
}

//badIntervals, 無效之interval(非正有限數: 0、負數、NaN、±Infinity、非數字、空白字串、null、布林、物件、陣列); goodIntervals, 有效者(undefined為省略, 取預設1; 數字字串亦可)
let badIntervals = [0, -5, NaN, Infinity, -Infinity, 'abc', '', ' ', null, true, {}, []]
let goodIntervals = [undefined, 1, 0.5, '20', ' 20 ', 20.5]

//lab, 值之標籤(供斷言與診斷)
function lab(v) {
    if (typeof v === 'string' || (v !== null && typeof v === 'object')) {
        return JSON.stringify(v)
    }
    return String(v)
}

//modes, 回調五種模式(未傳、紀錄器、拋錯、回傳rejection、非函數), 回傳{ rec, list }, list之每項為[模式名, args], args為第3參數(opt)之展開(未傳時為空陣列)
function modes() {
    let rec = mkRec()
    let throws = () => {
        throw new Error('trace boom')
    }
    let rejects = () => Promise.reject(new Error('trace reject'))
    return {
        rec,
        list: [
            ['none', []],
            ['rec', [{ onTrace: rec.on }]],
            ['throw', [{ onTrace: throws }]],
            ['reject', [{ onTrace: rejects }]],
            ['invalid', [{ onTrace: 'abc' }]],
        ],
    }
}

let cases = {

    //setIntervalHp: fun非函數時每次到期皆以console.log記錄Error('fn is not a function'), 呼叫停止函數後不再記錄
    //  同步點為第2個result事件(即將記錄); 原案以「120ms內須觸發至少2次」判定, 負載下鏈驅動之計時器延誤即偏離
    intervalNonFun: async () => {
        let SI = await imp('setIntervalHp')
        let cap = capLog()
        try {
            let ms = 20
            let rec = mkRec()
            let stop = SI(undefined, ms, { onTrace: rec.on })
            await rec.wait((e) => e.type === 'result', 2)
            let logsAt2 = cap.logs.slice()
            stop()
            let nStop = rec.events.length
            let nLogs = cap.logs.length
            await delay(100) //觀察窗(否定斷言): 停止後不再到期、不再記錄
            return {
                seq: rec.events.slice(0, nStop).map(brief),
                logsAt2,
                minElapsed: minElapsed(rec),
                minGap: minGap(rec),
                after: { events: rec.events.length - nStop, logs: cap.logs.length - nLogs },
            }
        }
        finally {
            cap.restore()
        }
    },

    //setIntervalHp: 到期之序號與結果(success、error、cancelled)一一對應, error才記錄, fire於調用前、result於調用後記錄前通知, 到期不早於interval
    intervalStates: async () => {
        let SI = await imp('setIntervalHp')
        let cap = capLog()
        try {
            let ms = 50
            let order = []
            let rec = mkRec(order)
            let k = 0
            let stop = SI(() => {
                k++
                order.push(`call${k}`)
                if (k === 1) {
                    return 'ok'
                }
                if (k === 2) {
                    return Promise.reject(new Error('boom2'))
                }
                if (k === 3) {
                    return Promise.reject({ reason: 'cancelled' })
                }
                throw new Error('boom4')
            }, ms, { onTrace: rec.on })
            await rec.wait((e) => e.type === 'result', 4)
            stop() //第4個result事件之續行與到期同一task, 其後不會有第5次到期, 先停止再讀取記錄
            await flush()
            return {
                seq: rec.events.map(brief),
                order,
                logs: cap.logs.slice(),
                calls: k,
                minElapsed: minElapsed(rec),
                minGap: minGap(rec),
                ...fieldInfo(rec),
            }
        }
        finally {
            cap.restore()
        }
    },

    //setIntervalHp: 呼叫停止函數後不再調用與通知(含停止前已調用而尚未有結果者), 重複呼叫停止函數只通知一次
    intervalStop: async () => {
        let SI = await imp('setIntervalHp')
        let cap = capLog()
        try {
            let rec = mkRec()
            let release = null
            let calls = 0
            let stop = SI(() => {
                calls++
                return new Promise((resolve) => {
                    release = resolve
                })
            }, 20, { onTrace: rec.on })
            await rec.wait((e) => e.type === 'fire') //fun已被調用而Promise未settle
            stop()
            stop()
            let nStop = rec.events.length
            release('late') //停止後才settle
            await flush()
            await delay(100) //觀察窗(否定斷言): 停止後不再到期
            return {
                seq: rec.events.map(brief),
                nStop,
                calls,
                logs: cap.logs.slice(),
            }
        }
        finally {
            cap.restore()
        }
    },

    //setIntervalHp: 五種回調模式之結果相同(P3、P4)
    intervalP34: async () => {
        let SI = await imp('setIntervalHp')
        let { rec, list } = modes()
        let results = []
        for (let [, args] of list) {
            let cap = capLog()
            try {
                //a: async fun第2次調用reject, 第3次調用時呼叫停止函數
                let calls = []
                let stopA = null
                let doneA = new Promise((resolve) => {
                    stopA = SI(async () => {
                        calls.push(calls.length + 1)
                        if (calls.length === 2) {
                            throw new Error('boom2')
                        }
                        if (calls.length === 3) {
                            stopA()
                            resolve()
                        }
                    }, 5, ...args)
                })
                await doneA
                await delay(40) //觀察窗(否定斷言): 停止後不再調用
                //b: fun非函數, 記錄2筆後停止
                let stopB = SI(undefined, 5, ...args)
                await cap.wait(3)
                stopB()
                await delay(40)
                results.push({ calls, logs: cap.logs.slice(), stops: [typeof stopA, typeof stopB] })
            }
            finally {
                cap.restore()
            }
        }
        return { results, recTypes: Array.from(new Set(rec.events.map((e) => e.type))).sort() }
    },

    //setIntervalHp: interval為非預期之輸入(非有效數字、0、負數、Infinity等; 不設上限; 第221項第二批g1timer組, K3)時視為未給、改用預設1毫秒並照常啟動, 不記錄
    //  start事件於呼叫當下同步通知(肯定斷言不需等待); 以事件為同步點: 等第1次調用之result事件(其後才呼叫停止函數, 使事件序列確定), 不以固定等待後檢查
    intervalInvalid: async () => {
        let SI = await imp('setIntervalHp')
        let cap = capLog()
        try {
            let items = []
            for (let v of badIntervals) {
                let calls = 0
                let rec = mkRec()
                let stop = SI(() => {
                    calls++
                }, v, { onTrace: rec.on })
                let startedSync = rec.events.length //start事件為同步可見
                let fire = await rec.wait((e) => e.type === 'fire')
                await rec.wait((e) => e.type === 'result')
                let stopOk = true
                try {
                    stop()
                }
                catch (e) {
                    stopOk = false
                }
                items.push({ v: lab(v), ret: typeof stop, stopOk, startedSync, seq: rec.events.map(brief), elapsedOk: fire.elapsed >= 1, calls })
            }
            return {
                items,
                totalLogs: cap.logs.length,
            }
        }
        finally {
            cap.restore()
        }
    },

    //setIntervalHp: 有效interval(省略取預設1、正整數、小數、數字字串含前後空白)皆啟動, 到期不早於其數值, 不記錄
    intervalValid: async () => {
        let SI = await imp('setIntervalHp')
        let cap = capLog()
        try {
            let out = []
            for (let v of goodIntervals) {
                let rec = mkRec()
                let stop = SI(() => {}, v, { onTrace: rec.on })
                let fire = await rec.wait((e) => e.type === 'fire')
                stop()
                out.push({ v: lab(v), elapsedOk: fire.elapsed >= (v === undefined ? 1 : Number(v)) })
            }
            return { out, logs: cap.logs.slice() }
        }
        finally {
            cap.restore()
        }
    },

    //setIntervalHp: async fun慢於interval時不等待前一次完成, 到期即再調用(與原生setInterval相同), 各次調用重疊執行
    //  fun回傳之Promise在第3次調用前皆不settle, 故第3個fire事件時3次調用皆在執行中(maxActive為3)且尚無任何result事件
    intervalOverlap: async () => {
        let SI = await imp('setIntervalHp')
        let cap = capLog()
        try {
            let rec = mkRec()
            let active = 0
            let maxActive = 0
            let calls = 0
            let releases = []
            let stop = SI(() => {
                calls++
                active++
                maxActive = Math.max(maxActive, active)
                return new Promise((resolve) => {
                    releases.push(() => {
                        active--
                        resolve()
                    })
                })
            }, 10, { onTrace: rec.on })
            await rec.wait((e) => e.type === 'fire', 3)
            let seq = rec.events.map(brief)
            let atThird = { calls, active, maxActive }
            stop()
            for (let release of releases) {
                release()
            }
            await flush()
            return { seq, atThird, activeAfter: active, logs: cap.logs.slice() }
        }
        finally {
            cap.restore()
        }
    },

    //setTimeoutHp: interval為非預期之輸入(非有效數字、0、負數、Infinity等; 不設上限; 第221項第二批g1timer組, K3)時視為未給、改用預設1毫秒並照常啟動, 不記錄, 回傳null
    //  start事件於呼叫當下同步通知(肯定斷言不需等待); 以事件為同步點: 等fire與result事件, 不以固定等待後檢查
    timeoutInvalid: async () => {
        let ST = await imp('setTimeoutHp')
        let cap = capLog()
        try {
            let items = []
            for (let v of badIntervals) {
                let calls = 0
                let rec = mkRec()
                let ret = ST(() => {
                    calls++
                }, v, { onTrace: rec.on })
                let startedSync = rec.events.length //start事件為同步可見
                let fire = await rec.wait((e) => e.type === 'fire')
                await rec.wait((e) => e.type === 'result')
                items.push({ v: lab(v), ret, startedSync, elapsedOk: fire.elapsed >= 1, rec, getCalls: () => calls })
            }
            await flush() //讓出數輪, 使若有多餘之調用/通知能在回傳前出現(僅使否定斷言更嚴, 不表達規格時間)
            return {
                items: items.map((it) => ({ v: it.v, ret: it.ret, startedSync: it.startedSync, seq: it.rec.events.map(brief), elapsedOk: it.elapsedOk, calls: it.getCalls() })),
                totalLogs: cap.logs.length,
            }
        }
        finally {
            cap.restore()
        }
    },

    //setTimeoutHp: 有效interval(省略取預設1、正整數、小數、數字字串含前後空白)皆啟動, 到期不早於其數值, 不記錄
    timeoutValid: async () => {
        let ST = await imp('setTimeoutHp')
        let cap = capLog()
        try {
            let out = []
            for (let v of goodIntervals) {
                let rec = mkRec()
                ST(() => {}, v, { onTrace: rec.on })
                let fire = await rec.wait((e) => e.type === 'fire')
                out.push({ v: lab(v), elapsedOk: fire.elapsed >= (v === undefined ? 1 : Number(v)) })
            }
            await flush()
            return { out, logs: cap.logs.slice() }
        }
        finally {
            cap.restore()
        }
    },

    //setTimeoutHp: fun非函數時到期以console.log記錄Error('fn is not a function')一次, 回傳null
    timeoutNonFun: async () => {
        let ST = await imp('setTimeoutHp')
        let cap = capLog()
        try {
            let ms = 30
            let rec = mkRec()
            let ret = ST(null, ms, { onTrace: rec.on })
            await rec.wait((e) => e.type === 'result')
            await flush()
            let nAt = rec.events.length
            let logsAt = cap.logs.slice()
            await delay(120) //觀察窗(否定斷言): 到期後不再調用與記錄
            return {
                ret,
                seq: rec.events.slice(0, nAt).map(brief),
                logsAt,
                minElapsed: minElapsed(rec),
                after: { events: rec.events.length - nAt, logs: cap.logs.length - logsAt.length },
            }
        }
        finally {
            cap.restore()
        }
    },

    //setTimeoutHp: 各種fun之結果(success、error、cancelled、invalid)與記錄, fire於調用前、result於調用後記錄前通知, 到期不早於interval
    timeoutStates: async () => {
        let ST = await imp('setTimeoutHp')
        let cap = capLog()
        try {
            let ms = 20
            let funs = [
                ['sync', () => 'ok'],
                ['async', async () => 'ok'],
                ['syncThrow', () => {
                    throw new Error('b1')
                }],
                ['asyncReject', async () => {
                    throw new Error('b2')
                }],
                ['cancelled', () => Promise.reject({ reason: 'cancelled' })],
                ['nonFun', 123],
            ]
            let out = {}
            let fields = null
            for (let [name, f] of funs) {
                let order = []
                let rec = mkRec(order)
                let calls = 0
                let fun = f
                if (typeof f === 'function') {
                    fun = (...a) => {
                        calls++
                        order.push('call')
                        return f(...a)
                    }
                }
                let nLogs = cap.logs.length
                ST(fun, ms, { onTrace: rec.on })
                await rec.wait((e) => e.type === 'result')
                await flush()
                out[name] = {
                    seq: rec.events.map(brief),
                    order,
                    calls,
                    logs: cap.logs.slice(nLogs),
                    minElapsed: minElapsed(rec),
                }
                if (name === 'asyncReject') {
                    fields = fieldInfo(rec)
                }
            }
            return { out, fields }
        }
        finally {
            cap.restore()
        }
    },

    //setTimeoutHp: 五種回調模式之結果相同(P3、P4)
    timeoutP34: async () => {
        let ST = await imp('setTimeoutHp')
        let { rec, list } = modes()
        let results = []
        for (let [, args] of list) {
            let cap = capLog()
            try {
                let rets = []
                //a: async fun reject
                rets.push(ST(async () => {
                    throw new Error('boom')
                }, 5, ...args))
                await cap.wait(1)
                //b: 同步fun
                let calls = 0
                let doneB = new Promise((resolve) => {
                    rets.push(ST(() => {
                        calls++
                        resolve()
                    }, 5, ...args))
                })
                await doneB
                //c: fun非函數
                rets.push(ST(null, 5, ...args))
                await cap.wait(2)
                await delay(40) //觀察窗(否定斷言): 到期只調用一次、只記錄一次
                results.push({ rets, calls, logs: cap.logs.slice() })
            }
            finally {
                cap.restore()
            }
        }
        return { results, recTypes: Array.from(new Set(rec.events.map((e) => e.type))).sort() }
    },
}

let out
try {
    out = await cases[caseName]()
}
catch (e) {
    out = { runnerError: safeStr(e) }
}
await delay(100)
console.log('@@R@@' + JSON.stringify({ out, unhandled, uncaught }))
process.exit(0)
