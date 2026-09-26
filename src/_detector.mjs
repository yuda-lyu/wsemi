import get from 'lodash-es/get.js'
import isfun from './isfun.mjs'
import evem from './evem.mjs'
import evEmit from './evEmit.mjs'


//本檔為內部使用, 不由index匯出
//偵測器(domIsVisible、domIsStable)之共用骨架: 模式解析、失敗時之回報、event模式之生命週期與派發, 使各偵測器只保留各自之量測邏輯


/**
 * 取偵測模式, 'event'以外皆為'promise'
 *
 * @param {Object} opt 輸入設定物件
 * @returns {String} 回傳'promise'或'event'
 */
function getMode(opt) {
    return get(opt, 'mode', '') === 'event' ? 'event' : 'promise'
}


/**
 * 建立event模式之偵測器, 回傳EventEmitter並掛create與dispose
 *
 * create於microtask啟動: 晚於本次同步流程(例如Vue 2指令於bind時create, 元素於其後才插入), 早於任何計時器; create後同步才掛之監聽亦收得到首次事件
 * start(emit, addCleanup)於啟動時呼叫一次: 每建立一項資源(觀察器、計時器等)即以addCleanup登記其釋放函數, 使建立途中拋錯時已建立者仍可釋放
 * emit(name, value)經evEmit派發: 監聽器拋錯時有error監聽者則emit('error'), 否則console.error, 不中斷偵測亦不被吞掉; 已釋放後之emit不發出
 * start為null代表無法偵測(元素無效或環境不支援), 此時create與dispose皆可呼叫但永不觸發, error為原因
 * 生命週期: 未開始 → 已create待啟動 → 偵測中 → 已釋放; create只於未開始時有效(重複呼叫不重複偵測), dispose後create無效, create後同一輪dispose則永不啟動; dispose可重複呼叫且回傳true
 * start拋錯時視同無法偵測: error為所拋之值, 已登記之資源立即釋放, 轉為已釋放
 * 釋放依登記之相反順序逐一呼叫, 單一釋放函數拋錯不影響其他; 已釋放後才登記者立即釋放
 *
 * @param {Function|null} start 輸入開始偵測之函數
 * @param {Object} [opt={}] 輸入設定物件
 * @param {*} [opt.error=null] 輸入無法偵測之原因
 * @param {String} [opt.tag='detector'] 輸入監聽器拋錯時console.error之標記
 * @returns {Object} 回傳EventEmitter, 另有create、dispose函數與error屬性(可偵測時為null)
 */
function detectorEvent(start, opt = {}) {
    let tag = get(opt, 'tag', 'detector')

    //ev
    let ev = evem()
    ev.error = get(opt, 'error', null)

    //state, cleanups
    let state = 'idle'
    let cleanups = []

    //release, 依登記之相反順序釋放
    let release = () => {
        let cs = cleanups
        cleanups = []
        for (let i = cs.length - 1; i >= 0; i--) {
            try {
                cs[i]()
            }
            catch (err) {}
        }
    }

    //addCleanup
    let addCleanup = (fn) => {
        if (!isfun(fn)) {
            return
        }
        if (state === 'disposed') {
            try {
                fn()
            }
            catch (err) {}
            return
        }
        cleanups.push(fn)
    }

    //emit
    let emit = (name, v) => {
        if (state === 'running') {
            evEmit(ev, name, [v], { tag })
        }
    }

    //create
    ev.create = () => {
        if (state !== 'idle') {
            return
        }
        state = 'pending'
        if (!isfun(start)) {
            return
        }
        Promise.resolve().then(() => {
            if (state !== 'pending') {
                return //啟動前已dispose
            }
            state = 'running'
            try {
                start(emit, addCleanup)
            }
            catch (err) {
                ev.error = err
                state = 'disposed'
                release()
            }
        })
    }

    //dispose
    ev.dispose = () => {
        state = 'disposed'
        release()
        return true
    }

    return ev
}


/**
 * 無法偵測時之回報: promise模式回傳被拒絕之Promise, event模式回傳永不觸發之偵測器(error為原因)
 *
 * @param {String} mode 輸入模式
 * @param {*} reason 輸入原因
 * @returns {Promise|Object} 回傳Promise或偵測器
 */
function detectorFail(mode, reason) {
    if (mode === 'event') {
        return detectorEvent(null, { error: reason })
    }
    return Promise.reject(reason)
}


let detector = {
    getMode,
    detectorEvent,
    detectorFail,
}


export default detector
