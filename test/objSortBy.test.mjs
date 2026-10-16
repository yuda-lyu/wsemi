import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import map from 'lodash-es/map.js'
import each from 'lodash-es/each.js'
import objSortBy from '../src/objSortBy.mjs'
import iseobj from '../src/iseobj.mjs'
import isfun from '../src/isfun.mjs'
import arrSort from '../src/arrSort.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`objSortBy`, function() {

    let obj1 = {
        'a': 3,
        'b': 2,
        'c': 1,
    }
    // let robj1 = objSortBy(obj1, (v, k) => {
    //     return v
    // })
    // console.log(robj1)
    // => { c: 1, b: 2, a: 3 }

    it(`should return { c: 1, b: 2, a: 3 } when input ${JSON.stringify(obj1)}, (v,k)=>v`, function() {
        let r = objSortBy(obj1, (v, k) => v)
        let rr = { c: 1, b: 2, a: 3 }
        assert.strict.deepStrictEqual(r, rr)
    })

    let obj2 = {
        'x2': 2,
        'x1': 1,
        'x3': 3,
    }
    // let robj2 = objSortBy(obj2, (v, k) => {
    //     return k
    // })
    // console.log(robj2)
    // => { x1: 1, x2: 2, x3: 3 }

    it(`should return { x1: 1, x2: 2, x3: 3 } when input ${JSON.stringify(obj2)}, (v,k)=>k`, function() {
        let r = objSortBy(obj2, (v, k) => k)
        let rr = { x1: 1, x2: 2, x3: 3 }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should order keys by numbers first and put values that cannot be converted or parsed last`, function() {
        //規則同arrSort: 數字(含數字字串)依數值, 其他字串其次, 空字串、純空白字串、null等放最末且維持原順序; 以鍵之順序斷言(deepStrictEqual不比對鍵之順序)
        let r = objSortBy({ a: 10, b: '', c: '9', d: 'x', e: null, f: 1 }, (v) => v)
        assert.strict.deepStrictEqual(Object.keys(r), ['f', 'c', 'a', 'd', 'b', 'e'])
    })

    let testFun = () => {
        return 0
    }

    it(`should return '' when input '', testFun`, function() {
        let r = objSortBy('', testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], testFun`, function() {
        let r = objSortBy([], testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}, testFun`, function() {
        let r = objSortBy({}, testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null, testFun`, function() {
        let r = objSortBy(null, testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input undefined, testFun`, function() {
        let r = objSortBy(undefined, testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input NaN, testFun`, function() {
        let r = objSortBy(NaN, testFun)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    describe(`使用端物件之迭代(R-OBJ-ITER-01)`, function() {

        //以資料屬性設定自有鍵(一般賦值對__proto__會改原型)
        let setOwn = (o, k, v) => {
            Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
            return o
        }

        //修前之演算法(lodash map/each迭代), 原樣複製, 供差分
        let legacyObjSortBy = (obj, fun) => {

            //check
            if (!iseobj(obj)) {
                return {}
            }
            if (!isfun(fun)) {
                throw new Error('fun is not a function')
            }

            //rs
            let rs = map(obj, (v, k) => {
                let t = fun(v, k)
                return { k, v, t }
            })

            //arrSort, 依排序用之值取得排序後之指標, 規則同arrSort
            let inds = arrSort(map(rs, 't'), { returnIndex: true })
            rs = map(inds, (ind) => {
                return rs[ind]
            })

            //objTemp
            let objTemp = {}
            each(rs, (r) => {
                objTemp[r.k] = r.v
            })

            return objTemp
        }

        //獨立於實作之期望值(排序值皆為有限數字時): 依自有可列舉字串鍵之順序取排序值, 以(排序值, 原順序)遞增排序, 再依序建立自有鍵
        let expectedNum = (obj, fun) => {
            if (Object.prototype.toString.call(obj) !== '[object Object]') {
                return {}
            }
            let ks = Object.keys(obj)
            if (ks.length === 0) {
                return {}
            }
            let rs = ks.map((k, i) => ({ k, i, t: fun(obj[k], k) }))
            rs.sort((a, b) => (a.t - b.t) || (a.i - b.i))
            let o = {}
            for (let r of rs) {
                setOwn(o, r.k, obj[r.k])
            }
            return o
        }

        //鍵順序與值皆比對(deepStrictEqual不比鍵順序)
        let same = (r, e) => {
            assert.strict.deepStrictEqual(Object.keys(r), Object.keys(e))
            assert.strict.deepStrictEqual(r, e)
        }

        describe(`無陣列樣length鍵之物件: 與修前演算法逐案相同(行為鎖定)`, function() {

            let seed = 20261017
            let rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648
                return seed / 2147483648
            }
            let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
            let keyNames = ['a', 'b', 'c', 'x1', 'x10', 'x2', '0', '1', '10', '2', 'constructor', 'toString', '中文', 'x y', 'length']
            let vals = [3, 1, 2, 10, 0, -5, 1.5, 2, 3, '9', '10', ' 7 ', 'abc', 'x1', '', '  ', null, undefined, true, NaN, {}, [], ['a'], { a: 1 }]
            //length值皆非陣列樣(非負整數以外): 修前亦以自有鍵迭代
            let lenVals = [-1, 1.5, -0.5, '3', 'x', 'LEN', null, true, NaN, Infinity, -Infinity, {}, [], undefined, 2 ** 53]
            let funs = [
                ['(v)=>v', (v) => v],
                ['(v,k)=>k', (v, k) => k],
                ['(v,k)=>typeof v', (v, k) => typeof v],
                ['(v,k)=>String(k).length', (v, k) => String(k).length],
            ]

            let gen = () => {
                let o = {}
                let n = Math.floor(rnd() * 7)
                for (let i = 0; i < n; i++) {
                    let k = pick(keyNames)
                    setOwn(o, k, k === 'length' ? pick(lenVals) : pick(vals))
                }
                return o
            }

            let cases = Array.from({ length: 400 }, () => [gen(), pick(funs)])

            it(`should equal the legacy algorithm on 400 random objects without array-like length keys`, function() {
                let bad = []
                for (let i = 0; i < cases.length; i++) {
                    let [o, [name, fun]] = cases[i]
                    try {
                        same(objSortBy(o, fun), legacyObjSortBy(o, fun))
                    }
                    catch (err) {
                        bad.push({ i, name })
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should keep the legacy result when length is not array-like (string, fractional, negative, null, object, 2**53)`, function() {
                assert.strict.deepStrictEqual(Object.keys(objSortBy({ length: '3', a: 3, b: 1 }, (v) => v)), ['b', 'length', 'a']) //'3'與3同值, 維持原順序
                assert.strict.deepStrictEqual(Object.keys(objSortBy({ length: -1, a: 3, b: 1 }, (v) => v)), ['length', 'b', 'a'])
                assert.strict.deepStrictEqual(Object.keys(objSortBy({ length: 1.5, a: 3, b: 1 }, (v) => v)), ['b', 'length', 'a'])
                assert.strict.deepStrictEqual(Object.keys(objSortBy({ length: 2 ** 53, a: 3, b: 1 }, (v) => v)), ['b', 'a', 'length'])
                assert.strict.deepStrictEqual(Object.keys(objSortBy({ length: null, a: 3, b: 1 }, (v) => v)), ['b', 'a', 'length']) //null無法排序放最末
            })

        })

        describe(`物件帶陣列樣length鍵(非負整數)時, 一律當一般鍵依自有鍵排序`, function() {

            //[名稱, 物件, fun, 預期鍵序]; 預期值為手算: 鍵序為排序值遞增、相同者維持原順序
            let cases = [
                ['{length:1,a:3,b:1} v=>v (修前得{})', { length: 1, a: 3, b: 1 }, (v) => v, ['length', 'b', 'a']],
                ['{length:2,a:3,b:1} v=>v (修前得{0:undefined,1:undefined})', { length: 2, a: 3, b: 1 }, (v) => v, ['b', 'length', 'a']],
                ['{length:0,a:3,b:1} v=>v (修前得{})', { length: 0, a: 3, b: 1 }, (v) => v, ['length', 'b', 'a']],
                ['{a:3,length:1,b:1} v=>v 鍵序length居中', { a: 3, length: 1, b: 1 }, (v) => v, ['length', 'b', 'a']],
                ['{a:3,b:1,length:5} v=>v 鍵序length最後', { a: 3, b: 1, length: 5 }, (v) => v, ['b', 'a', 'length']],
                ['{length:1000,a:3,b:1} v=>v 較大之length(行程內只用小值: 失敗時斷言差異輸出會逐鍵展開)', { length: 1000, a: 3, b: 1 }, (v) => v, ['b', 'a', 'length']],
                ['{length:2,x2:2,x1:1} (v,k)=>k 依鍵名', { length: 2, x2: 2, x1: 1 }, (v, k) => k, ['length', 'x1', 'x2']],
                ['{length:2,x2:5,x1:1} (v,k)=>-v 依值遞減', { length: 2, x2: 5, x1: 1 }, (v) => -v, ['x2', 'length', 'x1']],
            ]
            for (let [name, o, fun, ks] of cases) {
                it(`should order own keys of ${name}`, function() {
                    let r = objSortBy(o, fun)
                    assert.strict.deepStrictEqual(Object.keys(r), ks)
                    assert.strict.deepStrictEqual(r, o) //值皆原樣, 不新增、不遺失鍵
                })
            }

            it(`should keep numeric keys alongside length: all keys present, no undefined index values`, function() {
                let r = objSortBy({ length: 2, 0: 5, 1: 4 }, (v) => v)
                assert.strict.deepStrictEqual(r, { 0: 5, 1: 4, length: 2 })
                assert.strict.deepStrictEqual(Object.keys(r), ['0', '1', 'length']) //整數鍵恆依升冪排在前
            })

            it(`should call fun with (value, key) for every own key in own-key order, key is a string`, function() {
                let calls = []
                objSortBy({ length: 1, a: 3, b: 1 }, (v, k) => {
                    calls.push([v, k])
                    return v
                })
                assert.strict.deepStrictEqual(calls, [[1, 'length'], [3, 'a'], [1, 'b']]) //修前為(undefined, 0)
            })

            it(`should order by own keys when length is -0 from JSON (isLength(-0) is true: array-like before the fix)`, function() {
                let t = JSON.parse('{"length":-0,"a":3,"b":1}')
                assert.ok(Object.is(t.length, -0))
                let r = objSortBy(t, (v) => v)
                assert.strict.deepStrictEqual(Object.keys(r), ['length', 'b', 'a'])
                assert.ok(Object.is(r.length, -0))
            })

            it(`should order own keys when length is a getter on the prototype (class instance)`, function() {
                class G {
                    get length() {
                        return 2
                    }

                    constructor() {
                        this.a = 3
                        this.b = 1
                    }
                }
                let r = objSortBy(new G(), (v) => v)
                assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a'])
                assert.strict.deepStrictEqual(r, { b: 1, a: 3 })
            })

            it(`should order own keys when the own length is not enumerable`, function() {
                let o = { a: 3, b: 1 }
                Object.defineProperty(o, 'length', { value: 4, enumerable: false })
                let r = objSortBy(o, (v) => v)
                assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a'])
                assert.ok(!Object.prototype.hasOwnProperty.call(r, 'length'))
            })

            it(`should ignore inherited keys and an inherited length: own keys only`, function() {
                let o = Object.create({ z: 0, length: 1 })
                o.a = 3
                o.b = 1
                let calls = []
                let r = objSortBy(o, (v, k) => {
                    calls.push(k)
                    return v
                })
                assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a'])
                assert.strict.deepStrictEqual(calls, ['a', 'b'])
            })

            it(`should not modify the input nor add index keys, and accept a frozen input`, function() {
                let o = { length: 2, a: 3, b: 1 }
                let before = structuredClone(o)
                let r = objSortBy(o, (v) => v)
                assert.strict.deepStrictEqual(o, before)
                assert.strict.deepStrictEqual(Object.keys(o), ['length', 'a', 'b'])
                assert.ok(r !== o)
                assert.strict.deepStrictEqual(Object.keys(objSortBy(Object.freeze({ length: 1, a: 3, b: 1 }), (v) => v)), ['length', 'b', 'a'])
            })

            it(`should treat an object that only pretends to be an Array (Symbol.toStringTag) as no effective object: {} and fun not called`, function() {
                let n = 0
                let o = { [Symbol.toStringTag]: 'Array', length: 2, a: 3, b: 1 }
                assert.strict.deepStrictEqual(objSortBy(o, (v) => {
                    n++
                    return v
                }), {})
                assert.strict.deepStrictEqual(legacyObjSortBy(o, (v) => v), {})
                assert.strict.strictEqual(n, 0)
                assert.strict.deepStrictEqual(objSortBy([1, 2], (v) => v), {})
                assert.strict.deepStrictEqual(objSortBy('abc', (v) => v), {})
            })

            it(`should ignore symbol keys`, function() {
                let s = Symbol('s')
                let r = objSortBy({ a: 3, [s]: 0, b: 1 }, (v) => v)
                assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a'])
                assert.strict.deepStrictEqual(Object.getOwnPropertySymbols(r), [])
            })

            it(`should still throw for a non-function fun and propagate errors thrown by fun`, function() {
                assert.throws(() => objSortBy({ length: 1, a: 1 }, 1), /fun is not a function/)
                assert.throws(() => objSortBy({ length: 1, a: 1 }), /fun is not a function/)
                assert.throws(() => objSortBy({ length: 1, a: 1 }, (v, k) => {
                    throw new Error('boom ' + k)
                }), /boom length/)
            })

        })

        describe(`數值排序值之隨機物件(含陣列樣length鍵): 與獨立期望值逐案相同`, function() {

            let seed = 20261018
            let rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648
                return seed / 2147483648
            }
            let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
            let keyNames = ['a', 'b', 'c', 'x1', 'x10', '0', '1', '10', '2', 'constructor', 'toString', '中文', 'length']
            let nums = [3, 1, 2, 10, 0, -5, 1.5, 2, 3, 100, -0.25]
            //含陣列樣length(小值): 修後與修前不同
            let lenVals = [0, 1, 2, 3, 5, -0, 7, 12, -1, 1.5]

            let gen = () => {
                let o = {}
                let n = 1 + Math.floor(rnd() * 6)
                for (let i = 0; i < n; i++) {
                    let k = pick(keyNames)
                    setOwn(o, k, k === 'length' ? pick(lenVals) : pick(nums))
                }
                return o
            }

            let cases = Array.from({ length: 400 }, () => gen())

            it(`should equal the independent expectation on 400 random numeric objects`, function() {
                let bad = []
                let withLen = 0
                for (let i = 0; i < cases.length; i++) {
                    let o = cases[i]
                    try {
                        same(objSortBy(o, (v) => v), expectedNum(o, (v) => v))
                    }
                    catch (err) {
                        bad.push(i)
                    }
                    if (Object.prototype.hasOwnProperty.call(o, 'length') && Number.isInteger(o.length) && o.length >= 0) {
                        withLen++
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
                assert.ok(withLen >= 30, `withLen=${withLen}`) //須含足夠之帶陣列樣length案例
            })

        })

        describe(`極大length於限額子行程: 時間與記憶體只依實際鍵數`, function() {

            let runner = join(__dirname, 'tools', 'objIterG3Runner.mjs')
            let MAX = Number.MAX_SAFE_INTEGER
            //limit 64MB; 修前之實作對length=MAX為同步RangeError、4294967295為離開碼134
            let k100 = []
            for (let i = 0; i < 100; i++) {
                k100.push('k' + i)
            }
            let cases = [
                ['len', 1e8, ['b', 'a', 'length']],
                ['len', MAX, ['b', 'a', 'length']],
                ['len', 4294967295, ['b', 'a', 'length']],
                ['len', 4294967296, ['b', 'a', 'length']],
                ['len', 2 ** 53, ['b', 'a', 'length']], //超過isLength上限, 修前即以自有鍵迭代, 對照
                ['tag', MAX, []], //Symbol.toStringTag偽稱Array: iseobj為false, 對照
                ['proto', 4294967295, ['b', 'a']], //原型上之length getter
                ['proto', MAX, ['b', 'a']],
                ['hidden', 4294967295, ['b', 'a']], //不可列舉之自有length
                ['hidden', MAX, ['b', 'a']],
                ['keys', MAX, [...k100, 'length']], //length極大且另有100個自有鍵, 值為0~99故length排最末
            ]
            for (let [kind, len, ks] of cases) {
                it(`should finish ${kind}:${len} within 1000 ms and 4 MB of heap with keys ${ks.length}`, function() {
                    let rc = runChildCase(runner, `objSortBy:${kind}:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 20000 })
                    assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                    assert.ok(rc.r !== null, 'no result line')
                    let r = rc.r
                    assert.ok(!r.threw, `threw: ${r.msg}`)
                    assert.strict.deepStrictEqual(r.keys, ks)
                    assert.ok(!r.hasIndexKeys, `index keys added: ${r.keys.slice(0, 5)}`)
                    assert.strict.strictEqual(r.calls, kind === 'tag' ? 0 : ks.length) //fun只依實際自有鍵數呼叫
                    if (kind === 'len') {
                        assert.ok(r.lengthKept, 'length changed')
                        assert.strict.strictEqual(r.a, 3)
                        assert.strict.strictEqual(r.b, 1)
                    }
                    assert.ok(r.ms < 1000, `ms=${r.ms}`)
                    assert.ok(r.heapMB < 4, `heapMB=${r.heapMB}`)
                })
            }

        })

    })


    describe(`輸出鍵與讀值時機(R-OBJ-ITER-01 外審補測)`, function() {

        it(`should keep an own __proto__ key (JSON.parse) as an own data property in the result, with or without a length key`, function() {
            //外審 sol F10: 輸出以一般賦值建立鍵時, 自有__proto__鍵會被當成設定原型而遺失
            for (let src of ['{"__proto__":{"a":1},"b":2}', '{"length":0,"__proto__":{"a":1},"b":2}']) {
                let o = JSON.parse(src)
                let r = objSortBy(o, (v, k) => (k === '__proto__' ? 0 : (k === 'b' ? 1 : 2)))
                assert.strict.deepStrictEqual(Object.keys(r), Object.keys(o).sort((x, y) => ['__proto__', 'b', 'length'].indexOf(x) - ['__proto__', 'b', 'length'].indexOf(y)))
                assert.ok(Object.prototype.hasOwnProperty.call(r, '__proto__'))
                assert.strict.deepStrictEqual(Object.getOwnPropertyDescriptor(r, '__proto__').value, { a: 1 })
                assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                assert.strict.strictEqual(r.a, undefined)
            }
        })

        it(`should read each value at iteration time (lazily, like lodash map): a callback that changes a later value is observed`, function() {
            //外審 sol F11: 先取完 Object.entries 之變異讀到的是舊值
            let o = { a: 1, b: 2 }
            let r = objSortBy(o, (v, k) => {
                if (k === 'a') {
                    o.b = 9
                }
                return k === 'a' ? 1 : 2
            })
            assert.strict.deepStrictEqual(r, { a: 1, b: 9 })
        })

    })

})
