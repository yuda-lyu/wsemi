//pmSettleRunner.mjs: R-PM-SETTLE-01(以呼叫端函數或Promise之結果決定流程者, 必定settle、不產生未處理之rejection或例外、佇列必定續行、失敗路徑必清理)之子行程執行器
//  每個案例於獨立子行程執行(不污染mocha之worker), 掛unhandledRejection與uncaughtException記錄器與看門狗(settle逾時回'pending')
//  被測實作固定為本檔往上兩層之src/(由本檔位置推得); 內含最小DOM替身, 供domVirtualCreate、domVirtualCreateQueue、importResources之案例使用
//  結果以一行'@@R@@'開頭之JSON({ out, unhandled, uncaught })輸出至stdout, 由test/tools/pmSettleRun.mjs之runPmSettle剖析
//用法: node test/tools/pmSettleRunner.mjs <caseName> [exitMode]
//  exitMode=natural: 不強制結束, 由呼叫端量測行程是否自然結束(驗計時器已釋放)
/* eslint-disable no-throw-literal */ //本執行器刻意拋出非Error之值(null、字串、取消物件)作為受測輸入
import path from 'path'
import { pathToFileURL, fileURLToPath } from 'url'
import { safeStr, revoked } from './caseKit.mjs'

let implDir = fileURLToPath(new URL('../../src/', import.meta.url))
let [caseName, exitMode] = process.argv.slice(2)

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

function reasonGetter() {
    return {
        get reason() {
            throw new Error('reason getter boom')
        },
    }
}
function getTrap() {
    return new Proxy({}, {
        get() {
            throw new Error('get trap boom')
        },
    })
}
function tagGetter() {
    return {
        get [Symbol.toStringTag]() {
            throw new Error('toStringTag boom')
        },
    }
}

//settle, 等待p之結果, 逾時回'pending'
//  與execFailRunner之settle契約不同而分立: 本檔直接呼叫p.then(受測函數未回傳Promise時即拋錯而案例失敗, 不被Promise.resolve吸收), 且reject保留原值(斷言拒絕值本身)
function settle(p, ms = 800) {
    return new Promise((resolve) => {
        let t = setTimeout(() => resolve({ s: 'pending' }), ms)
        p.then((v) => {
            clearTimeout(t)
            resolve({ s: 'resolve', v })
        }, (e) => {
            clearTimeout(t)
            resolve({ s: 'reject', v: e })
        })
    })
}

//mkTrace, 觀察回調(opt.onTrace)之紀錄器: on為回調, events為已收到之事件, sub(f)訂閱其後之事件
function mkTrace() {
    let events = []
    let subs = []
    let on = (e) => {
        events.push(e)
        for (let f of subs.slice()) {
            f(e)
        }
    }
    return { events, on, sub: (f) => subs.push(f) }
}

//settleTrace, 等待p之結果, 以觀察回調判定懸置而不以牆鐘逾時(R-TRACE-01): p未settle前收到isLate之事件(已過應settle之時點仍續行)即回'pending'
//  p之settle為microtask, 必先於其後之計時器回呼所通知之事件, 故判定不受負載影響; 未settle且不再有事件者(停止輪詢而懸置)由父行程之子行程逾時兜底
function settleTrace(p, tr, isLate) {
    return new Promise((resolve) => {
        let done = false
        let fin = (r) => {
            if (!done) {
                done = true
                resolve(r)
            }
        }
        tr.sub((e) => {
            if (isLate(e)) {
                fin({ s: 'pending' })
            }
        })
        p.then((v) => fin({ s: 'resolve', v }), (e) => fin({ s: 'reject', v: e }))
    })
}

//lateTick, waitFun已過應settle之時點: 週期計數超過n
function lateTick(n) {
    return (e) => e.type === 'tick' && e.n > n
}

//noOverlap, 以waitFun之觀察回調事件驗證輪詢不重疊(R-PM-SETTLE-01規則13), 回傳各判準是否成立; 不依呼叫次數之絕對值(其隨週期與fun耗時之真實比例而變)
//  overlapFree: 呼叫(call)至其完成(result或reject)之間不再呼叫, 期間之週期皆busy(只計次不呼叫), 其餘週期皆非busy(立即呼叫)
//  ticksCounted: 週期計數逐次+1(busy之週期亦計入嘗試次數)
//  callsMatch: fun之呼叫次數等於call事件數, 等於立即1次加非busy之週期數, 且不超過attemptNum+2
//  rejectAtResult: 最後為某次呼叫完成(result, ok為false)而以exceeded reject, 其計數超過attemptNum(逾次於呼叫完成時判定)
function noOverlap(events, calls, attemptNum) {
    let inflight = false
    let overlapFree = true
    let ns = []
    let nCall = 0
    let nIdle = 0
    for (let e of events) {
        if (e.type === 'call') {
            if (inflight) {
                overlapFree = false
            }
            inflight = true
            nCall++
        }
        else if (e.type === 'result' || e.type === 'reject') {
            inflight = false
        }
        else if (e.type === 'tick') {
            ns.push(e.n)
            if (e.busy !== inflight) {
                overlapFree = false
            }
            if (!e.busy) {
                nIdle++
            }
        }
    }
    let [r, j] = events.slice(-2)
    return {
        overlapFree,
        ticksCounted: ns.length > 0 && ns.every((n, i) => n === i + 1),
        callsMatch: calls === nCall && nCall === 1 + nIdle && calls <= attemptNum + 2,
        rejectAtResult: !!(r && j) && r.type === 'result' && r.ok === false && j.type === 'reject' && j.reason === 'exceeded' && j.n === r.n && r.n > attemptNum,
    }
}

//call, 同步呼叫並記錄是否同步拋出
function call(fn) {
    try {
        return { ok: true, p: fn() }
    }
    catch (e) {
        return { ok: false, e }
    }
}

//shown, settle之結果轉為可序列化之物件(值經safeStr)
function shown(r) {
    return r.s === 'pending' ? { s: 'pending' } : { s: r.s, v: safeStr(r.v) }
}

//delay
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

//nonFuns, 非函數之任務值軸(R-PM-SETTLE-01規則12): undefined、null、0、字串、物件、Promise、async generator函數(isfun為false)
function nonFuns() {
    return [
        ['undefined', undefined],
        ['null', null],
        ['zero', 0],
        ['str', 'abc'],
        ['obj', {}],
        ['pm', Promise.resolve(1)],
        ['asyncGen', async function* () {}],
    ]
}

//mkTask, 依呼叫序k(由0起)決定耗時ms與結果之任務函數, 記錄呼叫次數、執行中數與最大並行數
//  durOf(k)為0時同步回傳(不計並行), 為Infinity時回傳永不settle之Promise; okOf(k)為false時reject Error('down'+k), 否則resolve valOf(k)(預設'v'+k)
function mkTask(durOf, okOf = () => true, valOf = (k) => 'v' + k) {
    let st = { calls: 0, conc: 0, maxConc: 0 }
    let fun = () => {
        let k = st.calls
        st.calls += 1
        let d = durOf(k)
        if (d === 0) {
            if (!okOf(k)) {
                throw new Error('down' + k)
            }
            return valOf(k)
        }
        st.conc += 1
        st.maxConc = Math.max(st.maxConc, st.conc)
        if (d === Infinity) {
            return new Promise(() => {})
        }
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                st.conc -= 1
                if (okOf(k)) {
                    resolve(valOf(k))
                }
                else {
                    reject(new Error('down' + k))
                }
            }, d)
        })
    }
    return { st, fun }
}

//captureLog, 攔截console.log, 回傳記錄陣列與還原函數
function captureLog() {
    let logs = []
    let cl = console.log
    console.log = (...a) => {
        logs.push(a.map((x) => safeStr(x)).join(' '))
    }
    let restore = () => {
        console.log = cl
    }
    return { logs, restore }
}

//captureOut, 攔截console.log與console.error(debounce、pmDebounce之失敗經getDiag出口以console.error記錄, 固定詞彙之記錄為console.log), 回傳記錄陣列與還原函數
function captureOut() {
    let logs = []
    let cl = console.log
    let ce = console.error
    console.log = (...a) => {
        logs.push(a.map((x) => safeStr(x)).join(' '))
    }
    console.error = (...a) => {
        logs.push(a.map((x) => safeStr(x)).join(' '))
    }
    let restore = () => {
        console.log = cl
        console.error = ce
    }
    return { logs, restore }
}

//最小DOM替身(domPrepend用insertBefore/firstChild, importResources用getElementsByTagName與load事件)
class El {
    constructor(tag) {
        this.nodeType = 1
        this.tagName = tag
        this.style = {}
        this.childNodes = []
        this.parentNode = null
        this.handlers = {}
    }

    get firstChild() {
        return this.childNodes[0] || null
    }

    setAttribute() {}
    addEventListener(type, fn) {
        (this.handlers[type] = this.handlers[type] || []).push(fn)
    }

    appendChild(c) {
        c.parentNode = this
        this.childNodes.push(c)
        if (this.tagName === 'head') {
            setTimeout(() => (c.handlers.load || []).forEach((fn) => fn()), 5)
        }
        return c
    }

    insertBefore(c, ref) {
        c.parentNode = this
        let i = ref ? this.childNodes.indexOf(ref) : -1
        if (i < 0) {
            this.childNodes.push(c)
        }
        else {
            this.childNodes.splice(i, 0, c)
        }
        return c
    }

    removeChild(c) {
        let i = this.childNodes.indexOf(c)
        if (i >= 0) {
            this.childNodes.splice(i, 1)
        }
        c.parentNode = null
        return c
    }
}
let body = null
function installDom() {
    body = new El('body')
    let head = new El('head')
    globalThis.document = {
        createElement: (tag) => new El(tag),
        querySelector: (q) => (q === 'body' ? body : null),
        getElementsByTagName: (n) => (n === 'head' ? [head] : []),
    }
}

let cases = {

    //pmConvertResolve: 拒絕值讀取reason拋錯者, resolve error且msg為原值
    convertRejectHostile: async () => {
        let f = await imp('pmConvertResolve')
        let out = {}
        for (let [k, mk] of [['revoked', revoked], ['reasonGetter', reasonGetter], ['getTrap', getTrap]]) {
            let v = mk()
            let r = await settle(f(async () => {
                throw v
            })())
            out[k] = { s: r.s, state: r.s === 'resolve' ? r.v.state : null, same: r.s === 'resolve' ? r.v.msg === v : false }
        }
        return out
    },

    //pmConvertResolve: 同步回傳各種值, 必回傳Promise並resolve
    convertSyncReturnHostile: async () => {
        let f = await imp('pmConvertResolve')
        let out = {}
        let mks = {
            revoked,
            getTrap,
            tagGetter,
            fakeTag: () => ({ [Symbol.toStringTag]: 'Promise' }),
            funcThen: () => Object.assign(function() {}, { then() {} }),
            proxyPm: () => new Proxy(Promise.resolve(1), {}),
        }
        for (let k in mks) {
            let v = mks[k]()
            let c = call(() => f(() => v)())
            if (!c.ok) {
                out[k] = { syncThrow: true }
                continue
            }
            let r = await settle(c.p)
            out[k] = { syncThrow: false, s: r.s, state: r.s === 'resolve' ? r.v.state : null, same: r.s === 'resolve' ? r.v.msg === v : false }
        }
        return out
    },

    //pmConvertResolve: 拋出null為error
    convertThrowNull: async () => {
        let f = await imp('pmConvertResolve')
        let r = await settle(f(() => {
            throw null
        })())
        return { s: r.s, state: r.v && r.v.state, msgIsNull: r.v && r.v.msg === null }
    },

    //pmConvertResolve: 取消慣例與一般值(對照, 不得改變)
    convertControls: async () => {
        let f = await imp('pmConvertResolve')
        let c = { reason: 'cancelled' }
        let a = await settle(f(async () => {
            throw c
        })())
        let b = await settle(f(() => {
            throw c
        })())
        let d = await settle(f(async () => {
            throw 'x'
        })())
        let e = await settle(f(async () => 'v')())
        let g = await settle(f(() => 'w')())
        return {
            asyncCancelled: a.v,
            syncThrowCancelled: { state: b.v.state, same: b.v.msg === c },
            asyncReject: d.v,
            asyncResolve: e.v,
            syncReturn: g.v,
        }
    },

    //pmQueue: 第一個任務以惡意值拒絕, 第二個任務照常
    queueHostileThenGood: async () => {
        let Q = await imp('pmQueue')
        let q = Q(1)
        let v = revoked()
        let p1 = settle(q(async () => {
            throw v
        }))
        let p2 = settle(q(async () => 'good'))
        let [r1, r2] = await Promise.all([p1, p2])
        return { t1: { s: r1.s, same: r1.v === v }, t2: { s: r2.s, v: r2.v } }
    },

    //pmQueue: 任務同步回傳Symbol.toStringTag會拋之物件
    queueSyncReturnTagGetter: async () => {
        let Q = await imp('pmQueue')
        let q = Q(1)
        let v = tagGetter()
        let p1 = settle(q(() => v))
        let p2 = settle(q(async () => 'good'))
        let [r1, r2] = await Promise.all([p1, p2])
        return { t1: { s: r1.s, same: r1.v === v }, t2: { s: r2.s, v: r2.v } }
    },

    //pmQueue: 任務之取消以{ reason: 'cancelled' }傳出, 同pmThrottle、pmInvResolve
    queueCancelPassThrough: async () => {
        let Q = await imp('pmQueue')
        let T = await imp('pmThrottle')
        let inv = await imp('pmInvResolve')
        let C = await imp('pmConvertResolve')
        let task = async () => {
            throw { reason: 'cancelled' }
        }
        let rq = await settle(Q(1)(task))
        let rt = await settle(T()(task))
        let ri = await settle(inv(C(task)()))
        let rd = (x) => (x.s === 'reject' && x.v !== null && typeof x.v === 'object') ? x.v.reason : x.v
        return { pmQueue: { s: rq.s, reason: rd(rq) }, pmThrottle: { s: rt.s, reason: rd(rt) }, pmInvResolve: { s: ri.s, reason: rd(ri) } }
    },

    //pmQueue: 拋出null為reject null
    queueThrowNull: async () => {
        let Q = await imp('pmQueue')
        let r = await settle(Q(1)(() => {
            throw null
        }))
        return { s: r.s, isNull: r.v === null }
    },

    //pmThrottle: 惡意值拒絕後, 之後之任務照常
    throttleHostileThenGood: async () => {
        let T = await imp('pmThrottle')
        let t = T()
        let v = reasonGetter()
        let r1 = await settle(t(async () => {
            throw v
        }))
        let r2 = await settle(t(async () => 'good'))
        return { t1: { s: r1.s, same: r1.v === v }, t2: { s: r2.s, v: r2.v } }
    },

    //pmDebounce: 任務同步拋錯不使計時器回呼拋錯, 失敗經getDiag出口以console.error記錄(label'[wsemi pmDebounce] task threw'+安全摘要, 不含拋出值; 同debounce, 回傳已撤銷Proxy之任務為成功故不記錄, 預期記錄1次), 後續任務照常
    debounceSyncThrowThenNext: async () => {
        let D = await imp('pmDebounce')
        let d = D(10)
        let cap = captureOut()
        let logs = cap.logs
        try {
            let ret = d(() => {
                throw new Error('sync boom')
            })
            let next = false
            await new Promise((resolve) => setTimeout(resolve, 150))
            d(() => {
                next = true
            })
            await new Promise((resolve) => setTimeout(resolve, 150))
            let v = revoked()
            d(() => v)
            await new Promise((resolve) => setTimeout(resolve, 150))
            let next2 = false
            d(() => {
                next2 = true
            })
            await new Promise((resolve) => setTimeout(resolve, 150))
            return { ret: ret === undefined ? 'undefined' : typeof ret, next, next2, logged: logs.filter((s) => s === '[wsemi pmDebounce] task threw <object>').length, leaked: logs.filter((s) => s.includes('sync boom')).length }
        }
        finally {
            cap.restore()
        }
    },

    //debounce: 非同步任務reject不產生未處理之rejection, 經getDiag出口以console.error記錄(label+安全摘要, 不含拋出值), 後續任務照常
    debounceAsyncReject: async () => {
        let D = await imp('debounce')
        let d = D(10)
        let cap = captureOut()
        let logs = cap.logs
        try {
            d(async () => {
                throw new Error('async boom')
            })
            await new Promise((resolve) => setTimeout(resolve, 100))
            let next = false
            d(() => {
                next = true
            })
            await new Promise((resolve) => setTimeout(resolve, 100))
            return { next, logged: logs.filter((s) => s === '[wsemi debounce] task threw <object>').length, leaked: logs.filter((s) => s.includes('async boom')).length }
        }
        finally {
            cap.restore()
        }
    },

    //pmMap: fun同步拋錯reject, 回傳一般值resolve, 不給fun時一般值resolve(同pmSeries), 皆不經console.error
    mapFunResults: async () => {
        let M = await imp('pmMap')
        let S = await imp('pmSeries')
        let errs = []
        let ce = console.error
        console.error = (...a) => {
            errs.push(a.map((x) => safeStr(x)).join(' '))
        }
        try {
            let e = new Error('fun boom')
            let a = await settle(M([1, 2], () => {
                throw e
            }, 1))
            let b = await settle(M([1, 2], (v) => v * 10, 1))
            let b0 = await settle(M([1, 2], (v) => v * 10, 0))
            let c = await settle(M([1, 2], null, 1))
            let d = await settle(M({ x: 1, y: Promise.resolve(2) }, null))
            let ds = await settle(S({ x: 1, y: Promise.resolve(2) }, null))
            return {
                funThrow: { s: a.s, same: a.v === e },
                funValue1: b,
                funValue0: b0,
                noFunValues: c,
                noFunObj: d,
                seriesNoFunObj: ds,
                consoleError: errs.length,
            }
        }
        finally {
            console.error = ce
        }
    },

    //pmHook: cb於各階段拋錯皆reject該錯誤, fun同步拋錯reject, fun回傳一般值resolve
    hookThrows: async () => {
        let H = await imp('pmHook')
        let HR = await imp('pmHookReject')
        let mk = (mode) => (msg) => {
            if (msg.mode === mode) {
                throw new Error('cb ' + mode)
            }
        }
        let out = {}
        let cb = call(() => H(async () => 'ok', mk('before'))())
        out.before = cb.ok ? (await settle(cb.p)) : { syncThrow: true }
        out.afterThen = await settle(H(async () => 'ok', mk('afterThen'))())
        out.afterCatch = await settle(H(async () => {
            throw 'ng'
        }, mk('afterCatch'))())
        let cs = call(() => H(() => {
            throw new Error('fun sync')
        })())
        out.funSyncThrow = cs.ok ? (await settle(cs.p)) : { syncThrow: true }
        let cv = call(() => H(() => 123)())
        out.funValue = cv.ok ? (await settle(cv.p)) : { syncThrow: true }
        out.hookRejectCbThrow = await settle(HR(async () => {
            throw 'ng'
        }, () => {
            throw new Error('rej cb')
        })())
        for (let k in out) {
            if (out[k].v instanceof Error) {
                out[k] = { s: out[k].s, msg: out[k].v.message }
            }
        }
        return out
    },

    //waitFun: 輪詢中拋錯或reject即reject該錯誤並停止輪詢, 同立即呼叫
    //  以觀察回調判定懸置(settleTrace): 原以牆鐘800ms看門狗, 負載下輪詢未及完成即判pending
    waitFunIntervalFail: async () => {
        let W = await imp('waitFun')
        let e = new Error('later boom')
        let n = 0
        let ta = mkTrace()
        let a = await settleTrace(W(async () => {
            n++
            if (n === 1) {
                return false
            }
            throw e
        }, { attemptNum: 5, timeInterval: 20, onTrace: ta.on }), ta, lateTick(1))
        await new Promise((resolve) => setTimeout(resolve, 120)) //否定斷言之觀察窗: reject後不再呼叫(calls仍為2)
        let m = 0
        let e2 = new Error('later sync boom')
        let tb = mkTrace()
        let b = await settleTrace(W(() => {
            m++
            if (m === 1) {
                return false
            }
            throw e2
        }, { attemptNum: 5, timeInterval: 20, onTrace: tb.on }), tb, lateTick(1))
        await new Promise((resolve) => setTimeout(resolve, 120)) //同上
        let e3 = new Error('first boom')
        let tc = mkTrace()
        let c = await settleTrace(W(async () => {
            throw e3
        }, { attemptNum: 5, timeInterval: 20, onTrace: tc.on }), tc, lateTick(0))
        let td = mkTrace()
        let d = await settleTrace(W(() => false, { attemptNum: 2, timeInterval: 20, onTrace: td.on }), td, lateTick(3))
        return {
            intervalReject: { s: a.s, same: a.v === e, calls: n },
            intervalSyncThrow: { s: b.s, same: b.v === e2, calls: m },
            immediateReject: { s: c.s, same: c.v === e3 },
            exceeded: d,
        }
    },

    //ispm: 任何輸入皆回傳布林值
    ispmHostile: async () => {
        let ispm = await imp('ispm')
        let out = {}
        for (let [k, mk] of [['revoked', revoked], ['getTrap', getTrap], ['tagGetter', tagGetter]]) {
            let c = call(() => ispm(mk()))
            out[k] = c.ok ? c.p : 'throw'
        }
        out.nativePm = ispm(Promise.resolve(1))
        return out
    },

    //domVirtualCreate: 成功與失敗皆移除臨時元素
    domVirtualCreateCleanup: async () => {
        installDom()
        let V = await imp('domVirtualCreate')
        let e = new Error('render boom')
        let a = await settle(V(() => {
            throw e
        }))
        let n1 = body.childNodes.length
        let b = await settle(V(async () => {
            throw e
        }))
        let n2 = body.childNodes.length
        let c = await settle(V(async () => 'b64'))
        let n3 = body.childNodes.length
        return { syncThrow: { s: a.s, same: a.v === e, left: n1 }, asyncReject: { s: b.s, same: b.v === e, left: n2 }, ok: { s: c.s, v: c.v, left: n3 } }
    },

    //domVirtualCreateQueue: 失敗後下一個照常, 不殘留
    domVirtualCreateQueueNext: async () => {
        installDom()
        let VQ = await imp('domVirtualCreateQueue')
        let q = VQ()
        let p1 = settle(q(async () => {
            throw new Error('render boom')
        }, {}))
        let p2 = settle(q(async () => 'b64', {}))
        let [r1, r2] = await Promise.all([p1, p2])
        return { t1: r1.s, t2: { s: r2.s, v: r2.v }, left: body.childNodes.length }
    },

    //importResources: pathItem.func拋錯時reject, 不懸置
    importResourcesFuncThrows: async () => {
        installDom()
        let I = await imp('importResources')
        let r = await settle(I([{
            path: 'a.js',
            func: () => {
                throw new Error('func boom')
            }
        }]), 1200)
        return { s: r.s, msg: r.v instanceof Error ? r.v.message : r.v }
    },

    //cacheBd: 取值失敗後解除lock, getFromCache之後續嘗試可取得
    cacheBdRetry: async () => {
        let cacheBd = await imp('cacheBd')
        let n = 0
        let c = cacheBd(async () => {
            n++
            if (n === 1) {
                throw new Error('transient')
            }
            return 'value'
        }, { nMax: 4, nTrigger: 1 })
        let r = await settle(c.getFromCache(), 6000)
        return { s: r.s, v: r.s === 'resolve' ? r.v : (r.v && r.v.message), calls: n }
    },

    //cacheSt.setWithFree: fn以惡意值拒絕時外傳原值, key釋放
    cacheStHostile: async () => {
        let cacheSt = await imp('cacheSt')
        let st = cacheSt()
        let v = revoked()
        let r = await settle(st.setWithFree(['k1'], async () => {
            throw v
        }))
        let freed = (await st.check('k1')) === false
        st.clear()
        return { s: r.s, same: r.v === v, freed }
    },

    //pmSeries、pmMap: 先行產生之Promise陣列中排後者先reject, 不產生未處理之rejection(複審R01)
    preCreatedLaterReject: async () => {
        let S = await imp('pmSeries')
        let M = await imp('pmMap')
        let delay = (ms, v) => new Promise((resolve) => setTimeout(() => resolve(v), ms))
        let e1 = new Error('later')
        let a = await settle(S([delay(40, 'a'), Promise.reject(e1)], null), 1500)
        let e2 = new Error('later1')
        let b = await settle(M([delay(40, 'a'), Promise.reject(e2)], null, 1), 1500)
        let e3 = new Error('first')
        let c = await settle(M([Promise.reject(e3), delay(40, 'b'), Promise.reject(new Error('never taken'))], null, 1), 1500)
        await new Promise((resolve) => setTimeout(resolve, 100))
        return { series: { s: a.s, same: a.v === e1 }, map1: { s: b.s, same: b.v === e2 }, mapAbort: { s: c.s, same: c.v === e3 } }
    },

    //setIntervalHp、setTimeoutHp: async回呼reject不產生未處理之rejection, 以console.log記錄(複審R03)
    hpAsyncReject: async () => {
        let SI = await imp('setIntervalHp')
        let ST = await imp('setTimeoutHp')
        let logs = []
        let cl = console.log
        console.log = (...a) => {
            logs.push(a.map((x) => safeStr(x)).join(' '))
        }
        try {
            let n = 0
            let stop = SI(async () => {
                n++
                throw new Error('interval async boom')
            }, 10)
            await new Promise((resolve) => setTimeout(resolve, 80))
            stop()
            ST(async () => {
                throw new Error('timeout async boom')
            }, 10)
            await new Promise((resolve) => setTimeout(resolve, 80))
            return { called: n > 0, loggedInterval: logs.some((s) => s.includes('interval async boom')), loggedTimeout: logs.some((s) => s.includes('timeout async boom')) }
        }
        finally {
            console.log = cl
        }
    },

    //importResources: 載入中之後到者與首位同成敗, 失敗後之呼叫可重新載入(複審R14)
    importResourcesConcurrent: async () => {
        installDom()
        let I = await imp('importResources')
        let n = 0
        let func = () => {
            n++
            if (n === 1) {
                throw new Error('func boom 1')
            }
            return true
        }
        let p1 = settle(I([{ path: 'b.js', func }]), 2500)
        let p2 = settle(I([{ path: 'b.js', func }]), 2500)
        let [r1, r2] = await Promise.all([p1, p2])
        let r3 = await settle(I([{ path: 'b.js', func }]), 2500)
        let msg = (x) => (x.v instanceof Error ? x.v.message : (typeof x.v === 'string' ? x.v : typeof x.v))
        return { first: { s: r1.s, msg: msg(r1) }, concurrent: { s: r2.s, msg: msg(r2) }, retry: { s: r3.s, funcCalls: n } }
    },

    //importResources: 不同組(key不同)共用同一路徑時, 單一路徑層之載入中後到者亦與首位同成敗
    importResourcesSharedPath: async () => {
        installDom()
        let I = await imp('importResources')
        let n = 0
        let func = () => {
            n++
            if (n === 1) {
                throw new Error('func boom c')
            }
            return true
        }
        let p1 = settle(I([{ path: 'c.js', func }]), 2500)
        let p2 = settle(I([{ path: 'c.js', func }, { path: 'd.js' }]), 2500)
        let [r1, r2] = await Promise.all([p1, p2])
        let msg = (x) => (x.v instanceof Error ? x.v.message : (typeof x.v === 'string' ? x.v : typeof x.v))
        return { first: { s: r1.s, msg: msg(r1) }, otherGroup: { s: r2.s, msg: msg(r2) } }
    },

    //debounce: 記錄之值的檢視器會拋時亦不產生未處理之rejection(複審R15)
    debounceInspectThrows: async () => {
        let D = await imp('debounce')
        let d = D(10)
        let bad = {
            [Symbol.for('nodejs.util.inspect.custom')]() {
                throw new Error('inspect boom')
            }
        }
        d(async () => {
            throw bad
        })
        await new Promise((resolve) => setTimeout(resolve, 100))
        let next = false
        d(() => {
            next = true
        })
        await new Promise((resolve) => setTimeout(resolve, 100))
        return { next }
    },

    //pmConvertResolve: 覆寫catch之Promise子類別與稍後回呼之可呼叫thenable(複審R16)
    convertSubclassAndCallable: async () => {
        let f = await imp('pmConvertResolve')
        class BadCatch extends Promise {
            catch() {
                throw new Error('catch boom')
            }
        }
        let e = new Error('real reason')
        let a = await settle(f(() => BadCatch.resolve('ok'))())
        let b = await settle(f(() => BadCatch.reject(e))())
        let callable = function() {}
        callable.then = (res) => {
            setTimeout(() => res('V'), 5)
        }
        let c = await settle(f(() => callable)())
        return {
            resolved: { state: a.v && a.v.state, msg: a.v && a.v.msg },
            rejected: { state: b.v && b.v.state, same: b.v && b.v.msg === e },
            callable: { state: c.v && c.v.state, msg: c.v && c.v.msg },
        }
    },

    //domVirtualCreate: fun自行移除臨時元素後失敗, 仍reject原錯誤(複審R17)
    domVirtualCreateSelfRemove: async () => {
        installDom()
        let V = await imp('domVirtualCreate')
        let e = new Error('render boom')
        let r = await settle(V((ele) => {
            let panel = ele.parentNode.parentNode.parentNode //eleTar → eleIn → eleOut → elePanel
            panel.parentNode.removeChild(panel)
            throw e
        }))
        return { s: r.s, same: r.v === e, left: body.childNodes.length }
    },

    //ispm回傳false之使用端效果(複審R19): pmTimeout輸入讀取即拋錯之值為invalid pm、waitFun謂詞回傳之為未就緒
    ispmCallers: async () => {
        let PT = await imp('pmTimeout')
        let W = await imp('waitFun')
        let a = await settle(PT(revoked(), 100))
        let b = await settle(W(() => tagGetter(), { attemptNum: 2, timeInterval: 20 }))
        return { pmTimeout: { s: a.s, msg: a.v instanceof Error ? a.v.message : a.v }, waitFun: b }
    },

    //throw null: pmThrottle與pmInvResolve亦為失敗(複審R23-13)
    throwNullOthers: async () => {
        let T = await imp('pmThrottle')
        let C = await imp('pmConvertResolve')
        let inv = await imp('pmInvResolve')
        let a = await settle(T()(() => {
            throw null
        }))
        let b = await settle(inv(C(() => {
            throw null
        })()))
        return { pmThrottle: { s: a.s, isNull: a.v === null }, pmInvResolve: { s: b.s, isNull: b.v === null } }
    },

    //行程自然結束(計時器已釋放): 停擺情境
    exitThrottle: async () => {
        let T = await imp('pmThrottle')
        T()(async () => {
            throw revoked()
        }).catch(() => {})
    },
    exitDebounce: async () => {
        let D = await imp('pmDebounce')
        D(10)(() => {
            throw new Error('sync boom')
        })
    },
    exitWaitFun: async () => {
        let W = await imp('waitFun')
        let n = 0
        W(async () => {
            n++
            if (n === 1) {
                return false
            }
            throw new Error('later boom')
        }, { attemptNum: 3, timeInterval: 20 }).catch(() => {})
    },

    //cache.get: fun於同步階段呼叫同key之get(c01)、交叉key(c11)、getProxy(c15)、重入後同步拋錯(c09)、同tick三個get(c12對照)
    cacheReentrant: async () => {
        let C = await imp('cache')
        let out = {}

        //track, 重入者之結果記錄: 只掛then(不另建Promise與計時器), 使修前遞迴至堆疊溢位時每層之額外堆疊最小; 未落定者為{ s: 'pending' }, 未產生者為{ s: 'none' }
        let track = (p) => {
            let o = { s: 'pending' }
            p.then((v) => {
                o.s = 'resolve'
                o.v = safeStr(v)
            }, (e) => {
                o.s = 'reject'
                o.v = safeStr(e)
            })
            return o
        }
        let none = { s: 'none' }

        //c01
        let oc1 = C()
        let n1 = 0
        let inner1 = none
        oc1.set('k', {
            fun: () => {
                n1++
                inner1 = track(oc1.get('k'))
                return 'v'
            },
            timeExpired: 30000,
        })
        let outer1 = await settle(oc1.get('k'), 1500)
        await delay(20)
        out.c01 = { calls: n1, outer: shown(outer1), inner: inner1 }

        //c11
        let oc2 = C()
        let n2 = { k1: 0, k2: 0 }
        let innerK2 = none //k1之fun內取k2
        let innerK1 = none //k2之fun內取k1
        oc2.set('k1', {
            fun: () => {
                n2.k1++
                innerK2 = track(oc2.get('k2'))
                return 'v1'
            },
            timeExpired: 30000,
        })
        oc2.set('k2', {
            fun: () => {
                n2.k2++
                innerK1 = track(oc2.get('k1'))
                return 'v2'
            },
            timeExpired: 30000,
        })
        let outer2 = await settle(oc2.get('k1'), 1500)
        await delay(20)
        out.c11 = { calls: n2, outer: shown(outer2), innerK2, innerK1 }

        //c15
        let oc3 = C()
        let n3 = 0
        let inner3 = none
        let fun3 = () => {
            n3++
            inner3 = track(oc3.getProxy('k', { fun: fun3, timeExpired: 30000 }))
            return 'v'
        }
        let outer3 = await settle(oc3.getProxy('k', { fun: fun3, timeExpired: 30000 }), 1500)
        await delay(20)
        out.c15 = { calls: n3, outer: shown(outer3), inner: inner3 }

        //c09
        let oc4 = C()
        let n4 = 0
        let inner4 = none
        oc4.set('k', {
            fun: () => {
                n4++
                if (n4 === 1) {
                    inner4 = track(oc4.get('k'))
                    throw new Error('boom1')
                }
                return 'ok'
            },
            timeExpired: 30000,
        })
        let outer4 = await settle(oc4.get('k'), 1500)
        await delay(20)
        let inner4Now = { ...inner4 }
        let next4 = await settle(oc4.get('k'), 1500)
        out.c09 = { outer: shown(outer4), inner: inner4Now, next: shown(next4), calls: n4 }

        //c12
        let oc5 = C()
        let n5 = 0
        oc5.set('k', {
            fun: async () => {
                n5++
                await delay(20)
                return 'v'
            },
            timeExpired: 30000,
        })
        let ps5 = [oc5.get('k'), oc5.get('k'), oc5.get('k')].map((p) => settle(p, 1500))
        let rs5 = []
        for (let p of ps5) {
            rs5.push(shown(await p))
        }
        out.c12 = { calls: n5, results: rs5 }

        return out
    },

    //cache.get: fun等待同key之get之結果為互等而永不settle(c02首個await即為重入、c04 await之後重入), fun只呼叫1次
    cacheMutualWait: async () => {
        let C = await imp('cache')
        let out = {}
        let oc1 = C()
        let n1 = 0
        oc1.set('k', {
            fun: async () => {
                n1++
                await oc1.get('k')
                return 'v'
            },
            timeExpired: 30000,
        })
        let r1 = await settle(oc1.get('k'), 300)
        out.c02 = { calls: n1, outer: shown(r1) }
        let oc2 = C()
        let n2 = 0
        oc2.set('k', {
            fun: async () => {
                n2++
                await delay(10)
                await oc2.get('k')
                return 'v'
            },
            timeExpired: 30000,
        })
        let r2 = await settle(oc2.get('k'), 300)
        out.c04 = { calls: n2, outer: shown(r2) }
        return out
    },

    //pmInvResolve: 可呼叫thenable(then回傳undefined)與覆寫catch之Promise子類別不使其同步拋出, 依其結果settle
    invResolveThenable: async () => {
        let inv = await imp('pmInvResolve')
        class BadCatch extends Promise {
            catch() {
                throw new Error('catch boom')
            }
        }
        let callable = function() {}
        callable.then = (res) => {
            setTimeout(() => res({ state: 'success', msg: 'V' }), 5)
        }
        let e = new Error('real reason')
        let out = {}
        let mks = {
            callable: () => callable,
            subclassResolve: () => BadCatch.resolve({ state: 'success', msg: 'W' }),
            subclassReject: () => BadCatch.reject(e),
        }
        for (let k in mks) {
            let c = call(() => inv(mks[k]()))
            if (!c.ok) {
                out[k] = { syncThrow: true, msg: safeStr(c.e) }
                continue
            }
            let r = await settle(c.p)
            out[k] = { syncThrow: false, s: r.s, v: r.v === e ? '<same error>' : safeStr(r.v) }
        }
        return out
    },

    //pmThrottle: 非函數之任務不排入, 回傳之Promise以'fun is not a function'被reject, 不記錄, 不影響已排入與後續之有效任務
    nonFunThrottle: async () => {
        let T = await imp('pmThrottle')
        let cap = captureLog()
        try {
            let t = T()
            let out = {}
            for (let [k, v] of nonFuns()) {
                let c = call(() => t(v))
                if (!c.ok) {
                    out[k] = { syncThrow: true }
                    continue
                }
                if (c.p === null || typeof c.p !== 'object' || typeof c.p.then !== 'function') {
                    out[k] = { ret: typeof c.p }
                    continue
                }
                let r = await settle(c.p)
                out[k] = { s: r.s, v: safeStr(r.v) }
            }
            let pa = settle(t(async () => {
                await delay(30)
                return 'a'
            }), 1500)
            let cb = call(() => t(undefined)) //已排入有效任務後再呼叫非函數
            if (cb.ok && cb.p && typeof cb.p.catch === 'function') {
                cb.p.catch(() => {})
            }
            let ra = await pa
            let rg = await settle(t(async () => 'good'), 1500)
            return { out, queued: shown(ra), next: shown(rg), logged: cap.logs.filter((s) => s.includes('is not a function')).length }
        }
        finally {
            cap.restore()
        }
    },

    //pmQueue: 非函數之任務以'fun is not a function'被reject
    nonFunQueue: async () => {
        let Q = await imp('pmQueue')
        let q = Q(1)
        let out = {}
        for (let [k, v] of nonFuns()) {
            let r = await settle(q(v), 1500)
            out[k] = shown(r)
        }
        out.next = shown(await settle(q(async () => 'good'), 1500))
        return out
    },

    //setTimeoutHp: fun非函數時到期以console.log記錄Error('fn is not a function')一次, 回傳null(setIntervalHp之非函數案改由hpTraceRunner的intervalNonFun以事件同步)
    nonFunHp: async () => {
        let ST = await imp('setTimeoutHp')
        let cap = captureLog()
        try {
            let ret = ST(null, 10)
            await delay(80)
            let n3 = cap.logs.filter((s) => s === 'fn is not a function').length
            return { timeoutLogs: n3, timeoutRet: ret }
        }
        finally {
            cap.restore()
        }
    },

    //pmDebounce、debounce: 非函數之任務不排入, 回傳undefined並經getDiag出口以console.log記錄固定詞彙'[wsemi 函數名] func is not a function', 不影響已排入之任務
    nonFunPmDebounce: async () => {
        let PD = await imp('pmDebounce')
        let cap = captureLog()
        try {
            let ran = false
            let d = PD(10)
            d(() => {
                ran = true
            })
            let ret = d(undefined)
            await delay(150)
            return { ret: typeof ret, ran, logged: cap.logs.filter((s) => s === '[wsemi pmDebounce] func is not a function').length }
        }
        finally {
            cap.restore()
        }
    },
    nonFunDebounce: async () => {
        let D = await imp('debounce')
        let cap = captureLog()
        try {
            let ran = false
            let d = D(10)
            d(() => {
                ran = true
            })
            let ret = d('abc')
            await delay(150)
            return { ret: typeof ret, ran, logged: cap.logs.filter((s) => s === '[wsemi debounce] func is not a function').length }
        }
        finally {
            cap.restore()
        }
    },

    //waitFun: 輪詢不重疊(S1慢fun恆false、S3同步false、S5先啟動之慢輪回true)
    //  以觀察回調判定懸置(settleTrace), 並以事件序列驗證輪詢不重疊(原斷言呼叫恰3次, 依真實時間之比例, 負載下週期延誤即變)
    waitFunNoOverlap: async () => {
        let W = await imp('waitFun')
        let a = mkTask(() => 250, () => true, () => false)
        let ta = mkTrace()
        let ra = await settleTrace(W(a.fun, { attemptNum: 5, timeInterval: 100, onTrace: ta.on }), ta, lateTick(7))
        let s1 = { s: ra.s, v: safeStr(ra.v), maxConc: a.st.maxConc, inflightAtSettle: a.st.conc, ...noOverlap(ta.events, a.st.calls, 5) }
        let b = mkTask(() => 0, () => true, () => false)
        let tb = mkTrace()
        let rb = await settleTrace(W(b.fun, { attemptNum: 5, timeInterval: 50, onTrace: tb.on }), tb, lateTick(6))
        let s3 = { s: rb.s, v: safeStr(rb.v), calls: b.st.calls }
        let c = mkTask((k) => (k === 1 ? 500 : 10), () => true, (k) => k === 1)
        let tc = mkTrace()
        let rc = await settleTrace(W(c.fun, { attemptNum: 2, timeInterval: 100, onTrace: tc.on }), tc, lateTick(3))
        let s5 = { s: rc.s, maxConc: c.st.maxConc, last: tc.events.slice(-2).map((e) => [e.type, e.ok]) }
        return { s1, s3, s5 }
    },

    //waitFun: 立即呼叫為false, 其後之呼叫永不settle(S6): 不settle且不再累積呼叫
    waitFunHang: async () => {
        let W = await imp('waitFun')
        let a = mkTask((k) => (k === 0 ? 0 : Infinity), () => true, () => false)
        let r = await settle(W(a.fun, { attemptNum: 3, timeInterval: 50 }), 600)
        return { s: r.s, calls: a.st.calls }
    },

    //cacheBd(F3): 5個getFromCache, fun耗時600ms成功: 只觸發1次且皆得同值
    cacheBdSingleFlight: async () => {
        let cacheBd = await imp('cacheBd')
        let a = mkTask(() => 600)
        let bc = cacheBd(a.fun, { nTrigger: 1, nMax: 6 })
        let rs = await Promise.all(Array.from({ length: 5 }, () => settle(bc.getFromCache(), 9000)))
        return { calls: a.st.calls, results: rs.map(shown) }
    },

    //cacheBd(F5): A之getFromCache觸發之慢get(k0)執行中, 直接get(k1)失敗結束; B之getFromCache於k0執行中不觸發
    cacheBdNoTriggerWhileRunning: async () => {
        let cacheBd = await imp('cacheBd')
        let a = mkTask((k) => (k === 0 ? 2500 : 50), (k) => k !== 1)
        let bc = cacheBd(a.fun, { nTrigger: 1, nMax: 6 })
        let pa = settle(bc.getFromCache('A'), 12000)
        await delay(1100)
        let pd = settle(bc.get('D'), 12000)
        await delay(100)
        let pb = settle(bc.getFromCache('B'), 12000)
        let [ra, rd, rb] = await Promise.all([pa, pd, pb])
        return { calls: a.st.calls, A: shown(ra), D: shown(rd), B: shown(rb) }
    },

    //cacheBd(F6): 先啟動之慢get(k0)晚於後啟動之快get(k1)完成: 各get回傳自身之結果, 快取為後啟動者之值
    cacheBdSeqGuard: async () => {
        let cacheBd = await imp('cacheBd')
        let a = mkTask((k) => (k === 0 ? 800 : 50))
        let bc = cacheBd(a.fun)
        let p0 = settle(bc.get('old'), 3000)
        await delay(100)
        let p1 = settle(bc.get('new'), 3000)
        let [r0, r1] = await Promise.all([p0, p1])
        let rc = await settle(bc.getFromCache(), 3000)
        return { old: shown(r0), new: shown(r1), cache: shown(rc) }
    },

    //pmMap(F12): 陣列第2個元素為拋錯之getter(有fun之takeLimit 1與0、未給fun), 物件之值為拋錯之getter: 以該錯誤reject, 不同步拋出、不懸置
    mapElemGetterThrow: async () => {
        let M = await imp('pmMap')
        let one = async (mk, fun, takeLimit) => {
            let e = new Error('getter boom')
            let c = call(() => M(mk(e), fun, takeLimit))
            if (!c.ok) {
                return { syncThrow: true, same: c.e === e }
            }
            let r = await settle(c.p, 800)
            return { s: r.s, same: r.v === e }
        }
        let arr = (e) => {
            let rs = ['a', 'b', 'c']
            Object.defineProperty(rs, 1, {
                get() {
                    throw e
                },
            })
            return rs
        }
        let obj = (e) => ({
            a: 'a',
            get b() {
                throw e
            },
        })
        let fun = async (v) => v
        return {
            arrFun1: await one(arr, fun, 1),
            arrFun0: await one(arr, fun, 0),
            arrNoFun1: await one(arr, null, 1),
            objFun1: await one(obj, fun, 1),
        }
    },

    //cacheBd(F16): 直接呼叫之get失敗而呼叫端未接: 其rejection為未處理(同HEAD與cache.get、pmQueue), 不被本函數吞下
    cacheBdDirectGetUncaught: async () => {
        let cacheBd = await imp('cacheBd')
        let bc = cacheBd(async () => {
            throw new Error('direct-fail')
        })
        bc.get() //刻意不接
        await delay(50)
        return {}
    },

    //cacheBd(F16): fun同步拋錯之直接get失敗後, 執行中登記已移除, getFromCache之後續嘗試可觸發並取得
    cacheBdSyncThrowRetry: async () => {
        let cacheBd = await imp('cacheBd')
        let n = 0
        let c = cacheBd(() => {
            n++
            if (n === 1) {
                throw new Error('sync-transient')
            }
            return 'value'
        }, { nMax: 4, nTrigger: 1 })
        let d = await settle(c.get(), 1000)
        let r = await settle(c.getFromCache(), 6000)
        return { direct: shown(d), fromCache: shown(r), calls: n }
    },

    //waitFun(F20): 立即呼叫為false, 其後之呼叫永不settle, 以pmTimeout包裝: pmTimeout逾時reject, 逾次後計時器停止而行程自然結束(natural模式)
    waitFunHangExit: async () => {
        let W = await imp('waitFun')
        let P = await imp('pmTimeout')
        let a = mkTask((k) => (k === 0 ? 0 : Infinity), () => true, () => false)
        let r = await settle(P(W(a.fun, { attemptNum: 3, timeInterval: 50 }), 400), 2000)
        return { s: r.s, code: (r.v !== null && typeof r.v === 'object') ? r.v.code : null, calls: a.st.calls }
    },

    //pmQueue(F23): takeLast下排兩有效任務後排非函數(最後一筆): 前兩者照常被取消, 非函數者以'fun is not a function'被reject
    nonFunQueueTakeLast: async () => {
        let Q = await imp('pmQueue')
        let q = Q(0, true)
        let p1 = settle(q(async () => {
            await delay(30)
            return 'a'
        }), 1500)
        let p2 = settle(q(async () => 'b'), 1500)
        let p3 = settle(q(undefined), 1500)
        let [r1, r2, r3] = await Promise.all([p1, p2, p3])
        let rd = (x) => (x.s === 'reject' && x.v !== null && typeof x.v === 'object') ? { s: x.s, reason: x.v.reason } : shown(x)
        return { t1: rd(r1), t2: rd(r2), t3: rd(r3) }
    },
}

let out
try {
    out = await cases[caseName]()
}
catch (e) {
    out = { runnerError: safeStr(e) }
}
if (exitMode === 'natural') {
    //不強制結束; 由父行程以spawnSync之timeout判定
    process.on('exit', () => {
        console.log('@@R@@' + JSON.stringify({ out: out || null, unhandled, uncaught }))
    })
}
else {
    await new Promise((resolve) => setTimeout(resolve, 100))
    console.log('@@R@@' + JSON.stringify({ out, unhandled, uncaught }))
    process.exit(0)
}
