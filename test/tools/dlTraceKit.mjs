//dlTraceKit.mjs: fsDownloadFileVerify(Core)之觀察回調(opt.onTrace)測試共用, 規則見sgud/rule/rulebook_timer.md之R-TRACE-01
//  mkRec: 以timeKit之traceRec為底, 另記每事件通知當下之Date.now()(假時鐘下為虛擬時刻), 供斷言「計時器重設後恰隔stallMs才觸發」等時間本身即規格者
//  advanceUntil: 假時鐘下逐步推進直到條件成立(或到上限), 回傳實際推進毫秒數與條件是否成立; 事件來自真實I/O(本機HTTP、檔案)時, 由條件(事件已收到)決定何時停止, 不假設I/O耗時
//  fiveOnTrace: P3/P4之五種回調(未傳、紀錄器、拋錯、回傳rejection、非函數)
//  guard: 以模組載入時保存之真實計時器為等待加防懸置上限(假時鐘會取代globalThis.setTimeout, 規格P5③)
import { traceRec } from './timeKit.mjs'


const realSetTimeout = setTimeout
const realClearTimeout = clearTimeout


//mkRec, 觀察回調紀錄器: on傳給opt.onTrace; events為已收到之事件; at為各事件通知當下之Date.now(); find(type, pred)回傳{ e, at, i }或null; all(type, pred)回傳全部
function mkRec(opt = {}) {
    let tr = traceRec(opt)
    let at = []
    let on = (e) => {
        at.push(Date.now())
        tr.on(e)
    }
    let pick = (type, pred) => {
        let rs = []
        tr.events.forEach((e, i) => {
            if (e.type === type && (!pred || pred(e))) {
                rs.push({ e, at: at[i], i })
            }
        })
        return rs
    }
    let find = (type, pred) => {
        return pick(type, pred)[0] || null
    }
    let has = (type, pred) => {
        return find(type, pred) !== null
    }
    return { on, events: tr.events, at, wait: tr.wait, mark: tr.mark, types: tr.types, all: pick, find, has }
}


//advanceUntil, 假時鐘下每次推進step毫秒, 直到pred()為真或累計推進達max毫秒; 回傳{ ok, ms }
async function advanceUntil(clock, pred, max, step = 1) {
    let ms = 0
    while (!pred() && ms < max) {
        await clock.advance(step)
        ms += step
    }
    return { ok: pred(), ms }
}


//fiveOnTrace, P3/P4之五種回調: 未傳(undefined)、紀錄器on、同步拋錯、回傳rejection之Promise、非函數
function fiveOnTrace(on) {
    return [undefined, on, () => {
        throw new Error('trace boom')
    }, () => Promise.reject(new Error('trace reject')), 'abc']
}


//guard, 等待pm, 超過ms毫秒(真實計時器)仍未落定即reject(只防懸置, 不表達規格)
function guard(pm, label = 'guard', ms = 20000) {
    return new Promise((resolve, reject) => {
        let t = realSetTimeout(() => {
            reject(new Error(`${label}: not settled within ${ms}ms`))
        }, ms)
        pm.then((v) => {
            realClearTimeout(t)
            resolve(v)
        }, (err) => {
            realClearTimeout(t)
            reject(err)
        })
    })
}


export { mkRec, advanceUntil, fiveOnTrace, guard, realSetTimeout, realClearTimeout }
