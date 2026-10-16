import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import each from 'lodash-es/each.js'
import replaceObj from '../src/replaceObj.mjs'
import replace from '../src/replace.mjs'
import isobj from '../src/isobj.mjs'
import isarr from '../src/isarr.mjs'
import isestr from '../src/isestr.mjs'
import iseobj from '../src/iseobj.mjs'
import cstr from '../src/cstr.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`replaceObj`, function() {

    it(`should return '1.20bc英文' when input '1.25abc中文', { '5a': '0', '中': '英' }`, function() {
        let r = replaceObj('1.25abc中文', { '5a': '0', '中': '英' })
        assert.strict.deepStrictEqual(r, '1.20bc英文')
    })

    it(`should return '1.20bc英文' when input '1.25abc中文', { '5a': '', '中': '英' }`, function() {
        let r = replaceObj('1.25abc中文', { '5a': '', '中': '英' })
        assert.strict.deepStrictEqual(r, '1.2bc英文')
    })

    it(`should return '1.20bc英文' when input '1.25abc中文', { '5a': null, '中': '英' }`, function() {
        let r = replaceObj('1.25abc中文', { '5a': null, '中': '英' })
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', ''`, function() {
        let r = replaceObj('1.25abc', '')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', []`, function() {
        let r = replaceObj('1.25abc', [])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', {}`, function() {
        let r = replaceObj('1.25abc', {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', null`, function() {
        let r = replaceObj('1.25abc', null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', undefined`, function() {
        let r = replaceObj('1.25abc', undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = replaceObj('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = replaceObj([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = replaceObj({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = replaceObj(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = replaceObj(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = replaceObj(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

    describe(`使用端物件之迭代(R-OBJ-ITER-01)`, function() {

        let c = 'abc x'

        //以資料屬性設定自有鍵(含__proto__, 一般賦值會改原型)
        let setOwn = (o, k, v) => {
            Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
            return o
        }

        //修前之演算法(lodash each迭代), 原樣複製, 供差分
        let legacyReplaceObj = (c, o) => {

            //check
            if (!isestr(c)) {
                return ''
            }
            if (!iseobj(o)) {
                return ''
            }

            //自動轉換
            each(o, function(v, k) {
                if (isobj(v) || isarr(v)) { //允許空字串
                    v = JSON.stringify(v)
                }
                else {
                    v = cstr(v)
                }
            })

            //replace
            each(o, function(v, k) {
                c = replace(c, k, v)
            })

            return c
        }

        //獨立於實作之期望值: 依自有可列舉字串鍵之順序逐一replaceAll, 空鍵或非字串值使結果為''
        let expected = (c, o) => {
            if (typeof c !== 'string' || c === '') {
                return ''
            }
            if (Object.prototype.toString.call(o) !== '[object Object]') {
                return ''
            }
            let has = false
            for (let k in o) { // eslint-disable-line no-unused-vars
                has = true
                break
            }
            if (!has) {
                return ''
            }
            for (let k of Object.keys(o)) {
                if (k === '' || typeof o[k] !== 'string') {
                    return ''
                }
                c = c.replaceAll(k, o[k])
            }
            return c
        }

        describe(`無陣列樣length鍵之字典: 與修前演算法及獨立期望值逐案相同(行為鎖定)`, function() {

            let seed = 20261017
            let rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648
                return seed / 2147483648
            }
            let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
            let cs = ['1.25abc中文', 'abc x', 'aaa', 'a.b.c', 'xax', 'length', 'lengthlength', '$&', ' ', 'x', 'ab', '', null, 12, undefined]
            let keyNames = ['a', 'b', 'x', '5a', '中', '.', '0', '1', 'length', 'constructor', 'toString', '__proto__', '']
            let vals = ['x', 'y', '', '0', 'AB', '$&', '$1', ' ', '中', 'a', 1, 0, null, undefined, true, {}, [], ['a'], { a: 1 }]
            //length值皆非陣列樣(非負整數以外): 修前亦以自有鍵迭代
            let lenVals = [-1, 1.5, -0.5, '3', 'x', 'y', 'LEN', null, true, NaN, Infinity, -Infinity, {}, [], undefined, 2 ** 53]

            let gen = () => {
                let o = {}
                let n = Math.floor(rnd() * 5)
                for (let i = 0; i < n; i++) {
                    let k = pick(keyNames)
                    setOwn(o, k, k === 'length' ? pick(lenVals) : pick(vals))
                }
                return o
            }

            let cases = Array.from({ length: 400 }, () => [pick(cs), gen()])

            it(`should equal the legacy algorithm on 400 random dictionaries without array-like length keys`, function() {
                let bad = []
                for (let i = 0; i < cases.length; i++) {
                    let [cc, o] = cases[i]
                    if (replaceObj(cc, o) !== legacyReplaceObj(cc, o)) {
                        bad.push(i)
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should equal the independent expectation on the same dictionaries`, function() {
                let bad = []
                let nonEmpty = 0
                for (let i = 0; i < cases.length; i++) {
                    let [cc, o] = cases[i]
                    let r = replaceObj(cc, o)
                    if (r !== expected(cc, o)) {
                        bad.push(i)
                    }
                    if (r !== '') {
                        nonEmpty++
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
                assert.ok(nonEmpty >= 20, `nonEmpty=${nonEmpty}`) //亂數案例須含足夠之實際取代結果, 避免全為空字串而空轉
            })

            it(`should keep the legacy result for string-like or non-integer length values (not array-like)`, function() {
                assert.strict.strictEqual(replaceObj(c, { length: '5', a: 'x' }), 'xbc x')
                assert.strict.strictEqual(replaceObj(c, { length: '0', a: 'x' }), 'xbc x')
                assert.strict.strictEqual(replaceObj(c, { length: 'length', a: 'x' }), 'xbc x')
                assert.strict.strictEqual(replaceObj(c, { a: 'x', length: 'b' }), 'xbc x')
                assert.strict.strictEqual(replaceObj('lengthabc', { length: 'L', a: 'x' }), 'Lxbc')
                assert.strict.strictEqual(replaceObj(c, { length: 1.5, a: 'x' }), '')
                assert.strict.strictEqual(replaceObj(c, { length: -1, a: 'x' }), '')
                assert.strict.strictEqual(replaceObj(c, { length: null, a: 'x' }), '')
                assert.strict.strictEqual(replaceObj(c, { length: 2 ** 53, a: 'x' }), '')
            })

            it(`should treat special keys as ordinary keys (constructor, toString, numeric keys, own __proto__)`, function() {
                assert.strict.strictEqual(replaceObj('constructor toString', { constructor: 'Z', toString: 'Y' }), 'Z Y')
                assert.strict.strictEqual(replaceObj('01', { 1: 'one', 0: 'zero' }), 'zeroone') //數字鍵依升冪走訪
                assert.strict.strictEqual(replaceObj('a__proto__b', JSON.parse('{"__proto__":"X"}')), 'aXb')
            })

            it(`should work on an object without prototype and a class instance`, function() {
                let np = Object.create(null)
                np.a = 'x'
                assert.strict.strictEqual(replaceObj(c, np), 'xbc x')
                class P {
                    constructor() {
                        this.a = 'x'
                    }
                }
                assert.strict.strictEqual(replaceObj(c, new P()), 'xbc x')
            })

        })

        describe(`物件帶陣列樣length鍵(非負整數)時, 一律當一般鍵依自有鍵取代: 數字值使結果為空字串`, function() {

            //[名稱, 取代字典, 預期結果]; 預期值為手算: replace要求值為字串, length值為數字非有效字串故為'', 同{n:1,a:'x'}
            let cases = [
                ['{length:0,a:x} (修前length為0而不迭代, 得原字串)', { length: 0, a: 'x' }, ''],
                ['{a:x,length:0} 鍵序在前', { a: 'x', length: 0 }, ''],
                ['{length:0} 僅length', { length: 0 }, ''],
                ['{length:1,a:x} (修前修後皆空字串, 行為鎖定)', { length: 1, a: 'x' }, ''],
                ['{length:2,a:x}', { length: 2, a: 'x' }, ''],
                ['{length:9,a:x,b:y}', { length: 9, a: 'x', b: 'y' }, ''],
                ['{length:2,0:a,1:b} 數字鍵與length並存', { length: 2, 0: 'a', 1: 'b' }, ''],
                ['{length:1000,a:x} 較大之length(行程內只用小值: 失敗時斷言差異輸出會逐鍵展開)', { length: 1000, a: 'x' }, ''],
                ['{n:1,a:x} 對照: 改名length為n(任何數字值皆使結果為空字串)', { n: 1, a: 'x' }, ''],
            ]
            for (let [name, o, rr] of cases) {
                it(`should return '' for ${name}`, function() {
                    assert.strict.strictEqual(replaceObj(c, o), rr)
                    assert.strict.strictEqual(expected(c, o), rr) //期望函數與手算值一致
                })
            }

            it(`should return '' when length is -0 from JSON (isLength(-0) is true: array-like before the fix)`, function() {
                let t = JSON.parse('{"length":-0,"a":"x"}')
                assert.ok(Object.is(t.length, -0))
                assert.strict.strictEqual(replaceObj(c, t), '')
                let t2 = JSON.parse('{"a":"x","length":-0}')
                assert.strict.strictEqual(replaceObj(c, t2), '')
            })

            it(`should replace by own keys when length is a getter on the prototype (not array-like iteration)`, function() {
                class G0 {
                    get length() {
                        return 0
                    }

                    constructor() {
                        this.a = 'x'
                    }
                }
                class G2 {
                    get length() {
                        return 2
                    }

                    constructor() {
                        this.a = 'x'
                    }
                }
                assert.strict.strictEqual(replaceObj(c, new G0()), 'xbc x') //修前length為0不迭代而得原字串
                assert.strict.strictEqual(replaceObj(c, new G2()), 'xbc x') //修前依索引迭代而得空字串
            })

            it(`should return '' for an object without prototype and a class instance whose own length is 0`, function() {
                let np = Object.create(null)
                np.a = 'x'
                np.length = 0
                assert.strict.strictEqual(replaceObj(c, np), '')
                class P {
                    constructor() {
                        this.a = 'x'
                        this.length = 0
                    }
                }
                assert.strict.strictEqual(replaceObj(c, new P()), '')
            })

            it(`should replace by own keys when the own length is not enumerable`, function() {
                let o = { a: 'x' }
                Object.defineProperty(o, 'length', { value: 3, enumerable: false })
                assert.strict.strictEqual(replaceObj(c, o), 'xbc x')
                let o0 = { a: 'x' }
                Object.defineProperty(o0, 'length', { value: 0, enumerable: false })
                assert.strict.strictEqual(replaceObj(c, o0), 'xbc x')
            })

            it(`should ignore an inherited length and inherited keys: own keys only`, function() {
                let o = Object.create({ x: 'Z', length: 1 })
                o.a = 'q'
                assert.strict.strictEqual(replaceObj(c, o), 'qbc x')
                let o2 = Object.create({ length: 2 })
                o2.x = 'Z'
                assert.strict.strictEqual(replaceObj(c, o2), 'abc Z')
            })

            it(`should visit every own key (each getter read at least once, at most twice) even with a large length value`, function() {
                let reads = { k0: 0, k1: 0, k2: 0 }
                let o = { length: 7 }
                for (let k of Object.keys(reads)) {
                    Object.defineProperty(o, k, {
                        get() {
                            reads[k]++
                            return 'v'
                        },
                        enumerable: true,
                        configurable: true
                    })
                }
                assert.strict.strictEqual(replaceObj(c, o), '')
                for (let k of Object.keys(reads)) {
                    assert.ok(reads[k] >= 1 && reads[k] <= 2, `${k} reads=${reads[k]}`)
                }
            })

            it(`should not modify the input nor add index keys`, function() {
                let o = { length: 2, a: 'x', n: { length: 1 }, 0: 'z' }
                let before = structuredClone(o)
                replaceObj(c, o)
                assert.strict.deepStrictEqual(o, before)
                assert.strict.deepStrictEqual(Object.keys(o), ['0', 'length', 'a', 'n'])
            })

            it(`should accept a frozen input`, function() {
                assert.strict.strictEqual(replaceObj(c, Object.freeze({ length: 0, a: 'x' })), '')
                assert.strict.strictEqual(replaceObj(c, Object.freeze({ length: '0', a: 'x' })), 'xbc x')
            })

            it(`should treat an object that only pretends to be an Array (Symbol.toStringTag) as no effective object, by neither its length nor its keys`, function() {
                let o = { [Symbol.toStringTag]: 'Array', length: 2, a: 'x' }
                assert.strict.strictEqual(replaceObj(c, o), '')
                assert.strict.strictEqual(legacyReplaceObj(c, o), '')
                let o0 = { [Symbol.toStringTag]: 'Array', length: 0, a: 'x' }
                assert.strict.strictEqual(replaceObj(c, o0), '')
                assert.strict.strictEqual(replaceObj(c, ['x']), '')
                assert.strict.strictEqual(replaceObj(c, 'abc'), '')
            })

        })

        describe(`自動轉換迴圈(對取代結果無作用之死碼)仍須求值: JSON.stringify對循環參照與BigInt巢狀值拋錯`, function() {

            it(`should throw TypeError for a circular value, as before the fix`, function() {
                let circ = { n: 1 }
                circ.self = circ
                assert.throws(() => legacyReplaceObj(c, { a: 'x', b: circ }), TypeError)
                assert.throws(() => replaceObj(c, { a: 'x', b: circ }), TypeError)
                assert.throws(() => replaceObj(c, { b: [circ] }), TypeError)
            })

            it(`should throw TypeError for a nested BigInt value, but not for a direct BigInt value`, function() {
                assert.throws(() => legacyReplaceObj(c, { a: { n: 1n } }), TypeError)
                assert.throws(() => replaceObj(c, { a: { n: 1n } }), TypeError)
                assert.strict.strictEqual(replaceObj(c, { a: 1n }), '')
            })

            it(`should evaluate the loop by own keys: a circular value is found even when length is 0 or 1 (array-like iteration skipped it before the fix)`, function() {
                let circ = { n: 1 }
                circ.self = circ
                assert.strict.strictEqual(legacyReplaceObj(c, { length: 0, a: circ }), c) //修前length為0不迭代而不拋錯
                assert.throws(() => replaceObj(c, { length: 0, a: circ }), TypeError)
                assert.throws(() => replaceObj(c, { length: 1, a: circ }), TypeError)
                assert.throws(() => replaceObj(c, { a: circ, length: 3 }), TypeError)
            })

            it(`should treat length as an ordinary key in the loop: a circular length value throws, an inherited circular value does not`, function() {
                let circ = { n: 1 }
                circ.self = circ
                assert.throws(() => replaceObj(c, { length: circ, a: 'x' }), TypeError)
                let o = Object.create({ b: circ })
                o.a = 'x'
                assert.strict.strictEqual(replaceObj(c, o), 'xbc x') //繼承之值不走訪
            })

            it(`should ignore symbol keys`, function() {
                let s = Symbol('s')
                assert.strict.strictEqual(replaceObj(c, { a: 'x', [s]: 'y' }), 'xbc x')
            })

        })

        describe(`極大length於限額子行程: 時間與記憶體只依實際鍵數`, function() {

            let runner = join(__dirname, 'tools', 'objIterG3Runner.mjs')
            let MAX = Number.MAX_SAFE_INTEGER
            //limit 64MB; 修前之實作對length極大為CPU無限迴圈(逾時被終止), 非記憶體耗盡
            let cases = [
                ['len', 1e8, ''],
                ['len', MAX, ''],
                ['len', 4294967295, ''],
                ['len', 4294967296, ''],
                ['len', 2 ** 53, ''], //超過isLength上限, 修前即以自有鍵迭代, 對照
                ['strlen', MAX, 'xbc x'], //length為字串, 修前即以自有鍵迭代, 對照
                ['tag', MAX, ''], //Symbol.toStringTag偽稱Array: iseobj為false, 對照
                ['proto', 1e8, 'xbc x'], //原型上之length getter
                ['proto', MAX, 'xbc x'],
                ['hidden', 4294967295, 'xbc x'], //不可列舉之自有length
                ['hidden', MAX, 'xbc x'],
                ['keys', MAX, ''], //length極大且另有100個自有鍵
            ]
            for (let [kind, len, rr] of cases) {
                it(`should finish ${kind}:${len} within 1000 ms and 4 MB of heap with result '${rr}'`, function() {
                    let rc = runChildCase(runner, `replaceObj:${kind}:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 20000 })
                    assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                    assert.ok(rc.r !== null, 'no result line')
                    let r = rc.r
                    assert.ok(!r.threw, `threw: ${r.msg}`)
                    assert.strict.strictEqual(r.result, rr)
                    assert.ok(r.ms < 1000, `ms=${r.ms}`)
                    assert.ok(r.heapMB < 4, `heapMB=${r.heapMB}`)
                    if (kind === 'keys') {
                        //100個自有鍵之getter皆被讀取(至少1次、至多2次), 次數與length無關
                        assert.strict.strictEqual(r.nReads, 100)
                        assert.ok(r.minReads >= 1 && r.maxReads <= 2, `minReads=${r.minReads} maxReads=${r.maxReads}`)
                    }
                })
            }

        })

    })

})
