import assert from 'assert'
import chkReadable from '../src/chkReadable.mjs'
import isobj from '../src/isobj.mjs'
import isarr from '../src/isarr.mjs'
import iseobj from '../src/iseobj.mjs'
import isearr from '../src/isearr.mjs'
import isfun from '../src/isfun.mjs'
import haskey from '../src/haskey.mjs'
import { boom, revoked, allTrapsThrow, partialProxy, withGetter, hostileValues } from './tools/hostileValues.mjs'


//chkReadable(可讀性探針, 排程第558項; 規則R-READABLE-01, sgud/rule/rulebook_readable.md)
//  規格依據: 排程第558項任務書(語意近C11驗證器: 可讀回'', 不可讀回固定原因字串, 永不拋錯, 不呼叫存取器與toJSON; 讀取範圍與判斷函數之內部讀取同源; 介面涵蓋w-dispatch-ai、w-converhp、w-orm-lowdb、w-orm-level、w-serv-webdata五庫之探針之需要)
//  期望值皆為手寫(依各選項之讀取範圍推得), 不由被測函數產生


const TAG = 'tag is unreadable'
const KEYS = 'keys are unreadable'
const KEY = 'key is unreadable'
const FUN = 'function type is unreadable'
const LEN = 'length is unreadable'
const BADLEN = 'length is not a non-negative safe integer'
const MANY = 'too many elements'
const ELEM = 'element is unreadable'
const PROP = 'property is unreadable'
const LARGE = 'structure is too large'


//opts, 選項組(名稱 → opt); 各敵意值於各選項下之期望見HOSTILE_EXP
const OPTS = {
    default: undefined,
    fun: { fun: true },
    has: { has: ['a'] },
    ownKeys: { ownKeys: true },
    first: { elements: 'first' },
    all: { elements: 'all' },
    deep: { deep: true },
}


//HOSTILE_EXP, test/tools/hostileValues.mjs之19個敵意值於各選項之期望: 預設'', 其餘列出之選項依表
const HOSTILE_EXP = {
    'object-proxy-ownKeys-throws': { ownKeys: KEYS, deep: KEYS },
    'object-proxy-getPrototypeOf-throws': { ownKeys: KEYS }, //deep: hasToJSON之getPrototypeOf拋錯被吞(視為無toJSON), 其後只讀自有鍵與描述子, 故可讀
    'object-proxy-getOwnPropertyDescriptor-throws': { ownKeys: KEYS, deep: PROP },
    'array-proxy-length-get-throws': { first: LEN, all: LEN, deep: LEN },
    'array-proxy-first-element-get-throws': { first: ELEM, all: ELEM, deep: ELEM },
}


describe('chkReadable', function() {

    describe('hostile values of test/tools/hostileValues.mjs × options (hand-written expectations)', function() {
        for (let h of hostileValues()) {
            for (let [on, opt] of Object.entries(OPTS)) {
                let exp = ''
                if (h.unjudgeable) {
                    exp = TAG //標籤讀取拋錯者於任何選項皆先回標籤不可讀(標籤為第一個讀取)
                }
                else if (HOSTILE_EXP[h.name] && HOSTILE_EXP[h.name][on] !== undefined) {
                    exp = HOSTILE_EXP[h.name][on]
                }
                it(`${h.name} with ${on}: ${JSON.stringify(exp)}`, function() {
                    // 不拋錯(C11: 永不拋錯); 結果為期望之固定原因字串
                    assert.strict.deepStrictEqual(chkReadable(h.value, opt), exp)
                })
            }
        }
    })

    it('default (no opt): unreadable ⇔ unjudgeable, same source as the judgement functions (isobj, isarr, isfun read the same tag)', function() {
        // 與判斷函數同源: 預設只讀內部標籤, 標籤不可讀者即為hostileValues之unjudgeable(任何判斷函數皆回false者)
        for (let h of hostileValues()) {
            let r = chkReadable(h.value)
            assert.strict.deepStrictEqual(r !== '', h.unjudgeable, h.name)
            if (h.unjudgeable) {
                assert.strict.deepStrictEqual([isobj(h.value), isarr(h.value), isfun(h.value)], [false, false, false], h.name)
            }
        }
    })

    describe('primitives and ordinary values are readable', function() {
        let prims = [undefined, null, 0, -0, NaN, Infinity, 1.5, '', 'abc', true, false, 10n, Symbol('s')]
        for (let p of prims) {
            for (let [on, opt] of Object.entries(OPTS)) {
                it(`${String(typeof p === 'symbol' ? 'Symbol()' : (typeof p === 'bigint' ? p + 'n' : (Object.is(p, -0) ? '-0' : JSON.stringify(p))))} with ${on}`, function() {
                    // 原始值無可讀取者, 一律''
                    assert.strict.deepStrictEqual(chkReadable(p, opt), '')
                })
            }
        }
        let ordinary = {
            'plain object': () => ({ a: 1 }),
            'empty object': () => ({}),
            'null-proto object': () => Object.create(null),
            'array': () => [1, 2, 3],
            'empty array': () => [],
            'sparse array': () => [1, , 3], // eslint-disable-line no-sparse-arrays
            'function': () => function() {},
            'arrow': () => () => 1,
            'class instance': () => new (class A {
                constructor() {
                    this.x = 1
                }
            })(),
            'Date': () => new Date(0),
            'Map': () => new Map([[1, 2]]),
            'Set': () => new Set([1]),
            'Uint8Array': () => new Uint8Array(4),
            'ArrayBuffer': () => new ArrayBuffer(4),
            'Error': () => new Error('x'),
            'RegExp': () => /a/g,
            'frozen object': () => Object.freeze({ a: [1, { b: 2 }] }),
            'boxed String': () => new String('a'), // eslint-disable-line no-new-wrappers
            'transparent Proxy of object': () => new Proxy({ a: 1 }, {}),
            'transparent Proxy of array': () => new Proxy([1, 2], {}),
            'transparent Proxy of function': () => new Proxy(function() {}, {}),
        }
        for (let [name, mk] of Object.entries(ordinary)) {
            for (let [on, opt] of Object.entries(OPTS)) {
                it(`${name} with ${on}`, function() {
                    assert.strict.deepStrictEqual(chkReadable(mk(), opt), '')
                })
            }
        }
    })

    describe('options are read safely (never throw; non-expected values are treated as not given)', function() {
        let v = { a: [1, { b: 2 }] }
        let bad = {
            'null': null,
            'string': 'deep',
            'number': 5,
            'true': true,
            'array': [],
            'function': function() {},
            'revoked Proxy': revoked({}),
            'all-traps-throw Proxy': new Proxy({}, allTrapsThrow()),
            'ownKeys-throws Proxy': partialProxy({}, ['ownKeys']),
            'getOwnPropertyDescriptor-throws Proxy': partialProxy({}, ['getOwnPropertyDescriptor']),
        }
        for (let [name, o] of Object.entries(bad)) {
            it(`opt ${name}: treated as {} (no throw)`, function() {
                assert.strict.deepStrictEqual(chkReadable(v, o), '')
                // 與給{}之結果相同(含不可讀值: 預設只讀標籤)
                assert.strict.deepStrictEqual(chkReadable(revoked({}), o), TAG)
            })
        }

        it('accessor keys of opt are not called and are treated as not given', function() {
            let n = 0
            let o = {}
            for (let k of ['deep', 'fun', 'ownKeys', 'has', 'elements', 'maxElements']) {
                Object.defineProperty(o, k, {
                    get() {
                        n++; return k === 'has' ? ['a'] : (k === 'elements' ? 'all' : true)
                    },
                    enumerable: true
                })
            }
            // deep等為true時會讀到hostile之深層值, 若存取器被採用則結果不為''
            let hostile = { x: revoked({}) }
            assert.strict.deepStrictEqual(chkReadable(hostile, o), '')
            assert.strict.deepStrictEqual(n, 0)
        })

        it('inherited keys of opt are not adopted', function() {
            let o = Object.create({ deep: true, ownKeys: true, elements: 'all', fun: true })
            assert.strict.deepStrictEqual(chkReadable({ x: revoked({}) }, o), '')
        })

        it('keys with non-expected values are treated as not given: deep (non-boolean), elements (not none/first/all), maxElements (negative, fractional, NaN, Infinity, string), has (not an array, over 1000 keys)', function() {
            let hostile = { x: revoked({}) }
            for (let d of [1, 'true', {}, [], null, undefined, NaN]) {
                assert.strict.deepStrictEqual(chkReadable(hostile, { deep: d }), '', `deep ${String(d)}`)
            }
            // 無效之elements視為未給('none'): 元素讀取拋錯之陣列仍為可讀(若被當作'all'或'first'則回element is unreadable)
            let badEl = () => partialProxy([1, 2], [], ['1'])
            assert.strict.deepStrictEqual(chkReadable(badEl(), { elements: 'all' }), ELEM, 'control: all reads the element')
            assert.strict.deepStrictEqual(chkReadable(badEl(), { elements: 'bogus' }), '')
            assert.strict.deepStrictEqual(chkReadable(badEl(), { elements: 1 }), '')
            assert.strict.deepStrictEqual(chkReadable(badEl(), { elements: ['all'] }), '')
            // maxElements無效 → 預設1000000: 長度2000000之稀疏陣列超過預設上限
            let big = new Array(2000000)
            for (let m of [-1, 1.5, NaN, Infinity, '10', null, {}]) {
                assert.strict.deepStrictEqual(chkReadable(big, { elements: 'all', maxElements: m }), MANY, `maxElements ${String(m)}`)
            }
            assert.strict.deepStrictEqual(chkReadable(big, { elements: 'all', maxElements: 2000000 }), '')
            // has: 非陣列、數量超過1000(視為未給)、非字串與Symbol之元素略過
            let hasThrows = new Proxy({}, { has: boom })
            assert.strict.deepStrictEqual(chkReadable(hasThrows, { has: 'a' }), '')
            assert.strict.deepStrictEqual(chkReadable(hasThrows, { has: { 0: 'a', length: 1 } }), '')
            assert.strict.deepStrictEqual(chkReadable(hasThrows, { has: new Array(1001).fill('a') }), '')
            assert.strict.deepStrictEqual(chkReadable(hasThrows, { has: [true, null, {}, undefined, 10n] }), '') //字串、Symbol、數字以外之元素略過(數字同haskey轉為字串鍵, 見後續案)
            assert.strict.deepStrictEqual(chkReadable(hasThrows, { has: new Array(1000).fill('a') }), KEY)
        })
    })

    describe('opt.has (same read as haskey: key in v, triggers the has trap)', function() {
        it('has trap throws → key is unreadable (string and Symbol keys, object and function)', function() {
            let sym = Symbol('k')
            for (let t of [{ a: 1 }, function() {}]) {
                let p = new Proxy(t, { has: boom })
                assert.strict.deepStrictEqual(chkReadable(p), '', 'default does not read has') // B/E之定義: 只壞has陷阱者, 預設可讀
                assert.strict.deepStrictEqual(chkReadable(p, { has: ['a'] }), KEY)
                assert.strict.deepStrictEqual(chkReadable(p, { has: [sym] }), KEY)
                assert.strict.deepStrictEqual(chkReadable(p, { has: ['a', 'b'] }), KEY)
            }
        })
        it('readable keys, absent keys and the prototype chain are fine; the first failing key decides', function() {
            assert.strict.deepStrictEqual(chkReadable({ a: 1 }, { has: ['a', 'zzz', 'toString', 'constructor'] }), '')
            let calls = []
            let p = new Proxy({}, {
                has(t, k) {
                    calls.push(String(k)); if (k === 'b') {
                        throw new Error('x')
                    } return false
                }
            })
            assert.strict.deepStrictEqual(chkReadable(p, { has: ['a', 'b', 'c'] }), KEY)
            assert.strict.deepStrictEqual(calls, ['a', 'b'])
        })
        it('haskey (same-source judgement) is false for the same Proxy and does not throw', function() {
            let p = new Proxy({ a: 1 }, { has: boom })
            assert.strict.deepStrictEqual(haskey(p, 'a'), false)
            assert.strict.deepStrictEqual(chkReadable(p, { has: ['a'] }) !== '', true)
        })
    })

    describe('opt.fun (same read as isfun: Symbol.toStringTag has and descriptor, no value read, no write)', function() {
        it('has trap throws on Symbol.toStringTag → function type is unreadable', function() {
            let p = new Proxy(function() {}, { has: boom })
            assert.strict.deepStrictEqual(chkReadable(p), '')
            assert.strict.deepStrictEqual(chkReadable(p, { fun: true }), FUN)
        })
        it('has says true and getOwnPropertyDescriptor throws → function type is unreadable', function() {
            let p = new Proxy(function() {}, { has: () => true, getOwnPropertyDescriptor: boom })
            assert.strict.deepStrictEqual(chkReadable(p, { fun: true }), FUN)
        })
        it('does not read the Symbol.toStringTag value (no accessor call) and does not write it', function() {
            let n = 0
            let sets = 0
            let f = function() {}
            Object.defineProperty(f, Symbol.toStringTag, {
                get() {
                    n++; return 'Function'
                },
                set() {
                    sets++
                },
                configurable: true
            })
            // 內部標籤之讀取(Object.prototype.toString)依規格會讀此值一次, 為所有判斷函數共同之讀取; fun選項不再增加
            let base = (() => {
                n = 0; chkReadable(f); return n
            })()
            n = 0
            assert.strict.deepStrictEqual(chkReadable(f, { fun: true }), '')
            assert.strict.deepStrictEqual(n, base)
            assert.strict.deepStrictEqual(sets, 0)
        })
        it('isfun (same-source judgement) is false for the throwing Proxy and does not throw', function() {
            let p = new Proxy(function() {}, { has: boom })
            assert.strict.deepStrictEqual(isfun(p), false)
        })
    })

    describe('opt.ownKeys (Reflect.ownKeys; plain objects also the prototype chain with descriptors, a superset of the iseobj for...in read)', function() {
        it('ownKeys / getPrototypeOf / getOwnPropertyDescriptor trap throws → keys are unreadable (object); readable by default', function() {
            for (let trap of ['ownKeys', 'getPrototypeOf', 'getOwnPropertyDescriptor']) {
                let p = partialProxy({ a: 1 }, [trap])
                assert.strict.deepStrictEqual(chkReadable(p), '', trap)
                assert.strict.deepStrictEqual(chkReadable(p, { ownKeys: true }), KEYS, trap)
            }
        })
        it('function and array: only Reflect.ownKeys is read (ownKeys trap)', function() {
            assert.strict.deepStrictEqual(chkReadable(new Proxy(function() {}, { ownKeys: boom }), { ownKeys: true }), KEYS)
            assert.strict.deepStrictEqual(chkReadable(new Proxy([1], { ownKeys: boom }), { ownKeys: true }), KEYS)
            // getPrototypeOf陷阱只壞之陣列/函數: 不沿原型鏈, 可讀
            assert.strict.deepStrictEqual(chkReadable(new Proxy([1], { getPrototypeOf: boom }), { ownKeys: true }), '')
            assert.strict.deepStrictEqual(chkReadable(new Proxy(function() {}, { getPrototypeOf: boom }), { ownKeys: true }), '')
        })
        it('an unreadable level of the prototype chain is found', function() {
            let bad = new Proxy({}, { ownKeys: boom })
            let o = Object.create(bad)
            o.a = 1
            assert.strict.deepStrictEqual(chkReadable(o, { ownKeys: true }), KEYS)
            assert.strict.deepStrictEqual(chkReadable(o), '')
            // iseobj(同源之判斷)對同一值不拋錯(for...in於列舉時即收集整條原型鏈之鍵, V8實測回false)
            assert.strict.deepStrictEqual(typeof iseobj(o), 'boolean')
        })
        it('a prototype cycle returned by a getPrototypeOf trap or a chain over 1000 levels → keys are unreadable, no hang', function() {
            let px = new Proxy({}, { getPrototypeOf: () => px })
            assert.strict.deepStrictEqual(chkReadable(px, { ownKeys: true }), KEYS)
            let o = {}
            for (let i = 0; i < 1100; i++) {
                o = Object.create(o)
            }
            assert.strict.deepStrictEqual(chkReadable(o, { ownKeys: true }), KEYS)
            let ok = {}
            for (let i = 0; i < 100; i++) {
                ok = Object.create(ok)
            }
            assert.strict.deepStrictEqual(chkReadable(ok, { ownKeys: true }), '')
        })
        it('does not call accessors (own, inherited), does not write', function() {
            let n = 0
            let proto = {
                get inh() {
                    n++; return 1
                }
            }
            let o = Object.create(proto)
            Object.defineProperty(o, 'own', {
                get() {
                    n++; return 1
                },
                enumerable: true
            })
            assert.strict.deepStrictEqual(chkReadable(o, { ownKeys: true }), '')
            assert.strict.deepStrictEqual(n, 0)
            assert.strict.deepStrictEqual(Object.keys(o), ['own'])
        })
    })

    describe('opt.elements (array length and elements)', function() {
        it('first: same as isearr (reads length, and [0] only when length is 1); the get trap is hit exactly there', function() {
            let log = []
            let mk = (a) => new Proxy(a, {
                get(t, k, r) {
                    log.push(String(k)); return Reflect.get(t, k, r)
                }
            })
            log.length = 0
            assert.strict.deepStrictEqual(chkReadable(mk([7, 8]), { elements: 'first' }), '')
            assert.strict.deepStrictEqual(log.filter(k => k === '0' || k === '1'), [])
            assert.ok(log.includes('length'))
            log.length = 0
            assert.strict.deepStrictEqual(chkReadable(mk([7]), { elements: 'first' }), '')
            assert.strict.deepStrictEqual(log.filter(k => k === '0'), ['0'])
            log.length = 0
            assert.strict.deepStrictEqual(chkReadable(mk([]), { elements: 'first' }), '')
            assert.strict.deepStrictEqual(log.filter(k => k === '0'), [])
        })
        it('first: length get throws → length is unreadable; [0] get throws → element is unreadable (only when length is 1)', function() {
            assert.strict.deepStrictEqual(chkReadable(partialProxy([1], [], ['length']), { elements: 'first' }), LEN)
            assert.strict.deepStrictEqual(chkReadable(partialProxy([1], [], ['0']), { elements: 'first' }), ELEM)
            assert.strict.deepStrictEqual(chkReadable(partialProxy([1, 2], [], ['0']), { elements: 'first' }), '')
        })
        it('all: reads every element; the failing index is found anywhere', function() {
            let n = 50
            for (let bad of [0, 1, 25, 49]) {
                let a = Array.from({ length: n }, (_, i) => i)
                let p = partialProxy(a, [], [String(bad)])
                assert.strict.deepStrictEqual(chkReadable(p, { elements: 'all' }), ELEM, `index ${bad}`)
                assert.strict.deepStrictEqual(chkReadable(p, { elements: 'first' }), '', `first ignores index ${bad} (length is ${n})`)
            }
        })
        it('all: length must be a non-negative safe integer (Proxy returning -1, 1.5, NaN, Infinity, a string, 2**53)', function() {
            for (let L of [-1, 1.5, NaN, Infinity, '3', 2 ** 53, null, undefined]) {
                let p = new Proxy([], {
                    get(t, k, r) {
                        return k === 'length' ? L : Reflect.get(t, k, r)
                    }
                })
                assert.strict.deepStrictEqual(chkReadable(p, { elements: 'all' }), BADLEN, String(L))
            }
        })
        it('all: too many elements (length over maxElements) is refused without reading elements (sparse array of 2**32-1 returns at once)', function() {
            let t0 = Date.now()
            assert.strict.deepStrictEqual(chkReadable(new Array(4294967295), { elements: 'all' }), MANY)
            assert.strict.deepStrictEqual(chkReadable(new Array(10), { elements: 'all', maxElements: 9 }), MANY)
            assert.strict.deepStrictEqual(chkReadable(new Array(10), { elements: 'all', maxElements: 10 }), '')
            assert.ok(Date.now() - t0 < 5000)
        })
        it('accessor elements and holes are skipped (not called)', function() {
            let n = 0
            let a = [1, 2, 3]
            Object.defineProperty(a, '1', {
                get() {
                    n++; throw new Error('boom')
                },
                enumerable: true
            })
            delete a[2]
            assert.strict.deepStrictEqual(chkReadable(a, { elements: 'all' }), '')
            assert.strict.deepStrictEqual(chkReadable(a, { elements: 'first' }), '')
            assert.strict.deepStrictEqual(chkReadable(a, { deep: true }), '')
            assert.strict.deepStrictEqual(n, 0)
        })
        it('non-arrays are not read as arrays (first by tag like isarr, all by Array.isArray)', function() {
            let n = 0
            let o = {
                get length() {
                    n++; return 1
                },
                get 0() {
                    n++; return 1
                }
            }
            assert.strict.deepStrictEqual(chkReadable(o, { elements: 'all' }), '')
            assert.strict.deepStrictEqual(chkReadable(o, { elements: 'first' }), '')
            // 偽造標籤之物件: first依標籤判陣列(同isarr)而讀length, 但length為存取器不呼叫; all依Array.isArray不讀
            let forged = {
                [Symbol.toStringTag]: 'Array',
                get length() {
                    n++; return 1
                }
            }
            assert.strict.deepStrictEqual(chkReadable(forged, { elements: 'first' }), '')
            assert.strict.deepStrictEqual(chkReadable(forged, { elements: 'all' }), '')
            assert.strict.deepStrictEqual(n, 0)
            assert.strict.deepStrictEqual(isarr(forged), true) // 同源: isarr亦依標籤
        })
        it('isearr (same-source judgement) is false for the failing arrays and does not throw', function() {
            assert.strict.deepStrictEqual(isearr(partialProxy([1], [], ['length'])), false)
            assert.strict.deepStrictEqual(isearr(partialProxy([1], [], ['0'])), false)
        })
    })

    describe('opt.deep (iterative walk, no recursion, WeakSet, aligned with what a serializer visits)', function() {
        it('an unreadable value anywhere in the graph is found (property, array element, nested, several branches)', function() {
            let r = revoked({})
            for (let g of [
                { a: r },
                { a: { b: { c: r } } },
                { a: [1, 2, [3, r]] },
                [r],
                { x: 1, y: [{ z: [{ w: r }] }], k: { m: 1 } },
                { a: new Proxy({}, allTrapsThrow()) },
                {
                    a: {
                        get [Symbol.toStringTag]() {
                            throw new Error('boom')
                        }
                    }
                },
            ]) {
                assert.strict.deepStrictEqual(chkReadable(g, { deep: true }), TAG)
                assert.strict.deepStrictEqual(chkReadable(g), '', 'shallow reads the top-level tag only')
            }
        })
        it('keys / descriptor / length / element failures inside the graph map to the fixed reasons', function() {
            assert.strict.deepStrictEqual(chkReadable({ a: partialProxy({ x: 1 }, ['ownKeys']) }, { deep: true }), KEYS)
            assert.strict.deepStrictEqual(chkReadable({ a: partialProxy({ x: 1 }, ['getOwnPropertyDescriptor']) }, { deep: true }), PROP)
            assert.strict.deepStrictEqual(chkReadable([partialProxy([1, 2], [], ['length'])], { deep: true }), LEN)
            assert.strict.deepStrictEqual(chkReadable({ a: partialProxy([1], [], ['0']) }, { deep: true }), ELEM)
        })
        it('no side effect: accessors (own, prototype), methods and toJSON are never called', function() {
            let n = 0
            class C {
                get g() {
                    n++; return revoked({})
                }

                m() {
                    n++
                }

                toJSON() {
                    n++; return 1
                }
            }
            let o = new C()
            Object.defineProperty(o, 'own', {
                get() {
                    n++; return revoked({})
                },
                enumerable: true
            })
            Object.defineProperty(o, 'tj', {
                value: {
                    toJSON: () => {
                        n++
                    }
                },
                enumerable: true
            })
            let g = {
                a: o,
                b: [o, {
                    get c() {
                        n++; return 1
                    }
                }]
            }
            assert.strict.deepStrictEqual(chkReadable(g, { deep: true }), '')
            assert.strict.deepStrictEqual(n, 0)
        })
        it('toJSON holders are touched but their subgraph is not expanded (class prototype toJSON, accessor toJSON, Date)', function() {
            let r = revoked({})
            class C {
                toJSON() {
                    return 1
                }
            }
            let c = new C()
            c.child = r
            let acc = { child: r }
            Object.defineProperty(acc, 'toJSON', {
                get() {
                    return () => 1
                },
                enumerable: false
            })
            let ownTj = {
                toJSON() {
                    return 1
                },
                child: r
            }
            assert.strict.deepStrictEqual(chkReadable({ x: c }, { deep: true }), '')
            assert.strict.deepStrictEqual(chkReadable({ x: acc }, { deep: true }), '')
            assert.strict.deepStrictEqual(chkReadable({ x: ownTj }, { deep: true }), '')
            assert.strict.deepStrictEqual(chkReadable({ x: new Date(0) }, { deep: true }), '')
            // 但其本身之標籤被讀(不可讀之toJSON持有者本身即為不可讀)
            assert.strict.deepStrictEqual(chkReadable({ x: revoked({ toJSON() {} }) }, { deep: true }), TAG)
            // 對照: 無toJSON者之子圖被展開
            assert.strict.deepStrictEqual(chkReadable({ x: { child: r } }, { deep: true }), TAG)
        })
        it('leaf nodes are not expanded: functions (with own properties), typed arrays, ArrayBuffer, DataView, Error, DOMException', function() {
            let r = revoked({})
            let f = function() {}
            f.child = r
            let e = new Error('x')
            e.child = r
            let ta = new Uint8Array(4)
            ta.child = r
            let ab = new ArrayBuffer(4)
            ab.child = r
            let dv = new DataView(new ArrayBuffer(4))
            dv.child = r
            for (let leaf of [f, e, ta, ab, dv]) {
                assert.strict.deepStrictEqual(chkReadable({ x: leaf }, { deep: true }), '')
            }
            if (typeof DOMException === 'function') {
                let d = new DOMException('x')
                d.child = r
                assert.strict.deepStrictEqual(chkReadable({ x: d }, { deep: true }), '')
            }
        })
        it('not read: symbol keys, non-enumerable properties, accessor return values', function() {
            let r = revoked({})
            let o = { [Symbol('s')]: r }
            Object.defineProperty(o, 'hidden', { value: r, enumerable: false })
            assert.strict.deepStrictEqual(chkReadable(o, { deep: true }), '')
        })
        it('cycles and shared references are not unreadable; an unreadable value inside a cycle is still found', function() {
            let a = []
            a.push(a)
            assert.strict.deepStrictEqual(chkReadable(a, { deep: true }), '')
            let o = { name: 'o' }
            o.self = o
            assert.strict.deepStrictEqual(chkReadable(o, { deep: true }), '')
            let s = { v: 1 }
            assert.strict.deepStrictEqual(chkReadable({ x: s, y: s, z: [s, s] }, { deep: true }), '')
            let c = { child: null }
            c.child = { back: c, bad: revoked({}) }
            assert.strict.deepStrictEqual(chkReadable(c, { deep: true }), TAG)
        })
        it('very deep chains (100000 levels) do not overflow the stack: objects and arrays', function() {
            let o = { v: 0 }
            for (let i = 0; i < 100000; i++) {
                o = { n: o }
            }
            assert.strict.deepStrictEqual(chkReadable(o, { deep: true }), '')
            let a = []
            for (let i = 0; i < 100000; i++) {
                a = [a]
            }
            assert.strict.deepStrictEqual(chkReadable(a, { deep: true }), '')
            let deepBad = { v: revoked({}) }
            for (let i = 0; i < 100000; i++) {
                deepBad = { n: deepBad }
            }
            assert.strict.deepStrictEqual(chkReadable(deepBad, { deep: true }), TAG)
        })
        it('arrays: length is checked (too many elements for huge sparse arrays, bad length from a Proxy)', function() {
            assert.strict.deepStrictEqual(chkReadable({ a: new Array(4294967295) }, { deep: true }), MANY)
            assert.strict.deepStrictEqual(chkReadable({ a: new Array(10) }, { deep: true, maxElements: 9 }), MANY)
            let p = new Proxy([], {
                get(t, k, r) {
                    return k === 'length' ? -1 : Reflect.get(t, k, r)
                }
            })
            assert.strict.deepStrictEqual(chkReadable([p], { deep: true }), BADLEN)
        })
        it('opt.fun, opt.has, opt.ownKeys, opt.elements apply to the top-level value only', function() {
            let nested = new Proxy({ a: 1 }, { has: boom, ownKeys: boom })
            assert.strict.deepStrictEqual(chkReadable({ x: nested }, { fun: true, has: ['x'], elements: 'all' }), '')
            assert.strict.deepStrictEqual(chkReadable({ x: nested }, { deep: true, has: ['x'] }), KEYS) // deep讀巢狀之自有鍵(ownKeys陷阱), has只作用於頂層
            assert.strict.deepStrictEqual(chkReadable({ x: nested }, { has: ['x'] }), '')
        })
        it('combined options: the tag is read first, then fun, has, ownKeys, elements, deep', function() {
            let p = partialProxy({ a: 1 }, ['has', 'ownKeys'])
            assert.strict.deepStrictEqual(chkReadable(p, { has: ['a'], ownKeys: true }), KEY)
            assert.strict.deepStrictEqual(chkReadable(p, { ownKeys: true, deep: true }), KEYS)
            assert.strict.deepStrictEqual(chkReadable(revoked({}), { fun: true, has: ['a'], ownKeys: true, elements: 'all', deep: true }), TAG)
        })
    })

    describe('no side effect and isolation', function() {
        it('does not call accessors or toJSON at the top level with any option; does not write; frozen values are fine', function() {
            let n = 0
            let o = {
                get a() {
                    n++; return 1
                },
                toJSON() {
                    n++; return 1
                },
            }
            Object.freeze(o)
            for (let opt of Object.values(OPTS)) {
                assert.strict.deepStrictEqual(chkReadable(o, opt), '')
            }
            assert.strict.deepStrictEqual(n, 0)
            assert.strict.deepStrictEqual(Object.getOwnPropertyNames(o), ['a', 'toJSON'])
        })
        it('does not call valueOf, toString or the constructor of the value (only the tag is read, the rule of Object.prototype.toString)', function() {
            let n = 0
            let o = {
                valueOf() {
                    n++; return 1
                },
                toString() {
                    n++; return 'x'
                },
                get constructor() {
                    n++; return Object
                }
            }
            for (let opt of Object.values(OPTS)) {
                assert.strict.deepStrictEqual(chkReadable(o, opt), '')
            }
            assert.strict.deepStrictEqual(n, 0)
        })
        it('is not affected by global pollution after loading (Object.prototype.toString, Reflect.*, Array.isArray, WeakSet.prototype.add replaced)', function() {
            let saved = {
                toString: Object.prototype.toString,
                ownKeys: Reflect.ownKeys,
                getProto: Reflect.getPrototypeOf,
                getDesc: Reflect.getOwnPropertyDescriptor,
                get: Reflect.get,
                has: Reflect.has,
                isArray: Array.isArray,
                add: WeakSet.prototype.add,
                wmGet: WeakMap.prototype.get,
            }
            let polluted = () => {
                throw new Error('polluted')
            }
            let results = null
            try {
                Object.prototype.toString = polluted // eslint-disable-line no-extend-native
                Reflect.ownKeys = polluted
                Reflect.getPrototypeOf = polluted
                Reflect.getOwnPropertyDescriptor = polluted
                Reflect.get = polluted
                Reflect.has = polluted
                Array.isArray = polluted
                WeakSet.prototype.add = polluted // eslint-disable-line no-extend-native
                WeakMap.prototype.get = polluted // eslint-disable-line no-extend-native
                results = [
                    chkReadable({ a: [1, { b: 2 }] }, { deep: true, ownKeys: true, elements: 'all', fun: true, has: ['a'] }),
                    chkReadable([1], { elements: 'first' }),
                ]
            }
            finally {
                Object.prototype.toString = saved.toString // eslint-disable-line no-extend-native
                Reflect.ownKeys = saved.ownKeys
                Reflect.getPrototypeOf = saved.getProto
                Reflect.getOwnPropertyDescriptor = saved.getDesc
                Reflect.get = saved.get
                Reflect.has = saved.has
                Array.isArray = saved.isArray
                WeakSet.prototype.add = saved.add // eslint-disable-line no-extend-native
                WeakMap.prototype.get = saved.wmGet // eslint-disable-line no-extend-native
            }
            assert.strict.deepStrictEqual(results, ['', '']) //污染期間不呼叫assert(其內部亦用Object.prototype.toString)
        })
        it('reentrant: concurrent / interleaved calls share no state (results independent of order)', function() {
            let bad = revoked({})
            let r = []
            for (let i = 0; i < 20; i++) {
                r.push(chkReadable(i % 2 === 0 ? bad : { a: 1 }))
            }
            assert.strict.deepStrictEqual(r, Array.from({ length: 20 }, (_, i) => (i % 2 === 0 ? TAG : '')))
        })
        it('returns a string for every case (reason vocabulary is fixed, never echoes the value or the thrown message)', function() {
            let secret = 'SECRET-xyz-123'
            let thrower = {
                get [Symbol.toStringTag]() {
                    throw new Error(secret)
                }
            }
            let p = new Proxy({}, {
                ownKeys() {
                    throw new Error(secret)
                },
                has() {
                    throw new Error(secret)
                }
            })
            let outs = [
                chkReadable(thrower),
                chkReadable(p, { ownKeys: true }),
                chkReadable(p, { has: ['a'] }),
                chkReadable({ [secret]: revoked({}) }, { deep: true }),
            ]
            for (let o of outs) {
                assert.strict.deepStrictEqual(typeof o, 'string')
                assert.ok(o !== '')
                assert.ok(!o.includes('SECRET') && !o.includes('xyz'))
            }
            assert.strict.deepStrictEqual(outs, [TAG, KEYS, KEY, TAG])
        })
    })

})


//獨立複審(ws492j)之後續: 深探經[[Get]]讀取、讀取總量上限、描述子之自有性檢查、數字鍵
describe('chkReadable: follow-ups of the independent review (ws492j)', function() {

    it('deep reads a data property of an object Proxy through [[Get]] (as the serializer does): a get trap that throws is unreadable', function() {
        let p = new Proxy({ a: 1 }, {
            get(t, k, r) {
                if (typeof k === 'string') {
                    throw new Error('x')
                }
                return Reflect.get(t, k, r)
            },
        })
        assert.strict.deepStrictEqual(chkReadable({ x: p }, { deep: true }), PROP)
        assert.strict.deepStrictEqual(chkReadable({ x: p }), '', 'shallow reads the tag only')
    })

    it('deep walks the value of [[Get]], not the value reported by the descriptor (a Proxy can hide an unreadable subgraph behind a safe descriptor value)', function() {
        let q = new Proxy({ a: {} }, {
            get(t, k, r) {
                return k === 'a' ? revoked({}) : Reflect.get(t, k, r)
            },
        })
        assert.strict.deepStrictEqual(chkReadable({ x: q }, { deep: true }), TAG)
    })

    it('deep stops at opt.maxReads: many sparse arrays each under maxElements, and a Proxy graph that makes a new node on every read', function() {
        let many = Array.from({ length: 50 }, () => new Array(1000))
        assert.strict.deepStrictEqual(chkReadable(many, { deep: true }), '') //共約5萬次讀取, 未逾預設上限
        assert.strict.deepStrictEqual(chkReadable(many, { deep: true, maxReads: 10000 }), LARGE)
        assert.strict.deepStrictEqual(chkReadable(many, { deep: true, maxReads: Number.MAX_SAFE_INTEGER }), '')
        let mk = () => new Proxy({}, {
            ownKeys: () => ['a'],
            getOwnPropertyDescriptor: () => ({ value: 1, enumerable: true, configurable: true, writable: true }),
            get: (t, k) => (typeof k === 'string' ? mk() : undefined),
        })
        let t0 = Date.now()
        assert.strict.deepStrictEqual(chkReadable(mk(), { deep: true, maxReads: 1000 }), LARGE)
        assert.ok(Date.now() - t0 < 5000)
        // 無效之maxReads視為未給(預設50000000)
        for (let m of [-1, 1.5, NaN, Infinity, '10', null]) {
            assert.strict.deepStrictEqual(chkReadable(many, { deep: true, maxReads: m }), '', String(m))
        }
    })

    it('descriptor checks use own properties: a polluted Object.prototype.value does not make an accessor look like a data property (accessors stay uncalled)', function() {
        let n = 0
        let a = [1]
        Object.defineProperty(a, '0', {
            get() {
                n++; return 1
            },
            enumerable: true,
            configurable: true
        })
        let o = {}
        Object.defineProperty(o, 'k', {
            get() {
                n++; return 1
            },
            enumerable: true,
            configurable: true
        })
        let r = null
        try {
            Object.prototype.value = 1 // eslint-disable-line no-extend-native
            r = [chkReadable(a, { elements: 'all' }), chkReadable(a, { deep: true }), chkReadable({ o }, { deep: true })]
        }
        finally {
            delete Object.prototype.value
        }
        assert.strict.deepStrictEqual(r, ['', '', ''])
        assert.strict.deepStrictEqual(n, 0)
    })

    it('opt.has also accepts number keys like haskey (0 in obj)', function() {
        let p = new Proxy({}, { has: boom })
        assert.strict.deepStrictEqual(chkReadable(p, { has: [0] }), KEY)
        assert.strict.deepStrictEqual(haskey(p, 0), false) //同源之判斷函數亦觸發has陷阱而回false, 不拋錯
    })

})


//五個既有探針(w-dispatch-ai callUserFn、w-converhp、w-orm-lowdb、w-orm-level、w-serv-webdata)各庫測試所用之敵意值, 於本函數對應選項下之結果(逐格鎖定; 期望值手寫, 對應各庫之需要見sgud/rule/rulebook_msg.md R-READABLE-01)
describe('chkReadable: the hostile shapes used by the tests of the five existing probes', function() {

    let boomFn = () => {
        throw new Error('boom')
    }
    let rows = [
        //w-serv-webdata(test/tools/unreadable.mjs 11 值, kind 為該值被判為不可讀所需之選項)
        ['webdata: revoked object Proxy', () => revoked({}), undefined, TAG],
        ['webdata: revoked function Proxy', () => revoked(function() {}), { fun: true }, TAG],
        ['webdata: revoked array Proxy', () => revoked([]), { ownKeys: true }, TAG],
        ['webdata: all-traps-throw object Proxy', () => new Proxy({}, allTrapsThrow()), { has: ['x'] }, TAG],
        ['webdata: all-traps-throw function Proxy', () => new Proxy(function() {}, allTrapsThrow()), undefined, TAG],
        ['webdata: toStringTag getter throws', () => ({
            get [Symbol.toStringTag]() {
                throw new Error('boom')
            }
        }), undefined, TAG],
        ['webdata: has trap throws (object) / no has option', () => new Proxy({ a: 1 }, { has: boomFn }), undefined, ''],
        ['webdata: has trap throws (object) / has option', () => new Proxy({ a: 1 }, { has: boomFn }), { has: ['__sysToken__'] }, KEY],
        ['webdata: has trap throws (function) / has option', () => new Proxy(function() {}, { has: boomFn }), { has: ['__sysToken__'] }, KEY],
        ['webdata: ownKeys trap throws / no option', () => new Proxy({ a: 1 }, { ownKeys: boomFn }), undefined, ''],
        ['webdata: ownKeys trap throws / ownKeys option', () => new Proxy({ a: 1 }, { ownKeys: boomFn }), { ownKeys: true }, KEYS],
        ['webdata: getPrototypeOf trap throws / ownKeys option', () => new Proxy({ a: 1 }, { getPrototypeOf: boomFn }), { ownKeys: true }, KEYS],
        ['webdata: getOwnPropertyDescriptor trap throws / ownKeys option', () => new Proxy({ a: 1 }, { getOwnPropertyDescriptor: boomFn }), { ownKeys: true }, KEYS],
        ['webdata: Proxy whose only has trap throws / fun option (isFunction reads has of the tag, only when the tag key is probed)', () => new Proxy(function() {}, { has: boomFn }), { fun: true }, FUN],
        //w-orm-level(test/unit-probe-readable.test.mjs 9 值; data 站點 = ownKeys + elements:'first')
        ['level: revoked Proxy', () => revoked({}), { ownKeys: true, elements: 'first' }, TAG],
        ['level: Proxy whose toStringTag read throws', () => new Proxy({}, { get: boomFn }), { ownKeys: true, elements: 'first' }, TAG],
        ['level: Proxy whose ownKeys throws', () => new Proxy({}, { ownKeys: boomFn }), { ownKeys: true, elements: 'first' }, KEYS],
        ['level: Proxy whose getOwnPropertyDescriptor throws (with an own key)', () => new Proxy({ a: 1 }, { getOwnPropertyDescriptor: boomFn }), { ownKeys: true, elements: 'first' }, KEYS],
        ['level: Proxy whose getPrototypeOf throws', () => new Proxy({}, { getPrototypeOf: boomFn }), { ownKeys: true, elements: 'first' }, KEYS],
        ['level: one-element array whose [0] getter throws (accessor is not called: readable)', () => withGetter([0], '0'), { ownKeys: true, elements: 'first' }, ''],
        ['level: array Proxy whose length read throws', () => partialProxy([1], [], ['length']), { ownKeys: true, elements: 'first' }, LEN],
        ['level: revoked array Proxy', () => revoked([]), { ownKeys: true, elements: 'first' }, TAG],
        ['level: object whose prototype is a Proxy whose ownKeys throws', () => Object.create(new Proxy({}, { ownKeys: boomFn })), { ownKeys: true, elements: 'first' }, KEYS],
        //w-orm-lowdb(kind: bol／str／data; 其 bol 之 has 與描述子讀取為修前 isbol 之讀取, isbol 已只用 typeof, 現只需標籤)
        ['lowdb: bol, Proxy whose has throws (formerly read by the old isbol)', () => new Proxy({}, { has: boomFn }), undefined, ''],
        ['lowdb: str, revoked Proxy', () => revoked({}), undefined, TAG],
        ['lowdb: data, Proxy array whose first element read throws', () => partialProxy([1], [], ['0']), { ownKeys: true, elements: 'first' }, ELEM],
        ['lowdb: data, object whose key enumeration throws', () => new Proxy({ a: 1 }, { ownKeys: boomFn }), { ownKeys: true, elements: 'first' }, KEYS],
        //w-dispatch-ai(callUserFn: 標籤 + ownKeys; 陣列於 readKeyOpt 逐元素且有上限)
        ['dispatch-ai: revoked Proxy', () => revoked({}), { ownKeys: true }, TAG],
        ['dispatch-ai: toStringTag throws', () => ({
            get [Symbol.toStringTag]() {
                throw new Error('boom')
            }
        }), { ownKeys: true }, TAG],
        ['dispatch-ai: ownKeys trap throws', () => new Proxy({}, { ownKeys: boomFn }), { ownKeys: true }, KEYS],
        ['dispatch-ai: get trap throws for a non-toStringTag key (not read: readable)', () => partialProxy({ a: 1 }, [], ['a']), { ownKeys: true }, ''],
        ['dispatch-ai: keys array, element read throws', () => partialProxy(['a', 'b'], [], ['1']), { elements: 'all', maxElements: 10000 }, ELEM],
        ['dispatch-ai: keys array, length is not an integer (Proxy returns 1.5)', () => new Proxy(['a'], { get: (t, k, r) => (k === 'length' ? 1.5 : Reflect.get(t, k, r)) }), { elements: 'all', maxElements: 10000 }, BADLEN],
        ['dispatch-ai: keys array over the limit (10001 elements)', () => new Array(10001).fill('k'), { elements: 'all', maxElements: 10000 }, MANY],
        ['dispatch-ai: keys array at the limit (10000 elements)', () => new Array(10000).fill('k'), { elements: 'all', maxElements: 10000 }, ''],
        //w-converhp(深探: 序列化器會走到之全部物件; 淺探 = 標籤)
        ['converhp: shallow reads the tag only (nested revoked Proxy is readable)', () => ({ a: revoked({}) }), { deep: false }, ''],
        ['converhp: deep finds the nested revoked Proxy', () => ({ a: [{ b: revoked({}) }] }), { deep: true, maxElements: Number.MAX_SAFE_INTEGER }, TAG],
        ['converhp: deep, ownKeys trap throws → unreadable; shallow → readable', () => ({ a: new Proxy({ x: 1 }, { ownKeys: boomFn }) }), { deep: true }, KEYS],
        ['converhp: deep, getOwnPropertyDescriptor trap throws', () => ({ a: new Proxy({ x: 1 }, { getOwnPropertyDescriptor: boomFn }) }), { deep: true }, PROP],
        ['converhp: deep, a Proxy whose only has trap throws is readable', () => ({ a: new Proxy({ x: 1 }, { has: boomFn }) }), { deep: true }, ''],
        ['converhp: deep, an accessor property is not called and its value is out of range (readable)', () => withGetter({}, 'k'), { deep: true }, ''],
    ]
    for (let [label, mk, opt, exp] of rows) {
        it(`${label}: ${JSON.stringify(exp)}`, function() {
            assert.strict.deepStrictEqual(chkReadable(mk(), opt), exp)
        })
    }

})
