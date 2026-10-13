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

//call, 同步呼叫並記錄是否同步拋出
function call(fn) {
    try {
        return { ok: true, p: fn() }
    }
    catch (e) {
        return { ok: false, e }
    }
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

    //pmDebounce: 任務同步拋錯不使計時器回呼拋錯, 失敗以console.log記錄(同debounce, 回傳已撤銷Proxy之任務為成功故不記錄, 預期記錄1次), 後續任務照常
    debounceSyncThrowThenNext: async () => {
        let D = await imp('pmDebounce')
        let d = D(10)
        let logs = []
        let cl = console.log
        console.log = (...a) => {
            logs.push(a.map((x) => safeStr(x)).join(' '))
        }
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
            return { ret: ret === undefined ? 'undefined' : typeof ret, next, next2, logged: logs.filter((s) => s.includes('m.func catch')).length }
        }
        finally {
            console.log = cl
        }
    },

    //debounce: 非同步任務reject不產生未處理之rejection, 以console.log記錄, 後續任務照常
    debounceAsyncReject: async () => {
        let D = await imp('debounce')
        let d = D(10)
        let logs = []
        let cl = console.log
        console.log = (...a) => {
            logs.push(a.map((x) => safeStr(x)).join(' '))
        }
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
            return { next, logged: logs.filter((s) => s.includes('m.func catch') && s.includes('async boom')).length }
        }
        finally {
            console.log = cl
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
    waitFunIntervalFail: async () => {
        let W = await imp('waitFun')
        let e = new Error('later boom')
        let n = 0
        let a = await settle(W(async () => {
            n++
            if (n === 1) {
                return false
            }
            throw e
        }, { attemptNum: 5, timeInterval: 20 }))
        await new Promise((resolve) => setTimeout(resolve, 120))
        let m = 0
        let e2 = new Error('later sync boom')
        let b = await settle(W(() => {
            m++
            if (m === 1) {
                return false
            }
            throw e2
        }, { attemptNum: 5, timeInterval: 20 }))
        await new Promise((resolve) => setTimeout(resolve, 120))
        let e3 = new Error('first boom')
        let c = await settle(W(async () => {
            throw e3
        }, { attemptNum: 5, timeInterval: 20 }))
        let d = await settle(W(() => false, { attemptNum: 2, timeInterval: 20 }))
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
