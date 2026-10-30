/* eslint-disable no-extend-native */ //thenPatched案刻意改寫Promise.prototype.then(同步段內還原)
//pmMarkHandledRunner.mjs: _pmMarkHandled(以品牌判定原生Promise並標記已處理)與其使用端(pmSeries、pmMap、genDiagFunLog、getDiag)之子行程執行器
//  每個案例於獨立子行程執行(未處理之rejection不污染mocha之worker), 掛unhandledRejection與uncaughtException記錄器
//  跨realm之Promise以vm.runInNewContext產生(其Promise.prototype與本realm不同); 延遲者以本realm之setTimeout傳入新context
//  被測實作預設為本檔往上兩層之src/, 環境變數PMH_SRC可指定他處(修前紅: git archive解出之舊版src)
//  環境變數PMH_NOUTIL=1時於載入被測模組前刪除process.getBuiltinModule(模擬瀏覽器與Node<20.16: 取不到util.types, 全由then之品牌檢查判定)
//  結果以一行'@@R@@'開頭之JSON({ out, unhandled, uncaught })輸出至stdout, 由test/tools/runChildCase.mjs剖析
//用法: node test/tools/pmMarkHandledRunner.mjs <caseName>
import path from 'path'
import vm from 'vm'
import { types } from 'util'
import { pathToFileURL, fileURLToPath } from 'url'

let implDir = process.env.PMH_SRC || fileURLToPath(new URL('../../src/', import.meta.url))
let [caseName] = process.argv.slice(2)
if (process.env.PMH_NOUTIL === '1') {
    process.getBuiltinModule = undefined //被測模組皆於各案內動態載入, 晚於此處
}

async function imp(name) {
    return (await import(pathToFileURL(path.join(implDir, name + '.mjs')).href)).default
}

let unhandled = []
let uncaught = []
process.on('unhandledRejection', (r) => {
    unhandled.push(String(r && r.message))
})
process.on('uncaughtException', (e) => {
    uncaught.push(String(e && e.message))
})

//realm, 新context之程式; ctx供傳入本realm之setTimeout
let realm = (code) => vm.runInNewContext(code, { setTimeout })

//mk, 各種rejected原生Promise: 跨realm、原型為null(本realm)、原型為null之跨realm
let mk = {
    realm: (msg) => realm(`Promise.reject(new Error(${JSON.stringify(msg)}))`),
    nullProto: (msg) => Object.setPrototypeOf(Promise.reject(new Error(msg)), null),
    realmNullProto: (msg) => Object.setPrototypeOf(realm(`Promise.reject(new Error(${JSON.stringify(msg)}))`), null),
}

//later, 稍後resolve之跨realm Promise(使排在後面之rejected者於取用前先reject)
let later = (v, ms) => realm(`new Promise((resolve) => setTimeout(() => resolve(${JSON.stringify(v)}), ${ms}))`)

//settle, 等待p之結果; resolve之陣列中原生Promise(含原型為null者, 其無then而非thenable, 依原值交出)以'[Promise]'表示
let tag = (x) => (types.isPromise(x) ? '[Promise]' : x)
let settle = (p) => p.then((v) => ({ s: 'resolve', v: Array.isArray(v) ? v.map(tag) : v }), (e) => ({ s: 'reject', v: String(e && e.message) }))

//flush, 讓出數次巨任務, 使未處理之rejection之偵測(於微任務檢查點後)完成
let flush = async () => {
    for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setImmediate(resolve))
    }
}

let cases = {

    //direct: 直接標記各種值; 非原生Promise者不讀其屬性、不呼叫其then、不觸發Proxy之陷阱
    direct: async () => {
        let pmMarkHandled = await imp('_pmMarkHandled')
        for (let k of Object.keys(mk)) {
            pmMarkHandled(mk[k](`direct:${k}`))
        }
        let n = 0
        let h = {}
        for (let t of ['get', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'has', 'ownKeys', 'apply']) {
            h[t] = (...args) => {
                n++
                return Reflect[t](...args)
            }
        }
        let thenable = {
            then() {
                n++
            },
        }
        let vals = [new Proxy(Promise.resolve(1), h), new Proxy(() => {}, h), thenable, Object.create(Promise.prototype), {}, null, undefined, 1, 's', Symbol('s')]
        for (let v of vals) {
            pmMarkHandled(v)
        }
        await flush()
        return { n }
    },

    //thenPatched: 載入後Promise.prototype.then被改寫(計數), 標記仍以載入時之內建then執行(不呼叫改寫者), 且標記照常生效
    thenPatched: async () => {
        let pmMarkHandled = await imp('_pmMarkHandled')
        let orig = Promise.prototype.then
        let n = 0
        Promise.prototype.then = function(...args) {
            n++
            return orig.apply(this, args)
        }
        try {
            pmMarkHandled(Promise.reject(new Error('patched:own')))
            pmMarkHandled(mk.nullProto('patched:nullProto'))
        }
        finally {
            Promise.prototype.then = orig
        }
        await flush()
        return { n }
    },

    //series: pmSeries未給fun, 排在後面之跨realm、原型為null之rejected Promise於取用前先reject: 不成為未處理之rejection, pmSeries以其錯誤reject
    series: async () => {
        let pmSeries = await imp('pmSeries')
        let out = {}
        for (let k of Object.keys(mk)) {
            out[k] = await settle(pmSeries([later('a', 30), mk[k](`series:${k}`)]))
        }
        out.objRealm = await settle(pmSeries({ a: later('a', 30), b: mk.realm('series:obj') }))
        await flush()
        return out
    },

    //map: pmMap未給fun且takeLimit為1
    map: async () => {
        let pmMap = await imp('pmMap')
        let out = {}
        for (let k of Object.keys(mk)) {
            out[k] = await settle(pmMap([later('a', 30), mk[k](`map:${k}`)], null, 1))
        }
        await flush()
        return out
    },

    //resolved: 跨realm、原型為null之resolved Promise照常取用其值(標記不改變結果)
    resolved: async () => {
        let pmSeries = await imp('pmSeries')
        let pmMap = await imp('pmMap')
        let np = Object.setPrototypeOf(Promise.resolve('n'), null)
        let s = await settle(pmSeries([later('a', 10), realm('Promise.resolve("b")'), np]))
        let np2 = Object.setPrototypeOf(Promise.resolve('n'), null)
        let m = await settle(pmMap([later('a', 10), realm('Promise.resolve("b")'), np2], null, 1))
        await flush()
        return { s, m }
    },

    //diag: funLog與write回傳之跨realm、原型為null之rejected Promise標記已處理
    diag: async () => {
        let genDiagFunLog = await imp('genDiagFunLog')
        let getDiag = await imp('getDiag')
        for (let k of Object.keys(mk)) {
            genDiagFunLog(() => mk[k](`write:${k}`)).funLog('lb', {})
            getDiag({ funLog: () => mk[k](`funLog:${k}`) }, {})('lb', {})
        }
        await flush()
        return 'ok'
    },

}

let out = null
try {
    out = await cases[caseName]()
}
catch (err) {
    out = { runnerError: String(err && err.stack) }
}
await flush()
process.stdout.write(`@@R@@${JSON.stringify({ out, unhandled, uncaught })}\n`)
process.exit(0)
