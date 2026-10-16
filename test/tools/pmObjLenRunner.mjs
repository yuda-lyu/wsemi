//pmObjLenRunner.mjs: pmMap、pmSeries、pmChain 之輸入容器(R-OBJ-ITER-01 缺陷候選2、R-PM-SETTLE-01 規則17)之子行程執行器
//  約定同runChildCase: node [--expose-gc] [--max-old-space-size=N] pmObjLenRunner.mjs <caseName> [exitMode]
//  結果以一行'@@R@@'開頭之JSON({ out, unhandled, uncaught })輸出至stdout; 掛unhandledRejection與uncaughtException記錄器
//  caseName:
//    '<fn>:<kind>:<數字>': 極大length案例, fn為map或series, 以同步簡單函數(v, k) => k + '=' + v 處理, 先暖機呼叫一次、gc, 再量耗時與heapUsed增量
//      kind: 'len'(物件{length,a}); 'tag'(以Symbol.toStringTag偽稱Array之物件{length,a}: isarr為真而非真陣列, 不得依length迭代); 'keys'(length極大且另有100個自有鍵)
//      修前之實作對物件依length次迭代並逐一建立元素, 限額下耗盡記憶體(離開碼134)
//    'seriesGetter'、'chainGetter': 元素(陣列)或值(物件)之讀取即拋錯, 以該錯誤reject, 不同步拋出, fun(或函數鏈首項)一次都不被呼叫, 無未處理之rejection
//    'revokedContainer'、'tagGetterContainer': 容器本身為已撤銷之Proxy、或Symbol.toStringTag讀取即拋錯, 三個函數皆以該錯誤reject(pmChain之後者為not an array字串)
import { safeStr, revoked } from './caseKit.mjs'
import pmMap from '../../src/pmMap.mjs'
import pmSeries from '../../src/pmSeries.mjs'
import pmChain from '../../src/pmChain.mjs'


let caseName = process.argv[2] || ''

let unhandled = []
let uncaught = []
process.on('unhandledRejection', (r) => {
    unhandled.push(safeStr(r))
})
process.on('uncaughtException', (e) => {
    uncaught.push(safeStr(e))
})

//settle, 等待p之結果, 逾時回'pending'
function settle(p, ms = 800) {
    return new Promise((resolve) => {
        let t = setTimeout(() => resolve({ s: 'pending' }), ms)
        p.then((v) => {
            clearTimeout(t)
            resolve({ s: 'resolve', v })
        }, (e) => {
            clearTimeout(t)
            resolve({ s: 'reject', v: e })
        })
    })
}

//call, 同步呼叫並記錄是否同步拋出
function call(fn) {
    try {
        return { ok: true, p: fn() }
    }
    catch (e) {
        return { ok: false, e }
    }
}

//delay
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

//lenCase, 極大length案例, 量測只含待測函數之呼叫(含等待其落定)
async function lenCase(fnName, kind, len) {
    let f = fnName === 'map' ? pmMap : pmSeries
    let fun = (v, k) => k + '=' + v
    let inp
    if (kind === 'len') {
        inp = { length: len, a: 'x' }
    }
    else if (kind === 'tag') {
        inp = { [Symbol.toStringTag]: 'Array', length: len, a: 'x' }
    }
    else if (kind === 'keys') {
        inp = { length: len }
        for (let i = 0; i < 100; i++) {
            inp['k' + i] = 'x'
        }
    }
    else {
        throw new Error('unknown case: ' + caseName)
    }
    await f({ a: 'x' }, fun) //暖機, 使增量只反映該次呼叫
    if (typeof global.gc === 'function') {
        global.gc()
    }
    let h0 = process.memoryUsage().heapUsed
    let t0 = process.hrtime.bigint()
    let res = await f(inp, fun)
    let ms = Number(process.hrtime.bigint() - t0) / 1e6
    let heapMB = (process.memoryUsage().heapUsed - h0) / 1048576
    return { fn: fnName, kind, len, ms, heapMB, res }
}

let cases = {

    //pmSeries: 陣列第2個元素或物件之值為拋錯之getter, 給fun(其回傳reject, 若被呼叫則於修前成為未處理之rejection)與不給fun
    seriesGetter: async () => {
        let e = new Error('getter boom')
        let mkArr = () => {
            let rs = ['a', 'b', 'c']
            Object.defineProperty(rs, 1, {
                get() {
                    throw e
                },
            })
            return rs
        }
        let mkObj = () => ({
            a: 'a',
            get b() {
                throw e
            },
            c: 'c',
        })
        let one = async (mk, withFun) => {
            let calls = 0
            let fun = withFun
                ? () => {
                    calls++
                    return Promise.reject(new Error('fun boom'))
                }
                : null
            let c = call(() => pmSeries(mk(), fun))
            let r = c.ok ? await settle(c.p) : null
            await delay(30) //使修前遺留之鏈得以執行
            if (!c.ok) {
                return { syncThrow: true, same: c.e === e, calls }
            }
            return { syncThrow: false, s: r.s, same: r.v === e, calls }
        }
        return {
            arrFun: await one(mkArr, true),
            arrNoFun: await one(mkArr, false),
            objFun: await one(mkObj, true),
            objNoFun: await one(mkObj, false),
        }
    },

    //pmChain: 函數陣列第2個元素為拋錯之getter, 首項若被呼叫則回傳reject(修前遺留之鏈使其成為未處理之rejection)
    chainGetter: async () => {
        let e = new Error('getter boom')
        let calls = 0
        let f = () => {
            calls++
            return Promise.reject(new Error('f boom'))
        }
        let pms = [f, f, f]
        Object.defineProperty(pms, 1, {
            get() {
                throw e
            },
        })
        let c = call(() => pmChain(pms, 'init'))
        let r = c.ok ? await settle(c.p) : null
        await delay(30)
        if (!c.ok) {
            return { syncThrow: true, same: c.e === e, calls }
        }
        return { syncThrow: false, s: r.s, same: r.v === e, calls }
    },

    //promisePrefix: 不給fun, 輸入含先行產生之rejected Promise(前項)與其後讀取即拋錯之元素/值: 以該錯誤reject, 前項Promise不成為未處理之rejection(R-PM-SETTLE-01規則9、17; 外審 sol F1)
    promisePrefix: async () => {
        let e = new Error('read boom')
        let mkArr = () => {
            let rs = [Promise.reject(new Error('prefix reject')), 'b']
            Object.defineProperty(rs, 1, {
                get() {
                    throw e
                },
            })
            return rs
        }
        let mkObj = () => ({
            p: Promise.reject(new Error('prefix reject')),
            get q() {
                throw e
            },
        })
        let one = async (f, mk) => {
            let c = call(() => f(mk()))
            let r = c.ok ? await settle(c.p) : null
            await delay(30) //使未被觀察之rejection得以觸發unhandledRejection
            if (!c.ok) {
                return { syncThrow: true, same: c.e === e }
            }
            return { syncThrow: false, s: r.s, same: r.v === e }
        }
        return {
            mapArr: await one(pmMap, mkArr),
            mapObj: await one(pmMap, mkObj),
            seriesArr: await one(pmSeries, mkArr),
            seriesObj: await one(pmSeries, mkObj),
        }
    },

    //speciesSparse: Array子類別(Symbol.species回Object)與稀疏陣列之輸入(外審 sol F3): 內部容器不得由使用端之species決定, 稀疏(空洞)語意同修前
    speciesSparse: async () => {
        class Tasks extends Array {
            static get [Symbol.species]() {
                return Object
            }
        }
        let mk = (...a) => {
            let t = new Tasks()
            for (let x of a) {
                t.push(x)
            }
            return t
        }
        let sp = ['a']
        sp[2] = 'c'
        let fun = (x) => x + 1
        let r = {}
        //safe, 同步拋出亦轉為結果(使單一案例之失敗不拖累其他)
        let safe = async (f) => {
            let c = call(f)
            if (!c.ok) {
                return { s: 'syncThrow', v: safeStr(c.e) }
            }
            return await settle(c.p)
        }
        r.mapSpecies = await safe(() => pmMap(mk(1, 2), fun))
        r.seriesSpecies = await safe(() => pmSeries(mk(1, 2), fun))
        r.chainSpecies = await safe(() => pmChain(mk((x) => x + 1, (x) => x * 2), 1))
        r.mapSparseFun = await safe(() => pmMap(sp, (v, k) => k + ':' + v))
        r.mapSparseNoFun = await safe(() => pmMap(sp))
        r.seriesSparseFun = await safe(() => pmSeries(sp, (v, k) => k + ':' + v))
        r.seriesSparseNoFun = await safe(() => pmSeries(sp))
        r.chainSparse = await safe(() => pmChain([(x) => x + 1, , (x) => x * 2], 1)) // eslint-disable-line no-sparse-arrays
        return r
    },

    //三個函數: 容器本身為已撤銷之Proxy(任何操作皆拋TypeError)
    revokedContainer: async () => {
        let one = async (f, args) => {
            let c = call(() => f(...args))
            if (!c.ok) {
                return { syncThrow: true, isTypeError: c.e instanceof TypeError }
            }
            let r = await settle(c.p)
            return { syncThrow: false, s: r.s, isTypeError: r.v instanceof TypeError }
        }
        let fun = (v) => v
        return {
            map: await one(pmMap, [revoked(), fun]),
            series: await one(pmSeries, [revoked(), fun]),
            chain: await one(pmChain, [revoked(), 'init']),
        }
    },

    //三個函數: 容器之Symbol.toStringTag讀取即拋錯(isobj、isarr之判定即拋); pmChain以Array.isArray判定而不讀標籤, 為not an array
    tagGetterContainer: async () => {
        let e = new Error('tag boom')
        let mk = () => ({
            get [Symbol.toStringTag]() {
                throw e
            },
        })
        let one = async (f, args) => {
            let c = call(() => f(...args))
            if (!c.ok) {
                return { syncThrow: true, same: c.e === e }
            }
            let r = await settle(c.p)
            return { syncThrow: false, s: r.s, same: r.v === e, msg: typeof r.v === 'string' ? r.v : null }
        }
        let fun = (v) => v
        return {
            map: await one(pmMap, [mk(), fun]),
            series: await one(pmSeries, [mk(), fun]),
            chain: await one(pmChain, [mk(), 'init']),
        }
    },

}

let out
try {
    let m = caseName.match(/^(map|series):(len|tag|keys):(\d+)$/)
    if (m) {
        out = await lenCase(m[1], m[2], Number(m[3]))
    }
    else if (cases[caseName]) {
        out = await cases[caseName]()
    }
    else {
        throw new Error('unknown case: ' + caseName)
    }
}
catch (e) {
    out = { runnerError: safeStr(e) }
}
await delay(100)
console.log('@@R@@' + JSON.stringify({ out, unhandled, uncaught }))
process.exit(0)
