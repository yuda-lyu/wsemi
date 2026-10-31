//g1timerKit.mjs: 「opt類數值參數非預期之輸入改用預設」(排程第221項第二批g1timer組)之探測工具
//  本檔為第一級發布A之裁剪版: 只含setTimeoutHp、setIntervalHp所需(其餘函數屬第二、三級, 不在本輪)
//  依據: dspec〈輸入參數之檢測機制〉K3(opt類參數遇非預期之輸入視為未給、改用預設; opt.debug警告)、K4、§7.1
//  原則: 計時器相關之測試不以「等N毫秒後斷言」為唯一同步點(R-TRACE-01), 本檔以兩種手法取得可觀察值:
//    1. 攔截setTimeout/setInterval(captureTimerCbs), 記錄交給計時器之毫秒與回呼, 不真的排程
//    2. 手動呼叫攔到之回呼並暫換process.hrtime.bigint(withHrtimeMs), 以二分搜尋找出「至少經過多久才觸發」(minInt)
//  同一helper只定義一次


//fake timer物件(供clearTimeout/clearInterval吞下, 不真的排程)
function fakeTimer() {
    return {
        ref() {},
        unref() {},
        hasRef() {
            return false
        },
        refresh() {},
        [Symbol.toPrimitive]() {
            return 0
        },
    }
}


/**
 * 於f(同步)執行期間暫換setTimeout/setInterval並記錄(不真的排程), 結束(含拋錯)必還原
 *
 * @param {Function} f 輸入函數, 以f(calls)呼叫, calls為即時更新之紀錄陣列[{ kind, ms, fn }], 供f內即時取得回呼並手動呼叫
 * @returns {Object} 回傳{ r, calls }
 */
function captureTimerCbs(f) {
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
        let r = f(calls)
        return { r, calls }
    }
    finally {
        globalThis.setTimeout = ost
        globalThis.setInterval = osi
    }
}


//withHrtimeMs, 於f(同步)執行期間暫換process.hrtime.bigint為clock.ms毫秒(getTimeHp在Node以其計時), 結束必還原
function withHrtimeMs(f) {
    let clock = { ms: 0 }
    let oh = process.hrtime.bigint
    process.hrtime.bigint = () => BigInt(Math.round(clock.ms * 1e6))
    try {
        return f(clock)
    }
    finally {
        process.hrtime.bigint = oh
    }
}


//TRIAL_HI, 二分搜尋之上界(略大於2147483647, 供驗證高於舊計時上限之interval仍依原值等待; 更大之interval請用probeHpFiresAt)
const TRIAL_HI = 2147483648 + 16


/**
 * 二分搜尋「至少經過多久才觸發」: fires(a)為經過a毫秒是否觸發(須單調: 小a不觸發、大a觸發), 回傳最小之整數a
 *
 * 觸發條件為經過時間 >= ms者(setTimeoutHp、setIntervalHp)回傳ceil(ms)
 * 每次試驗都須建立新實例(觸發會消耗狀態)
 *
 * @param {Function} fires 輸入(a)=>布林, 回傳null代表「未啟動」(回傳'NOSTART')
 * @returns {Number|String} 回傳最小整數a, 上界內仍不觸發回傳Infinity, 未啟動回傳'NOSTART'
 */
function minInt(fires) {
    let first = fires(TRIAL_HI)
    if (first === null) {
        return 'NOSTART'
    }
    if (first === false) {
        return Infinity
    }
    let lo = 0
    let hi = TRIAL_HI //hi必觸發
    if (fires(lo) === true) {
        return lo
    }
    while (hi - lo > 1) {
        let mid = Math.floor((lo + hi) / 2)
        if (fires(mid) === true) {
            hi = mid
        }
        else {
            lo = mid
        }
    }
    return hi
}


//setTimeoutHp、setIntervalHp: interval. 可觀察值為「自建立起至少經過多久(毫秒)才到期」(elapsed >= interval之最小整數, 即ceil(interval), 上限為TRIAL_HI); 無效而不啟動者為'NOSTART'
function probeHpInterval(fn) {
    return (v, o = {}) => {
        let origLog = console.log
        console.log = () => {} //舊版無效值時console.log記錄Error, 探測期間靜音
        try {
            return minInt((a) => {
                let fired = false
                let started = false
                withHrtimeMs((clock) => {
                    captureTimerCbs((calls) => {
                        fn(() => {}, v, {
                            ...o,
                            onTrace: (e) => {
                                if (e.type === 'fire') {
                                    fired = true
                                }
                            },
                        })
                        let c = calls.find((x) => x.kind === 'timeout')
                        if (c) {
                            started = true
                            clock.ms = a
                            c.fn()
                        }
                    })
                })
                return started ? fired : null
            })
        }
        finally {
            console.log = origLog
        }
    }
}


//setTimeoutHp、setIntervalHp: 建立後經過elapsed毫秒(假hrtime)是否已到期(fire); 供驗證任意大之interval(不設上限)是否依原值等待, 不經minInt之上界
function probeHpFiresAt(fn, interval, elapsed) {
    let fired = false
    let started = false
    withHrtimeMs((clock) => {
        captureTimerCbs((calls) => {
            fn(() => {}, interval, {
                onTrace: (e) => {
                    if (e.type === 'fire') {
                        fired = true
                    }
                },
            })
            let c = calls.find((x) => x.kind === 'timeout')
            if (c) {
                started = true
                clock.ms = elapsed
                c.fn()
            }
        })
    })
    return started ? fired : null
}


export {
    fakeTimer,
    captureTimerCbs,
    withHrtimeMs,
    minInt,
    probeHpInterval,
    probeHpFiresAt
}
