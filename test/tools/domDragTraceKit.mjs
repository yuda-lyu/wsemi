//domDragTraceKit.mjs: domDrag、domDragPreview之觀察回調(opt.onTrace)測試共用, 規則見sgud/rule/rulebook_timer.md之R-TRACE-01
//  mkRec: 以timeKit之traceRec為底, 另記每事件通知當下之(假時鐘)時刻與測試給定之狀態快照(snap), 供斷言「通知當下狀態已一致」
//  fiveOnTrace: P3/P4之五種回調(未傳、紀錄器、拋錯、回傳rejection、非函數)
//  watchUnhandled: 收集unhandledRejection
//  mkMeta: 檢查事件為凍結物件且回調不帶接收者之回調
//  flush: 以真實setImmediate讓出, 使已可進行之microtask全數執行(假時鐘不控制setImmediate)
import { traceRec } from './timeKit.mjs'


//fmt, 事件轉為簡式字串: type加冒號與各欄位值(依欄位出現順序, 以/隔開), 無其他欄位者僅type
//  例: start:0/false、timer:set/120、preview:create、end:drop/0、unbind:true、tick:true、remove:clear
function fmt(e) {
    let { type, ...rest } = e
    let vs = Object.values(rest)
    return vs.length > 0 ? `${type}:${vs.join('/')}` : type
}


//mkRec, 觀察回調紀錄器: on傳給opt.onTrace; snap為選用函數(e)=>任意值, 於每個事件通知當下呼叫並存入snaps
function mkRec(snap = null) {
    let tr = traceRec()
    let at = []
    let snaps = []
    let on = (e) => {
        at.push(Date.now())
        snaps.push(snap ? snap(e) : null)
        tr.on(e)
    }
    return {
        on,
        events: tr.events,
        wait: tr.wait,
        mark: tr.mark,
        at,
        snaps,
        lines: (from = 0) => tr.events.slice(from).map(fmt),
        timed: (from = 0) => tr.events.slice(from).map((e, i) => `${fmt(e)}@${at[from + i]}`),
    }
}


//fiveOnTrace, P3/P4之五種回調: 未傳(undefined)、紀錄器on、同步拋錯、回傳rejection之Promise、非函數
function fiveOnTrace(on) {
    return [undefined, on, () => {
        throw new Error('trace boom')
    }, () => Promise.reject(new Error('trace reject')), 'abc']
}


//watchUnhandled, 收集unhandledRejection: 回傳{ list, stop }
function watchUnhandled() {
    let list = []
    let on = (v) => list.push(String(v))
    process.on('unhandledRejection', on)
    return { list, stop: () => process.removeListener('unhandledRejection', on) }
}


//mkMeta, 回調記錄「接收者與事件是否凍結」: on須以function宣告(接收者才為undefined), 並把事件轉給rec.on
function mkMeta(rec) {
    let meta = []
    let on = function(e) {
        meta.push([this, Object.isFrozen(e)])
        rec.on(e)
    }
    return { on, meta }
}


//flush, 以真實setImmediate讓出
function flush() {
    return new Promise((resolve) => setImmediate(resolve))
}


//keysByType, 各type之欄位名(排序後以逗號串接), 同type不同事件之欄位須相同否則回傳以|串接之多種
function keysByType(events) {
    let m = {}
    for (let e of events) {
        let k = Object.keys(e).sort().join(',')
        m[e.type] = m[e.type] || new Set()
        m[e.type].add(k)
    }
    let out = {}
    for (let [t, s] of Object.entries(m)) {
        out[t] = Array.from(s).join('|')
    }
    return out
}


//allPrimitive, 事件之欄位皆為原始值(數字、字串、布林或null)
function allPrimitive(events) {
    return events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v)))
}


export { fmt, mkRec, fiveOnTrace, watchUnhandled, mkMeta, flush, keysByType, allPrimitive }
