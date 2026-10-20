//ormStrRefModel.mjs: 契約案例表(src/_cvOrmStrCases.mjs)之[參考後端]與逐案執行器(測試用)
//
//用途: 以記憶體實作各公開API之語意(insert/insertBulk/save/del/selectByPk/Gfs/建構), 檢核一律經wsemi之chkOrmStr與chkOrmData,
//使案例表之期望(完整訊息、逐筆處置形狀、呼叫後集合)可被一個與規格同形之實作逐案驗證; 各w-orm-*後端之測試以同一執行器形狀對其真實API執行(見案例表檔頭[後端套用方式]).
//參考後端僅依規格(dspec〈一之三〉9.)撰寫, 不看案例表之expect, 避免循環論證; 複製採lodash-es之cloneDeep(同各w-orm-*後端: 保留原型、存取器取值後成資料屬性、Map/Set/Error/RegExp/String包裝照常).
import { isDeepStrictEqual } from 'util'
import cloneDeep from 'lodash-es/cloneDeep.js'
import chkOrmStr from '../../src/chkOrmStr.mjs'
import chkOrmData from '../../src/chkOrmData.mjs'


let NUL = String.fromCharCode(0)

//依規格之處置(可被變異: wsemi測試拿掉各接線點須轉紅)
//  opt: { checkId, checkData, checkOpt, idNul, dataNul, mangle, leakOnFail, onFail }, 檢核預設全開(變異時關閉其一; leakOnFail為true時整批reject前已寫入, onFail(store)於失敗時被呼叫以模擬失敗呼叫改動既有列; dataNul為true時資料值與鍵名亦檢NUL, 為錯誤的接線); mangle為true時模擬UTF-8/C字串型儲存:
//  主鍵存取前孤立代理碼元改為U+FFFD、NUL之後截斷(用於證明案例表能抓出[未拒絕而被改寫]之實作)
let createRefModel = (baseOpt, ctorOpt = {}) => {
    let cfg = { checkId: true, checkData: true, checkOpt: true, idNul: true, mangle: false, ...ctorOpt }
    let optErr = (name, v) => {
        let r = chkOrmStr(v, { nul: true })
        return r === null ? null : `invalid opt.${name}: ${r}`
    }
    if (cfg.checkOpt) {
        for (let name of ['url', 'db', 'cl']) {
            if (typeof baseOpt[name] === 'string') {
                let e = optErr(name, baseOpt[name])
                if (e) {
                    throw new Error(e)
                }
            }
        }
    }

    let rows = new Map() //一般集合: id -> 文件
    let files = new Map() //GridFS: id -> 文件(與一般集合分開儲存, 如mongodb之<cl>.files)
    let key = (id) => {
        if (!cfg.mangle || typeof id !== 'string') {
            return id
        }
        let s = id.toWellFormed()
        let cut = s.indexOf(NUL)
        return cut === -1 ? s : s.slice(0, cut)
    }
    let clone = (v) => cloneDeep(v)

    //checkDoc, 單一文件之檢核(主鍵先於資料); 回傳null或完整訊息
    let checkDoc = (d, k) => {
        if (cfg.checkId) {
            let r = chkOrmStr(d.id, { nul: cfg.idNul })
            if (r !== null) {
                return `invalid id: ${r} at [data[${k}].id]`
            }
        }
        if (cfg.checkData) {
            let r = chkOrmData(d, { root: `data[${k}]`, nul: cfg.dataNul === true })
            if (r !== null) {
                return `invalid data: ${r.reason} at [${r.path}]`
            }
        }
        return null
    }
    let arr = (data) => (Array.isArray(data) ? data : [data])

    //以store(Map)為對象之操作組: 一般集合與GridFS共用規格, 但儲存分開
    let ops = (store, needU8a) => {
        let o = {}
        o.selectByPk = async (pk) => {
            if (cfg.checkId && chkOrmStr(pk, { nul: cfg.idNul }) !== null) {
                return null
            }
            return store.has(key(pk)) ? clone(store.get(key(pk))) : null
        }
        o.insert = async (data) => {
            let docs = arr(data).map(clone) //先複製再檢核, 其後只用複本
            for (let k = 0; k < docs.length; k++) {
                let e = checkDoc(docs[k], k)
                if (e) {
                    if (cfg.leakOnFail) {
                        //變異: 先寫入再拋錯(整批reject卻已寫入)
                        for (let d of docs) {
                            store.set(key(d.id), { ...d, id: key(d.id) })
                        }
                    }
                    if (cfg.onFail) {
                        cfg.onFail(store)
                    }
                    throw new Error(e)
                }
                if (needU8a && !(docs[k].u8a instanceof Uint8Array)) {
                    throw new Error(`invalid data[${k}].u8a`) //模擬mongodb insertGfs之前置條件, 於主鍵與資料檢核之後才驗
                }
            }
            for (let d of docs) {
                store.set(key(d.id), { ...d, id: key(d.id) })
            }
            return { n: docs.length, nInserted: docs.length, ok: 1 }
        }
        o.save = async (data) => {
            let docs = arr(data).map(clone)
            return docs.map((d, k) => {
                let e = checkDoc(d, k)
                if (e) {
                    if (cfg.onFail) {
                        cfg.onFail(store)
                    }
                    return { n: 0, nInserted: 0, nModified: 0, ok: 0, err: e }
                }
                store.set(key(d.id), { ...(store.get(key(d.id)) || {}), ...d, id: key(d.id) })
                return { n: 1, nInserted: 1, nModified: 0, ok: 1 }
            })
        }
        o.del = async (data) => {
            let docs = arr(data).map(clone)
            return docs.map((d, k) => {
                let e = checkDoc(d, k)
                if (e) {
                    if (cfg.onFail) {
                        cfg.onFail(store)
                    }
                    return { n: 0, nDeleted: 0, ok: 0, err: e }
                }
                let had = store.delete(key(d.id))
                return { n: had ? 1 : 0, nDeleted: had ? 1 : 0, ok: 1 }
            })
        }
        return o
    }
    let g = ops(rows, false)
    let f = ops(files, true)

    let wo = {}
    wo.select = async () => [...rows.values()].map(clone)
    wo.selectByPk = g.selectByPk
    wo.insert = g.insert
    wo.insertBulk = g.insert
    wo.save = g.save
    wo.del = g.del
    wo.insertGfs = f.insert
    wo.selectByPkGfs = f.selectByPk
    wo.delGfs = f.del
    wo.listGfs = async () => [...files.keys()]
    return wo
}


//msgOf, 錯誤值之訊息(Error取message, 其餘轉字串)
let msgOf = (e) => (e instanceof Error ? e.message : String(e))

//partial, 預期之部分文件須為取回文件之子集(鍵存在且深度相等)
let partialDiff = (actual, part, p = 'doc') => {
    if (part === null || typeof part !== 'object') {
        return Object.is(actual, part) ? null : `${p}: ${String(actual)} !== ${String(part)}`
    }
    if (actual === null || typeof actual !== 'object') {
        return `${p}: not an object`
    }
    if (Array.isArray(part)) {
        if (!Array.isArray(actual) || actual.length !== part.length) {
            return `${p}: array length`
        }
    }
    for (let k of Object.keys(part)) {
        if (!Object.prototype.hasOwnProperty.call(actual, k)) {
            return `${p}.${Array.isArray(part) ? k : '<key>'}: missing`
        }
        let d = partialDiff(actual[k], part[k], `${p}.${Array.isArray(part) ? k : '<key>'}`)
        if (d) {
            return d
        }
    }
    return null
}

//runApiCase, 對任一後端(須提供create、insertBulk、select、selectByPk及案例所用之API; GridFS案另需insertGfs、selectByPkGfs、listGfs)逐案執行並回傳問題清單([]為通過);
//  create(): 回傳全新(空)之後端; ctor(opt): 建構函數(僅api='new'案使用); mk(id, extra): 文件工廠(need含'gfs'之案改用mkGfs); base: 合法建構設定
let runApiCase = async (c, { create, ctor, mk: mk0, mkGfs, base }) => {
    let probs = []
    let e = c.expect
    let isGfs = c.need.includes('gfs') //GridFS案(group為gfs, 或single組之insertGfs/delGfs)
    let mk = isGfs && mkGfs ? mkGfs : mk0
    let n0 = (a0) => (Array.isArray(a0) ? a0.length : 1)
    if (c.api === 'new') {
        let err
        try {
            ctor(...c.args(mk, base))
        }
        catch (x) {
            err = x
        }
        if (e.kind === 'throw') {
            if (!err) {
                probs.push('must throw')
            }
            else if (msgOf(err) !== e.msg) {
                probs.push(`msg: ${msgOf(err)}`)
            }
        }
        else if (err) {
            probs.push(`must not throw: ${msgOf(err)}`)
        }
        return probs
    }
    let wo = create()
    let pre = c.pre(mk)
    if (pre.length > 0) {
        await (isGfs ? wo.insertGfs : wo.insertBulk)(pre)
    }
    //呼叫前之快照(unchanged: 失敗之呼叫不得改動既有列)
    let before = {}
    for (let id of (e.unchanged || [])) {
        before[id] = await (isGfs ? wo.selectByPkGfs : wo.selectByPk)(id)
    }
    let args = c.args(mk, base)
    let r
    let rej
    try {
        let p = wo[c.api](...args)
        if (c.afterCall) {
            c.afterCall(args) //呼叫後、await之前同步改動原輸入
        }
        r = await p
    }
    catch (x) {
        rej = x
    }
    if (e.kind === 'free') {
        //值與鍵名含NUL: 接受或因自身限制拒收皆可, 但拒收之訊息不得為共用檢核之詞彙
        let re = new RegExp(e.notMsg)
        if (rej && re.test(msgOf(rej))) {
            probs.push(`rejected with the shared vocabulary: ${msgOf(rej)}`)
        }
        if (!rej && Array.isArray(r)) {
            for (let i = 0; i < r.length; i++) {
                if (r[i].ok !== 1 && re.test(String(r[i].err))) {
                    probs.push(`item ${i} rejected with the shared vocabulary: ${r[i].err}`)
                }
            }
        }
    }
    else if (e.kind === 'rejectAll') {
        if (!rej) {
            probs.push('must reject')
        }
        else if (msgOf(rej) !== e.msg) {
            probs.push(`msg: ${msgOf(rej)}`)
        }
    }
    else if (rej) {
        probs.push(`must not reject: ${msgOf(rej)}`)
    }
    else {
        if (e.kind === 'null' && r !== null) {
            probs.push('must be null')
        }
        if (e.kind === 'itemErr') {
            let n = n0(args[0])
            if (!Array.isArray(r) || r.length !== n) {
                probs.push('result must align with input')
            }
            else {
                for (let i = 0; i < n; i++) {
                    if (e.bad.includes(i)) {
                        let want = e.msgs ? e.msgs[e.bad.indexOf(i)] : e.msg
                        if (r[i].ok !== 0 || r[i].err !== want) {
                            probs.push(`item ${i}: ${JSON.stringify([r[i].ok, r[i].err])}`)
                        }
                    }
                    else if (r[i].ok !== 1) {
                        probs.push(`item ${i} must be ok`)
                    }
                }
            }
        }
        if (e.kind === 'ok') {
            if (/^insert/.test(c.api) && !(r && r.ok === 1)) {
                probs.push(`insert result must be ok:1, got ${JSON.stringify(r)}`)
            }
            if (e.result) {
                let d = partialDiff(r, e.result)
                if (d) {
                    probs.push(`result: ${d}`)
                }
            }
        }
    }
    if (e.ids) {
        let ids = (await wo.select()).map((v) => v.id).sort()
        if (JSON.stringify(ids) !== JSON.stringify(e.ids)) {
            probs.push(`ids: ${JSON.stringify(ids)} !== ${JSON.stringify(e.ids)}`)
        }
    }
    if (e.gfsIds) {
        let ids = (await wo.listGfs()).sort()
        if (JSON.stringify(ids) !== JSON.stringify(e.gfsIds)) {
            probs.push(`gfsIds: ${JSON.stringify(ids)} !== ${JSON.stringify(e.gfsIds)}`)
        }
    }
    for (let [id, part] of Object.entries(e.rows || {})) {
        let d = partialDiff(await wo.selectByPk(id), part)
        if (d) {
            probs.push(`row ${JSON.stringify(id)}: ${d}`)
        }
    }
    for (let id of (e.unchanged || [])) {
        let after = await (isGfs ? wo.selectByPkGfs : wo.selectByPk)(id)
        if (!isDeepStrictEqual(after, before[id])) {
            probs.push(`row ${JSON.stringify(id)} changed: ${JSON.stringify(before[id])} -> ${JSON.stringify(after)}`)
        }
    }
    return probs
}


export { createRefModel, runApiCase, msgOf, partialDiff }
