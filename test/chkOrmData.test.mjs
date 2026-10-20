/* eslint-disable no-extend-native, no-sparse-arrays, no-new-wrappers -- 測試刻意以稀疏陣列、包裝物件與暫時汙染/覆寫原型(finally還原)驗證檢核器 */
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import vm from 'vm'
import { fileURLToPath } from 'url'
import chkOrmData from '../src/chkOrmData.mjs'
import chkOrmStr from '../src/chkOrmStr.mjs'
import ormStrCases from '../src/_cvOrmStrCases.mjs'
import { srcBundle } from './tools/srcBundle.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


//規則見CLAUDE_rulebook.md R-ORMSTR-01; 案例表見src/_cvOrmStrCases.mjs
//chkOrmData回傳null(合格)或{ reason, path }; 此處皆為純函數測試

let dirTest = path.dirname(fileURLToPath(import.meta.url))
let fpSrc = path.join(dirTest, '..', 'src', 'chkOrmData.mjs')

let LONE = 'string contains lone surrogate'
let NUL = 'string contains NUL'

let ch = (n) => String.fromCharCode(n)
let H = ch(0xD800)
let L = ch(0xDC00)

let bad = (path) => ({ reason: LONE, path })
let hidden = (obj, k, v) => Object.defineProperty(obj, k, { value: v, enumerable: false, writable: true, configurable: true })


describe('chkOrmData 契約案例表之單元層(規則2)', function() {

    it('should return the expected result for every data-level case of the case table (positions x forms)', function() {
        let cs = ormStrCases.cases.filter((c) => c.fn === 'chkOrmData')
        assert.ok(cs.length >= 100, `too few cases: ${cs.length}`)
        for (let c of cs) {
            assert.deepStrictEqual(chkOrmData(c.make(), c.opt), c.expect, c.id)
        }
    })

    it('should return the expected reason for every string-level case through a document value (consistency with chkOrmStr)', function() {
        for (let c of ormStrCases.cases.filter((v) => v.fn === 'chkOrmStr' && typeof v.input === 'string' && v.opt === undefined)) {
            let r = chkOrmData({ id: 'x', v: c.input })
            let want = chkOrmStr(c.input, { nul: false })
            assert.deepStrictEqual(r, want === null ? null : { reason: want, path: 'data.v' }, c.id)
        }
    })

})


describe('chkOrmData 走訪範圍與略過(規則3、4)', function() {

    it('should return null for ordinary documents with CJK, emoji, U+FFFD and nested structures', function() {
        assert.strictEqual(chkOrmData({ id: 'a', name: '中文\u{1F600}', n: 1, b: true, z: null, u: undefined, tags: ['x', 'y'], meta: { k: 'v', deep: [{ a: ['b'] }] } }), null)
        assert.strictEqual(chkOrmData([{ id: 'a' }, { id: 'b', name: '�' }]), null)
        assert.strictEqual(chkOrmData({}), null)
        assert.strictEqual(chkOrmData([]), null)
    })

    it('should return null for non-container roots other than strings, and check a string root', function() {
        for (let v of [undefined, null, 0, 1, NaN, true, false, Symbol('s'), BigInt(1), () => {}]) {
            assert.strictEqual(chkOrmData(v), null)
        }
        assert.strictEqual(chkOrmData('abc'), null)
        assert.deepStrictEqual(chkOrmData(H), bad('data'))
        assert.deepStrictEqual(chkOrmData(H, { root: 'data[3]' }), bad('data[3]'))
    })

    it('should find a bad string in documents, nested objects, arrays and array elements at any depth', function() {
        assert.deepStrictEqual(chkOrmData({ a: H }), bad('data.a'))
        assert.deepStrictEqual(chkOrmData({ a: { b: { c: H } } }), bad('data.a.b.c'))
        assert.deepStrictEqual(chkOrmData({ a: ['x', H] }), bad('data.a[1]'))
        assert.deepStrictEqual(chkOrmData({ a: [['x', ['y', L]]] }), bad('data.a[0][1][1]'))
        assert.deepStrictEqual(chkOrmData({ a: [{ b: [{ c: H }] }] }), bad('data.a[0].b[0].c'))
        assert.deepStrictEqual(chkOrmData([{ id: 'a' }, { id: 'b', n: H }]), bad('data[1].n'))
        assert.deepStrictEqual(chkOrmData([[H]]), bad('data[0][0]'))
    })

    it('should skip Date, TypedArray, Buffer, ArrayBuffer, SharedArrayBuffer, DataView, functions, symbols, bigint and numbers', function() {
        let u8 = new Uint8Array([0xED, 0xA0, 0x80])
        let doc = {
            d: new Date(0),
            bad: new Date(NaN),
            u8,
            f32: new Float32Array(2),
            i16: new Int16Array(2),
            bi: new BigInt64Array(1),
            buf: Buffer.from('a'),
            ab: new ArrayBuffer(4),
            dv: new DataView(new ArrayBuffer(2)),
            fn: () => H,
            big: BigInt(5),
            n: 1.5,
            nan: NaN,
            inf: Infinity,
            t: true,
            nl: null,
            un: undefined
        }
        if (typeof SharedArrayBuffer === 'function') {
            doc.sab = new SharedArrayBuffer(4)
        }
        assert.strictEqual(chkOrmData(doc), null)
        assert.strictEqual(chkOrmData([u8, Buffer.from(H), new Date(0)]), null)
    })

    it('should skip a skipped type as a whole: own enumerable extras on Date, TypedArray, Buffer, ArrayBuffer and DataView are not walked', function() {
        let withExtra = (o) => Object.assign(o, { extra: H, [`k${H}`]: L })
        let doc = { d: withExtra(new Date(0)), u8: withExtra(new Uint8Array(2)), buf: withExtra(Buffer.from('a')), ab: withExtra(new ArrayBuffer(2)), dv: withExtra(new DataView(new ArrayBuffer(2))), f64: withExtra(new Float64Array(1)) }
        assert.strictEqual(chkOrmData(doc), null)
        assert.strictEqual(chkOrmData(withExtra(new Date(0))), null)
        assert.strictEqual(chkOrmData([withExtra(new Uint8Array(1))]), null)
    })

    it('should skip Symbol keys, non-enumerable keys (also non-enumerable accessors, never read), array holes and non-index array properties', function() {
        let calls = 0
        let doc = { id: 'a' }
        doc[Symbol(H)] = H
        doc[Symbol.for('x')] = { deep: H }
        hidden(doc, `hidden${H}`, H)
        hidden(doc, 'hv', H)
        Object.defineProperty(doc, `acc${H}`, {
            get() {
                calls++
                return 'x'
            },
            enumerable: false
        })
        Object.defineProperty(doc, 'hiddenAcc', {
            get() {
                calls++
                return H
            },
            enumerable: false
        })
        let arr = [, 'a', ,]
        arr.extra = H
        arr[Symbol('s')] = H
        doc.arr = arr
        assert.strictEqual(chkOrmData(doc), null)
        assert.strictEqual(calls, 0)
    })

    it('should read an enumerable accessor (own, in an array, or inherited) exactly once and check the value it returns (the value a merge or serializer would take)', function() {
        let calls = 0
        let mkAcc = (obj, k, val) => Object.defineProperty(obj, k, {
            get() {
                calls++
                return val
            },
            enumerable: true
        })
        assert.deepStrictEqual(chkOrmData(mkAcc({}, 'acc', H)), bad('data.acc'))
        assert.strictEqual(calls, 1)
        calls = 0
        assert.strictEqual(chkOrmData(mkAcc({}, 'acc', 'ok')), null)
        assert.strictEqual(calls, 1)
        calls = 0
        let arr = []
        mkAcc(arr, '0', L)
        assert.deepStrictEqual(chkOrmData({ arr }), bad('data.arr[0]'))
        assert.strictEqual(calls, 1)
        calls = 0
        assert.deepStrictEqual(chkOrmData(Object.create(mkAcc({}, 'inh', H))), bad('data.inh'))
        assert.strictEqual(calls, 1)
        let flip = 0
        let o = Object.defineProperty({}, 'name', {
            get() {
                flip++
                return flip === 1 ? 'ok' : H
            },
            enumerable: true
        })
        assert.strictEqual(chkOrmData(o), null)
        assert.strictEqual(flip, 1, 'a stateful getter is read once; backends must materialise the copy they write')
    })

    it('should report a bad key of an accessor property (the key is checked, the getter is not called)', function() {
        let calls = 0
        let doc = {}
        Object.defineProperty(doc, `k${H}`, {
            get() {
                calls++
                return 'x'
            },
            enumerable: true
        })
        assert.deepStrictEqual(chkOrmData(doc), bad('data.<invalid key>'))
        assert.strictEqual(calls, 0)
    })

    it('should walk own enumerable properties of class instances and null-prototype objects, not non-enumerable prototype members (methods, getters)', function() {
        class P {
            constructor(v) {
                this.f = v
            }

            get g() {
                return H
            }

            m() {
                return H
            }
        }
        assert.deepStrictEqual(chkOrmData({ o: new P(H) }), bad('data.o.f'))
        assert.strictEqual(chkOrmData({ o: new P('ok') }), null)
        let np = Object.create(null)
        np.k = H
        assert.deepStrictEqual(chkOrmData({ np }), bad('data.np.k'))
        class Sub extends P {}
        assert.deepStrictEqual(chkOrmData(new Sub(L)), bad('data.f'))
        assert.strictEqual(chkOrmData(new Sub('ok')), null)
    })

    it('should check String wrapper objects by their string value and their extra properties (character index keys excluded), and skip other wrappers, RegExp literals without lone halves, Promise, WeakMap and functions whose source has no lone half', function() {
        assert.deepStrictEqual(chkOrmData({ s: new String(H) }), bad('data.s'))
        assert.strictEqual(chkOrmData({ s: new String('ok') }), null)
        assert.deepStrictEqual(chkOrmData({ s: Object.assign(new String('ok'), { extra: H }) }), bad('data.s.extra'))
        assert.deepStrictEqual(chkOrmData({ s: Object.assign(new String('ok'), { [`k${L}`]: 1 }) }), bad('data.s.<invalid key>'))
        assert.strictEqual(chkOrmData({ s: new String('abc') }), null)
        //含成對代理之包裝: 字串值良構, 字元索引鍵略過(本函數不拒收; lmdb、mongodb以字元索引存放會拆開成對代理, 須由後端解包, 見帳本規則15)
        assert.strictEqual(chkOrmData({ s: new String(String.fromCodePoint(0x1F600)) }), null)
        assert.strictEqual(chkOrmData({ s: new String('a\u0000b') }), null)
        assert.deepStrictEqual(chkOrmData({ s: new String('a\u0000b') }, { nul: true }), { reason: NUL, path: 'data.s' })
        assert.strictEqual(chkOrmData({ n: new Number(1), b: new Boolean(true), r: /a\uD800/, p: Promise.resolve(H), wm: new WeakMap(), ws: new WeakSet(), f: () => H }), null)
    })

})


describe('chkOrmData 繼承可列舉屬性、Error 與 RegExp(規則3; 盤點證據: save 合併/更新與 mdb 經原型鏈取值; lmdb 存 Error 與 RegExp 之文字)', function() {

    it('should walk enumerable properties inherited from prototypes other than Object.prototype (own keys first, nearest prototype first), key names before values', function() {
        assert.deepStrictEqual(chkOrmData(Object.create({ inh: H })), bad('data.inh'))
        assert.deepStrictEqual(chkOrmData({ o: Object.create({ inh: ['x', L] }) }), bad('data.o.inh[1]'))
        assert.deepStrictEqual(chkOrmData(Object.create({ [`k${H}`]: 1 })), bad('data.<invalid key>'))
        let two = Object.create(Object.create({ far: H }, {}), {})
        assert.deepStrictEqual(chkOrmData(two), bad('data.far'))
        let near = Object.create({ b: L }, { a: { value: 'ok', enumerable: true } })
        assert.deepStrictEqual(chkOrmData(near), bad('data.b'))
        class P {}
        P.prototype.shared = H
        assert.deepStrictEqual(chkOrmData({ o: new P() }), bad('data.o.shared'))
        assert.deepStrictEqual(chkOrmData({ o: Object.setPrototypeOf({ own: 'ok' }, { inheritedKey: H }) }), bad('data.o.inheritedKey'))
        assert.deepStrictEqual(chkOrmData(Object.create({ z: H }, { a: { value: H, enumerable: true } })), bad('data.a'))
    })

    it('should check in the order: own key names, inherited key names (nearest prototype first), own values, inherited values', function() {
        let mk = (ownKey, ownVal, inhKey, inhVal) => {
            let proto = {}
            proto[inhKey] = inhVal
            let o = Object.create(proto)
            o[ownKey] = ownVal
            return o
        }
        //繼承鍵名不合格先於自有值不合格
        assert.deepStrictEqual(chkOrmData(mk('own', L, `k${H}`, 'ok')), bad('data.<invalid key>'))
        //自有值先於繼承值
        assert.deepStrictEqual(chkOrmData({ x: mk('own', L, 'inh', H) }), bad('data.x.own'))
        assert.deepStrictEqual(chkOrmData(mk('own', 'ok', 'inh', H)), bad('data.inh'))
        //自有鍵名不合格先於繼承鍵名不合格(兩者路徑相同, 以首個為準, 不影響結果)
        assert.deepStrictEqual(chkOrmData(mk(`o${L}`, 'ok', `k${H}`, 'ok')), bad('data.<invalid key>'))
        //較近之原型先於較遠者
        let far = { f: H }
        let near = Object.create(far)
        near.n = L
        let leaf = Object.create(near)
        assert.deepStrictEqual(chkOrmData(leaf), bad('data.n'))
    })

    it('should not walk shadowed inherited properties (also shadowed by a nearer non-enumerable one), non-enumerable inherited members, Symbol keys, nor anything on Object.prototype', function() {
        assert.strictEqual(chkOrmData(Object.create({ k: H }, { k: { value: 'ok', enumerable: true } })), null)
        assert.strictEqual(chkOrmData(Object.create({ k: H }, { k: { value: 'ok', enumerable: false } })), null)
        assert.strictEqual(chkOrmData(Object.create(Object.create({ k: H }, { k: { value: 'mid', enumerable: true } }))), null)
        //較近原型之不可列舉同名屬性(資料屬性或存取器)遮蔽較遠原型之可列舉屬性
        assert.strictEqual(chkOrmData(Object.create(Object.create({ name: H }, { name: { value: 'safe', enumerable: false } }))), null)
        assert.strictEqual(chkOrmData(Object.create(Object.create({ name: H }, {
            name: {
                get() {
                    return 'safe'
                },
                enumerable: false
            }
        }))), null)
        assert.deepStrictEqual(chkOrmData(Object.create(Object.create({ name: H }, { other: { value: 'x', enumerable: false } }))), bad('data.name'))
        let calls = 0
        let proto = {}
        Object.defineProperty(proto, 'acc', {
            get() {
                calls++
                return H
            },
            enumerable: true
        })
        assert.deepStrictEqual(chkOrmData(Object.create(proto)), bad('data.acc'))
        assert.strictEqual(calls, 1)
        let keyAcc = Object.defineProperty({}, `k${H}`, {
            get() {
                return 'x'
            },
            enumerable: true
        })
        assert.deepStrictEqual(chkOrmData(Object.create(keyAcc)), bad('data.<invalid key>'))
        assert.strictEqual(chkOrmData(Object.create({ [Symbol('s')]: H })), null)
        assert.strictEqual(chkOrmData(Object.create({}, { h: { value: H, enumerable: false } })), null)
        Object.prototype.polluted = H
        try {
            assert.strictEqual(chkOrmData({ a: 'ok', o: { b: 'ok' }, c: new (class Q {})() }), null)
        }
        finally {
            delete Object.prototype.polluted
        }
    })

    it('should scan each distinct prototype once per call (many instances of one class stay cheap)', function() {
        class P {
            constructor(v) {
                this.v = v
            }
        }
        for (let i = 0; i < 12; i++) {
            Object.defineProperty(P.prototype, `method${i}`, { value() {}, enumerable: false })
        }
        let list = Array.from({ length: 50000 }, (_, i) => new P(`v${i}`))
        let t0 = Date.now()
        assert.strictEqual(chkOrmData(list), null)
        assert.ok(Date.now() - t0 < 1500, `${Date.now() - t0} ms`) //實測約50 ms(5萬個類別實例)
        list[49999].v = H
        assert.deepStrictEqual(chkOrmData(list), bad('data[49999].v'))
    })

    it('should read each prototype key list once per call: many instances sharing one prototype trigger a single ownKeys on it', function() {
        let calls = 0
        let proto = new Proxy({ shared: 'ok' }, {
            ownKeys(target) {
                calls++
                return Reflect.ownKeys(target)
            }
        })
        let list = Array.from({ length: 1000 }, () => Object.create(proto, { v: { value: 'x', enumerable: true } }))
        assert.strictEqual(chkOrmData(list), null)
        assert.strictEqual(calls, 1)
        assert.strictEqual(chkOrmData(list), null)
        assert.strictEqual(calls, 2)
    })

    it('should read property values through descriptors only: a Proxy get trap is not used for any string key (own and inherited); only the Symbol.toStringTag lookup of a non-plain object goes through [[Get]]', function() {
        let gets = 0
        let target = { a: 'x', b: ['y'] }
        let px = new Proxy(target, {
            get(t, k, r) {
                if (typeof k === 'string') {
                    gets++
                }
                return Reflect.get(t, k, r)
            }
        })
        assert.strictEqual(chkOrmData({ p: px }), null)
        assert.strictEqual(gets, 0)
        let child = Object.create(px)
        child.own = 'ok'
        assert.strictEqual(chkOrmData({ c: child }), null)
        assert.strictEqual(gets, 0)
        let pa = new Proxy(['a', 'b'], {
            get(t, k, r) {
                if (typeof k === 'string') {
                    gets++
                }
                return Reflect.get(t, k, r)
            }
        })
        assert.strictEqual(chkOrmData({ pa }), null)
        assert.strictEqual(gets, 0)
    })

    it('should check Error name, message and cause (lmdb stores them), including subclasses, other realms and nested causes', function() {
        assert.strictEqual(chkOrmData({ e: new Error('boom') }), null)
        assert.deepStrictEqual(chkOrmData({ e: new Error(H) }), bad('data.e.message'))
        assert.deepStrictEqual(chkOrmData({ e: new TypeError(`x${L}`) }), bad('data.e.message'))
        let named = new Error('ok')
        named.name = `N${H}`
        assert.deepStrictEqual(chkOrmData({ e: named }), bad('data.e.name'))
        class MyErr extends Error {}
        MyErr.prototype.name = `My${L}`
        assert.deepStrictEqual(chkOrmData({ e: new MyErr('ok') }), bad('data.e.name'))
        let hiddenName = new Error('ok')
        Object.defineProperty(hiddenName, 'name', { value: `N${H}`, enumerable: false })
        assert.deepStrictEqual(chkOrmData({ e: hiddenName }), bad('data.e.name'))
        class HidErr extends Error {}
        Object.defineProperty(HidErr.prototype, 'name', { value: `H${L}`, enumerable: false })
        assert.deepStrictEqual(chkOrmData({ e: new HidErr('ok') }), bad('data.e.name'))
        assert.deepStrictEqual(chkOrmData({ e: new Error('ok', { cause: H }) }), bad('data.e.cause'))
        assert.deepStrictEqual(chkOrmData({ e: new Error('ok', { cause: new Error(L) }) }), bad('data.e.cause.message'))
        assert.deepStrictEqual(chkOrmData({ e: new Error('ok', { cause: { deep: [H] } }) }), bad('data.e.cause.deep[0]'))
        let withProp = new Error('ok')
        withProp.code = H
        assert.deepStrictEqual(chkOrmData({ e: withProp }), bad('data.e.code'))
        let other = vm.runInNewContext('new RangeError("\\uD800")')
        assert.deepStrictEqual(chkOrmData({ e: other }), bad('data.e.message'))
        let cyc = new Error('ok')
        cyc.cause = cyc
        assert.strictEqual(chkOrmData({ e: cyc }), null)
        assert.deepStrictEqual(chkOrmData(new Error(H)), bad('data.message'))
    })

    it('should read an accessor message of an Error once and check it, and tolerate Errors without message', function() {
        let calls = 0
        let e = new Error('ok')
        Object.defineProperty(e, 'message', {
            get() {
                calls++
                return H
            }
        })
        assert.deepStrictEqual(chkOrmData({ e }), bad('data.e.message'))
        assert.strictEqual(calls, 1)
        let bare = Object.create(Error.prototype)
        assert.strictEqual(chkOrmData({ e: bare }), null)
    })

    it('should check the text of functions (source) and Symbols (description) that postgresql and mdb write as text, without rejecting clean ones', function() {
        assert.strictEqual(chkOrmData({
            f: () => 1,
            g: function() {
                return 'x'
            },
            s: Symbol('desc'),
            n: Symbol(undefined)
        }), null)
        let mkFn = (body) => new Function(body) // eslint-disable-line no-new-func
        let src = mkFn(`return 'a${H}'`).toString() //原始碼含孤立高位之函數
        assert.ok(!src.isWellFormed())
        assert.deepStrictEqual(chkOrmData({ f: mkFn(`return 'a${H}'`) }), bad('data.f'))
        assert.deepStrictEqual(chkOrmData({ s: Symbol(`d${L}`) }), bad('data.s'))
        assert.deepStrictEqual(chkOrmData({ a: [Symbol(H)] }), bad('data.a[0]'))
        assert.deepStrictEqual(chkOrmData(Symbol(H)), bad('data'))
        assert.strictEqual(chkOrmData(Symbol('ok')), null)
        assert.strictEqual(chkOrmData(() => 1), null)
    })

    it('should check the source of RegExp objects (lmdb, mongodb and mdb store it), not the flags, and ignore a plain object posing as a RegExp', function() {
        assert.strictEqual(chkOrmData({ r: /a+b/gi }), null)
        assert.deepStrictEqual(chkOrmData({ r: new RegExp(H) }), bad('data.r.source'))
        assert.deepStrictEqual(chkOrmData({ r: new RegExp(`ok${L}`, 'g') }), bad('data.r.source'))
        assert.deepStrictEqual(chkOrmData({ r: Object.assign(/a/, { extra: H }) }), bad('data.r.extra'))
        assert.deepStrictEqual(chkOrmData({ r: { source: H, flags: 'g' } }), bad('data.r.source')) //一般物件之自有鍵 source 本就會被走訪(與 RegExp 無關)
    })

})


describe('chkOrmData Map 與 Set(規則3; 盤點證據見帳本: lmdb 之 msgpack 存 Map 項目與 Set 元素, 故一併走訪)', function() {

    it('should check Map keys (string and object keys) and values, with <key> for a bad key and the entry index in the path', function() {
        assert.strictEqual(chkOrmData({ m: new Map([['k', 'v'], [1, { a: ['b'] }], [{ o: 'x' }, 'y']]) }), null)
        assert.deepStrictEqual(chkOrmData({ m: new Map([['k', 'v'], ['k2', { n: H }]]) }), bad('data.m[1].n'))
        assert.deepStrictEqual(chkOrmData({ m: new Map([['ok', 'v'], [`k${H}`, 'v']]) }), bad('data.m[1].<key>'))
        assert.deepStrictEqual(chkOrmData({ m: new Map([['k', L]]) }), bad('data.m[0]'))
        assert.deepStrictEqual(chkOrmData({ m: new Map([[{ o: H }, 'v']]) }), bad('data.m[0].<key>.o'))
        assert.deepStrictEqual(chkOrmData({ m: new Map([[1, 'x'], [2, ['p', H]]]) }), bad('data.m[1][1]'))
    })

    it('should check Set elements, nested containers inside Set, and Map/Set at the root', function() {
        assert.strictEqual(chkOrmData({ s: new Set(['a', 'b', { c: 'd' }]) }), null)
        assert.deepStrictEqual(chkOrmData({ s: new Set(['a', L]) }), bad('data.s[1]'))
        assert.deepStrictEqual(chkOrmData({ s: new Set([{ a: [H] }]) }), bad('data.s[0].a[0]'))
        assert.deepStrictEqual(chkOrmData(new Set([H])), bad('data[0]'))
        assert.deepStrictEqual(chkOrmData(new Map([['k', H]])), bad('data[0]'))
    })

    it('should check both entries and own enumerable properties of Map/Set subclasses and Map/Set carrying own properties', function() {
        class MyMap extends Map {}
        let m = new MyMap([['k', 'v']])
        m.own = H
        assert.deepStrictEqual(chkOrmData({ m }), bad('data.m.own'))
        let m2 = new MyMap([['k', L]])
        m2.own = 'ok'
        assert.deepStrictEqual(chkOrmData({ m: m2 }), bad('data.m[0]'))
        let s = new Set(['a'])
        s.own = `x${L}`
        assert.deepStrictEqual(chkOrmData({ s }), bad('data.s.own'))
        let mk = new Map([['k', 'v']])
        mk[`own${H}`] = 1
        assert.deepStrictEqual(chkOrmData({ m: mk }), bad('data.m.<invalid key>'))
    })

    it('should judge built-ins by their internal slot, not by the tag: a re-tagged Map, Set, Date or Error is still walked (or skipped) as what it is; a plain object posing with a tag is not', function() {
        class Hidden extends Map {
            get [Symbol.toStringTag]() {
                return 'Hidden'
            }
        }
        let h = new Hidden([['k', H]])
        h.own = 'ok'
        assert.deepStrictEqual(chkOrmData({ h }), bad('data.h[0]'))
        let owned = new Map([['k', L]])
        Object.defineProperty(owned, Symbol.toStringTag, { value: 'Object' })
        assert.deepStrictEqual(chkOrmData({ owned }), bad('data.owned[0]'))
        let hiddenSet = new Set(['a', H])
        Object.defineProperty(hiddenSet, Symbol.toStringTag, { value: 'X' })
        assert.deepStrictEqual(chkOrmData({ hiddenSet }), bad('data.hiddenSet[1]'))
        let err = new Error(H)
        Object.defineProperty(err, Symbol.toStringTag, { value: 'NotAnError' })
        assert.deepStrictEqual(chkOrmData({ err }), bad('data.err.message'))
        let date = Object.assign(new Date(0), { extra: H })
        Object.defineProperty(date, Symbol.toStringTag, { value: 'NotADate' })
        assert.strictEqual(chkOrmData({ date }), null)
        //原型為null/Object.prototype者當一般物件(複製後即不含項目)
        let reproto = Object.setPrototypeOf(new Map([['k', H]]), null)
        assert.strictEqual(chkOrmData({ reproto }), null)
        //標籤偽稱而無內部槽者當一般物件
        class Pose {
            get [Symbol.toStringTag]() {
                return 'Map'
            }
        }
        let pose = new Pose()
        pose.f = L
        assert.deepStrictEqual(chkOrmData({ pose }), bad('data.pose.f'))
        let setTagged = {
            get [Symbol.toStringTag]() {
                return 'Set'
            }
        }
        let poseSet = Object.assign(Object.create(setTagged), { f: 'ok' })
        assert.strictEqual(chkOrmData({ poseSet }), null)
    })

    it('should classify each prototype once per call but still tell apart instances of one prototype (class instances stay cheap)', function() {
        class P {
            constructor(v) {
                this.v = v
            }
        }
        let list = Array.from({ length: 30000 }, (_, i) => new P(`v${i}`))
        let t0 = Date.now()
        assert.strictEqual(chkOrmData(list), null)
        assert.ok(Date.now() - t0 < 1500)
        //同一原型已判為一般物件者(以原型為單位記憶), 其後原型相同之內建物件亦當一般物件(此為極端構造: 內建物件被setPrototypeOf成類別原型, 複製後即不含項目)
        let m = new Map([['k', H]])
        Object.setPrototypeOf(m, P.prototype)
        assert.strictEqual(chkOrmData({ a: new P('x'), m }), null) //原型為類別者, Map之內部槽被當一般物件(複製後即不含項目)
    })

    it('should confirm the kind of every instance by its internal slot even when its prototype was already seen as a Map (Object.create(Map.prototype) is no Map)', function() {
        let fake = Object.assign(Object.create(Map.prototype), { own: H })
        assert.doesNotThrow(() => chkOrmData([new Map([['k', 'v']]), fake]))
        assert.deepStrictEqual(chkOrmData([new Map([['k', 'v']]), fake]), bad('data[1].own'))
        assert.strictEqual(chkOrmData([new Map(), Object.create(Map.prototype)]), null)
        let fakeSet = Object.assign(Object.create(Set.prototype), { own: L })
        assert.deepStrictEqual(chkOrmData([new Set(['a']), fakeSet]), bad('data[1].own'))
    })

    it('should not treat an ordinary object as a Map or Set (and not read internal slots of Map-like objects)', function() {
        let fake = { size: 1, entries: () => [[H, H]], values: () => [H], has: () => true, forEach: () => {} }
        assert.strictEqual(chkOrmData({ f: fake }), null)
        let tagged = {
            get [Symbol.toStringTag]() {
                return 'Map'
            },
            a: 'ok'
        }
        assert.strictEqual(chkOrmData(tagged), null)
    })

})


describe('chkOrmData 回傳與路徑格式(規則5)', function() {

    it('should return a plain { reason, path } object with exactly these two keys', function() {
        let r = chkOrmData({ a: H })
        assert.deepStrictEqual(Object.keys(r), ['reason', 'path'])
        assert.strictEqual(Object.getPrototypeOf(r), Object.prototype)
        assert.strictEqual(r.reason, LONE)
    })

    it('should never put a bad key into the path, only the <invalid key> marker (object, nested object, array of objects, Map)', function() {
        let key = `SECRET${H}KEY`
        let rs = [
            chkOrmData({ [key]: 1 }),
            chkOrmData({ a: { [key]: 1 } }),
            chkOrmData({ a: [{ b: { [key]: 1 } }] }),
            chkOrmData({ a: new Map([[key, 1]]) }),
            chkOrmData({ [key]: H }),
            chkOrmData({ [key]: { [key]: H } }),
        ]
        assert.deepStrictEqual(rs.map((r) => r.path), ['data.<invalid key>', 'data.a.<invalid key>', 'data.a[0].b.<invalid key>', 'data.a[0].<key>', 'data.<invalid key>', 'data.<invalid key>'])
        for (let r of rs) {
            assert.ok(!r.path.includes('SECRET') && !r.reason.includes('SECRET'), r.path)
            assert.ok(r.path.isWellFormed(), 'path must be well-formed')
        }
    })

    it('should show well-formed keys cleaned like cvOrmFind (30 chars, control/format/bidi chars and brackets replaced by ?)', function() {
        let long = `${'k'.repeat(40)}`
        assert.deepStrictEqual(chkOrmData({ [long]: H }), bad(`data.${'k'.repeat(30)}...`))
        assert.deepStrictEqual(chkOrmData({ 'a[0]': H }), bad('data.a?0?'))
        assert.deepStrictEqual(chkOrmData({ 'a\nb\u0007c': H }), bad('data.a?b?c'))
        assert.deepStrictEqual(chkOrmData({ 'a‮b​c': H }), bad('data.a?b?c'))
        assert.deepStrictEqual(chkOrmData({ '中文\u{1F600}': H }), bad('data.中文\u{1F600}'))
        assert.deepStrictEqual(chkOrmData({ '': H }), bad('data.'))
        assert.deepStrictEqual(chkOrmData({ 0: H, 1: 'x' }), bad('data.0'))
    })

    it('should keep the truncated path well-formed: the cut never lands inside a surrogate pair (7 levels of emoji keys, every cut position)', function() {
        for (let pad = 0; pad < 21; pad++) { //其中恰有切點落在代理對中間者(以不避開之切法重算驗證)
            let o = { z: H }
            let emoji = String.fromCodePoint(0x1F600)
            for (let i = 0; i < 30; i++) {
                o = { [`${'x'.repeat(pad)}${emoji}${emoji}${emoji}`]: o }
            }
            let r = chkOrmData(o)
            assert.ok(r.path.startsWith('...'), r.path)
            assert.ok(r.path.isWellFormed(), `pad ${pad}: path must not hold a lone half`)
            assert.ok(r.path.length >= 99 && r.path.length <= 103, `${r.path.length}`)
        }
    })

    it('should ignore an opt.root that would put NUL, lone halves, control characters or an oversized label into the path', function() {
        for (let bad1 of [`d${H}`, `d${L}x`, `d${String.fromCharCode(0)}x`, `d${String.fromCharCode(10)}x`, `d${String.fromCharCode(7)}`, `d${String.fromCharCode(0x202E)}x`, 'x'.repeat(201), '']) {
            assert.deepStrictEqual(chkOrmData({ a: H }, { root: bad1 }), bad('data.a'), JSON.stringify(bad1).slice(0, 30))
        }
        assert.deepStrictEqual(chkOrmData({ a: H }, { root: 'x'.repeat(200) }), bad(`...${'x'.repeat(98)}.a`))
        assert.deepStrictEqual(chkOrmData({ a: H }, { root: 'data[12]' }), bad('data[12].a'))
        assert.deepStrictEqual(chkOrmData({ a: H }, { root: '資料[2]' }), bad('資料[2].a'))
        assert.deepStrictEqual(chkOrmData(H, { root: `ro${L}` }), bad('data'))
    })

    it('should use opt.root as the path label, ignoring non-string roots', function() {
        assert.deepStrictEqual(chkOrmData({ a: H }, { root: 'data[2]' }), bad('data[2].a'))
        assert.deepStrictEqual(chkOrmData([{ a: 'x' }, { a: H }], { root: 'items' }), bad('items[1].a'))
        for (let v of [undefined, null, 1, {}, [], true]) {
            assert.deepStrictEqual(chkOrmData({ a: H }, { root: v }), bad('data.a'))
        }
    })

    it('should truncate long paths to ... plus the last 100 characters (as cvOrmFind)', function() {
        let o = { z: H }
        for (let i = 0; i < 60; i++) {
            o = { [`level${i}`]: o }
        }
        let r = chkOrmData(o)
        assert.ok(r.path.startsWith('...'), r.path)
        assert.strictEqual(r.path.length, 103)
        assert.ok(r.path.endsWith('.level0.z'), r.path)
    })

    it('should cut at an exact place when the cut lands on a pair: low half moves the cut one later (99 kept), high half keeps the whole pair (boundary pairs U+10000, U+1F600, U+10FFFF)', function() {
        for (let pair of [String.fromCodePoint(0x10000), String.fromCodePoint(0x1F600), String.fromCodePoint(0x10FFFF)]) {
            //path = root + '.a'; root = 31個r + 一個代理對 + m個r
            let low = `${'r'.repeat(31)}${pair}${'r'.repeat(97)}` //路徑長132, 切點(第32碼元)為低位
            assert.deepStrictEqual(chkOrmData({ a: H }, { root: low }), bad(`...${'r'.repeat(97)}.a`), `low half ${pair.codePointAt(0).toString(16)}`)
            let high = `${'r'.repeat(31)}${pair}${'r'.repeat(96)}` //路徑長131, 切點(第31碼元)為高位
            assert.deepStrictEqual(chkOrmData({ a: H }, { root: high }), bad(`...${pair}${'r'.repeat(96)}.a`), `high half ${pair.codePointAt(0).toString(16)}`)
        }
    })

    it('should leave a path of exactly 120 characters whole and cut one of 121 to ... plus the last 100 (all ASCII, as before)', function() {
        let r120 = 'r'.repeat(118) //118 + '.a'
        assert.deepStrictEqual(chkOrmData({ a: H }, { root: r120 }), bad(`${r120}.a`))
        let r121 = 'r'.repeat(119)
        assert.deepStrictEqual(chkOrmData({ a: H }, { root: r121 }), bad(`...${'r'.repeat(98)}.a`))
    })

    it('should build every path through the shared _ormPathCut, receiving the full untruncated path (stand-in proves the call; R-ORMSTR-01 rule 16)', function() {
        let code = srcBundle('chkOrmData', '__f', { _ormPathCut: '(s) => \'CUT<\' + s.length + \'>\'' })
        let ctx = vm.createContext({})
        vm.runInContext(code, ctx)
        let out = JSON.parse(vm.runInContext(`(function() {
            let f = globalThis.__f
            let lone = String.fromCharCode(0xD800)
            let deep = (n, leaf) => { let r = leaf; for (let i = 0; i < n; i++) { r = { k: r } } return r }
            return JSON.stringify([f({ a: lone }), f(deep(30, lone)), f({ a: [1, lone] }, { root: 'x'.repeat(150) }), f({ ['b' + lone]: 1 })])
        })()`, ctx))
        assert.deepStrictEqual(out, [
            { reason: 'string contains lone surrogate', path: 'CUT<6>' }, //data.a
            { reason: 'string contains lone surrogate', path: 'CUT<64>' }, //data + 30個.k
            { reason: 'string contains lone surrogate', path: 'CUT<155>' }, //150個x + .a[1]
            { reason: 'string contains lone surrogate', path: 'CUT<18>' }, //data.<invalid key>
        ])
    })

    it('should report the first bad place in document order: keys of an object before its values, then values depth-first in key order', function() {
        assert.deepStrictEqual(chkOrmData({ name: L, [`k${H}`]: 1 }), bad('data.<invalid key>'))
        assert.deepStrictEqual(chkOrmData({ a: { s: H }, b: L }), bad('data.a.s'))
        assert.deepStrictEqual(chkOrmData({ b: L, a: { s: H } }), bad('data.b'))
        assert.deepStrictEqual(chkOrmData({ a: [{ s: 'ok' }, { s: H }], b: [L] }), bad('data.a[1].s'))
        assert.deepStrictEqual(chkOrmData([{ n: 'ok' }, { n: H }, { n: L }]), bad('data[1].n'))
        assert.deepStrictEqual(chkOrmData({ a: { x: 1, [`y${H}`]: 2 }, b: { [`z${L}`]: 3 } }), bad('data.a.<invalid key>'))
        assert.deepStrictEqual(chkOrmData({ b: 'ok', 1: H, a: 'x' }), bad('data.1'))
    })

})


describe('chkOrmData opt.nul(規則2)', function() {

    it('should not check NUL in values and keys by default, and check them only when opt.nul is exactly true', function() {
        let doc = { id: 'a', n: 'x\u0000y', nested: { 'k\u0000': ['\u0000'] } }
        assert.strictEqual(chkOrmData(doc), null)
        assert.strictEqual(chkOrmData(doc, {}), null)
        assert.strictEqual(chkOrmData(doc, { nul: false }), null)
        for (let v of [1, 'true', {}, [], undefined, null]) {
            assert.strictEqual(chkOrmData(doc, { nul: v }), null, String(v))
        }
        assert.deepStrictEqual(chkOrmData(doc, { nul: true }), { reason: NUL, path: 'data.n' })
        assert.deepStrictEqual(chkOrmData({ n: 'x\u0000y' }, { nul: true }), { reason: NUL, path: 'data.n' })
        assert.deepStrictEqual(chkOrmData({ 'k\u0000': 1 }, { nul: true }), { reason: NUL, path: 'data.<invalid key>' })
        assert.deepStrictEqual(chkOrmData({ n: `\u0000${H}` }, { nul: true }), { reason: NUL, path: 'data.n' })
    })

    it('should still report lone surrogates when NUL is not checked and the string also holds NUL', function() {
        assert.deepStrictEqual(chkOrmData({ n: `a\u0000${H}` }), bad('data.n'))
    })

    it('should read opts only as own data properties (inherited, polluted and accessor values do not apply, getters not called)', function() {
        let calls = 0
        let acc = {}
        Object.defineProperty(acc, 'nul', { get() { calls++; return true }, enumerable: true }) // eslint-disable-line
        Object.defineProperty(acc, 'root', { get() { calls++; return 'evil' }, enumerable: true }) // eslint-disable-line
        assert.strictEqual(chkOrmData({ n: '\u0000' }, acc), null)
        assert.deepStrictEqual(chkOrmData({ n: H }, acc), bad('data.n'))
        assert.strictEqual(calls, 0)
        let inh = Object.create({ nul: true, root: 'evil' })
        assert.strictEqual(chkOrmData({ n: '\u0000' }, inh), null)
        assert.deepStrictEqual(chkOrmData({ n: H }, inh), bad('data.n'))
        Object.prototype.nul = true
        Object.prototype.root = 'evil'
        try {
            assert.strictEqual(chkOrmData({ n: '\u0000' }), null)
            assert.deepStrictEqual(chkOrmData({ n: H }), bad('data.n'))
        }
        finally {
            delete Object.prototype.nul
            delete Object.prototype.root
        }
        for (let o of [undefined, null, 0, 'x', true, [], () => {}]) {
            assert.deepStrictEqual(chkOrmData({ n: H }, o), bad('data.n'))
        }
    })

})


describe('chkOrmData 迭代、無上限、循環與共享參照(規則4)', function() {

    it('should walk a 200000-level deep object chain and array chain without a stack overflow, finding a bad string at the bottom', function() {
        let n = 200000
        let o = { z: 'ok' }
        for (let i = 0; i < n; i++) {
            o = { c: o }
        }
        assert.strictEqual(chkOrmData(o), null)
        let o2 = { z: H }
        for (let i = 0; i < n; i++) {
            o2 = { c: o2 }
        }
        let r = chkOrmData(o2)
        assert.strictEqual(r.reason, LONE)
        assert.ok(r.path.startsWith('...') && r.path.endsWith('.c.z'), r.path)
        let a = ['ok']
        for (let i = 0; i < n; i++) {
            a = [a]
        }
        assert.strictEqual(chkOrmData(a), null)
        let a2 = [H]
        for (let i = 0; i < n; i++) {
            a2 = [a2]
        }
        assert.strictEqual(chkOrmData(a2).reason, LONE)
    })

    it('should render a 200000-segment path without recursion (object, array and Map segments mixed)', function() {
        let o = { z: H }
        for (let i = 0; i < 70000; i++) {
            o = { c: [new Map([['k', o]])] }
        }
        let r = chkOrmData(o)
        assert.strictEqual(r.reason, LONE)
        assert.ok(r.path.startsWith('...') && r.path.endsWith('.z'), r.path)
        assert.strictEqual(r.path.length, 103)
    })

    it('should not limit width, string length or node count (1e6 element array, 3e5 keys, a 5e6 character string)', function() {
        let big = Array.from({ length: 1000000 }, (_, i) => `v${i}`)
        assert.strictEqual(chkOrmData(big), null)
        big[999999] = H
        assert.deepStrictEqual(chkOrmData(big), bad('data[999999]'))
        let wide = {}
        for (let i = 0; i < 300000; i++) {
            wide[`k${i}`] = 'v'
        }
        assert.strictEqual(chkOrmData(wide), null)
        wide[`k${H}`] = 'v'
        assert.deepStrictEqual(chkOrmData(wide), bad('data.<invalid key>'))
        assert.strictEqual(chkOrmData({ s: 'a'.repeat(5000000) }), null)
        assert.deepStrictEqual(chkOrmData({ s: `${'a'.repeat(5000000)}${H}` }), bad('data.s'))
    })

    it('should terminate on self references, mutual references and an array containing itself, still finding bad strings', function() {
        let a = { name: 'a' }
        a.self = a
        assert.strictEqual(chkOrmData(a), null)
        a.late = H
        assert.deepStrictEqual(chkOrmData(a), bad('data.late'))
        let x = { n: 'x' }
        let y = { n: 'y', x }
        x.y = y
        assert.strictEqual(chkOrmData({ x, y }), null)
        y.n = L
        assert.deepStrictEqual(chkOrmData({ x, y }), bad('data.x.y.n'))
        let arr = ['a']
        arr.push(arr)
        assert.strictEqual(chkOrmData(arr), null)
        arr.push(H)
        assert.deepStrictEqual(chkOrmData(arr), bad('data[2]'))
        let m = new Map()
        m.set('self', m)
        assert.strictEqual(chkOrmData(m), null)
        let s = new Set()
        s.add(s)
        assert.strictEqual(chkOrmData(s), null)
    })

    it('should walk a shared object once even when it is referenced exponentially often (DAG of 60 levels)', function() {
        let node = { v: 'leaf' }
        for (let i = 0; i < 60; i++) {
            node = { l: node, r: node }
        }
        let t0 = Date.now()
        assert.strictEqual(chkOrmData(node), null)
        assert.ok(Date.now() - t0 < 500, 'shared references must not be expanded')
        let leaf = { v: H }
        let node2 = leaf
        for (let i = 0; i < 60; i++) {
            node2 = { l: node2, r: node2 }
        }
        let r = chkOrmData(node2)
        assert.strictEqual(r.reason, LONE)
        assert.ok(r.path.endsWith('.l.v'), r.path)
    })

    it('should walk sparse arrays by their real elements, not by length (length 2^32-1 with elements at 5 and 4e9)', function() {
        let sp = []
        sp.length = 4294967295
        sp[5] = 'ok'
        sp[4000000000] = 'ok2'
        let t0 = Date.now()
        assert.strictEqual(chkOrmData({ sp }), null)
        sp[4000000001] = H
        assert.deepStrictEqual(chkOrmData({ sp }), bad('data.sp[4000000001]'))
        assert.ok(Date.now() - t0 < 1000)
        let sp2 = []
        sp2.length = 100000
        sp2[7] = L
        assert.deepStrictEqual(chkOrmData(sp2), bad('data[7]'))
        let sp3 = []
        sp3.length = 100000
        sp3[3] = 'ok'
        sp3.extra = H
        sp3['01'] = H
        sp3['1.5'] = H
        sp3['-1'] = H
        sp3[Symbol('s')] = H
        sp3[4294967295] = H //2^32-1不是陣列索引(只是一般屬性)
        assert.strictEqual(chkOrmData({ sp3 }), null)
        sp3[4294967294] = H //最大合法索引: length隨之增大
        assert.deepStrictEqual(chkOrmData({ sp3 }), bad('data.sp3[4294967294]'))
        let small = [, , H]
        assert.deepStrictEqual(chkOrmData(small), bad('data[2]'))
        let dense = Array.from({ length: 5000 }, () => 'x')
        dense[4999] = H
        assert.deepStrictEqual(chkOrmData(dense), bad('data[4999]'))
    })

})


describe('chkOrmData 不修改輸入、不受汙染與覆寫影響、可重入(規則6)', function() {

    it('should not modify the input (frozen deep structure, same shape afterwards)', function() {
        let doc = { id: 'a', tags: ['x', { y: 'z' }], m: new Map([['k', 'v']]), s: new Set(['q']), d: new Date(0) }
        let snapshot = JSON.stringify(doc)
        let deepFreeze = (v) => {
            if (v !== null && typeof v === 'object' && !(v instanceof Date) && !Object.isFrozen(v)) {
                Object.freeze(v)
                for (let k of Reflect.ownKeys(v)) {
                    deepFreeze(v[k])
                }
            }
            return v
        }
        deepFreeze(doc)
        assert.strictEqual(chkOrmData(doc), null)
        assert.strictEqual(JSON.stringify(doc), snapshot)
        assert.deepStrictEqual(Object.keys(doc), ['id', 'tags', 'm', 's', 'd'])
    })

    it('should be unaffected by Array.prototype index setters, Object.prototype members and replaced built-ins after load', function() {
        let deepDoc = () => {
            let o = { z: H }
            for (let i = 0; i < 60; i++) {
                o = { [`level${i}`]: o }
            }
            return o
        }
        let bigSparse = () => {
            let a = []
            a.length = 100000
            a[7] = 'ok'
            a[99999] = L
            return { a }
        }
        let withProto = () => Object.create({ inh: ['p', H] }, { own: { value: 'ok', enumerable: true } })
        let docs = () => [{ id: 'a', arr: ['x', 'y'], o: { k: 'v' } }, { id: 'b', arr: ['x', H], o: { k: 'v' } }, { id: 'c', [`k${L}`]: 1 }, { m: new Map([['k', H]]) }, deepDoc(), bigSparse(), withProto(), { e: new Error(H) }, { s: new Set(['a', L]) }]
        let inputs = docs() //先建好(覆寫期間 new Set 等會用到被覆寫之內建); 檢核不修改輸入, 兩次共用
        let expected = inputs.map((d) => chkOrmData(d))
        assert.deepStrictEqual(expected.map((r) => r && r.path), [null, 'data.arr[1]', 'data.<invalid key>', 'data.m[0]', expected[4].path, 'data.a[99999]', 'data.inh[1]', 'data.e.message', 'data.s[1]'])
        assert.ok(expected[4].path.startsWith('...') && expected[4].path.length === 103, expected[4].path)
        let sOwnKeys = Reflect.ownKeys
        let sDesc = Object.getOwnPropertyDescriptor
        let sIsArray = Array.isArray
        let sGetProto = Object.getPrototypeOf
        let sHas = WeakSet.prototype.has
        let sAdd = WeakSet.prototype.add
        let sIdx = String.prototype.indexOf
        let sIsWf = String.prototype.isWellFormed
        let sExec = RegExp.prototype.exec
        let sSlice = String.prototype.slice
        let sCc = String.prototype.charCodeAt
        let sString = globalThis.String
        let sWmGet = WeakMap.prototype.get
        let sWmSet = WeakMap.prototype.set
        let sSetHas = Set.prototype.has
        let sSetAdd = Set.prototype.add
        let sMapEntries = Map.prototype.entries
        let sSetValues = Set.prototype.values
        let sObjToString = Object.prototype.toString
        let mapIterProto = Object.getPrototypeOf(new Map().entries())
        let setIterProto = Object.getPrototypeOf(new Set().values())
        let sMapNext = mapIterProto.next
        let sSetNext = setIterProto.next
        let seenSetter = 0
        let got
        try {
            Object.defineProperty(Array.prototype, '0', {
                set() {
                    seenSetter++
                },
                get() {
                    return H
                },
                configurable: true
            })
            Object.prototype.reason = 'poison'
            Object.prototype.path = 'poison'
            Object.prototype.value = H
            Object.prototype.enumerable = true
            Reflect.ownKeys = () => []
            Object.getOwnPropertyDescriptor = () => undefined
            Array.isArray = () => false
            Object.getPrototypeOf = () => null
            WeakSet.prototype.has = () => true
            WeakSet.prototype.add = () => {
                throw new Error('x')
            }
            String.prototype.indexOf = () => -1
            String.prototype.isWellFormed = () => true
            RegExp.prototype.exec = () => null
            String.prototype.slice = () => ''
            String.prototype.charCodeAt = () => 0
            globalThis.String = function() {
                return 'X'
            }
            WeakMap.prototype.get = () => undefined
            WeakMap.prototype.set = () => {
                throw new Error('x')
            }
            Set.prototype.has = () => true
            Set.prototype.add = () => {
                throw new Error('x')
            }
            Map.prototype.entries = () => []
            Set.prototype.values = () => []
            Object.prototype.toString = () => '[object Object]'
            mapIterProto.next = () => ({ done: true })
            setIterProto.next = () => ({ done: true })
            got = inputs.map((d) => chkOrmData(d))
        }
        finally {
            globalThis.String = sString //先還原全域String(其後之String.prototype才是真正之原型)
            delete Array.prototype[0]
            Array.prototype.length = 0 //Array.prototype本身是陣列, 定義索引0會把length撐為1, 刪除後須還原
            delete Object.prototype.reason
            delete Object.prototype.path
            delete Object.prototype.value
            delete Object.prototype.enumerable
            Reflect.ownKeys = sOwnKeys
            Object.getOwnPropertyDescriptor = sDesc
            Array.isArray = sIsArray
            Object.getPrototypeOf = sGetProto
            WeakSet.prototype.has = sHas
            WeakSet.prototype.add = sAdd
            String.prototype.indexOf = sIdx
            String.prototype.isWellFormed = sIsWf
            RegExp.prototype.exec = sExec
            String.prototype.slice = sSlice
            String.prototype.charCodeAt = sCc
            WeakMap.prototype.get = sWmGet
            WeakMap.prototype.set = sWmSet
            Set.prototype.has = sSetHas
            Set.prototype.add = sSetAdd
            Map.prototype.entries = sMapEntries
            Set.prototype.values = sSetValues
            Object.prototype.toString = sObjToString
            mapIterProto.next = sMapNext
            setIterProto.next = sSetNext
        }
        assert.strictEqual(seenSetter, 0)
        assert.deepStrictEqual(got, expected)
    })

    it('should be re-entrant: a Proxy trap that calls chkOrmData again does not disturb the outer walk', function() {
        let inner = []
        let p = new Proxy({ a: 'x', b: H }, {
            ownKeys(t) {
                inner.push(chkOrmData({ q: L }))
                return Reflect.ownKeys(t)
            }
        })
        assert.deepStrictEqual(chkOrmData({ p }), bad('data.p.b'))
        assert.deepStrictEqual(inner, [bad('data.q')])
    })

    it('should rethrow exceptions raised by hostile Proxy traps unchanged (no swallowing)', function() {
        let boom = new Error('trap')
        let p = new Proxy({ a: 1 }, {
            ownKeys() {
                throw boom
            }
        })
        assert.throws(() => chkOrmData({ p }), (e) => e === boom)
        let r = Proxy.revocable({}, {})
        r.revoke()
        assert.throws(() => chkOrmData({ r: r.proxy }), TypeError)
    })

})


describe('chkOrmData 純JS(規則3、4)', function() {

    let src = fs.readFileSync(fpSrc, 'utf8')
    let strip = (t) => t.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')

    it('should import nothing but chkOrmStr, _ormMsgClean and _ormPathCut, and mention no Node API or lodash', function() {
        assert.deepStrictEqual(src.match(/^\s*import\s.*$/gm).map((v) => v.trim()), ['import chkOrmStr from \'./chkOrmStr.mjs\'', 'import clean from \'./_ormMsgClean.mjs\'', 'import ormPathCut from \'./_ormPathCut.mjs\''])
        assert.ok(!/\brequire\s*\(/.test(src), 'must not require')
        assert.ok(!/\bBuffer\b/.test(strip(src)), 'must not use Buffer')
        assert.ok(!/\bprocess\b/.test(strip(src)), 'must not use process')
        assert.ok(!/lodash/.test(strip(src)), 'must not use lodash')
        assert.ok(/^export default chkOrmData\s*$/m.test(src), 'must export default chkOrmData')
    })

    it('should contain no BigInt literal in code (jsdoc would fail serializing it)', function() {
        assert.ok(!/(^|[^\w$.])(0[xXoObB][\da-fA-F_]+|\d[\d_]*)n\b/.test(strip(src).replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '')), 'BigInt literal in code')
    })

    it('should load and work in a context without Node globals, with and without String.prototype.isWellFormed', function() {
        let code = srcBundle('chkOrmData', '__f')
        let run = (setup) => {
            let ctx = vm.createContext({ H, L })
            vm.runInContext(setup, ctx)
            vm.runInContext(code, ctx)
            return JSON.parse(vm.runInContext(`(function() {
                let f = globalThis.__f
                return JSON.stringify({
                    noNode: [typeof process, typeof Buffer, typeof require, typeof module],
                    r: [f({ a: 'x' }), f({ a: [H] }), f({ ['k' + L]: 1 }), f({ m: new Map([['k', H]]) }), f({ n: 'a\\u0000' }, { nul: true }), f({ d: new Date(0), u: new Uint8Array(2) })]
                })
            })()`, ctx))
        }
        let want = {
            noNode: ['undefined', 'undefined', 'undefined', 'undefined'],
            r: [null, bad('data.a[0]'), bad('data.<invalid key>'), bad('data.m[0]'), { reason: NUL, path: 'data.n' }, null]
        }
        assert.deepStrictEqual(run(''), want)
        assert.deepStrictEqual(run('delete String.prototype.isWellFormed; Object.prototype.isWellFormed = () => true'), want)
    })

    it('should handle values from another realm (vm context objects, arrays, Maps)', function() {
        let other = vm.runInNewContext('({ a: [1, "x", { b: "\\uD800" }], m: new Map([["k", "\\uDC00"]]), d: new Date(0), clean: { z: ["ok"] } })')
        assert.deepStrictEqual(chkOrmData(other), bad('data.a[2].b'))
        let other2 = vm.runInNewContext('({ m: new Map([["k", "\\uDC00"]]), d: new Date(0) })')
        assert.deepStrictEqual(chkOrmData(other2), bad('data.m[0]'))
        let other3 = vm.runInNewContext('({ s: new Set(["a"]), d: new Date(0), u: new Uint8Array(2), clean: { z: ["ok"] } })')
        assert.strictEqual(chkOrmData(other3), null)
    })

})


describe('chkOrmData 成本(規則7)', function() {

    it('should check a typical document (20 fields x 50 chars) within 30 microseconds (measured ~3 microseconds, 1.6x JSON.stringify of the same document)', function() {
        let doc = {}
        for (let i = 0; i < 20; i++) {
            doc[`field${i}`] = `${'v'.repeat(50)}${i}`
        }
        let n = 20000
        for (let i = 0; i < 2000; i++) {
            chkOrmData(doc)
        }
        let t0 = process.hrtime.bigint()
        for (let i = 0; i < n; i++) {
            chkOrmData(doc)
        }
        let us = Number(process.hrtime.bigint() - t0) / n / 1000
        assert.ok(us < 30, `${us} us per document`)
    })

    let fpRunner = path.join(dirTest, 'tools', 'chkOrmDataRunner.mjs')
    //堆積上限(MB): 二十萬層巢狀之輸入本身加走訪框架約需64MB以上, 其餘64MB
    for (let [name, mb] of [['array', 64], ['wide', 64], ['deep', 128], ['dag', 64], ['sparse', 64], ['map', 64], ['set', 64]]) {
        it(`should walk the ${name} stress input in a child process with a ${mb} MB heap (no per-element retention, finds the bad string)`, function() {
            this.timeout(120000)
            let { r } = runChildCase(fpRunner, name, { execArgv: [`--max-old-space-size=${mb}`], timeout: 100000 })
            assert.deepStrictEqual(r.ok, true, JSON.stringify(r))
            assert.deepStrictEqual(r.clean, null)
            assert.deepStrictEqual(r.dirty.reason, LONE)
            assert.ok(r.ms < 20000, `${r.ms} ms`)
        })
    }

})


describe('chkOrmData 會呼叫繼承存取器之 JSDoc 說明(規則15、第94項併入)', function() {

    let src = fs.readFileSync(fpSrc, 'utf8')
    let doc = src.slice(src.indexOf('/**'), src.indexOf('function chkOrmData'))

    it('should say in the JSDoc that enumerable accessors (inherited ones included) are called, that the backend must walk an independent copy, and that the walk copy can be repaired by the accessor (known limitation)', function() {
        assert.ok(/會呼叫可列舉存取器\(含繼承者\)，後端應於獨立複本上走訪/.test(doc))
        assert.ok(/改動被走訪之同一份複本/.test(doc))
        assert.ok(/寫入用複本不被走訪/.test(doc))
        assert.ok(/事件訂閱者之物件亦須為獨立快照/.test(doc))
        assert.ok(/訂閱函數拋錯不得影響操作/.test(doc))
        assert.ok(/擋不住存取器『修好』走訪用複本中的不合格值/.test(doc))
        assert.ok(/把存取器固定為資料/.test(doc))
        assert.ok(/『修好』之情形尚無案例，列為已知限制/.test(doc))
    })

    it('should not keep the earlier wording that the backend may keep using the very same copy after the call', function() {
        assert.ok(!/並假設後端其後只使用同一份複本/.test(doc))
        assert.ok(/並假設後端其後寫入的就是被檢查之值/.test(doc))
    })

    it('should be backed by increment cases that exist in next (not in cases): the inherited-accessor and event cases named in the JSDoc', function() {
        let ids = new Set(ormStrCases.next.map((c) => c.id))
        for (let id of ['toctou:insert:inh-getter-name', 'toctou:insertBulk:inh-getter-name', 'toctou:save:inh-getter-name', 'toctou:save:inh-getter-id', 'toctou:del:inh-getter-id', 'toctou:save:event-shared:insert', 'toctou:save:event-shared:update', 'toctou:save:event-shared-error', 'toctou:save:listener-throws']) {
            assert.ok(ids.has(id), id)
        }
        assert.ok(!ormStrCases.cases.some((c) => ids.has(c.id)))
    })

})
