import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import { revoked } from './tools/caseKit.mjs'
import { scanOptReads } from './tools/optReadScan.mjs'


//排程第676項②(R-C1-HOSTILE-01之延伸): arrMax、arrMin、arrGroupByMaxmin、arrLookupByMaxmin、treeObj讀取opt時, 讀取拋錯(已撤銷之Proxy、存取器拋錯、陷阱拋錯)者視為未給, 不拋錯(C1/C6);
//  其餘鍵照常讀取(每鍵只讀一次, V11); 無效之第1、2參數之既有處置(arrMax/arrMin拋錯、其餘回[])不變
//  規格來源: dspec〈輸入參數之檢測機制〉K3(opt讀取拋錯視為未給)、V11(每鍵只讀一次)與主控派工第676項②
//  修前紅: 環境變數WSEMI_OPT676_SRC指向修前之src資料夾時, 改載該處之模組


let SRC = process.env.WSEMI_OPT676_SRC ? path.resolve(process.env.WSEMI_OPT676_SRC) : path.resolve(import.meta.dirname, '..', 'src')
let load = async (n) => (await import(pathToFileURL(path.join(SRC, `${n}.mjs`)).href)).default

let FN5 = ['arrMax', 'arrMin', 'arrGroupByMaxmin', 'arrLookupByMaxmin', 'treeObj']


//hostile, 各種讀取即拋錯之opt(整個opt不可讀): 已撤銷之Proxy、get陷阱拋錯之Proxy、has/ownKeys陷阱拋錯之Proxy
let boom = () => {
    throw new Error('SECRET_OPT_Q9')
}
let HOSTILE = [
    ['revoked Proxy', () => revoked()],
    ['Proxy with a throwing get trap', () => new Proxy({}, { get: boom })],
    ['Proxy with a throwing has trap', () => new Proxy({}, { has: boom, get: boom })],
]

//oneKeyBad, 只有一個鍵之讀取拋錯(存取器), 其餘鍵為有效值
let oneKeyBad = (key, rest) => Object.defineProperty({ ...rest }, key, { get: boom, enumerable: true, configurable: true })


describe(`排程第676項②: arrMax、arrMin、arrGroupByMaxmin、arrLookupByMaxmin、treeObj之opt讀取拋錯視為未給`, function() {

    let M = {}
    before(async function() {
        for (let n of FN5) {
            M[n] = await load(n)
        }
    })

    let MM = () => [{ min: 0, max: 3 }, { min: 3, max: 10 }]
    let ARR = () => [{ value: 1 }, { value: 5 }, { value: 2 }]
    let TREE = () => ({ a: { b: 1 }, c: [1, { d: 2 }] })
    let HOOK = (v) => v

    for (let [hn, mk] of HOSTILE) {
        it(`[${hn}] arrMax and arrMin should treat the opt as not given (no throw, same result as without opt)`, function() {
            for (let n of ['arrMax', 'arrMin']) {
                assert.strict.deepStrictEqual(M[n]([1, 3, 2], mk()), M[n]([1, 3, 2]), n)
                //物件陣列未給compareKey時無有效數字而拋錯: 不可讀之opt須與未給opt得同一結果(同一訊息)
                let out = (f) => {
                    try {
                        return f()
                    }
                    catch (e) {
                        return `THROW:${e.message}`
                    }
                }
                assert.strict.deepStrictEqual(out(() => M[n]([{ a: 1 }, { a: 3 }], mk())), out(() => M[n]([{ a: 1 }, { a: 3 }])), n)
            }
        })
        it(`[${hn}] arrGroupByMaxmin and arrLookupByMaxmin should treat the opt as not given (default keys)`, function() {
            assert.strict.deepStrictEqual(M.arrGroupByMaxmin(ARR(), MM(), mk()), M.arrGroupByMaxmin(ARR(), MM()))
            assert.strict.deepStrictEqual(M.arrLookupByMaxmin(ARR(), MM(), mk()), M.arrLookupByMaxmin(ARR(), MM()))
        })
        it(`[${hn}] treeObj should treat the opt as not given (force false)`, function() {
            assert.strict.deepStrictEqual(M.treeObj(TREE(), HOOK, mk()), M.treeObj(TREE(), HOOK))
        })
    }

    it(`arrMax and arrMin: an unreadable key is treated as not given while the other key is still honored`, function() {
        for (let n of ['arrMax', 'arrMin']) {
            let data = [{ a: 1 }, { a: 3 }, { a: 2 }]
            //returnIndex不可讀 → 視為false(回傳數值), compareKey照常取a
            assert.strict.deepStrictEqual(M[n](data, oneKeyBad('returnIndex', { compareKey: 'a' })), M[n](data, { compareKey: 'a' }), n)
            //compareKey不可讀 → 視為null(不取欄位, 元素為物件而無有效數字, 拋錯同未給之處置)
            let withoutKey = (() => {
                try {
                    return M[n](data, { returnIndex: true })
                }
                catch (e) {
                    return e.message
                }
            })()
            let withBad = (() => {
                try {
                    return M[n](data, oneKeyBad('compareKey', { returnIndex: true }))
                }
                catch (e) {
                    return e.message
                }
            })()
            assert.strict.deepStrictEqual(withBad, withoutKey, n)
            //有效數字陣列: compareKey不可讀、returnIndex有效 → 回傳指標
            assert.strict.deepStrictEqual(M[n]([5, 9, 7], oneKeyBad('compareKey', { returnIndex: true })), M[n]([5, 9, 7], { returnIndex: true }), n)
        }
    })

    it(`arrGroupByMaxmin and arrLookupByMaxmin: an unreadable key falls back to its default while the other keys are still honored`, function() {
        let maxmins = [{ lo: 0, hi: 3 }, { lo: 3, hi: 10 }]
        let arr = [{ v: 1 }, { v: 5 }]
        for (let n of ['arrGroupByMaxmin', 'arrLookupByMaxmin']) {
            //keyItems不可讀 → 'items'; keyMax、keyMin、keyValue照常
            let good = { keyMax: 'hi', keyMin: 'lo', keyValue: 'v' }
            assert.strict.deepStrictEqual(M[n](arr, maxmins, oneKeyBad('keyItems', good)), M[n](arr, maxmins, good), n)
            //keyValue不可讀 → 'value'(arr內無該欄, 結果同未給keyValue)
            let good2 = { keyMax: 'hi', keyMin: 'lo', keyItems: 'its' }
            assert.strict.deepStrictEqual(M[n](arr, maxmins, oneKeyBad('keyValue', good2)), M[n](arr, maxmins, good2), n)
        }
        //beforeAddResult不可讀 → 視為未給(null)
        let good3 = { keyMax: 'hi', keyMin: 'lo', keyValue: 'v' }
        assert.strict.deepStrictEqual(M.arrLookupByMaxmin(arr, maxmins, oneKeyBad('beforeAddResult', good3)), M.arrLookupByMaxmin(arr, maxmins, good3))
    })

    it(`treeObj: an unreadable force is treated as false while a readable force:true is honored`, function() {
        let sym = Symbol('s')
        let data = { [sym]: 'sv', a: 2 }
        //hook被呼叫之次數: force為true時Symbol鍵之值亦交給hook(共2次), 否則只有字串鍵(1次)
        let calls = (opt) => {
            let n = 0
            M.treeObj(data, (v) => {
                n++
                return v
            }, opt)
            return n
        }
        assert.strict.deepStrictEqual(calls({ force: true }), 2)
        assert.strict.deepStrictEqual(calls(), 1)
        assert.strict.deepStrictEqual(calls(oneKeyBad('force', {})), 1) //不可讀 → 視為false
        assert.strict.deepStrictEqual(M.treeObj(data, HOOK, oneKeyBad('force', {})), M.treeObj(data, HOOK))
    })

    it(`each key should be read once (V11)`, function() {
        let reads = {}
        let spy = (keys, rest = {}) => {
            let o = { ...rest }
            for (let k of keys) {
                reads[k] = 0
                Object.defineProperty(o, k, {
                    get() {
                        reads[k]++
                        return rest[k]
                    },
                    enumerable: true,
                    configurable: true,
                })
            }
            return o
        }
        M.arrMax([1, 2, 3], spy(['returnIndex', 'compareKey']))
        M.arrMin([1, 2, 3], spy(['returnIndex', 'compareKey']))
        assert.strict.deepStrictEqual(reads, { returnIndex: 1, compareKey: 1 })
        reads = {}
        M.arrGroupByMaxmin(ARR(), MM(), spy(['keyMax', 'keyMin', 'keyValue', 'keyItems']))
        assert.strict.deepStrictEqual(reads, { keyMax: 1, keyMin: 1, keyValue: 1, keyItems: 1 })
        reads = {}
        M.arrLookupByMaxmin(ARR(), MM(), spy(['keyMax', 'keyMin', 'keyValue', 'keyItems', 'beforeAddResult']))
        assert.strict.deepStrictEqual(reads, { keyMax: 1, keyMin: 1, keyValue: 1, keyItems: 1, beforeAddResult: 1 })
        reads = {}
        M.treeObj(TREE(), HOOK, spy(['force']))
        assert.strict.deepStrictEqual(reads, { force: 1 })
    })

    it(`the invalid first or second parameters should keep their handling (arrMax and arrMin throw, the others return [])`, function() {
        for (let n of ['arrMax', 'arrMin']) {
            assert.throws(() => M[n]('x', revoked()), /^Error: invalid vall: must be an array$/, n)
            assert.throws(() => M[n]([], revoked()), /^Error: invalid vall: must contain a valid number$/, n)
        }
        assert.strict.deepStrictEqual(M.arrGroupByMaxmin(ARR(), 'x', revoked()), [])
        assert.strict.deepStrictEqual(M.arrLookupByMaxmin(ARR(), [], revoked()), [])
    })

    it(`source scan (AST): the five functions should read opt only through the _pickOpt snapshot (no direct read) and import _pickOpt`, function() {
        for (let n of FN5) {
            let code = fs.readFileSync(path.join(SRC, `${n}.mjs`), 'utf8')
            let r = scanOptReads(code)
            assert.strict.deepStrictEqual(r.direct, [], `${n} direct opt reads`)
            assert.ok(/from '\.\/_pickOpt\.mjs'/.test(code), `${n} imports _pickOpt`)
        }
    })

})
