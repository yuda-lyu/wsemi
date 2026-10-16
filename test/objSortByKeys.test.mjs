import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import get from 'lodash-es/get.js'
import map from 'lodash-es/map.js'
import each from 'lodash-es/each.js'
import objSortByKeys from '../src/objSortByKeys.mjs'
import iseobj from '../src/iseobj.mjs'
import isearr from '../src/isearr.mjs'
import isfun from '../src/isfun.mjs'
import arrSort from '../src/arrSort.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`objSortByKeys`, function() {

    let obj1 = {
        'x2': 2,
        'x1': 1,
        'x3': 3,
    }
    it(`should return { x1: 1, x2: 2, x3: 3 } when input ${JSON.stringify(obj1)}, ['x1', 'x2', 'x3']`, function() {
        let r = objSortByKeys(obj1, ['x1', 'x2', 'x3'])
        let rr = { x1: 1, x2: 2, x3: 3 }
        assert.strict.deepStrictEqual(r, rr)
    })

    let obj2 = {
        'x2': 2,
        'x111': 1,
        'x33': 3,
    }
    it(`should return { x111: 1, x2: 2, x33: 3 } when input ${JSON.stringify(obj2)}, ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys(obj2, ['x111', 'x2', 'x33'])
        let rr = { x111: 1, x2: 2, x33: 3 }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input '', ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys('', ['x111', 'x2', 'x33'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys([], ['x111', 'x2', 'x33'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}, ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys({}, ['x111', 'x2', 'x33'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null, ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys(null, ['x111', 'x2', 'x33'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input undefined, ['x111', 'x2', 'x33']`, function() {
        let r = objSortByKeys(undefined, ['x111', 'x2', 'x33'])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = objSortByKeys('')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = objSortByKeys([])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = objSortByKeys({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = objSortByKeys(null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input undefined`, function() {
        let r = objSortByKeys(undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input NaN`, function() {
        let r = objSortByKeys(NaN)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    describe(`使用端物件之迭代(R-OBJ-ITER-01)`, function() {

        //objSortByKeys本身只迭代arr(陣列契約, isearr守門), 物件之迭代經objSortBy, 故物件帶length鍵之行為隨objSortBy修正

        //以資料屬性設定自有鍵(一般賦值對__proto__會改原型)
        let setOwn = (o, k, v) => {
            Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
            return o
        }

        //修前之演算法(objSortBy內為lodash map/each迭代), 原樣複製, 供差分
        let legacyObjSortBy = (obj, fun) => {
            if (!iseobj(obj)) {
                return {}
            }
            if (!isfun(fun)) {
                throw new Error('fun is not a function')
            }
            let rs = map(obj, (v, k) => {
                let t = fun(v, k)
                return { k, v, t }
            })
            let inds = arrSort(map(rs, 't'), { returnIndex: true })
            rs = map(inds, (ind) => {
                return rs[ind]
            })
            let objTemp = {}
            each(rs, (r) => {
                objTemp[r.k] = r.v
            })
            return objTemp
        }
        let legacyObjSortByKeys = (obj, arr) => {
            if (!iseobj(obj)) {
                return {}
            }
            if (!isearr(arr)) {
                return {}
            }
            let kp = {}
            each(arr, (v, k) => {
                kp[v] = k
            })
            return legacyObjSortBy(obj, (v, k) => {
                return get(kp, k, 0)
            })
        }

        //獨立於實作之期望值: 各自有鍵之排序值為其於arr中最後出現之位置(不在arr內為0), 以(排序值, 原順序)遞增排序; 鍵名不含原型鏈上之名稱
        let expectedByKeys = (obj, arr) => {
            if (Object.prototype.toString.call(obj) !== '[object Object]' || Object.keys(obj).length === 0) {
                return {}
            }
            if (!Array.isArray(arr) || arr.length === 0) {
                return {}
            }
            let pos = Object.create(null)
            arr.forEach((v, i) => {
                pos[v] = i
            })
            let rs = Object.keys(obj).map((k, i) => ({ k, i, t: k in pos ? pos[k] : 0 }))
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
            let vals = [3, 1, 2, 10, 'abc', '', null, undefined, true, {}, [], 0, -5, 1.5]
            //length值皆非陣列樣(非負整數以外): 修前亦以自有鍵迭代
            let lenVals = [-1, 1.5, -0.5, '3', 'x', null, true, NaN, Infinity, {}, [], undefined, 2 ** 53]

            let gen = () => {
                let o = {}
                let n = Math.floor(rnd() * 7)
                for (let i = 0; i < n; i++) {
                    let k = pick(keyNames)
                    setOwn(o, k, k === 'length' ? pick(lenVals) : pick(vals))
                }
                return o
            }
            let genArr = () => {
                let n = Math.floor(rnd() * 8)
                let a = []
                for (let i = 0; i < n; i++) {
                    a.push(pick(keyNames))
                }
                return a
            }

            let cases = Array.from({ length: 400 }, () => [gen(), genArr()])

            it(`should equal the legacy algorithm on 400 random objects without array-like length keys`, function() {
                let bad = []
                for (let i = 0; i < cases.length; i++) {
                    let [o, arr] = cases[i]
                    try {
                        same(objSortByKeys(o, arr), legacyObjSortByKeys(o, arr))
                    }
                    catch (err) {
                        bad.push(i)
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

        })

        describe(`物件帶陣列樣length鍵(非負整數)時, 一律當一般鍵依自有鍵排序`, function() {

            //[名稱, 物件, 指定鍵陣列, 預期鍵序]; 預期值為手算: 排序值為鍵於arr中之位置(不在arr內為0), 相同者維持原順序
            let cases = [
                ['{length:1,a:3,b:1} [b,a,length] (修前得{})', { length: 1, a: 3, b: 1 }, ['b', 'a', 'length'], ['b', 'a', 'length']],
                ['{length:1,a:3,b:1} [length,b,a]', { length: 1, a: 3, b: 1 }, ['length', 'b', 'a'], ['length', 'b', 'a']],
                ['{length:1,a:3,b:1} [a,b,length]', { length: 1, a: 3, b: 1 }, ['a', 'b', 'length'], ['a', 'b', 'length']],
                ['{length:2,x2:2,x1:1} [x1,x2] length不在arr內而為0', { length: 2, x2: 2, x1: 1 }, ['x1', 'x2'], ['length', 'x1', 'x2']],
                ['{length:2,x2:2,x1:1} [x2,length,x1]', { length: 2, x2: 2, x1: 1 }, ['x2', 'length', 'x1'], ['x2', 'length', 'x1']],
                ['{length:0,x2:2,x1:1} [x2,x1] (修前得{})', { length: 0, x2: 2, x1: 1 }, ['x2', 'x1'], ['length', 'x2', 'x1']],
                ['{x2:2,length:1000,x1:1} [x1,x2] 較大之length(行程內只用小值: 失敗時斷言差異輸出會逐鍵展開)', { x2: 2, length: 1000, x1: 1 }, ['x1', 'x2'], ['length', 'x1', 'x2']],
            ]
            for (let [name, o, arr, ks] of cases) {
                it(`should order own keys of ${name}`, function() {
                    let r = objSortByKeys(o, arr)
                    assert.strict.deepStrictEqual(Object.keys(r), ks)
                    assert.strict.deepStrictEqual(r, o) //值皆原樣, 不新增、不遺失鍵
                    assert.strict.deepStrictEqual(Object.keys(expectedByKeys(o, arr)), ks) //期望函數與手算值一致
                })
            }

            it(`should not be affected by a length entry in the key array (the internal key-position map is never iterated)`, function() {
                let r = objSortByKeys({ a: 1, b: 2, c: 3 }, ['c', 'length', 'a'])
                assert.strict.deepStrictEqual(Object.keys(r), ['b', 'c', 'a']) //b不在arr內為0, c為0, a為2: b與c同值維持原順序
            })

            it(`should order by own keys when length is -0 from JSON (isLength(-0) is true: array-like before the fix)`, function() {
                let t = JSON.parse('{"length":-0,"a":3,"b":1}')
                assert.ok(Object.is(t.length, -0))
                let r = objSortByKeys(t, ['b', 'a', 'length'])
                assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a', 'length'])
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
                let r = objSortByKeys(new G(), ['b', 'a'])
                assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a'])
                assert.strict.deepStrictEqual(r, { b: 1, a: 3 })
                let r2 = objSortByKeys(new G(), ['a', 'b'])
                assert.strict.deepStrictEqual(Object.keys(r2), ['a', 'b'])
            })

            it(`should order own keys when the own length is not enumerable`, function() {
                let o = { a: 3, b: 1 }
                Object.defineProperty(o, 'length', { value: 4, enumerable: false })
                assert.strict.deepStrictEqual(Object.keys(objSortByKeys(o, ['b', 'a'])), ['b', 'a'])
                assert.strict.deepStrictEqual(Object.keys(objSortByKeys(o, ['a', 'b'])), ['a', 'b'])
            })

            it(`should ignore inherited keys and an inherited length: own keys only`, function() {
                let o = Object.create({ z: 0, length: 1 })
                o.a = 3
                o.b = 1
                let r = objSortByKeys(o, ['z', 'b', 'a'])
                assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a'])
                assert.ok(!('z' in r))
            })

            it(`should not modify the input nor add index keys`, function() {
                let o = { length: 2, a: 3, b: 1 }
                let arr = ['b', 'a', 'length']
                let before = structuredClone(o)
                let r = objSortByKeys(o, arr)
                assert.strict.deepStrictEqual(o, before)
                assert.strict.deepStrictEqual(Object.keys(o), ['length', 'a', 'b'])
                assert.strict.deepStrictEqual(arr, ['b', 'a', 'length'])
                assert.ok(r !== o)
            })

            it(`should return {} for an object that only pretends to be an Array (Symbol.toStringTag), and for an arr that is not a non-empty array`, function() {
                let o = { [Symbol.toStringTag]: 'Array', length: 2, a: 3, b: 1 }
                assert.strict.deepStrictEqual(objSortByKeys(o, ['b', 'a']), {})
                assert.strict.deepStrictEqual(objSortByKeys({ length: 1, a: 3 }, []), {})
                assert.strict.deepStrictEqual(objSortByKeys({ length: 1, a: 3 }, { 0: 'a', length: 1 }), {}) //arr為帶length之物件, isearr為false
            })

        })

        describe(`隨機物件(含陣列樣length鍵)與獨立期望值逐案相同`, function() {

            let seed = 20261019
            let rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648
                return seed / 2147483648
            }
            let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
            //不含constructor、toString等原型鏈上之名稱(get(kp, k, 0)對其回原型上之函數, 非本規則範圍)
            let keyNames = ['a', 'b', 'c', 'x1', 'x10', '0', '1', '10', '2', '中文', 'length']
            let lenVals = [0, 1, 2, 3, 5, -0, 7, 12, -1, 1.5]

            let cases = Array.from({ length: 400 }, () => {
                let o = {}
                let n = 1 + Math.floor(rnd() * 6)
                for (let i = 0; i < n; i++) {
                    let k = pick(keyNames)
                    setOwn(o, k, k === 'length' ? pick(lenVals) : pick([1, 2, 'x', null]))
                }
                let arr = []
                let m = 1 + Math.floor(rnd() * 7)
                for (let i = 0; i < m; i++) {
                    arr.push(pick(keyNames))
                }
                return [o, arr]
            })

            it(`should equal the independent expectation on 400 random objects`, function() {
                let bad = []
                let withLen = 0
                for (let i = 0; i < cases.length; i++) {
                    let [o, arr] = cases[i]
                    try {
                        same(objSortByKeys(o, arr), expectedByKeys(o, arr))
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
            //limit 64MB; 修前之實作(經objSortBy)對length=MAX為同步RangeError、4294967295為離開碼134
            let k100r = []
            for (let i = 99; i >= 0; i--) {
                k100r.push('k' + i)
            }
            let cases = [
                ['len', 1e8, ['b', 'a', 'length']],
                ['len', MAX, ['b', 'a', 'length']],
                ['len', 4294967295, ['b', 'a', 'length']],
                ['len', 4294967296, ['b', 'a', 'length']],
                ['len', 2 ** 53, ['b', 'a', 'length']], //超過isLength上限, 修前即以自有鍵迭代, 對照
                ['tag', MAX, []], //Symbol.toStringTag偽稱Array: iseobj為false, 對照
                ['proto', MAX, ['b', 'a']], //原型上之length getter
                ['hidden', MAX, ['b', 'a']], //不可列舉之自有length
                ['keys', MAX, [...k100r, 'length']], //length極大且另有100個自有鍵
            ]
            for (let [kind, len, ks] of cases) {
                it(`should finish ${kind}:${len} within 1000 ms and 4 MB of heap with keys ${ks.length}`, function() {
                    let rc = runChildCase(runner, `objSortByKeys:${kind}:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 20000 })
                    assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                    assert.ok(rc.r !== null, 'no result line')
                    let r = rc.r
                    assert.ok(!r.threw, `threw: ${r.msg}`)
                    assert.strict.deepStrictEqual(r.keys, ks)
                    assert.ok(!r.hasIndexKeys, `index keys added: ${r.keys.slice(0, 5)}`)
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


    describe(`輸出鍵(R-OBJ-ITER-01 外審補測)`, function() {

        it(`should keep an own __proto__ key (JSON.parse) as an own data property in the result`, function() {
            //外審 sol F10: 經 objSortBy 組出輸出
            let o = JSON.parse('{"length":0,"__proto__":{"a":1},"b":2}')
            let r = objSortByKeys(o, ['__proto__', 'b', 'length'])
            assert.strict.deepStrictEqual([...Object.keys(r)].sort(), ['__proto__', 'b', 'length'])
            assert.ok(Object.prototype.hasOwnProperty.call(r, '__proto__'))
            assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
            assert.strict.strictEqual(r.a, undefined)
        })

    })

})
