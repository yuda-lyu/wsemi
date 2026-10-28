//fsWatchKit.mjs: fs監看類函數(fsWatchFolder、fsWatchFile、fsEvem)之測試工具, 規則見sgud/rule/rulebook.md之R-TRACE-01
//  真實檔案監看(chokidar, awaitWriteFinish穩定期約2.1秒)之事件來源是作業系統與chokidar而非被測函數之計時器, 不能用假時鐘, 測試以「做一個檔案操作→等被測函數回報已處理該操作之事件→才做下一個」步進
//  withFakeChokidar: 暫以假watcher取代chokidar.watch, 供語意案決定性地送出ready、all、error事件(不經作業系統與穩定期)
//  fiveOnTrace: P3/P4案用之五種回調(未傳、紀錄器、回調拋錯、回調回傳rejection之Promise、非函數)
//  waitUntil: 以真實計時器輪詢條件, 逾時拋錯, 只供沒有事件可等之條件(如假watcher被建立), 不用來表達規格之時間要求
import { EventEmitter } from 'events'
import chokidar from 'chokidar'


//真實計時器於模組載入時保存, 假時鐘(useFakeClock)不影響
const realSetTimeout = setTimeout


/**
 * 以真實計時器等待ms毫秒, 僅供否定斷言(停止後不得再有事件)之短暫觀察窗, 不可用於肯定斷言
 *
 * @param {Number} ms 輸入毫秒數
 * @returns {Promise} 回傳Promise
 */
function sleep(ms) {
    return new Promise((resolve) => realSetTimeout(resolve, ms))
}


/**
 * 以真實計時器每5毫秒輪詢條件至成立, 逾guard毫秒拋錯, 回傳條件成立時之值
 *
 * @param {Function} fun 輸入條件函數, 回傳真值代表成立
 * @param {Number} [guard=20000] 輸入防懸置上限毫秒數
 * @returns {Promise} 回傳Promise
 */
async function waitUntil(fun, guard = 20000) {
    let t0 = Date.now()
    while (true) {
        let v = fun()
        if (v) {
            return v
        }
        if (Date.now() - t0 > guard) {
            throw new Error(`waitUntil: condition not met within ${guard}ms`)
        }
        await sleep(5)
    }
}


/**
 * 建立假watcher(原生EventEmitter), 記錄unwatch與close之呼叫, close回傳已resolve之Promise
 *
 * @returns {Object} 回傳假watcher, 含unwatched陣列、closeCount數字與args(chokidar.watch之引數)
 */
function fakeWatcher() {
    let w = new EventEmitter()
    w.unwatched = []
    w.closeCount = 0
    w.args = null
    w.unwatch = (p) => {
        w.unwatched.push(p)
    }
    w.close = () => {
        w.closeCount++
        return Promise.resolve()
    }
    return w
}


/**
 * 執行fun期間以假watcher取代chokidar.watch(被測模組呼叫的是同一個chokidar預設匯出物件之watch屬性), 結束後(含拋錯)還原
 *
 * @param {Function} fun 輸入async函數, 傳入(ws), ws為依建立順序累積之假watcher陣列
 * @returns {Promise} 回傳fun之結果
 */
async function withFakeChokidar(fun) {
    let orig = chokidar.watch
    let ws = []
    chokidar.watch = (p, o) => {
        let w = fakeWatcher()
        w.args = [p, o]
        ws.push(w)
        return w
    }
    try {
        return await fun(ws)
    }
    finally {
        chokidar.watch = orig
    }
}


/**
 * 取得五種回調: 未傳(undefined)、紀錄器(rec.on)、回調拋錯、回調回傳rejection之Promise、非函數('abc'), 供P3/P4案確認結果完全相同
 *
 * @param {Function} on 輸入紀錄器之回調(traceRec().on)
 * @returns {Array} 回傳[{ name, onTrace }]
 */
function fiveOnTrace(on) {
    return [
        { name: 'undefined', onTrace: undefined },
        { name: 'recorder', onTrace: on },
        {
            name: 'throwing',
            onTrace: () => {
                throw new Error('trace boom')
            },
        },
        { name: 'rejecting', onTrace: () => Promise.reject(new Error('trace reject')) },
        { name: 'non-function', onTrace: 'abc' },
    ]
}


/**
 * 收集執行fun期間之unhandledRejection, 回傳{ result, un }
 *
 * @param {Function} fun 輸入async函數
 * @returns {Promise} 回傳Promise, resolve { result, un }, un為unhandledRejection之字串陣列
 */
async function collectUnhandled(fun) {
    let un = []
    let onUn = (v) => un.push(String(v))
    process.on('unhandledRejection', onUn)
    try {
        let result = await fun()
        await sleep(0) //讓出一次, 使已排定之rejection處理完畢
        return { result, un }
    }
    finally {
        process.removeListener('unhandledRejection', onUn)
    }
}


export {
    sleep,
    waitUntil,
    fakeWatcher,
    withFakeChokidar,
    fiveOnTrace,
    collectUnhandled
}
