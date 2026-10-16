import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import map from 'lodash-es/map.js'
import each from 'lodash-es/each.js'
import zipObject from 'lodash-es/zipObject.js'
import keysmat2ltdt from '../src/keysmat2ltdt.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`keysmat2ltdt`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        keys: ['a', 'b'],
        mdata: [[12, 34.56], ['123', 'xyz']],
        out: [{ a: 12, b: 34.56 }, { a: '123', b: 'xyz' }]
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].mdata)}`, function() {
        let r = keysmat2ltdt(o[k].keys, o[k].mdata)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        keys: ['a', 'b'],
        mdata: [12, 34.56],
        out: []
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].keys)}, ${JSON.stringify(o[k].mdata)}`, function() {
        let r = keysmat2ltdt(o[k].keys, o[k].mdata)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ['a', 'b'], ''`, function() {
        let r = keysmat2ltdt(['a', 'b'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ['a', 'b'], []`, function() {
        let r = keysmat2ltdt(['a', 'b'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ['a', 'b'], {}`, function() {
        let r = keysmat2ltdt(['a', 'b'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ['a', 'b'], null`, function() {
        let r = keysmat2ltdt(['a', 'b'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ['a', 'b'], undefined`, function() {
        let r = keysmat2ltdt(['a', 'b'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input ''`, function() {
        let r = keysmat2ltdt('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input []`, function() {
        let r = keysmat2ltdt([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input {}`, function() {
        let r = keysmat2ltdt({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input null`, function() {
        let r = keysmat2ltdt(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input undefined`, function() {
        let r = keysmat2ltdt(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return [] when input NaN`, function() {
        let r = keysmat2ltdt(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input valid keys and mat with returnWithStateAndMsg`, function() {
        //opt為第3參數, 因第1、2參數keys與mat為既有參數
        let r = keysmat2ltdt(['a', 'b'], [[1, 2]], { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: [{ a: 1, b: 2 }] }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid keys' } when keys is invalid with returnWithStateAndMsg`, function() {
        let r = keysmat2ltdt(NaN, [[1, 2]], { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid keys' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid mat' } when mat is invalid with returnWithStateAndMsg`, function() {
        let r = keysmat2ltdt(['a', 'b'], NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid mat' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = keysmat2ltdt(['a', 'b'], [[1, 2]], { returnWithStateAndMsg: 'yes' })
        let rr = [{ a: 1, b: 2 }]
        assert.strict.deepStrictEqual(r, rr)
    })

    describe(`keysmat2ltdt 使用端物件之迭代(R-OBJ-ITER-01)`, function() {

        //以資料屬性設定自有鍵(含__proto__, 一般賦值會改原型)
        let setOwn = (o, k, v) => {
            Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
            return o
        }

        //獨立於實作之期望值: 依keys逐欄取列值(短於keys者為undefined), undefined改''
        let expected = (keys, mat) => {
            return mat.map((r) => {
                let o = {}
                keys.forEach((k, i) => {
                    setOwn(o, k, r[i] === undefined ? '' : r[i])
                })
                return o
            })
        }

        //修前之演算法(lodash each), 供差分
        let legacy = (keys, mat) => {
            return map(mat, function(r) {
                let o = zipObject(keys, r)
                each(o, function(v, k) {
                    if (v === undefined) {
                        o[k] = ''
                    }
                })
                return o
            })
        }

        //鍵順序與值皆比對(deepStrictEqual不比鍵順序, 但區分-0與0)
        let same = (r, e) => {
            assert.strict.deepStrictEqual(r, e)
            assert.strict.deepStrictEqual(r.map((o) => Object.keys(o)), e.map((o) => Object.keys(o)))
        }

        describe(`欄名為length且列值為非負整數時, 輸出列只含keys之欄`, function() {

            let cases = [
                ['length:2,a', ['length', 'a'], [[2, 'x']]],
                ['length:0,a', ['length', 'a'], [[0, 'x']]],
                ['length:1,a', ['length', 'a'], [[1, 'x']]],
                ['length:9,a 兩列', ['length', 'a'], [[9, 'x'], [3, 'y']]],
                ['a,length:2 鍵序在前', ['a', 'length'], [['x', 2]]],
                ['a,length,b 在中間', ['a', 'length', 'b'], [['x', 2, 'z']]],
                ['length 值各列不同(0、1、5、1000)', ['length', 'a'], [[0, 'x'], [1, 'y'], [5, 'z'], [1000, 'w']]],
                ['length 值為字串數字(非陣列樣, 對照)', ['length', 'a'], [['3', 'x']]],
                ['length 值為undefined(改為空字串)', ['length', 'a'], [[undefined, 'x']]],
                ['列短於keys: length 有值、其餘缺欄為空字串', ['length', 'a', 'b'], [[2, 'x']]],
                ['列短於keys: length 缺值亦為空字串', ['a', 'length'], [['x']]],
                ['列元素為undefined仍轉空字串', ['length', 'a', 'b'], [[2, undefined, 'z']]],
                ['length:0 時其餘欄缺值仍轉空字串(修前依length=0不迭代而留undefined)', ['length', 'a'], [[0]]],
                ['length:0 時其餘欄為undefined仍轉空字串', ['length', 'a'], [[0, undefined]]],
            ]
            for (let [name, keys, mat] of cases) {
                it(`should keep exactly the keys of ${name}`, function() {
                    let r = keysmat2ltdt(keys, mat)
                    same(r, expected(keys, mat))
                })
            }

            it(`should return [{ length: 2, a: 'x' }] for keys ['length','a'] and mat [[2,'x']] (no index keys 0 and 1)`, function() {
                let r = keysmat2ltdt(['length', 'a'], [[2, 'x']])
                assert.strict.deepStrictEqual(r, [{ length: 2, a: 'x' }])
                assert.strict.deepStrictEqual(Object.keys(r[0]), ['length', 'a'])
            })

            it(`should treat length as an ordinary key when the value is -0 (JSON.parse('-0'))`, function() {
                let mat = JSON.parse('[[-0,"x"]]')
                assert.ok(Object.is(mat[0][0], -0))
                let r = keysmat2ltdt(['length', 'a'], mat)
                assert.strict.deepStrictEqual(Object.keys(r[0]), ['length', 'a'])
                assert.ok(Object.is(r[0].length, -0))
                assert.strict.strictEqual(r[0].a, 'x')
                //另一欄缺值時仍須轉空字串(修前依length=-0不迭代而留undefined)
                let r2 = keysmat2ltdt(['length', 'a'], [[-0, undefined]])
                assert.ok(Object.is(r2[0].length, -0))
                assert.strict.strictEqual(r2[0].a, '')
            })

            it(`should treat length as an ordinary key via the returnWithStateAndMsg result`, function() {
                let r = keysmat2ltdt(['length', 'a'], [[2, 'x'], [1, undefined]], { returnWithStateAndMsg: true })
                assert.strict.deepStrictEqual(r, { state: 'success', msg: [{ length: 2, a: 'x' }, { length: 1, a: '' }] })
            })

            it(`should not touch the input mat and keys`, function() {
                let keys = ['length', 'a', 'b']
                let mat = [[2, 'x'], [1, undefined, 'z']]
                let k0 = JSON.stringify(keys)
                let m0 = JSON.stringify(mat, (k, v) => v === undefined ? '<undef>' : v)
                keysmat2ltdt(keys, mat)
                assert.strict.strictEqual(JSON.stringify(keys), k0)
                assert.strict.strictEqual(JSON.stringify(mat, (k, v) => v === undefined ? '<undef>' : v), m0)
                assert.strict.strictEqual(mat[1][1], undefined)
            })

        })

        describe(`無陣列樣length欄之輸入: 與修前演算法逐案相同(行為鎖定)`, function() {

            let seed = 20261017
            let rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648
                return seed / 2147483648
            }
            let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
            //欄名: 不含length(另以length欄之非陣列樣值案例對照)
            let keyPool = ['a', 'b', 'c', '0', '1', '10', 'constructor', 'toString', 'hasOwnProperty', 'x y', '中文', '__proto__']
            let vals = [12, 0, -0, -5, 1.5, 34.56, '123', 'xyz', '', true, false, null, undefined, NaN, Infinity, {}, [], { a: 1 }, [1, 2], new Date(0)]
            //length欄之值皆非陣列樣(非負整數以外): 修前亦以自有鍵迭代
            let lenVals = [-1, 1.5, '3', null, true, NaN, Infinity, {}, [], 'x', undefined, 2 ** 53, -Infinity]

            let gen = () => {
                let nk = 1 + Math.floor(rnd() * 5)
                let keys = []
                for (let i = 0; i < nk; i++) {
                    keys.push(pick(keyPool))
                }
                let withLen = rnd() < 0.4
                let lenIdx = -1
                if (withLen) {
                    lenIdx = Math.floor(rnd() * (keys.length + 1))
                    keys.splice(lenIdx, 0, 'length')
                }
                let nr = 1 + Math.floor(rnd() * 4)
                let mat = []
                for (let i = 0; i < nr; i++) {
                    let nc = Math.floor(rnd() * (keys.length + 2)) //可短於或長於keys
                    if (i === 0) {
                        nc = Math.max(nc, 2) //第1列需為有效陣列(isearr: 單一元素時不得為無效值)才不會被拒
                    }
                    let r = []
                    for (let j = 0; j < nc; j++) {
                        r.push(keys[j] === 'length' ? pick(lenVals) : pick(vals))
                    }
                    mat.push(r)
                }
                return { keys, mat }
            }

            let cases = Array.from({ length: 400 }, () => gen())

            it(`should equal the legacy algorithm on 400 random inputs (length column only with non-array-like values)`, function() {
                let bad = []
                for (let i = 0; i < cases.length; i++) {
                    let { keys, mat } = cases[i]
                    try {
                        same(keysmat2ltdt(keys, mat), legacy(keys, mat))
                    }
                    catch (err) {
                        bad.push({ i })
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should equal the independent expectation on the same inputs`, function() {
                let bad = []
                for (let i = 0; i < cases.length; i++) {
                    let { keys, mat } = cases[i]
                    try {
                        same(keysmat2ltdt(keys, mat), expected(keys, mat))
                    }
                    catch (err) {
                        bad.push({ i })
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should convert undefined cells to empty strings and keep other falsy values`, function() {
                let r = keysmat2ltdt(['a', 'b', 'c', 'd', 'e'], [[undefined, null, 0, false, '']])
                assert.strict.deepStrictEqual(r, [{ a: '', b: null, c: 0, d: false, e: '' }])
            })

            it(`should keep the own __proto__ key without changing the prototype`, function() {
                let r = keysmat2ltdt(['__proto__', 'a'], [[undefined, 'x'], [{ p: 1 }, 'y']])
                assert.strict.strictEqual(Object.getPrototypeOf(r[0]), Object.prototype)
                assert.strict.strictEqual(Object.getOwnPropertyDescriptor(r[0], '__proto__').value, '')
                assert.strict.strictEqual(Object.getPrototypeOf(r[1]), Object.prototype)
                assert.strict.deepStrictEqual(Object.getOwnPropertyDescriptor(r[1], '__proto__').value, { p: 1 })
                assert.strict.strictEqual(({}).p, undefined)
            })

        })

        describe(`極大length於限額子行程: 時間與記憶體只依實際鍵數`, function() {

            let runner = join(__dirname, 'tools', 'objIterG4Runner.mjs')
            let MAX = Number.MAX_SAFE_INTEGER
            //limit 64MB: 修前之實作對 length>=5e6 即耗盡堆積而崩潰, 離開碼 134
            let lens = [5e6, 1e8, MAX, 4294967295, 4294967296]
            for (let len of lens) {
                it(`should finish with a length column of ${len} within 1000 ms and 4 MB of heap, with no index key`, function() {
                    let rc = runChildCase(runner, `keysmat2ltdt:basic:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 30000 })
                    assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                    assert.ok(rc.r !== null, 'no result line')
                    assert.strict.deepStrictEqual(rc.r.out, [{ length: len, a: 'x' }, { length: len, a: 'y' }])
                    assert.ok(rc.r.ms < 1000, `ms=${rc.r.ms}`)
                    assert.ok(rc.r.heapMB < 4, `heapMB=${rc.r.heapMB}`)
                })
            }

        })

    })

})
