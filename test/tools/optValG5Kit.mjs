//optValG5Kit.mjs: 第221項第二批第2輪(ws272a, 計時與流程類)各函數之「可觀察有效值」探針, 供optValG5timerFlow.test.mjs以defineOptParamAsync逐參數宣告案例
//  每個探針 probe(v, extra) 皆為async: v為受測參數之輸入, extra為額外合併進opt之物件(如{ debug: true, funLog }); 回傳該參數實際採用之值(未給或非預期為預設)
//  觀察方式(皆不靠真實等待):
//    交給計時器者(setTimeout/setInterval之毫秒): 以stubTimers/stubTimersAsync攔截呼叫之ms
//    只與時間差比較者(debounce之ms、cache之timeExpired、cacheSt之timeExpire、alive之timeAlive): 以假Date.now與二分搜尋求「過了多久才算超過」之門檻, 門檻-1即採用之值
//    個數類(waitFun之attemptNum、cacheBd之nMax與nTrigger、fsDelete*Core之numRetry、cacheSt之waitExist/waitNotExist之attemptNum): 以假計時器逐週期推進(tick), 讀其結束時之訊息或事件
//    並行上限(queue、pmQueue、pmMap之takeLimit): 推入12個任務, 數同時進行者(12個全進行者視為0=不限)
import { mock } from 'node:test'
import delay from '../../src/delay.mjs'
import waitFun from '../../src/waitFun.mjs'
import debounce from '../../src/debounce.mjs'
import pmDebounce from '../../src/pmDebounce.mjs'
import cache from '../../src/cache.mjs'
import cacheSt from '../../src/cacheSt.mjs'
import cacheBd from '../../src/cacheBd.mjs'
import alive from '../../src/alive.mjs'
import evEmitDelay from '../../src/evEmitDelay.mjs'
import evem from '../../src/evem.mjs'
import queue from '../../src/queue.mjs'
import pmQueue from '../../src/pmQueue.mjs'
import pmMap from '../../src/pmMap.mjs'
import execProcess from '../../src/execProcess.mjs'
import kitPortPids from '../../src/_execPortPids.mjs'
import fsDeleteFileSafeCore from '../../src/fsDeleteFileSafeCore.mjs'
import fsDeleteFolderSafeCore from '../../src/fsDeleteFolderSafeCore.mjs'
import fsWatchFolder from '../../src/fsWatchFolder.mjs'
import domRipple from '../../src/domRipple.mjs'
import { traceRec, useFakeClock } from './timeKit.mjs'
import { fakeTimer, stubTimers, withFakeChokidarSync } from './optValG2fsexecKit.mjs'
import { mkFake } from './delTraceKit.mjs'


//真實setImmediate於模組載入時保存(假時鐘不影響), 供讓出一次使已可進行之microtask全數執行
const realImmediate = setImmediate
function flush() {
    return new Promise((resolve) => realImmediate(resolve))
}


//起算時刻(正數, 避免快取等以truthy判定時間而把0視為未設)
const T0 = 1000


/**
 * 於async函數f執行期間暫換setTimeout/setInterval並記錄(不真的排程), 結束(含拋錯)必還原; f收到calls陣列({ kind, ms, fn }), 可手動呼叫fn以決定性地觸發計時器回呼
 *
 * @param {Function} f 輸入async函數, 傳入(calls)
 * @returns {Promise} 回傳f之結果
 */
async function stubTimersAsync(f) {
    let calls = []
    let ost = globalThis.setTimeout
    let osi = globalThis.setInterval
    globalThis.setTimeout = (fn, ms) => {
        calls.push({ kind: 'timeout', ms, fn })
        return fakeTimer()
    }
    globalThis.setInterval = (fn, ms) => {
        calls.push({ kind: 'interval', ms, fn })
        return fakeTimer()
    }
    try {
        return await f(calls)
    }
    finally {
        globalThis.setTimeout = ost
        globalThis.setInterval = osi
    }
}


/**
 * 求「單調判定trial(x)由false轉true」之最小整數x(x>=1), 先倍增再二分; 上界2**53仍為false則回傳null
 *
 * @param {Function} trial 輸入async函數, 傳入經過毫秒數x, 回傳是否已超過(單調)
 * @returns {Promise} 回傳最小x或null
 */
async function findThreshold(trial) {
    let lo = 0
    let hi = 1
    while (!(await trial(hi))) {
        lo = hi
        if (hi >= 2 ** 53) {
            return null
        }
        hi *= 2
    }
    while (hi - lo > 1) {
        let mid = Math.floor((lo + hi) / 2)
        if (await trial(mid)) {
            hi = mid
        }
        else {
            lo = mid
        }
    }
    return hi
}


//以假Date.now執行f(getNow), 結束必還原; getNow回傳目前假時間, setNow由f設定
async function withFakeNow(f) {
    let cur = T0
    let od = Date.now
    Date.now = () => cur
    try {
        return await f((t) => {
            cur = t
        })
    }
    finally {
        Date.now = od
    }
}


//門檻轉採用值: 判定為「經過x > ms」故門檻x=ms+1; 上界仍為false則回傳'never'
function thresholdToMs(x) {
    return x === null ? 'never' : x - 1
}


//取第一個interval之回呼
function firstInterval(calls) {
    return calls.find((c) => c.kind === 'interval')
}


//--- delay、evEmitDelay: 交給setTimeout之毫秒 ---

async function delayMs(v, extra) {
    let { calls } = stubTimers(() => {
        delay(v, extra === undefined ? null : extra)
    })
    return calls.find((c) => c.kind === 'timeout').ms
}

async function evEmitDelayMs(v, extra) {
    let { calls } = stubTimers(() => {
        evEmitDelay(evem(), 'ev', [], { ms: v, ...extra })
    })
    return calls.find((c) => c.kind === 'timeout').ms
}


//--- waitFun: attemptNum(個數)、timeInterval(交給setInterval) ---

//驅動fake interval回呼至pm落定(上限6000輪), 回傳 { st: 'res'|'rej'|'unsettled', v }
async function driveInterval(iv, settledRef, max = 6000) {
    for (let i = 0; i < max && settledRef.v === null; i++) {
        await iv.fn()
        await flush()
    }
    return settledRef.v === null ? { st: 'unsettled', v: null } : settledRef.v
}

async function waitFunAttempt(v, extra) {
    return stubTimersAsync(async (calls) => {
        let ref = { v: null }
        waitFun(() => false, { attemptNum: v, ...extra }).then(() => {
            ref.v = { st: 'res', v: null }
        }, (e) => {
            ref.v = { st: 'rej', v: e }
        })
        await flush()
        let iv = firstInterval(calls)
        let r = await driveInterval(iv, ref)
        if (r.st !== 'rej') {
            return r.st
        }
        let m = /^exceeded attemptNum\[(\d+)\]$/.exec(String(r.v))
        return m ? Number(m[1]) : `unexpected:${String(r.v)}`
    })
}

async function waitFunInterval(v, extra) {
    return stubTimersAsync(async (calls) => {
        waitFun(() => false, { timeInterval: v, ...extra })
        await flush()
        return firstInterval(calls).ms
    })
}


//--- debounce、pmDebounce: ms只與時間差比較 ---

function makeDebounceMs(make) {
    return async (v, extra) => {
        let x = await findThreshold((x) => withFakeNow(async (setNow) => {
            let ran = false
            let cb = null
            stubTimers((calls) => {
                let run = make(v, { ...extra })
                run(() => {
                    ran = true
                })
                cb = firstInterval(calls).fn
            })
            setNow(T0 + x)
            cb()
            await flush()
            return ran
        }))
        return thresholdToMs(x)
    }
}

const debounceMs = makeDebounceMs((v, opt) => debounce(v, opt))
const pmDebounceMs = makeDebounceMs((v, opt) => pmDebounce(v, opt))


//--- cache.timeExpired、cacheSt.timeExpire、alive.timeAlive: 只與時間差比較 ---

async function cacheTimeExpired(v, extra) {
    let x = await findThreshold((x) => withFakeNow(async (setNow) => {
        let oc = cache()
        let n = 0
        let fun = async () => {
            n++
            return 1
        }
        oc.set('k', { fun, inputs: [], timeExpired: v, ...extra })
        await oc.get('k')
        setNow(T0 + x)
        await oc.get('k')
        return n === 2
    }))
    return thresholdToMs(x)
}

async function cacheStTimeExpire(v, extra) {
    let x = await findThreshold((x) => withFakeNow(async (setNow) => {
        let cs = null
        let cb = null
        stubTimers((calls) => {
            cs = cacheSt({ timeExpire: v, ...extra })
            cb = firstInterval(calls).fn
        })
        await cs.set('k', 1)
        setNow(T0 + x)
        cb()
        return !(await cs.check('k'))
    }))
    return thresholdToMs(x)
}

async function aliveTimeAlive(v, extra) {
    let x = await findThreshold((x) => withFakeNow(async (setNow) => {
        let oAL = null
        let cb = null
        stubTimers((calls) => {
            oAL = alive({ timeAlive: v, ...extra })
            oAL.trigger('k', {})
            cb = firstInterval(calls).fn
        })
        setNow(T0 + x)
        cb()
        return oAL.get().length === 0
    }))
    return thresholdToMs(x)
}


//--- cacheSt.timeDetect、alive.timeDetect: 交給setInterval ---

async function cacheStTimeDetect(v, extra) {
    let { calls } = stubTimers(() => {
        cacheSt({ timeDetect: v, ...extra })
    })
    return firstInterval(calls).ms
}

async function aliveTimeDetect(v, extra) {
    let { calls } = stubTimers(() => {
        let oAL = alive({ timeDetect: v, ...extra })
        oAL.trigger('k', {})
    })
    return firstInterval(calls).ms
}


//--- cacheSt.waitExist / waitNotExist 之 attemptNum、timeInterval(第二個interval為waitFun之輪詢) ---

//kind為'waitExist'(等key出現, 測試中key不存在, 永不成立)或'waitNotExist'(等key消失, 測試中key存在, 永不成立)
function cacheStWaitAttempt(kind) {
    return async (v, extra) => {
        return stubTimersAsync(async (calls) => {
            let cs = cacheSt()
            if (kind === 'waitNotExist') {
                await cs.set('nokey', 1)
            }
            let ref = { v: null }
            cs[kind]('nokey', { attemptNum: v, timeInterval: 1, ...extra }).then(() => {
                ref.v = { st: 'res', v: null }
            }, (e) => {
                ref.v = { st: 'rej', v: e }
            })
            await flush()
            let iv = calls.filter((c) => c.kind === 'interval')[1] //[0]為cacheSt自身之TTL偵測, [1]為waitFun之輪詢
            let r = await driveInterval(iv, ref)
            if (r.st !== 'rej') {
                return r.st
            }
            let m = /timeout \((\d+)ms\)/.exec(String(r.v))
            return m ? Number(m[1]) : `unexpected:${String(r.v)}`
        })
    }
}

function cacheStWaitInterval(kind) {
    return async (v, extra) => {
        return stubTimersAsync(async (calls) => {
            let cs = cacheSt()
            if (kind === 'waitNotExist') {
                await cs.set('nokey', 1)
            }
            cs[kind]('nokey', { attemptNum: 5, timeInterval: v, ...extra })
            await flush()
            return calls.filter((c) => c.kind === 'interval')[1].ms
        })
    }
}


//--- cacheBd: nMax(總嘗試次數)、nTrigger(第幾次之後觸發get) ---

//啟用假setTimeout後逐1000ms推進getFromCache之偵測週期(delay(1000)), 直到落定(上限6000輪); fun失敗(nMax探針)或成功(nTrigger探針)
async function cacheBdRun(fun, opt, stopPred) {
    mock.timers.enable({ apis: ['setTimeout'] })
    try {
        let tr = traceRec()
        let bd = cacheBd(fun, { ...opt, onTrace: tr.on })
        let ref = { v: null }
        bd.getFromCache().then(() => {
            ref.v = { st: 'res', v: null }
        }, (e) => {
            ref.v = { st: 'rej', v: e }
        })
        let stopped = () => (stopPred ? stopPred(tr.events) : false)
        for (let i = 0; i < 6000 && ref.v === null && !stopped(); i++) {
            await flush()
            mock.timers.tick(1000)
        }
        await flush()
        return { ref, events: tr.events }
    }
    finally {
        mock.timers.reset()
    }
}

async function cacheBdNMax(v, extra) {
    let { ref } = await cacheBdRun(async () => {
        throw new Error('x')
    }, { nMax: v, ...extra })
    if (ref.v === null) {
        return 'unsettled'
    }
    let m = /^exceeded nMax\[(\d+)\]$/.exec(String(ref.v.v && ref.v.v.message))
    return m ? Number(m[1]) : `unexpected:${ref.v.st}`
}

async function cacheBdNTrigger(v, extra) {
    let { events } = await cacheBdRun(async () => 1, { nTrigger: v, ...extra }, (es) => es.some((e) => e.type === 'poll' && e.trigger === true))
    let e = events.find((x) => x.type === 'poll' && x.trigger === true)
    return e ? e.i - 1 : 'never'
}


//--- queue、pmQueue、pmMap 之 takeLimit(並行上限): 12個任務同時進行者視為0=不限 ---

const N_TASKS = 12

async function queueTakeLimit(v, extra) {
    let q = queue(v, extra)
    let hits = 0
    q.on('message', () => {
        if (q.get()) {
            hits++
        }
    })
    for (let i = 0; i < N_TASKS; i++) {
        q.push(i + 1) //get回傳falsy視為無消息, 故消息從1起
    }
    return hits === N_TASKS ? 0 : hits
}

//放行全部任務直到pm落定(上限500輪)
async function releaseAll(resolvers, pmAll) {
    let st = { done: false }
    pmAll.then(() => {
        st.done = true
    }, () => {
        st.done = true
    })
    for (let i = 0; i < 500 && !st.done; i++) {
        for (let r of resolvers.splice(0)) {
            r()
        }
        await flush()
    }
}

//pmQueue之任務於message處理內先await delay(1)才執行, 故以假setTimeout逐1ms推進(確定性, 不靠真實等待)
async function pmQueueTakeLimit(v, extra) {
    mock.timers.enable({ apis: ['setTimeout'] })
    try {
        let q = pmQueue(v, false, extra)
        let running = 0
        let resolvers = []
        let ps = []
        for (let i = 0; i < N_TASKS; i++) {
            ps.push(q(() => new Promise((resolve) => {
                running++
                resolvers.push(resolve)
            })))
        }
        for (let i = 0; i < 4; i++) {
            await flush()
            mock.timers.tick(1)
        }
        await flush()
        let r = running === N_TASKS ? 0 : running
        let st = { done: false }
        Promise.allSettled(ps).then(() => {
            st.done = true
        })
        for (let i = 0; i < 500 && !st.done; i++) {
            for (let res of resolvers.splice(0)) {
                res()
            }
            await flush()
            mock.timers.tick(1)
            await flush()
        }
        return r
    }
    finally {
        mock.timers.reset()
    }
}

async function pmMapTakeLimit(v, extra) {
    let running = 0
    let resolvers = []
    let pm = pmMap(Array.from({ length: N_TASKS }, (_, i) => i), () => new Promise((resolve) => {
        running++
        resolvers.push(resolve)
    }), v, extra)
    await flush()
    await flush()
    let r = running === N_TASKS ? 0 : running
    await releaseAll(resolvers, pm)
    return r
}


//--- execProcess.timeout: 交給setTimeout(未給或非預期為null=不限時, 此時不建立逾時計時器) ---

//探針所起之子行程(快速結束), 測試於after等其落定
const execPms = []

async function execProcessTimeout(v, extra) {
    let pm = null
    let { calls } = stubTimers(() => {
        pm = execProcess(process.execPath, ['-e', '0'], { timeout: v, ...extra })
    })
    execPms.push(pm.catch(() => {}))
    let c = calls.filter((x) => x.kind === 'timeout')
    return c.length === 0 ? null : c[0].ms
}

async function drainExec() {
    await Promise.allSettled(execPms.splice(0))
}


//--- execProcessPortPids / execProcessPortPidsSync 之 opt.timeout(經readInput讀取) ---

async function portPidsTimeout(v, extra) {
    return kitPortPids.readInput(80, { timeout: v, ...extra }, () => {}).cfg.timeout
}


//--- fsDeleteFileSafeCore、fsDeleteFolderSafeCore 之 numRetry: 以注入fs永遠EBUSY, 讀giveup事件之n(=採用之numRetry) ---

function makeNumRetry(core, op) {
    return async (v, extra) => {
        let { fs } = mkFake(op, new Array(80).fill('EBUSY'))
        let rec = traceRec()
        let clock = useFakeClock()
        try {
            let st = { done: false }
            let out = core('p', { fs, numRetry: v, onTrace: rec.on, ...extra }).then(() => 'resolve', () => 'reject')
            out.then(() => {
                st.done = true
            })
            for (let i = 0; i < 400 && !st.done; i++) {
                await flush()
                mock.timers.tick(300)
            }
            await flush()
            if (!st.done) {
                return 'unsettled'
            }
            await out
            let e = rec.events.find((x) => x.type === 'giveup')
            return e ? e.n : 'nogiveup'
        }
        finally {
            clock.restore()
        }
    }
}

const fsDeleteFileNumRetry = makeNumRetry(fsDeleteFileSafeCore, 'unlinkSync')
const fsDeleteFolderNumRetry = makeNumRetry(fsDeleteFolderSafeCore, 'rmSync')


//--- fsWatchFolder 之 timeInterval、timeBinaryInterval(假計時器與假chokidar.watch, 手動輪詢一次建立假watcher) ---

function observeFsWatchFolder(fd, o) {
    return withFakeChokidarSync((ws) => {
        let ev = null
        let { calls } = stubTimers(() => {
            ev = fsWatchFolder(fd, o)
        })
        let iv = calls.filter((c) => c.kind === 'interval')
        if (iv.length !== 1) {
            throw new Error(`fsWatchFolder: expected 1 polling interval, got ${iv.length}`)
        }
        iv[0].fn() //輪詢一次, 資料夾存在, 建立(假)watcher
        ev.clear()
        if (ws.length !== 1) {
            throw new Error(`fsWatchFolder: expected 1 watcher, got ${ws.length}`)
        }
        return { si: iv[0].ms, ci: ws[0].opts.pollingInterval, cb: ws[0].opts.pollingBinaryInterval }
    })
}


//--- domRipple.timeDuration: 交給移除用之setTimeout(第二個setTimeout; 第一個為固定1ms之啟動效果), 以最小假DOM執行 ---

class FakeEle {
    constructor() {
        this.nodeType = 1
        this.style = {}
        this.children = []
        this.parentNode = null
        this.clientWidth = 100
        this.clientHeight = 40
    }

    getBoundingClientRect() {
        return { left: 0, top: 0 }
    }

    appendChild(c) {
        c.parentNode = this
        this.children.push(c)
        return c
    }

    removeChild(c) {
        this.children.splice(this.children.indexOf(c), 1)
        c.parentNode = null
        return c
    }
}

async function domRippleRun(v, extra) {
    let od = globalThis.document
    globalThis.document = { createElement: () => new FakeEle() }
    try {
        let ele = new FakeEle()
        let { calls } = stubTimers(() => {
            domRipple(ele, { clientX: 5, clientY: 5 }, { timeDuration: v, ...extra })
        })
        let ts = calls.filter((c) => c.kind === 'timeout')
        let eleRipple = ele.children[0]
        return { ms: ts[1].ms, nTimers: ts.length, transition: eleRipple.style.transition }
    }
    finally {
        if (od === undefined) {
            delete globalThis.document
        }
        else {
            globalThis.document = od
        }
    }
}

async function domRippleDuration(v, extra) {
    return (await domRippleRun(v, extra)).ms
}


export {
    flush,
    T0,
    stubTimersAsync,
    findThreshold,
    delayMs,
    evEmitDelayMs,
    waitFunAttempt,
    waitFunInterval,
    debounceMs,
    pmDebounceMs,
    cacheTimeExpired,
    cacheStTimeExpire,
    cacheStTimeDetect,
    aliveTimeAlive,
    aliveTimeDetect,
    cacheStWaitAttempt,
    cacheStWaitInterval,
    cacheBdNMax,
    cacheBdNTrigger,
    queueTakeLimit,
    pmQueueTakeLimit,
    pmMapTakeLimit,
    execProcessTimeout,
    drainExec,
    portPidsTimeout,
    fsDeleteFileNumRetry,
    fsDeleteFolderNumRetry,
    observeFsWatchFolder,
    domRippleRun,
    domRippleDuration,
    N_TASKS
}
