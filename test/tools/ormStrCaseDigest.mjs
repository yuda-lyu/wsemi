//ormStrCaseDigest.mjs: 契約案例表(src/_cvOrmStrCases.mjs)案例之摘要(測試用)
//
//用途: 已發布之w-orm-*後端以deep import逐案執行案例表, 故表中[既有案例]須逐案不變(只增不改): 摘要涵蓋每案之靜態欄位(id、group、label、api、pos、form、str、variant、need、expect等)、
//  pre/args/make之產出(以固定工廠mk/mkGfs呼叫), 以及toctou組之動態行為: 帶讀取計數之存取器(連讀三次之結果)、掛在原型上之存取器(以探針物件為this呼叫後之探針狀態)、
//  afterCall之原始碼與其對全新args作用後之狀態、listen之事件名/minCalls/fn原始碼. 有意改動既有案例時須重算摘要並說明(測試中之常數).
import { createHash } from 'crypto'


let mk = (id, extra) => ({ id, name: 'n', ...extra })
let mkGfs = (id, extra) => ({ ...mk(id, extra), u8a: new Uint8Array(2) })
let base = { url: 'x://y/', db: 'd', cl: 'c' }

//ser, 可比較之序列化(Map/Set/Date/Error/RegExp/String包裝/Uint8Array/函數/Symbol/undefined皆轉為標記形)
let ser = (v) => JSON.stringify(v, function(k, x) {
    let raw = this[k]
    if (raw instanceof Map) {
        return { $map: [...raw] }
    }
    if (raw instanceof Set) {
        return { $set: [...raw] }
    }
    if (raw instanceof Date) {
        return { $date: raw.getTime() }
    }
    if (raw instanceof Error) {
        return { $err: [raw.name, raw.message] }
    }
    if (raw instanceof RegExp) {
        return { $re: raw.source }
    }
    if (raw instanceof String) { // eslint-disable-line no-new-wrappers
        return { $str: String(raw), extra: Object.keys(raw).filter((q) => !/^\d+$/.test(q)) }
    }
    if (raw instanceof Uint8Array) {
        return { $u8: [...raw] }
    }
    if (typeof raw === 'function') {
        return '$fn'
    }
    if (typeof raw === 'symbol') {
        return String(raw)
    }
    if (x === undefined) {
        return '$undef'
    }
    return x
})

let FN_KEYS = new Set(['pre', 'args', 'make', 'afterCall', 'find', 'listen'])

//probeDoc, 文件上存取器之行為: 自有存取器連讀三次(含讀取計數: 第一次與其後), 原型上之存取器以探針物件為this呼叫後之探針狀態
let probeDoc = (d) => {
    let out = []
    if (d === null || typeof d !== 'object') {
        return out
    }
    for (let k of Reflect.ownKeys(d)) {
        let ds = Object.getOwnPropertyDescriptor(d, k)
        if (ds && ds.get) {
            out.push([String(k), 'own', ds.get.call(d), ds.get.call(d), ds.get.call(d)])
        }
    }
    let p = Object.getPrototypeOf(d)
    if (p !== null && p !== Object.prototype) {
        for (let k of Reflect.ownKeys(p)) {
            let ds = Object.getOwnPropertyDescriptor(p, k)
            if (ds && ds.get) {
                let sandbox = { id: 'z', name: 'n', meta: { s: 'x' } }
                let r = ds.get.call(sandbox)
                out.push([String(k), 'proto', ds.enumerable, r, sandbox])
            }
        }
    }
    return out
}
let probeArgs = (a) => a.map((v) => (Array.isArray(v) ? v.map(probeDoc) : probeDoc(v)))

//digestCases, cases陣列(扣除skipIds)之sha256十六進位摘要; 依各案在陣列中之相對順序
let digestCases = (cases, skipIds = []) => {
    let skip = new Set(skipIds)
    let h = createHash('sha256')
    for (let c of cases) {
        if (skip.has(c.id)) {
            continue
        }
        let st = {}
        for (let k of Object.keys(c)) {
            if (!FN_KEYS.has(k)) {
                st[k] = c[k]
            }
        }
        h.update(ser(st))
        h.update('\n')
        if (c.group === 'data') {
            h.update(ser(c.make()))
        }
        else if (c.group !== 'str') {
            let f = (c.need || []).includes('gfs') ? mkGfs : mk
            //探針與序列化各用全新之args(讀取計數存取器每次呼叫args重新計數)
            h.update(ser(probeArgs(c.args(f, base))))
            h.update(ser({ pre: c.pre(f), args: c.args(f, base) }))
            if (c.afterCall) {
                let a = c.args(f, base)
                h.update(String(c.afterCall))
                c.afterCall(a)
                h.update(ser(a))
            }
            if (c.listen) {
                h.update(ser([c.listen.event, c.listen.minCalls, String(c.listen.fn)]))
            }
        }
        h.update('\n')
    }
    return h.digest('hex')
}


export { digestCases, ser }
export default digestCases
