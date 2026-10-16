import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import merge from 'lodash-es/merge.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import ltdtmerge from '../src/ltdtmerge.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe('ltdtmerge', function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        ltdt1: [{ a: 12, b: 34.56 }, {}],
        ltdt2: [{ a: '123', c: 'mn' }, { aa: 'a123', bb: 'bmn' }],
        out: [{ a: '123', b: 34.56, c: 'mn' }, { aa: 'a123', bb: 'bmn' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].ltdt1)}, ${JSON.stringify(o[k].ltdt2)}`, function() {
        k = 1
        let r = ltdtmerge(o[k].ltdt1, o[k].ltdt2)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input [{ a: 12, b: 34.56 }, { a: \'123\', b: \'xyz\', c: \'mn\' }], \'\'', function() {
        let r = ltdtmerge([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input [{ a: 12, b: 34.56 }, { a: \'123\', b: \'xyz\', c: \'mn\' }], []', function() {
        let r = ltdtmerge([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input [{ a: 12, b: 34.56 }, { a: \'123\', b: \'xyz\', c: \'mn\' }], {}', function() {
        let r = ltdtmerge([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input [{ a: 12, b: 34.56 }, { a: \'123\', b: \'xyz\', c: \'mn\' }], null', function() {
        let r = ltdtmerge([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input [{ a: 12, b: 34.56 }, { a: \'123\', b: \'xyz\', c: \'mn\' }], undefined', function() {
        let r = ltdtmerge([{ a: 12, b: 34.56 }, { a: '123', b: 'xyz', c: 'mn' }], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input \'\'', function() {
        let r = ltdtmerge('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input []', function() {
        let r = ltdtmerge([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input {}', function() {
        let r = ltdtmerge({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input null', function() {
        let r = ltdtmerge(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input undefined', function() {
        let r = ltdtmerge(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it('sould return [] when input NaN', function() {
        let r = ltdtmerge(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    describe(`ltdtmerge 使用端物件之迭代(R-OBJ-ITER-01)`, function() {

        //結構簽章: 含鍵順序、陣列洞、-0、NaN、Date與值型別(deepStrictEqual不比鍵順序, 僅供無循環參照之資料)
        let sig = (v) => {
            if (Array.isArray(v)) {
                let a = []
                for (let i = 0; i < v.length; i++) {
                    a.push(i in v ? sig(v[i]) : '<hole>')
                }
                return '[' + a.join(',') + ']'
            }
            if (Object.prototype.toString.call(v) === '[object Object]') {
                return '{' + Object.keys(v).map((k) => JSON.stringify(k) + ':' + sig(v[k])).join(',') + '}'
            }
            if (v instanceof Date) {
                return 'Date(' + v.getTime() + ')'
            }
            if (Object.is(v, -0)) {
                return '-0'
            }
            return typeof v + ':' + String(v)
        }
        let same = (r, e) => {
            assert.strict.deepStrictEqual(r, e)
            assert.strict.strictEqual(sig(r), sig(e))
        }

        //收集全部純物件與陣列容器(含循環參照者)
        let containersOf = (v, set = new Set()) => {
            if (Array.isArray(v) || Object.prototype.toString.call(v) === '[object Object]') {
                if (set.has(v)) {
                    return set
                }
                set.add(v)
                for (let k of Object.keys(v)) {
                    containersOf(v[k], set)
                }
            }
            return set
        }

        //結果內之容器不得與輸入之容器共用參照
        let assertNoSharedContainer = (r, ltdt1, ltdt2) => {
            let ins = new Set([...containersOf(ltdt1), ...containersOf(ltdt2)])
            let bad = [...containersOf(r)].filter((c) => ins.has(c))
            assert.strict.strictEqual(bad.length, 0, `${bad.length} containers shared with the inputs`)
        }

        //以資料屬性設定自有鍵(含__proto__, 一般賦值會改原型)
        let setOwn = (o, k, v) => {
            Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
            return o
        }

        //修前之演算法(lodash merge), 供差分
        let legacy = (ltdt1, ltdt2) => {
            return ltdt1.map((v, k) => merge(cloneDeep(ltdt1[k]), ltdt2[k]))
        }

        describe(`種類不同以來源為準, length 為一般鍵(明確期望值)`, function() {

            let cases = [
                ['目的端{length:2}、來源端陣列 -> 來源陣列', [{ x: { length: 2 } }], [{ x: ['a'] }], [{ x: ['a'] }]],
                ['目的端{length:2,0,1}、來源端陣列 -> 來源陣列(不沿用目的端索引鍵)', [{ x: { length: 2, 0: 'a', 1: 'b' } }], [{ x: ['Z'] }], [{ x: ['Z'] }]],
                ['目的端陣列、來源端{length:0} -> 來源物件', [{ x: ['a', 'b'] }], [{ x: { length: 0 } }], [{ x: { length: 0 } }]],
                ['目的端陣列、來源端{length:1,a}', [{ x: ['a', 'b'] }], [{ x: { length: 1, a: 1 } }], [{ x: { length: 1, a: 1 } }]],
                ['目的端空陣列、來源端{length:2}', [{ x: [] }], [{ x: { length: 2 } }], [{ x: { length: 2 } }]],
                ['目的端陣列、來源端{length:-1}(修前同步拋RangeError)', [{ x: ['a'] }], [{ x: { length: -1 } }], [{ x: { length: -1 } }]],
                ['目的端陣列、來源端{length:1.5}', [{ x: ['a'] }], [{ x: { length: 1.5 } }], [{ x: { length: 1.5 } }]],
                ['目的端陣列、來源端{length:2,0:"p"}', [{ x: ['a', 'b', 'c'] }], [{ x: { length: 2, 0: 'p' } }], [{ x: { length: 2, 0: 'p' } }]],
                ['目的端{length:2}、來源端空陣列 -> 空陣列', [{ x: { length: 2, a: 1 } }], [{ x: [] }], [{ x: [] }]],
                ['目的端物件、來源端陣列 -> 來源陣列', [{ x: { a: 1 } }], [{ x: [1] }], [{ x: [1] }]],
                ['目的端陣列、來源端物件(無length) -> 來源物件', [{ x: [1, 2] }], [{ x: { a: 1 } }], [{ x: { a: 1 } }]],
                ['目的端字串、來源端{length:2}', [{ x: 'abc' }], [{ x: { length: 2 } }], [{ x: { length: 2 } }]],
                ['目的端null、來源端{length:2}', [{ x: null }], [{ x: { length: 2 } }], [{ x: { length: 2 } }]],
                ['目的端無x、來源端{length:2}', [{}], [{ x: { length: 2 } }], [{ x: { length: 2 } }]],
                ['巢狀: 目的端陣列元素內{length}、來源端陣列元素內陣列', [{ p: [{ q: { length: 3 } }] }], [{ p: [{ q: ['z'] }] }], [{ p: [{ q: ['z'] }] }]],
                ['巢狀: 目的端陣列元素內陣列、來源端陣列元素內{length}', [{ p: [{ q: ['a', 'b'] }] }], [{ p: [{ q: { length: 3 } }] }], [{ p: [{ q: { length: 3 } }] }]],
                ['兩端皆物件: length 與其他鍵正常合併', [{ x: { length: 3, a: 1 } }], [{ x: { length: 5, b: 2 } }], [{ x: { length: 5, a: 1, b: 2 } }]],
                ['兩端皆物件, 來源無length -> 保留目的端length', [{ x: { length: 3, a: 1 } }], [{ x: { b: 2 } }], [{ x: { length: 3, a: 1, b: 2 } }]],
                ['兩端皆物件, 目的端無length -> 採來源length', [{ x: { a: 1 } }], [{ x: { length: 3, b: 2 } }], [{ x: { a: 1, length: 3, b: 2 } }]],
                ['兩端皆物件帶數字鍵與length', [{ x: { length: 2, 0: 'a', 1: 'b' } }], [{ x: { 1: 'B' } }], [{ x: { 0: 'a', 1: 'B', length: 2 } }]],
                ['最外層元素: {length:2,a:1}併{length:3,b:2}', [{ length: 2, a: 1 }], [{ length: 3, b: 2 }], [{ length: 3, a: 1, b: 2 }]],
                ['最外層元素: 目的端{length:2,a}併來源端{b}', [{ length: 2, a: 1 }], [{ b: 2 }], [{ length: 2, a: 1, b: 2 }]],
                ['最外層元素: 目的端{a}併來源端{length:0}', [{ a: 1 }], [{ length: 0 }], [{ a: 1, length: 0 }]],
                ['最外層元素為陣列時, 來源端{length}物件取代之', [[1, 2, 3]], [{ length: 1 }], [{ length: 1 }]],
                ['length 為字串/null/布林(非陣列樣)亦為一般鍵', [{ x: { length: 'a' } }], [{ x: { length: null, y: true } }], [{ x: { length: null, y: true } }]],
            ]
            for (let [name, a, b, e] of cases) {
                it(`should return the source-first merge when ${name}`, function() {
                    let r = ltdtmerge(a, b)
                    same(r, e)
                })
            }

            it(`should treat length -0 (JSON.parse('-0')) as an ordinary key on the source side`, function() {
                let b = JSON.parse('[{"x":{"length":-0}}]')
                assert.ok(Object.is(b[0].x.length, -0))
                let r = ltdtmerge([{ x: ['a'] }], b)
                assert.strict.deepStrictEqual(Object.keys(r[0].x), ['length'])
                assert.ok(Object.is(r[0].x.length, -0))
            })

            it(`should treat length -0 (JSON.parse('-0')) as an ordinary key on the destination side`, function() {
                let a = JSON.parse('[{"x":{"length":-0,"a":1}}]')
                let r = ltdtmerge(a, [{ x: ['Z'] }])
                assert.strict.deepStrictEqual(r, [{ x: ['Z'] }])
                let r2 = ltdtmerge(a, [{ x: { b: 2 } }])
                assert.strict.deepStrictEqual(Object.keys(r2[0].x), ['length', 'a', 'b'])
                assert.ok(Object.is(r2[0].x.length, -0))
            })

            it(`should treat a class instance with a prototype length getter as an object, not as array-like`, function() {
                class Cls {
                    get length() {
                        return 2
                    }
                }
                let o = new Cls()
                o.a = 1
                let r = ltdtmerge([{ x: o }], [{ x: ['a'] }])
                same(r, [{ x: ['a'] }])
            })

            it(`should assign a non-plain source value (class instance) by reference like lodash merge, not deep-copy it as a plain object`, function() {
                class Cls {
                    constructor() {
                        this.a = 1
                    }

                    hello() {
                        return 'hi'
                    }
                }
                let o = new Cls()
                let r = ltdtmerge([{ x: { z: 1 } }, {}], [{ x: o }, { y: o }])
                assert.ok(r[0].x === o)
                assert.ok(r[1].y === o)
                assert.strict.strictEqual(r[1].y.hello(), 'hi')
                //對照lodash
                let rl = [{ x: { z: 1 } }, {}].map((v, k) => merge(v, [{ x: o }, { y: o }][k]))
                assert.ok(rl[0].x === o)
            })

            it(`should keep the destination value when the source value is SameValueZero-equal (-0 vs 0, like lodash merge)`, function() {
                let r = ltdtmerge([{ n: -0, x: { m: -0 } }], [{ n: 0, x: { m: 0 } }])
                assert.ok(Object.is(r[0].n, -0))
                assert.ok(Object.is(r[0].x.m, -0))
                let rl = merge({ n: -0, x: { m: -0 } }, { n: 0, x: { m: 0 } })
                assert.ok(Object.is(rl.n, -0))
                assert.ok(Object.is(rl.x.m, -0))
            })

            it(`should return a new array whose members are not the input members`, function() {
                let a = [{ a: 1 }, { b: 2 }]
                let b = [{ c: 3 }, { d: 4 }]
                let r = ltdtmerge(a, b)
                assert.ok(r !== a)
                assert.ok(r !== b)
                assert.ok(r[0] !== a[0] && r[0] !== b[0])
                assert.ok(r[1] !== a[1] && r[1] !== b[1])
                same(r, [{ a: 1, c: 3 }, { b: 2, d: 4 }])
            })

        })

        describe(`不修改輸入且結果與輸入無共用容器`, function() {

            it(`should not modify ltdt1 and ltdt2 (nested arrays and objects, length keys included)`, function() {
                let a = [{ x: ['a', 'b'], y: { length: 2, k: 1 }, z: [{ p: 1 }] }, { x: { length: 3 } }]
                let b = [{ x: { length: 0 }, y: ['q'], z: [{ p: 2 }, { n: 3 }] }, { x: ['m'] }]
                let a0 = structuredClone(a)
                let b0 = structuredClone(b)
                ltdtmerge(a, b)
                same(a, a0)
                same(b, b0)
            })

            it(`should not modify the destination array when the source is an object with length`, function() {
                let arr = ['a', 'b', 'c']
                let a = [{ x: arr }]
                ltdtmerge(a, [{ x: { length: 0 } }])
                assert.strict.deepStrictEqual(arr, ['a', 'b', 'c'])
                assert.ok(a[0].x === arr)
            })

            it(`should not return ltdt1 members (a changed result must not change ltdt1)`, function() {
                let a = [{ x: [1, 2], y: { z: 1 } }]
                let b = [{ x: [9], y: { w: 2 } }]
                let a0 = structuredClone(a)
                let b0 = structuredClone(b)
                let r = ltdtmerge(a, b)
                r[0].x.push('new')
                r[0].y.z = 'changed'
                r[0].y.w = 'changed'
                r[0].extra = 1
                same(a, a0)
                same(b, b0)
            })

            it(`should share no container (object or array) with ltdt1 or ltdt2`, function() {
                let a = [{ x: [1, { y: 2 }], z: { w: [3] }, only1: { q: [4] } }]
                let b = [{ x: [9, { y: 8, n: [7] }], z: { v: { u: 1 } }, only2: { r: [5, { s: 6 }] } }]
                let r = ltdtmerge(a, b)
                assertNoSharedContainer(r, a, b)
                same(r, [{ x: [9, { y: 8, n: [7] }], z: { w: [3], v: { u: 1 } }, only1: { q: [4] }, only2: { r: [5, { s: 6 }] } }])
            })

            it(`should work on deeply frozen inputs`, function() {
                let deepFreeze = (v) => {
                    if (v !== null && typeof v === 'object' && !Object.isFrozen(v)) {
                        Object.freeze(v)
                        for (let k of Object.keys(v)) {
                            deepFreeze(v[k])
                        }
                    }
                    return v
                }
                let a = deepFreeze([{ x: [1, { y: 2 }], z: { length: 2 } }])
                let b = deepFreeze([{ x: [9], z: { q: 1 } }])
                let r = ltdtmerge(a, b)
                same(r, [{ x: [9, { y: 2 }], z: { length: 2, q: 1 } }])
                assert.ok(!Object.isFrozen(r[0]))
            })

        })

        describe(`一般資料(各路徑種類一致): 與修前演算法(lodash merge)逐案相同(行為鎖定)`, function() {

            let seed = 20261017
            let rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648
                return seed / 2147483648
            }
            let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
            let shuffle = (arr) => {
                let a = arr.slice()
                for (let i = a.length - 1; i > 0; i--) {
                    let j = Math.floor(rnd() * (i + 1))
                    let t = a[i]
                    a[i] = a[j]
                    a[j] = t
                }
                return a
            }
            //鍵含length(兩端皆物件時, 修前亦以自有鍵合併, 為一般鍵)、constructor、toString、數字鍵; 不含__proto__(修前對物件值之__proto__鍵靜默略過, 見專案案例)
            let keyPool = ['a', 'b', 'c', '0', '1', '10', 'x y', '中文', 'toString', 'hasOwnProperty', 'constructor', 'length']
            let leafD = [1, 0, -5, 1.5, 'a', '', true, false, null, undefined, NaN, new Date(0)]
            let leafS = [...leafD, 'z', 99, Infinity, new Date(5)]

            let genPair = (depth) => {
                let t = rnd()
                if (depth <= 0 || t < 0.4) {
                    return [pick(leafD), pick(leafS)]
                }
                if (t < 0.65) {
                    return genArr(depth)
                }
                return genObj(depth)
            }
            let genArr = (depth) => {
                let nd = Math.floor(rnd() * 4)
                let ns = Math.floor(rnd() * 4)
                let d = []
                let s = []
                for (let i = 0; i < Math.max(nd, ns); i++) {
                    let p = genPair(depth - 1)
                    if (i < nd) {
                        d.push(p[0])
                    }
                    if (i < ns) {
                        s.push(p[1])
                    }
                }
                return [d, s]
            }
            let genObj = (depth) => {
                let pairs = {}
                for (let k of keyPool) {
                    let inD = rnd() < 0.5
                    let inS = rnd() < 0.5
                    if (inD || inS) {
                        pairs[k] = { inD, inS, p: genPair(depth - 1) }
                    }
                }
                let d = {}
                let s = {}
                for (let k of shuffle(Object.keys(pairs))) {
                    if (pairs[k].inD) {
                        setOwn(d, k, pairs[k].p[0])
                    }
                }
                for (let k of shuffle(Object.keys(pairs))) {
                    if (pairs[k].inS) {
                        setOwn(s, k, pairs[k].p[1])
                    }
                }
                return [d, s]
            }
            let genLtdt = () => {
                let n = 1 + Math.floor(rnd() * 3)
                let a = []
                let b = []
                for (let i = 0; i < n; i++) {
                    let p = rnd() < 0.75 ? genObj(3) : genArr(3)
                    a.push(p[0])
                    b.push(p[1])
                }
                return [a, b]
            }

            let trees = Array.from({ length: 400 }, () => genLtdt())

            it(`should equal the legacy lodash merge on 400 random ltdt pairs`, function() {
                let bad = []
                for (let i = 0; i < trees.length; i++) {
                    let [a, b] = trees[i]
                    try {
                        same(ltdtmerge(a, b), legacy(a, b))
                    }
                    catch (err) {
                        bad.push({ i })
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should not modify the inputs and share no container with them on the same 400 pairs`, function() {
                let bad = []
                for (let i = 0; i < trees.length; i++) {
                    let [a, b] = trees[i]
                    let a0 = structuredClone(a)
                    let b0 = structuredClone(b)
                    try {
                        let r = ltdtmerge(a, b)
                        same(a, a0)
                        same(b, b0)
                        assertNoSharedContainer(r, a, b)
                    }
                    catch (err) {
                        bad.push({ i })
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should be idempotent (independent of lodash): merging a result with itself changes nothing`, function() {
                let bad = []
                for (let i = 0; i < trees.length; i++) {
                    let [a, b] = trees[i]
                    let r = ltdtmerge(a, b)
                    try {
                        same(ltdtmerge(r, r), r)
                    }
                    catch (err) {
                        bad.push({ i })
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

        })

        describe(`合併語意(逐項明確期望值, 與修前相同者並以lodash merge對照)`, function() {

            let cases = [
                ['來源值為undefined時保留目的端既有值', [{ a: 1, b: { c: 2 } }], [{ a: undefined, b: { c: undefined } }], [{ a: 1, b: { c: 2 } }]],
                ['來源值為undefined而目的端無該鍵時設為undefined(自有鍵)', [{}], [{ a: undefined }], [{ a: undefined }]],
                ['來源值為undefined且目的端有該鍵為undefined', [{ a: undefined }], [{ a: undefined }], [{ a: undefined }]],
                ['來源值為null覆蓋目的端物件', [{ a: { b: 1 } }], [{ a: null }], [{ a: null }]],
                ['來源值為原始值覆蓋目的端物件', [{ a: { b: 1 } }], [{ a: 's' }], [{ a: 's' }]],
                ['來源值為物件覆蓋目的端原始值', [{ a: 1 }], [{ a: { b: 2 } }], [{ a: { b: 2 } }]],
                ['來源值為物件覆蓋目的端null', [{ a: null }], [{ a: { b: 2 } }], [{ a: { b: 2 } }]],
                ['來源值為陣列覆蓋目的端原始值', [{ a: 1 }], [{ a: [1, 2] }], [{ a: [1, 2] }]],
                ['陣列依索引合併(來源較短保留目的端尾端)', [{ x: [1, 2, 3] }], [{ x: [9] }], [{ x: [9, 2, 3] }]],
                ['陣列依索引合併(來源較長補尾端)', [{ x: [1] }], [{ x: [1, 2, 3] }], [{ x: [1, 2, 3] }]],
                ['陣列元素為物件則逐一合併', [{ x: [{ a: 1 }, { b: 2 }] }], [{ x: [{ c: 3 }] }], [{ x: [{ a: 1, c: 3 }, { b: 2 }] }]],
                ['陣列元素來源為undefined保留目的端', [{ x: [1, 2] }], [{ x: [undefined, 5] }], [{ x: [1, 5] }]],
                ['陣列元素來源為undefined而目的端無該索引時補undefined', [{ x: [] }], [{ x: [undefined, 5] }], [{ x: [undefined, 5] }]],
                ['陣列元素來源為null覆蓋', [{ x: [1, 2] }], [{ x: [null] }], [{ x: [null, 2] }]],
                ['鍵順序: 目的端鍵在前、來源新鍵依來源順序追加', [{ a: 1, b: 2 }], [{ c: 3, a: 9 }], [{ a: 9, b: 2, c: 3 }]],
                ['最外層元素為陣列', [[1, 2, 3]], [[9]], [[9, 2, 3]]],
                ['最外層來源元素為undefined時保留目的端元素', [{ a: 1 }, { b: { c: 2 } }], [undefined, { b: { d: 3 } }], [{ a: 1 }, { b: { c: 2, d: 3 } }]],
                ['最外層來源元素為洞(稀疏陣列)時保留目的端元素', [{ a: 1 }, { b: 2 }], (() => {
                    let sp = []
                    sp[1] = { c: 3 }
                    return sp
                })(), [{ a: 1 }, { b: 2, c: 3 }]],
                ['最外層目的端元素為undefined時採來源元素', [undefined, { b: 2 }], [{ a: 1 }, { c: 3 }], [{ a: 1 }, { b: 2, c: 3 }]],
                ['空物件併空物件', [{}], [{}], [{}]],
                ['目的端元素為空物件併來源端有欄位', [{}, {}], [{ a: 1 }, { b: [1] }], [{ a: 1 }, { b: [1] }]],
                ['數字鍵與一般鍵', [{ 0: 'a', 10: 'b' }], [{ 10: 'B', 2: 'c' }], [{ 0: 'a', 2: 'c', 10: 'B' }]],
                ['來源鍵為toString、hasOwnProperty、constructor(原始值)', [{}], [{ toString: 1, hasOwnProperty: 2, constructor: 3 }], [{ toString: 1, hasOwnProperty: 2, constructor: 3 }]],
                ['來源鍵為toString(物件值)', [{}], [{ toString: { a: 1 } }], [{ toString: { a: 1 } }]],
            ]
            for (let [name, a, b, e] of cases) {
                it(`should merge: ${name}`, function() {
                    let r = ltdtmerge(a, b)
                    same(r, e)
                    //與修前相同者(種類一致之一般資料)亦以lodash merge對照
                    same(r, legacy(a, b))
                })
            }

            it(`should keep the destination Date (same reference, not copied) when the source value is undefined, and take the source Date otherwise`, function() {
                let a = [{ d: new Date(100), e: new Date(200) }]
                let b = [{ d: undefined, e: new Date(300) }]
                let r = ltdtmerge(a, b)
                assert.ok(r[0].d instanceof Date)
                assert.strict.strictEqual(r[0].d.getTime(), 100)
                assert.ok(r[0].d === a[0].d) //非純物件取參照(外審 opus F3), 不複製
                assert.strict.strictEqual(r[0].e.getTime(), 300)
                assert.strict.strictEqual(a[0].d.getTime(), 100)
            })

            it(`should include the inherited enumerable keys of the source (same as lodash keysIn)`, function() {
                let proto = { inh: 1 }
                let s = Object.create(proto)
                s.own = 2
                let r = ltdtmerge([{}], [s])
                assert.strict.deepStrictEqual(Object.keys(r[0]), ['own', 'inh'])
                same(r, legacy([{}], [s]))
            })

            it(`should handle objects without a prototype on both sides`, function() {
                let d = Object.create(null)
                d.a = 1
                d.n = { p: 1 }
                let s = Object.create(null)
                s.b = 2
                s.n = Object.create(null)
                s.n.q = 2
                let r = ltdtmerge([d], [s])
                assert.strict.deepStrictEqual(Object.keys(r[0]), ['a', 'n', 'b'])
                assert.strict.deepStrictEqual(Object.keys(r[0].n), ['p', 'q'])
                assert.strict.strictEqual(r[0].a, 1)
                assert.strict.strictEqual(r[0].b, 2)
                assert.strict.strictEqual(r[0].n.p, 1)
                assert.strict.strictEqual(r[0].n.q, 2)
            })

            it(`should treat a Symbol.toStringTag Array look-alike source value as a plain object (own keys, length an ordinary key), and assign a Map as is`, function() {
                //length 只用小值(失敗時斷言差異輸出會逐鍵展開); lodash isPlainObject 以原生標籤判定(忽略Symbol.toStringTag), 偽稱Array之純物件依自有鍵合併成新物件, 不依其length迭代
                let fake = { [Symbol.toStringTag]: 'Array', length: 2, 0: 'a', 1: 'b' }
                let mp = new Map([['k', 1]])
                let r = ltdtmerge([{ x: [1, 2, 3], y: { z: 1 } }], [{ x: fake, y: mp }])
                assert.ok(r[0].x !== fake)
                assert.ok(!Array.isArray(r[0].x))
                assert.strict.deepStrictEqual(Object.keys(r[0].x), ['0', '1', 'length'])
                assert.strict.strictEqual(r[0].x.length, 2)
                assert.strict.strictEqual(r[0].x[1], 'b')
                assert.ok(r[0].y === mp)
                assert.strict.strictEqual(fake.length, 2)
            })

            it(`should not mutate or share containers inherited through the destination prototype (even frozen ones); inherited values are not merged`, function() {
                //外審 sol F2: cloneDeep保留原型, 讀到之繼承容器仍指向呼叫端輸入; 現只讀自有鍵之值, 繼承值以自有屬性遮蔽
                let protoX = Object.freeze({ a: 1 })
                let protoY = Object.freeze([1])
                let input = Object.create({ x: protoX, y: protoY })
                let r = ltdtmerge([input], [{ x: { b: 2 }, y: [2] }])
                assert.strict.deepStrictEqual(Object.keys(r[0]), ['x', 'y'])
                assert.strict.deepStrictEqual(r[0].x, { b: 2 })
                assert.strict.deepStrictEqual(r[0].y, [2])
                assert.ok(r[0].x !== protoX && r[0].y !== protoY)
                assert.strict.deepStrictEqual(protoX, { a: 1 })
                assert.strict.deepStrictEqual(protoY, [1])
            })

            it(`should merge a top-level source row of any object type (Date, Map) by its own enumerable keys, like lodash merge`, function() {
                //外審 sol F4
                let d = Object.assign(new Date(0), { a: 1 })
                let m = Object.assign(new Map(), { a: 1 })
                let r = ltdtmerge([{}, {}], [d, m])
                assert.strict.deepStrictEqual(r, [{ a: 1 }, { a: 1 }])
                let rl = [{}, {}].map((v, k) => merge(v, [d, m][k]))
                assert.strict.deepStrictEqual(rl, [{ a: 1 }, { a: 1 }])
            })

            it(`should treat a plain object as plain even when its non-writable Symbol.toStringTag claims another type`, function() {
                //外審 sol F5: lodash isPlainObject 無法暫時遮蔽不可寫標籤; 純物件判定以原型為準
                let s = Object.freeze({ a: 2, [Symbol.toStringTag]: 'Array' })
                let r = ltdtmerge([{ x: { keep: 1 } }], [{ x: s }])
                assert.strict.deepStrictEqual(Object.keys(r[0].x), ['keep', 'a'])
                assert.ok(r[0].x !== s)
                let w = { a: 2, [Symbol.toStringTag]: 'Array' }
                let r2 = ltdtmerge([{ x: { keep: 1 } }], [{ x: w }])
                assert.strict.deepStrictEqual(Object.keys(r2[0].x), ['keep', 'a'])
            })

            it(`should not copy own Symbol keys of the source (lodash keysIn lists string keys only)`, function() {
                //外審 sol F11
                let sym = Symbol('z')
                let r = ltdtmerge([{ n: {} }], [{ a: 1, [sym]: 2, n: { b: 3, [sym]: 4 } }])
                assert.strict.deepStrictEqual(Object.getOwnPropertySymbols(r[0]), [])
                assert.strict.deepStrictEqual(Object.getOwnPropertySymbols(r[0].n), [])
                assert.strict.deepStrictEqual(r, [{ a: 1, n: { b: 3 } }])
            })

            it(`should copy a typed array source value instead of sharing the reference (lodash clones typed arrays)`, function() {
                let u = new Uint8Array([1, 2])
                let r = ltdtmerge([{}], [{ u }])
                assert.ok(r[0].u instanceof Uint8Array)
                assert.ok(r[0].u !== u)
                assert.strict.deepStrictEqual(Array.from(r[0].u), [1, 2])
                u[0] = 9
                assert.strict.strictEqual(r[0].u[0], 1)
            })

            describe(`目的端只複製陣列與純物件, 其餘值取參照(外審 opus F3、F8)`, function() {

                it(`should keep the identity of non-plain destination values the source does not touch (class instance with a private field, function, Map, Set, Date, typed array, ArrayBuffer)`, function() {
                    class P {
                        #v = 42
                        get v() {
                            return this.#v
                        }
                    }
                    let p = new P()
                    let fn = () => 1
                    let mp = new Map([['k', 1]])
                    let st = new Set([1])
                    let dt = new Date(5)
                    let u8 = new Uint8Array([1, 2])
                    let ab = new ArrayBuffer(3)
                    let r = ltdtmerge([{ p, fn, mp, st, dt, u8, ab, keep: { a: 1 } }], [{ q: 1 }])
                    assert.ok(r[0].p === p && r[0].fn === fn && r[0].mp === mp && r[0].st === st && r[0].dt === dt && r[0].u8 === u8 && r[0].ab === ab)
                    assert.strict.strictEqual(r[0].p.v, 42)
                    assert.strict.strictEqual(r[0].fn(), 1)
                    assert.strict.strictEqual(r[0].q, 1)
                    assert.ok(r[0].keep !== undefined)
                })

                it(`should preserve the holes of destination arrays`, function() {
                    let arr = ['a']
                    arr[2] = 'c'
                    let r = ltdtmerge([{ arr, nest: [[1, , 3]] }], [{ z: 1 }]) // eslint-disable-line no-sparse-arrays
                    assert.strict.strictEqual(r[0].arr.length, 3)
                    assert.ok(!(1 in r[0].arr))
                    assert.ok(!(1 in r[0].nest[0]))
                    assert.ok(r[0].arr !== arr && r[0].nest !== undefined)
                })

                it(`should copy a class-instance row into a new object with the same prototype and own fields, and leave the input instance untouched`, function() {
                    class Row {
                        constructor() {
                            this.id = 1
                        }

                        hello() {
                            return 'hi'
                        }
                    }
                    let row = new Row()
                    let r = ltdtmerge([row], [{ extra: 2 }])
                    assert.ok(r[0] !== row)
                    assert.ok(r[0] instanceof Row)
                    assert.strict.strictEqual(r[0].hello(), 'hi')
                    assert.strict.deepStrictEqual(Object.keys(r[0]), ['id', 'extra'])
                    assert.strict.deepStrictEqual(Object.keys(row), ['id'])
                })

                it(`should replace a non-plain destination value (Date, Map) by a new plain object when a plain source is merged into it, without mutating the input value`, function() {
                    let dt = new Date(0)
                    let mp = new Map()
                    let r = ltdtmerge([{ d: dt, m: mp }], [{ d: { a: 1 }, m: { b: 2 } }])
                    assert.strict.deepStrictEqual(r, [{ d: { a: 1 }, m: { b: 2 } }])
                    assert.strict.deepStrictEqual(Object.keys(dt), [])
                    assert.strict.deepStrictEqual(Object.keys(mp), [])
                })

                it(`should keep rows that share a sub-object independent of each other and leave the shared input untouched`, function() {
                    let shared = { p: 1 }
                    let r = ltdtmerge([{ s: shared }, { s: shared }], [{ s: { q: 1 } }, { s: { r: 2 } }])
                    assert.strict.deepStrictEqual(r, [{ s: { p: 1, q: 1 } }, { s: { p: 1, r: 2 } }])
                    assert.strict.deepStrictEqual(shared, { p: 1 })
                })

                it(`should keep a cyclic destination cyclic (no stack overflow, a copy of the cycle)`, function() {
                    let o = { a: 1 }
                    o.self = o
                    let r = ltdtmerge([o], [{ b: 2 }])
                    assert.ok(r[0] !== o)
                    assert.ok(r[0].self === r[0])
                    assert.strict.strictEqual(r[0].b, 2)
                    assert.ok(o.self === o && !('b' in o))
                })

            })

            it(`should ignore a top-level source row that is neither an array nor an object (keep the destination row), like lodash merge`, function() {
                let r = ltdtmerge([{ a: 1 }, { b: 2 }, { c: 3 }, [4]], [5, 'x', undefined, null])
                assert.strict.deepStrictEqual(r, [{ a: 1 }, { b: 2 }, { c: 3 }, [4]])
                //對照lodash(原始值5與undefined來源被忽略; 字串來源lodash會依索引字元併入, 屬陣列樣迭代, 本函數一律忽略)
                let rl = [{ a: 1 }, { c: 3 }].map((v, k) => merge(v, [5, undefined][k]))
                assert.strict.deepStrictEqual(rl, [{ a: 1 }, { c: 3 }])
            })

            it(`should merge a top-level source row that has a non-Object prototype by its enumerable keys (like lodash keysIn), but assign such a nested value as is`, function() {
                let proto = { inh: 1 }
                let row = Object.create(proto)
                row.own = 2
                let r = ltdtmerge([{ a: 0 }], [row])
                assert.strict.deepStrictEqual(Object.keys(r[0]), ['a', 'own', 'inh'])
                let r2 = ltdtmerge([{ a: 0 }], [{ n: row }])
                assert.ok(r2[0].n === row)
            })

            it(`should keep a sparse source array hole as a missing source value`, function() {
                let sp = []
                sp[1] = 5
                let r = ltdtmerge([{ x: [1, 2, 3] }], [{ x: sp }])
                same(r, [{ x: [1, 5, 3] }])
                let r2 = ltdtmerge([{ x: [] }], [{ x: sp }])
                assert.strict.strictEqual(r2[0].x.length, 2)
                assert.ok(0 in r2[0].x)
                assert.strict.strictEqual(r2[0].x[0], undefined)
                assert.strict.strictEqual(r2[0].x[1], 5)
            })

        })

        describe(`輸入檢查`, function() {

            it(`should return [] when the lengths differ`, function() {
                assert.strict.deepStrictEqual(ltdtmerge([{ a: 1 }], [{ b: 1 }, { c: 2 }]), [])
                assert.strict.deepStrictEqual(ltdtmerge([{ a: 1 }, { c: 2 }], [{ b: 1 }]), [])
            })

            it(`should return [] for two empty arrays`, function() {
                assert.strict.deepStrictEqual(ltdtmerge([], []), [])
            })

            it(`should return [] for array-like objects instead of arrays`, function() {
                assert.strict.deepStrictEqual(ltdtmerge({ length: 1, 0: { a: 1 } }, [{ b: 1 }]), [])
                assert.strict.deepStrictEqual(ltdtmerge([{ a: 1 }], { length: 1, 0: { b: 1 } }), [])
            })

            it(`should return [] for a non-array that claims to be an Array by Symbol.toStringTag`, function() {
                let fake = { [Symbol.toStringTag]: 'Array', length: 1, 0: { a: 1 } }
                assert.strict.deepStrictEqual(ltdtmerge(fake, [{ b: 1 }]), [])
                assert.strict.deepStrictEqual(ltdtmerge([{ b: 1 }], fake), [])
            })

        })

        describe(`特殊鍵與循環參照`, function() {

            it(`should define an own __proto__ key (JSON.parse) without polluting Object.prototype`, function() {
                try {
                    let s = JSON.parse('{"__proto__":{"polluted":"yes"},"b":1}')
                    let r = ltdtmerge([{ a: 1 }], [s])
                    assert.strict.strictEqual(Object.getPrototypeOf(r[0]), Object.prototype)
                    assert.ok(Object.prototype.hasOwnProperty.call(r[0], '__proto__'))
                    let v = Object.getOwnPropertyDescriptor(r[0], '__proto__').value
                    assert.strict.deepStrictEqual(v, { polluted: 'yes' })
                    assert.ok(v !== Object.getOwnPropertyDescriptor(s, '__proto__').value)
                    assert.strict.strictEqual(r[0].polluted, undefined)
                    assert.strict.strictEqual(({}).polluted, undefined)
                    assert.strict.strictEqual(Object.prototype.polluted, undefined)
                    assert.strict.deepStrictEqual(Object.keys(r[0]), ['a', '__proto__', 'b'])
                }
                finally {
                    delete Object.prototype.polluted
                }
            })

            it(`should define an own __proto__ key nested inside objects and array elements`, function() {
                try {
                    let b = JSON.parse('[{"x":{"__proto__":{"polluted":"yes"}},"l":[{"__proto__":{"polluted":"yes"}}]}]')
                    let r = ltdtmerge([{ x: {}, l: [{}] }], b)
                    assert.strict.strictEqual(Object.getPrototypeOf(r[0].x), Object.prototype)
                    assert.strict.deepStrictEqual(Object.getOwnPropertyDescriptor(r[0].x, '__proto__').value, { polluted: 'yes' })
                    assert.strict.deepStrictEqual(Object.getOwnPropertyDescriptor(r[0].l[0], '__proto__').value, { polluted: 'yes' })
                    assert.strict.strictEqual(({}).polluted, undefined)
                }
                finally {
                    delete Object.prototype.polluted
                }
            })

            it(`should merge own __proto__ keys of both sides as ordinary data without touching the prototype`, function() {
                try {
                    let a = JSON.parse('[{"__proto__":{"p":1}}]')
                    let b = JSON.parse('[{"__proto__":{"q":2}}]')
                    let r = ltdtmerge(a, b)
                    assert.strict.strictEqual(Object.getPrototypeOf(r[0]), Object.prototype)
                    assert.strict.deepStrictEqual(Object.getOwnPropertyDescriptor(r[0], '__proto__').value, { p: 1, q: 2 })
                    assert.strict.strictEqual(({}).p, undefined)
                    assert.strict.strictEqual(({}).q, undefined)
                    //輸入不變
                    assert.strict.deepStrictEqual(Object.getOwnPropertyDescriptor(a[0], '__proto__').value, { p: 1 })
                    assert.strict.deepStrictEqual(Object.getOwnPropertyDescriptor(b[0], '__proto__').value, { q: 2 })
                }
                finally {
                    delete Object.prototype.p
                    delete Object.prototype.q
                }
            })

            it(`should not pollute Object.prototype through a constructor.prototype path`, function() {
                try {
                    let b = JSON.parse('[{"constructor":{"prototype":{"polluted":"yes"}}}]')
                    let r = ltdtmerge([{}], b)
                    assert.strict.strictEqual(({}).polluted, undefined)
                    assert.strict.strictEqual(Object.prototype.polluted, undefined)
                    assert.ok(Object.prototype.hasOwnProperty.call(r[0], 'constructor'))
                    assert.strict.deepStrictEqual(r[0].constructor, { prototype: { polluted: 'yes' } })
                    assert.strict.strictEqual(r[0].constructor.prototype.polluted, 'yes')
                }
                finally {
                    delete Object.prototype.polluted
                }
            })

            it(`should not pollute Object.prototype through a nested constructor.prototype path`, function() {
                try {
                    let b = JSON.parse('[{"x":{"constructor":{"prototype":{"polluted":"yes"}}}}]')
                    let r = ltdtmerge([{ x: {} }], b)
                    assert.strict.strictEqual(({}).polluted, undefined)
                    assert.strict.strictEqual(Object.prototype.polluted, undefined)
                    assert.ok(Object.prototype.hasOwnProperty.call(r[0].x, 'constructor'))
                    assert.strict.strictEqual(r[0].x.constructor.prototype.polluted, 'yes')
                }
                finally {
                    delete Object.prototype.polluted
                }
            })

            it(`should never merge into an inherited constructor function (even one that reports itself as [object Object])`, function() {
                //constructor 為函數時視為不存在(同lodash safeGet): 函數可令toString標籤為Object而被誤當純物件, 其屬性不得被寫入
                let C = function() {}
                C[Symbol.toStringTag] = 'Object'
                let proto = { constructor: C }
                let d = Object.create(proto)
                d.a = 1
                let r = ltdtmerge([d], [{ constructor: { extra: 1 } }])
                assert.strict.strictEqual(C.extra, undefined)
                assert.strict.strictEqual(proto.constructor, C)
                assert.ok(Object.prototype.hasOwnProperty.call(r[0], 'constructor'))
                assert.strict.deepStrictEqual(r[0].constructor, { extra: 1 })
                assert.strict.strictEqual(r[0].a, 1)
            })

            it(`should merge into an own constructor object of the destination`, function() {
                let a = JSON.parse('[{"constructor":{"prototype":{"p":1}}}]')
                let b = JSON.parse('[{"constructor":{"prototype":{"q":2}}}]')
                let r = ltdtmerge(a, b)
                assert.strict.deepStrictEqual(r[0].constructor, { prototype: { p: 1, q: 2 } })
                assert.strict.strictEqual(({}).q, undefined)
            })

            it(`should handle a cyclic source object (self reference) without overflowing the stack`, function() {
                let s = { a: 1 }
                s.self = s
                let r = ltdtmerge([{ b: 2 }], [s])
                assert.strict.strictEqual(r[0].a, 1)
                assert.strict.strictEqual(r[0].b, 2)
                assert.ok(r[0].self === r[0])
                assert.ok(r[0] !== s)
            })

            it(`should handle a cyclic source reaching an inner ancestor`, function() {
                let s = { p: { q: {} } }
                s.p.q.back = s.p
                let r = ltdtmerge([{ p: { z: 1 } }], [s])
                assert.strict.strictEqual(r[0].p.z, 1)
                assert.ok(r[0].p.q.back === r[0].p)
                assert.ok(r[0].p !== s.p)
            })

            it(`should handle a cyclic source array`, function() {
                let arr = [1]
                arr.push(arr)
                let r = ltdtmerge([{ x: [] }], [{ x: arr }])
                assert.strict.strictEqual(r[0].x[0], 1)
                assert.ok(r[0].x[1] === r[0].x)
                assert.ok(r[0].x !== arr)
            })

            it(`should copy a shared (acyclic) source sub-object into separate result objects`, function() {
                let shared = { z: [1] }
                let s = { p: shared, q: shared }
                let r = ltdtmerge([{}], [s])
                assert.strict.deepStrictEqual(r, [{ p: { z: [1] }, q: { z: [1] } }])
                assert.ok(r[0].p !== r[0].q)
                assert.ok(r[0].p !== shared && r[0].q !== shared)
                assert.ok(r[0].p.z !== r[0].q.z)
            })

        })

        describe(`極大length於限額子行程: 時間與記憶體只依實際鍵數`, function() {

            let runner = join(__dirname, 'tools', 'objIterG4Runner.mjs')
            let MAX = Number.MAX_SAFE_INTEGER
            //limit 64MB: 修前之實作對陣列設定length>=5e6之稀疏陣列後序列化即耗盡堆積, 或拋RangeError(離開碼非0)
            let lens = [1e8, MAX, 4294967295, 4294967296]
            let variants = {
                dArrSObj: { name: '目的端陣列、來源端{length:N}', exp: (n) => [{ x: { length: n } }] },
                dObjSArr: { name: '目的端{length:N}、來源端陣列', exp: () => [{ x: ['a'] }] },
                dEmptyArrSObj: { name: '目的端空陣列、來源端{length:N}', exp: (n) => [{ x: { length: n } }] },
                both: { name: '兩端皆物件帶length:N', exp: (n) => [{ x: { length: n, a: 1, b: 2 } }] },
                top: { name: '最外層元素帶length:N', exp: (n) => [{ length: n, a: 1, b: 2 }] },
                deep: { name: '巢狀陣列與物件內, 目的端{length:N}、來源端陣列', exp: () => [{ p: [{ q: ['z'] }] }] },
            }
            for (let v of Object.keys(variants)) {
                for (let len of lens) {
                    it(`should finish within 1000 ms and 4 MB of heap: ${variants[v].name}, N=${len}`, function() {
                        let rc = runChildCase(runner, `ltdtmerge:${v}:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 30000 })
                        assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                        assert.ok(rc.r !== null, 'no result line')
                        assert.strict.deepStrictEqual(rc.r.out, variants[v].exp(len))
                        assert.ok(rc.r.ms < 1000, `ms=${rc.r.ms}`)
                        assert.ok(rc.r.heapMB < 4, `heapMB=${rc.r.heapMB}`)
                    })
                }
            }

        })

    })

})
