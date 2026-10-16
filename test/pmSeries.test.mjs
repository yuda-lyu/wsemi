import assert from 'assert'
import { fileURLToPath } from 'url'
import each from 'lodash-es/each.js'
import pmSeries from '../src/pmSeries.mjs'
import isarr from '../src/isarr.mjs'
import isobj from '../src/isobj.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


describe(`pmSeries`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            //通過function調用產生promise, 各promise循序調用
            pmSeries([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    // console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        // console.log('resolve', v, 'd', d)
                        ms.push({ resolve: v, d })
                        resolve('#' + v)
                    }, d)
                })
            })
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })

        })

    }
    let r1 = '[{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"resolve":3,"d":260},{"call":4},{"resolve":4,"d":190},{"call":5},{"resolve":5,"d":100},{"res":["#1","#2","#3","#4","#5"]}]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            //通過function調用產生promise, 各promise循序調用, 於3會觸發reject而跳出pmSeries
            pmSeries([1, 2, 3, 4, 5], function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    // console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        if (v === 3) {
                            // console.log('reject', v, 'd', d)
                            ms.push({ reject: v, d })
                            reject('#' + v)
                        }
                        else {
                            // console.log('resolve', v, 'd', d)
                            ms.push({ resolve: v, d })
                            resolve('#' + v)
                        }
                    }, d)
                })
            })
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })

        })

    }
    let r2 = '[{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"reject":3,"d":260},{"err":"#3"}]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    async function test3() {
        return new Promise((resolve, reject) => {
            let ms = []

            //先產生promise, 因事先初始化故各promise會依照各自執行時間結束
            let rs = [1, 2, 3, 4, 5].map(function (v, k) {
                return new Promise(function(resolve, reject) {
                    let d = 400 - ((v ** 2) * 10 + 50)
                    // console.log('call', v)
                    ms.push({ call: v })
                    setTimeout(function() {
                        // console.log('resolve', v, 'd', d)
                        ms.push({ resolve: v, d })
                        resolve('#' + v)
                    }, d)
                })
            })
            pmSeries(rs, null)
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })

        })

    }
    let r3 = '[{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"resolve":3,"d":260},{"resolve":2,"d":310},{"resolve":1,"d":340},{"res":["#1","#2","#3","#4","#5"]}]'
    it(`should return '${r3}' when run test3'`, async function() {
        let ms = await test3()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

    async function test4() {
        return new Promise((resolve, reject) => {
            let ms = []

            //通過function調用產生promise, 各promise循序調用
            pmSeries({
                t1: 1,
                t2: 2.345,
                t3: 'abc',
            }, function (v, k) {
                return new Promise(function(resolve, reject) {
                    resolve(`k=${k},v=${v}`)
                })
            })
                .then(function(res) {
                    // console.log('then', JSON.stringify(res))
                    ms.push({ res })
                    resolve(ms)
                })
                .catch(function(err) {
                    // console.log('catch', JSON.stringify(err))
                    ms.push({ err })
                    resolve(ms)
                })

        })

    }
    let r4 = '[{"res":["k=t1,v=1","k=t2,v=2.345","k=t3,v=abc"]}]'
    it(`should return '${r4}' when run test4'`, async function() {
        let ms = await test4()
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
    })

})


describe(`pmSeries settle(R-PM-SETTLE-01)`, function() {

    it(`pmSeries、pmMap: 先行產生之Promise陣列中排後者先reject, reject該錯誤且無未處理之rejection(含中止後未取用者) [規則2、9]`, function() {
        let { r } = runPmSettle('preCreatedLaterReject')
        assert.strict.deepStrictEqual(r.out, { series: { s: 'reject', same: true }, map1: { s: 'reject', same: true }, mapAbort: { s: 'reject', same: true } })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

})


describe(`pmSeries 使用端物件之迭代(R-OBJ-ITER-01)`, function() {

    let runner = fileURLToPath(new URL('./tools/pmObjLenRunner.mjs', import.meta.url))

    //以資料屬性設定自有鍵(含__proto__, 一般賦值會改原型)
    let setOwn = (o, k, v) => {
        Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
        return o
    }

    //call, 等待pmSeries之結果轉為{ s, v }; 同步拋出記為{ s: 'throw' }, 使修前之同步拋出以斷言失敗呈現而非中斷
    let call = (fn) => {
        try {
            return Promise.resolve(fn()).then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
        }
        catch (e) {
            return Promise.resolve({ s: 'throw', v: e })
        }
    }

    let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    //以'k=v'呈現fun收到之鍵與值
    let kv = (v, k) => k + '=' + v

    describe(`物件輸入只依自有可列舉字串鍵, length與其他鍵同為一般鍵(規則1、2)`, function() {

        class ProtoLen {
            get length() {
                return 2
            }
        }

        //期望值為手算: 物件以Object.keys順序(整數鍵升冪在前, 其餘依建立順序), 值為'鍵=值'
        let cases = [
            [`length:1與一般鍵a(修前得'0=undefined')`, () => ({ length: 1, a: 'x' }), ['length=1', 'a=x']],
            [`length:0與一般鍵a(修前得空陣列)`, () => ({ length: 0, a: 'x' }), ['length=0', 'a=x']],
            [`只有length:0(修前得空陣列)`, () => ({ length: 0 }), ['length=0']],
            [`length:2並存數字鍵0、1(修前只走索引0、1, 漏length與a)`, () => ({ length: 2, 0: 'p', 1: 'q', a: 'x' }), ['0=p', '1=q', 'length=2', 'a=x']],
            [`length為-0(JSON.parse可產生, isLength為真)`, () => JSON.parse('{"length":-0,"a":"x"}'), ['length=0', 'a=x']],
            [`原型上有length getter之class實例(修前依其值走索引)`, () => {
                let o = new ProtoLen()
                o.a = 'x'
                return o
            }, ['a=x']],
            [`Object.create(null)且有length鍵(修前走索引)`, () => {
                let o = Object.create(null)
                o.length = 1
                o.b = 'y'
                return o
            }, ['length=1', 'b=y']],
            [`Symbol.toStringTag偽稱Array(isarr為真之非真陣列), length:2(修前同步拋rs.reduce is not a function)`, () => ({ [Symbol.toStringTag]: 'Array', length: 2, a: 'x' }), ['length=2', 'a=x']],
            [`Symbol.toStringTag偽稱Array, length:0`, () => ({ [Symbol.toStringTag]: 'Array', length: 0, a: 'x' }), ['length=0', 'a=x']],
            [`Symbol.toStringTag偽稱Array, 只有length:3`, () => ({ [Symbol.toStringTag]: 'Array', length: 3 }), ['length=3']],
        ]

        for (let [name, mk, exp] of cases) {
            it(`should iterate own keys only for ${name}`, async function() {
                let r = await call(() => pmSeries(mk(), kv))
                assert.strict.deepStrictEqual(r, { s: 'resolve', v: exp })
            })
        }

        //length非陣列樣之值(修前亦走自有鍵, 行為鎖定)
        it(`should keep iterating own keys when length is not array-like (-1, 1.5, '3', null, true, NaN, Infinity, 2^53, object, array)`, async function() {
            let lens = [
                [-1, 'length=-1'],
                [1.5, 'length=1.5'],
                ['3', 'length=3'],
                ['abc', 'length=abc'],
                [null, 'length=null'],
                [undefined, 'length=undefined'],
                [true, 'length=true'],
                [NaN, 'length=NaN'],
                [Infinity, 'length=Infinity'],
                [2 ** 53, 'length=9007199254740992'],
                [{}, 'length=[object Object]'],
                [[], 'length='],
                [[1, 2], 'length=1,2'],
            ]
            let out = []
            for (let [len] of lens) {
                out.push(await call(() => pmSeries({ length: len, a: 'x' }, kv)))
            }
            assert.strict.deepStrictEqual(out, lens.map(([, s]) => ({ s: 'resolve', v: [s, 'a=x'] })))
        })

        it(`should pass string keys to fun for objects (including digit keys and length) and number indexes for arrays`, async function() {
            let ko = []
            let ka = []
            await pmSeries({ 0: 'p', length: 1 }, (v, k) => {
                ko.push(typeof k + ':' + k)
            })
            await pmSeries(['p', 'q'], (v, k) => {
                ka.push(typeof k + ':' + k)
            })
            assert.strict.deepStrictEqual({ ko, ka }, { ko: ['string:0', 'string:length'], ka: ['number:0', 'number:1'] })
        })

        it(`should take the values of own keys when fun is omitted (values are promises or plain values)`, async function() {
            let r = await call(() => pmSeries({ length: 1, a: Promise.resolve('A'), b: Promise.resolve('B') }, null))
            assert.strict.deepStrictEqual(r, { s: 'resolve', v: [1, 'A', 'B'] })
        })

        it(`should only use own enumerable string keys: no inherited, non-enumerable or symbol keys`, async function() {
            let proto = { inh: 1 }
            let o = Object.create(proto)
            o.a = 'x'
            Object.defineProperty(o, 'hid', { value: 'h', enumerable: false })
            o[Symbol('s')] = 'sym'
            class C {
                constructor() {
                    this.p = 1
                }

                m() {}
            }
            let r = await call(() => pmSeries(o, kv))
            let rc = await call(() => pmSeries(new C(), kv))
            assert.strict.deepStrictEqual({ r, rc }, { r: { s: 'resolve', v: ['a=x'] }, rc: { s: 'resolve', v: ['p=1'] } })
        })

        it(`should keep the empty-collection and invalid-input behavior`, async function() {
            let empties = []
            for (let inp of [[], {}, Object.create(null), []]) {
                empties.push(await call(() => pmSeries(inp, kv)))
            }
            let sparse = await call(() => pmSeries(new Array(3), kv))
            // eslint-disable-next-line no-new-wrappers
            let bads = [undefined, null, 0, 1, '', 'abc', true, () => {}, new Map(), new Set(), new Uint8Array(2), new Date(0), /x/, new String('ab'), Symbol('s'), 10n]
            let rb = []
            for (let b of bads) {
                rb.push(await call(() => pmSeries(b, kv)))
            }
            assert.strict.deepStrictEqual({ empties, sparse, rb }, {
                empties: [{ s: 'resolve', v: [] }, { s: 'resolve', v: [] }, { s: 'resolve', v: [] }, { s: 'resolve', v: [] }],
                sparse: { s: 'resolve', v: [] }, //稀疏陣列之空缺不呼叫fun(reduce略過空缺)
                rb: bads.map(() => ({ s: 'reject', v: 'rs is not an array or object' })),
            })
        })

        it(`should not add keys to or change the input object, and fun receives the values at call time`, async function() {
            let inp = { length: 2, a: 'x', 0: 'p' }
            let snap = JSON.stringify(inp)
            let keys = Object.keys(inp)
            let r1 = await call(() => pmSeries(inp, kv))
            assert.strict.deepStrictEqual({ r1, same: JSON.stringify(inp) === snap, keys: Object.keys(inp) }, { r1: { s: 'resolve', v: ['0=p', 'length=2', 'a=x'] }, same: true, keys })

            let o = { a: 1, b: 2, c: 3 }
            let seen = []
            let pm = pmSeries(o, async (v, k) => {
                seen.push([k, v])
                await sleep(5)
                return v
            })
            o.b = 'changed'
            delete o.c
            o.d = 'new'
            let r2 = await call(() => pm)
            assert.strict.deepStrictEqual({ seen, r2 }, { seen: [['a', 1], ['b', 2], ['c', 3]], r2: { s: 'resolve', v: [1, 2, 3] } })
        })

    })

    describe(`無陣列樣length鍵之輸入: 與修前演算法及獨立期望值逐案相同(行為鎖定)`, function() {

        //修前之輸入轉換(isobj以lodash each展開、陣列直接以reduce走訪)原樣複製, 回傳fun收到之[k, v]序列; 非陣列非物件回'reject'
        let legacyPairs = (rs) => {
            if (!isarr(rs) && !isobj(rs)) {
                return 'reject'
            }
            let useObj = false
            if (isobj(rs)) {
                useObj = true
                let _rs = []
                each(rs, (v, k) => {
                    _rs.push({ k, v })
                })
                rs = _rs
            }
            let out = []
            let k = -1
            rs.reduce(function(pmm, v) {
                k += 1
                out.push(useObj ? [v.k, v.v] : [k, v])
                return pmm
            }, null)
            return out
        }

        //獨立於實作與修前演算法之期望值: 陣列依索引走訪存在之元素(稀疏處略過, 序號只計存在者), 物件依Object.keys
        let oracle = (rs) => {
            let out = []
            if (Array.isArray(rs)) {
                let n = 0
                for (let i = 0; i < rs.length; i++) {
                    if (i in rs) {
                        out.push([n, rs[i]])
                        n += 1
                    }
                }
                return out
            }
            return Object.keys(rs).map((k) => [k, rs[k]])
        }

        let seed = 20261017
        let rnd = () => {
            seed = (seed * 1103515245 + 12345) % 2147483648
            return seed / 2147483648
        }
        let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
        let vals = [1, 0, -5, 1.5, 'a', '', 'x y', null, undefined, true, false, NaN, { n: 1 }, [1, 2]]
        //length值皆非陣列樣(非負整數以外): 修前亦以自有鍵迭代
        let lenVals = [-1, 1.5, '3', 'abc', null, true, NaN, Infinity, 2 ** 53, {}, [], [1, 2], undefined]
        let keyNames = ['a', 'b', 'c', '0', '1', '10', 'constructor', 'toString', '__proto__', 'hasOwnProperty', 'x y', '中文']

        let gen = () => {
            if (rnd() < 0.4) {
                let n = Math.floor(rnd() * 6)
                let a = []
                for (let i = 0; i < n; i++) {
                    a.push(pick(vals))
                }
                if (n > 0 && rnd() < 0.3) {
                    delete a[Math.floor(rnd() * n)] //稀疏
                }
                return a
            }
            let o = {}
            let n = Math.floor(rnd() * 6)
            for (let i = 0; i < n; i++) {
                setOwn(o, pick(keyNames), pick(vals))
            }
            if (rnd() < 0.4) {
                setOwn(o, 'length', pick(lenVals))
            }
            return o
        }

        //兩個案例共用同一批輸入
        let inputs = Array.from({ length: 400 }, () => gen())

        let diff = async (expectOf) => {
            let bad = []
            for (let i = 0; i < inputs.length; i++) {
                let r = await call(() => pmSeries(inputs[i], (v, k) => [k, v]))
                try {
                    assert.strict.deepStrictEqual(r, { s: 'resolve', v: expectOf(inputs[i]) })
                }
                catch (err) {
                    bad.push(i)
                }
            }
            return bad
        }

        it(`should equal the legacy conversion on 400 random objects and arrays without array-like length keys`, async function() {
            assert.strict.deepStrictEqual(await diff(legacyPairs), [])
        })

        it(`should equal the independent expectation (Object.keys / present indexes) on the same inputs`, async function() {
            assert.strict.deepStrictEqual(await diff(oracle), [])
        })

    })

    describe(`子行程: 讀取失敗時已讀到之Promise仍被觀察、Array子類別(Symbol.species)與稀疏陣列 [R-PM-SETTLE-01規則9、17]`, function() {

        it(`不給fun, 前項為rejected Promise、其後元素/值讀取即拋錯: 以該錯誤reject, 前項不成為未處理之rejection`, function() {
            let r = runChildCase(runner, 'promisePrefix').r
            let rj = { syncThrow: false, s: 'reject', same: true }
            assert.strict.deepStrictEqual({ out: { seriesArr: r.out.seriesArr, seriesObj: r.out.seriesObj }, unhandled: r.unhandled, uncaught: r.uncaught }, { out: { seriesArr: rj, seriesObj: rj }, unhandled: [], uncaught: [] })
        })

        it(`Symbol.species回Object之Array子類別得[2,3]; 稀疏陣列空洞被略過(鍵為實際走訪序), 同修前`, function() {
            let r = runChildCase(runner, 'speciesSparse').r
            assert.strict.deepStrictEqual({
                species: r.out.seriesSpecies,
                sparseFun: r.out.seriesSparseFun,
                sparseNoFun: r.out.seriesSparseNoFun,
                unhandled: r.unhandled,
                uncaught: r.uncaught,
            }, {
                species: { s: 'resolve', v: [2, 3] },
                sparseFun: { s: 'resolve', v: ['0:a', '1:c'] },
                sparseNoFun: { s: 'resolve', v: ['a', 'c'] },
                unhandled: [],
                uncaught: [],
            })
        })

    })

    describe(`子行程: 容器本身讀取即拋錯(已撤銷Proxy、Symbol.toStringTag拋錯) [R-PM-SETTLE-01規則17]`, function() {

        it(`已撤銷之Proxy: 以TypeError reject, 不同步拋出`, function() {
            let r = runChildCase(runner, 'revokedContainer').r
            assert.strict.deepStrictEqual({ out: r.out.series, unhandled: r.unhandled, uncaught: r.uncaught }, { out: { syncThrow: false, s: 'reject', isTypeError: true }, unhandled: [], uncaught: [] })
        })

        it(`Symbol.toStringTag讀取即拋錯: 以該錯誤reject, 不同步拋出`, function() {
            let r = runChildCase(runner, 'tagGetterContainer').r
            assert.strict.deepStrictEqual({ out: r.out.series, unhandled: r.unhandled, uncaught: r.uncaught }, { out: { syncThrow: false, s: 'reject', same: true, msg: null }, unhandled: [], uncaught: [] })
        })

    })

    describe(`極大length於限額子行程: 時間與記憶體只依實際鍵數`, function() {

        let MAX = Number.MAX_SAFE_INTEGER
        //limit 64MB: 修前之實作對 length>=5e6 即逐次建立元素而耗盡堆積, 離開碼 134
        let cases = [
            ['len', 5e6],
            ['len', 1e8],
            ['len', MAX],
            ['len', 4294967295],
            ['len', 4294967296],
            ['len', 2 ** 53], //超過 isLength 上限, 修前即以自有鍵迭代, 對照
            ['tag', 1e6], //Symbol.toStringTag偽稱Array(isarr為真之非真陣列): 不得依length迭代
            ['tag', MAX],
            ['keys', MAX],
        ]
        for (let [kind, len] of cases) {
            it(`should finish series:${kind}:${len} within 1000 ms and 4 MB of heap, iterating own keys only`, function() {
                let rc = runChildCase(runner, `series:${kind}:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 30000 })
                assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                assert.ok(rc.r !== null, 'no result line')
                let o = rc.r.out
                assert.strict.deepStrictEqual({ unhandled: rc.r.unhandled, uncaught: rc.r.uncaught, runnerError: o.runnerError }, { unhandled: [], uncaught: [], runnerError: undefined })
                let exp = ['length=' + len]
                if (kind === 'keys') {
                    for (let i = 0; i < 100; i++) {
                        exp.push('k' + i + '=x')
                    }
                }
                else {
                    exp.push('a=x')
                }
                assert.strict.deepStrictEqual(o.res, exp)
                assert.ok(o.ms < 1000, `ms=${o.ms}`)
                assert.ok(o.heapMB < 4, `heapMB=${o.heapMB}`)
            })
        }

    })

})


describe(`pmSeries 輸入於進入時取值(R-PM-SETTLE-01規則17)`, function() {

    let runner = fileURLToPath(new URL('./tools/pmObjLenRunner.mjs', import.meta.url))

    let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    describe(`子行程: 元素讀取即拋錯`, function() {
        let r = null
        before(function() {
            r = runChildCase(runner, 'seriesGetter').r
        })

        it(`陣列第2個元素讀取即拋錯(給fun、不給fun): 以該錯誤reject, 不同步拋出, fun一次都不被呼叫 [規則17]`, function() {
            //R-PM-SETTLE-01 規則17: 於try內於進入時取值, 讀取拋錯一律以該錯誤reject(與pmMap一致); 修前於rs.reduce(或標記已處理之each)同步拋出, 且給fun時已建好之鏈首項於其後仍被呼叫
            let rj = { syncThrow: false, s: 'reject', same: true, calls: 0 }
            assert.strict.deepStrictEqual({ arrFun: r.out.arrFun, arrNoFun: r.out.arrNoFun }, { arrFun: rj, arrNoFun: rj })
        })

        it(`物件之值讀取即拋錯(給fun、不給fun): 同陣列 [規則17]`, function() {
            //R-PM-SETTLE-01 規則17: 物件以Object.keys展開並於進入時讀值, 同一取值時機
            let rj = { syncThrow: false, s: 'reject', same: true, calls: 0 }
            assert.strict.deepStrictEqual({ objFun: r.out.objFun, objNoFun: r.out.objNoFun }, { objFun: rj, objNoFun: rj })
        })

        it(`無未處理之rejection與未捕捉例外 [規則2、17]`, function() {
            //R-PM-SETTLE-01 規則2、17: 讀取拋錯時fun不被呼叫, 其rejection不產生
            assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
        })
    })

    it(`呼叫後改動輸入陣列(改元素、縮短長度): fun收到呼叫當下之值 [規則17]`, async function() {
        let calls = []
        let rs = ['a', 'b', 'c']
        let pm = pmSeries(rs, async (v, k) => {
            calls.push([k, v])
            await sleep(10)
            return v
        })
        rs[1] = 'B-mutated'
        rs.length = 2
        let r = await pm.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
        //R-PM-SETTLE-01 規則17: 於進入時取值(複製), 其後只處理複本; JSDoc pmSeries「rs之元素於進入時即取值」
        assert.strict.deepStrictEqual({ calls, r }, { calls: [[0, 'a'], [1, 'b'], [2, 'c']], r: { s: 'resolve', v: ['a', 'b', 'c'] } })
    })

    it(`不給fun時改動輸入陣列: 取用呼叫當下之元素 [規則17]`, async function() {
        let rs = [Promise.resolve('a'), Promise.resolve('b'), Promise.resolve('c')]
        let pm = pmSeries(rs, null)
        rs[1] = Promise.resolve('B-mutated')
        rs.push(Promise.resolve('d'))
        let r = await pm.then((v) => ({ s: 'resolve', v }), (v) => ({ s: 'reject', v }))
        //R-PM-SETTLE-01 規則17: 同上
        assert.strict.deepStrictEqual(r, { s: 'resolve', v: ['a', 'b', 'c'] })
    })

})
