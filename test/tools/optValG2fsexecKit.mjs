//optValG2fsexecKit.mjs: 第221項第二批g2fsexec組(fs監看/任務/刪除、exec系)之opt類數值參數測試共用輔助
//  stubTimers: 於f(同步)期間暫換setTimeout/setInterval並記錄(kind、ms、fn), 不真的排程, 結束(含拋錯)必還原; fn可由測試手動呼叫以決定性地觸發計時器回呼
//    與optValKit.captureTimers之差別: 另記錄回呼fn, 且f收到calls陣列(f執行中即可讀取已記錄者)
//  withFakeChokidarSync: 於f(同步)期間以假watcher取代chokidar.watch(被測模組呼叫的是同一個chokidar預設匯出物件之watch屬性), 記錄所給之引數, 結束必還原
import { EventEmitter } from 'events'
import chokidar from 'chokidar'


//假計時器物件(被測模組可能呼叫unref、clearTimeout)
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
 * 於同步函數f執行期間暫換setTimeout/setInterval並記錄, 不真的排程
 *
 * @param {Function} f 輸入函數, 傳入(calls), calls為已記錄之陣列, 每項為{ kind: 'timeout'|'interval', ms, fn }
 * @returns {Object} 回傳{ r: f之回傳, calls }
 */
function stubTimers(f) {
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


/**
 * 於同步函數f執行期間以假watcher取代chokidar.watch
 *
 * @param {Function} f 輸入函數, 傳入(ws), ws為依建立順序累積之{ p, opts, w }陣列(p、opts為chokidar.watch所給之引數, w為假watcher)
 * @returns {*} 回傳f之回傳
 */
function withFakeChokidarSync(f) {
    let orig = chokidar.watch
    let ws = []
    chokidar.watch = (p, opts) => {
        let w = new EventEmitter()
        w.unwatch = () => {}
        w.close = () => Promise.resolve()
        ws.push({ p, opts, w })
        return w
    }
    try {
        return f(ws)
    }
    finally {
        chokidar.watch = orig
    }
}


export { fakeTimer, stubTimers, withFakeChokidarSync }
