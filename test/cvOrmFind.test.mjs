/* eslint-disable no-extend-native, no-sparse-arrays, no-control-regex, no-throw-literal, no-new-wrappers -- 測試刻意以稀疏陣列、控制字元、包裝物件、拋出非Error之值與暫時汙染原型(finally還原)驗證檢核器 */
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import vm from 'vm'
import { fileURLToPath } from 'url'
import cvOrmFind from '../src/cvOrmFind.mjs'
import cvOrmFindCases from '../src/_cvOrmFindCases.mjs'
import oracle from './tools/cvOrmFindOracle.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


//規則見CLAUDE_rulebook.md R-FIND-01; 案例表見src/_cvOrmFindCases.mjs; 預言機見test/tools/cvOrmFindOracle.mjs
//檢核先於一切讀取, 故此處皆為純函數測試(不連線、不需資料庫)

let dirTest = path.dirname(fileURLToPath(import.meta.url))
let fpSrc = path.join(dirTest, '..', 'src', 'cvOrmFind.mjs')
let fpRunner = path.join(dirTest, 'tools', 'cvOrmFindRunner.mjs')

let reMsg = /^invalid find: [^\n\r]+ at \[(?:find|\.\.\.)[^\n\r]*\]$/ //路徑過長時截短為...開頭

//errOf, 以thunk產生輸入(輸入本身可能為函數), 回傳拋出之錯誤; 未拋錯則令斷言失敗並顯示結果
let errOf = (mk, opt) => {
    let r
    try {
        r = cvOrmFind(mk(), opt)
    }
    catch (err) {
        return err
    }
    assert.fail(`should throw, got ${JSON.stringify(toPlain(r))}`)
}

//rej, 斷言整批reject: 為Error、訊息格式為invalid find: 原因 at [路徑]、含指定原因詞彙(why)與路徑結尾(at)
let rej = (mk, why, at, opt) => {
    let e = errOf(mk, opt)
    assert.ok(e instanceof Error, 'must be an Error')
    assert.ok(reMsg.test(e.message), e.message)
    if (why) {
        assert.ok(e.message.includes(why), `[${why}] not in: ${e.message}`)
    }
    if (at !== undefined) {
        assert.ok(e.message.endsWith(` at [${at}]`), `path [${at}] not at end of: ${e.message}`)
    }
    return e
}

let isDate = (v) => Object.prototype.toString.call(v) === '[object Date]'

//toPlain, 轉為可以deepStrictEqual比對之一般結構(Date轉{$date:毫秒}, 物件一律轉一般物件)
let toPlain = (v) => {
    if (v === null || typeof v !== 'object') {
        return v
    }
    if (isDate(v)) {
        return { $date: v.getTime() }
    }
    if (Array.isArray(v)) {
        return v.map(toPlain)
    }
    let o = {}
    for (let k of Object.keys(v)) {
        Object.defineProperty(o, k, { __proto__: null, value: toPlain(v[k]), enumerable: true, writable: true, configurable: true })
    }
    return o
}

//assertFresh, 複本與輸入逐層無共用參照; 物件為null原型、陣列為Array.prototype之密集陣列、Date為新Date
let assertFresh = (orig, copy, p = 'find') => {
    if (orig === null || typeof orig !== 'object') {
        assert.ok(Object.is(orig, copy), `${p}: scalar changed`)
        return
    }
    assert.notStrictEqual(orig, copy, `${p}: shares reference`)
    if (isDate(orig)) {
        assert.ok(isDate(copy), `${p}: not a Date`)
        assert.strictEqual(copy.getTime(), orig.getTime(), p)
        return
    }
    if (Array.isArray(orig)) {
        assert.ok(Array.isArray(copy), `${p}: not an array`)
        assert.strictEqual(Object.getPrototypeOf(copy), Array.prototype, p)
        assert.strictEqual(copy.length, orig.length, p)
        assert.strictEqual(Object.keys(copy).length, copy.length, `${p}: not dense`)
        assert.strictEqual(Reflect.ownKeys(copy).length, copy.length + 1, `${p}: extra own keys`)
        orig.forEach((x, i) => assertFresh(x, copy[i], `${p}[${i}]`))
        return
    }
    assert.strictEqual(Object.getPrototypeOf(copy), null, `${p}: not a null-prototype object`)
    assert.deepStrictEqual(Reflect.ownKeys(copy), Reflect.ownKeys(orig), p)
    for (let k of Reflect.ownKeys(orig)) {
        assertFresh(orig[k], copy[k], `${p}.${String(k)}`)
    }
}

//ok, 接受並斷言複本結構與輸入相同且無共用參照, 回傳複本
let ok = (mk, opt) => {
    let f = mk()
    let r = cvOrmFind(f, opt)
    assert.deepStrictEqual(toPlain(r), toPlain(f))
    assertFresh(f, r)
    return r
}

let chain = (n, leaf = { g: 'A' }) => {
    let o = leaf
    for (let i = 0; i < n; i++) {
        o = { $and: [o] }
    }
    return o
}
let fills = (n) => Array.from({ length: n }, (_, i) => `k${i}`)
let withEnumerable = (obj, k, v) => {
    Object.defineProperty(obj, k, { __proto__: null, value: v, enumerable: true, writable: true, configurable: true })
    return obj
}
let hidden = (obj, k, v) => {
    Object.defineProperty(obj, k, { __proto__: null, value: v, enumerable: false, writable: true, configurable: true })
    return obj
}
class Foo {
    constructor() {
        this.name = 'aa'
    }
}


describe('cvOrmFind 頂層(R-FIND-01 規則1~2)', function() {

    it('should return a fresh empty null-prototype object for undefined, {} and Object.create(null)', function() {
        for (let mk of [() => undefined, () => ({}), () => Object.create(null)]) {
            let r = cvOrmFind(mk())
            assert.strictEqual(Object.getPrototypeOf(r), null)
            assert.deepStrictEqual(Reflect.ownKeys(r), [])
        }
        assert.deepStrictEqual(Reflect.ownKeys(cvOrmFind()), [])
        assert.notStrictEqual(cvOrmFind(), cvOrmFind())
        let input = {}
        assert.notStrictEqual(cvOrmFind(input), input)
    })

    it('should reject every non-condition top-level value with the kind of the value (not the value)', function() {
        let bads = [
            ['null', () => null, 'null'],
            ['[]', () => [], 'array'],
            ['[{id:\'a\'}]', () => [{ id: 'a' }], 'array'],
            ['string', () => 'a1', 'string'],
            ['empty string', () => '', 'string'],
            ['number', () => 5, 'number'],
            ['0', () => 0, 'number'],
            ['NaN', () => NaN, 'number'],
            ['boolean', () => false, 'boolean'],
            ['function', () => () => ({}), 'function'],
            ['bigint', () => 1n, 'bigint'],
            ['symbol', () => Symbol('s'), 'symbol'],
            ['Date', () => new Date(0), 'Date'],
            ['RegExp', () => /a/, 'RegExp'],
            ['Map', () => new Map(), 'Map'],
            ['Set', () => new Set(), 'Set'],
            ['Promise', () => Promise.resolve({}), 'Promise'],
            ['Error', () => new Error('x'), 'Error'],
            ['Buffer', () => Buffer.from('x'), 'Uint8Array'],
            ['Uint8Array', () => new Uint8Array(2), 'Uint8Array'],
            ['String wrapper', () => new String('a'), 'String'],
            ['Number wrapper', () => new Number(1), 'Number'],
            ['class instance', () => new Foo(), 'object'],
            ['arguments', () => (function() {
                return arguments
            })(1), 'Arguments'],
            ['condition on the prototype', () => Object.create({ id: 'a1' }), 'object'],
            ['Object.create(Object.create(null))', () => Object.create(Object.create(null)), 'object'],
            ['object with Array.prototype', () => Object.setPrototypeOf({ a: 1 }, Array.prototype), 'object'],
            ['Proxy of an array', () => new Proxy([], {}), 'array'],
        ]
        for (let [label, mk, kind] of bads) {
            rej(mk, `condition must be a plain object, got [${kind}]`, 'find')
            assert.ok(true, label)
        }
    })

    it('should never treat a non-condition value as "all" (it must not return an empty object)', function() {
        for (let v of [null, [], '', 0, false, NaN, () => 1, new Date(), new Map(), new Set(), /x/, new Foo(), Object.create({})]) {
            assert.throws(() => cvOrmFind(v), /^Error: invalid find: /)
        }
    })

    it('should accept null-prototype and Object.prototype plain objects, and a Proxy of a plain object', function() {
        ok(() => ({ id: 'a1' }))
        ok(() => Object.assign(Object.create(null), { id: 'a1' }))
        ok(() => Object.create(Object.prototype, { id: { value: 'a1', enumerable: true } }))
        ok(() => new Proxy({ id: 'a1', age: { $gt: 1 } }, {}))
    })

    it('should reject a plain-prototype object that carries a toStringTag other than Object (internal tag check)', function() {
        let o = Object.create(null)
        hidden(o, Symbol.toStringTag, 'Date')
        rej(() => o, 'condition must be a plain object, got [Date]', 'find')
        let args = (function() {
            return arguments
        })('a1')
        rej(() => args, 'condition must be a plain object', 'find')
    })

    it('should reject an array disguised as a plain object (null prototype and an Object toStringTag), as an array', function() {
        let a = [{ id: 'a1' }]
        Object.setPrototypeOf(a, null)
        hidden(a, Symbol.toStringTag, 'Object')
        rej(() => a, 'condition must be a plain object, got [array]', 'find')
        rej(() => ({ $and: a }), 'array carries extra properties', 'find.$and') //仍為真陣列(Array.isArray), 但帶Symbol鍵之額外屬性
        let b = [{ id: 'a1' }]
        Object.setPrototypeOf(b, Object.prototype)
        rej(() => b, 'condition must be a plain object, got [array]', 'find')
    })

    it('should reject a cross-realm plain object (prototype is not this realm Object.prototype)', function() {
        let foreign = vm.runInNewContext('({ id: "a1" })')
        rej(() => foreign, 'condition must be a plain object', 'find')
    })

})


describe('cvOrmFind 欄位等值與純量(規則3)', function() {

    it('should accept strings, finite numbers, booleans, valid Dates and null as field values (multi-field = implicit AND)', function() {
        ok(() => ({ s: 'x', e: '', n: 20, f: 1.5, z: 0, neg: -1, t: true, u: false, n0: null, d: new Date(5) }))
        ok(() => ({ big: Number.MAX_SAFE_INTEGER, huge: 1e21, max: Number.MAX_VALUE, min: Number.MIN_VALUE, tiny: -Number.MAX_VALUE }))
        ok(() => ({ u: '中文', e: '😀', q: 'it\'s', sql: '\'; drop table t; --', d: '$name$', p: '%_', nl: 'a\nb', tab: '\t', ffff: '\uFFFF', fffd: '\uFFFD' }))
    })

    it('should preserve -0 and return new Date instances (the copy does not follow later changes of the input Date)', function() {
        let d = new Date(1e12)
        let r = cvOrmFind({ a: -0, d })
        assert.ok(Object.is(r.a, -0))
        assert.notStrictEqual(r.d, d)
        assert.strictEqual(r.d.getTime(), 1e12)
        d.setTime(5)
        assert.strictEqual(r.d.getTime(), 1e12)
    })

    it('should accept Date boundaries and reject an invalid Date', function() {
        ok(() => ({ d: new Date(8.64e15) }))
        ok(() => ({ d: new Date(-8.64e15) }))
        rej(() => ({ d: new Date(8.64e15 + 1) }), 'invalid Date', 'find.d')
        rej(() => ({ d: new Date('x') }), 'invalid Date', 'find.d')
        rej(() => ({ d: { $gt: new Date(NaN) } }), 'invalid Date', 'find.d.$gt')
    })

    it('should judge Date by the internal slot: not by toStringTag, instanceof or an overridden getTime', function() {
        let calls = 0
        let d = new Date(7)
        d.getTime = () => {
            calls++
            return NaN
        }
        assert.strictEqual(cvOrmFind({ d }).d.getTime(), 7)
        assert.strictEqual(calls, 0)
        let np = Object.setPrototypeOf(new Date(9), null) //有內部槽, 原型為null
        assert.strictEqual(cvOrmFind({ d: np }).d.getTime(), 9)
        rej(() => ({ d: Object.create(Date.prototype) }), 'unsupported value type', 'find.d') //無內部槽
        rej(() => ({ d: new Proxy(new Date(0), {}) }), 'unsupported value type', 'find.d')
        rej(() => ({
            d: {
                [Symbol.toStringTag]: 'Date',
                getTime() {
                    return 1
                }
            }
        }), 'unsupported value type [Date]', 'find.d') //標籤偽稱Date者非一般物件
    })

    it('should reject every non-scalar value with the kind of the value', function() {
        let bads = [
            ['BigInt', () => 10n, 'bigint'],
            ['Symbol', () => Symbol('s'), 'symbol'],
            ['function', () => () => 1, 'function'],
            ['RegExp', () => /a/i, 'RegExp'],
            ['Map', () => new Map(), 'Map'],
            ['Set', () => new Set(), 'Set'],
            ['Buffer', () => Buffer.from('ab'), 'Uint8Array'],
            ['String wrapper', () => new String('a'), 'String'],
            ['Number wrapper', () => new Number(1), 'Number'],
            ['Boolean wrapper', () => new Boolean(true), 'Boolean'],
            ['class instance', () => new Foo(), 'object'],
            ['Error', () => new Error('x'), 'Error'],
            ['Promise', () => Promise.resolve(1), 'Promise'],
        ]
        for (let [label, mk, kind] of bads) {
            rej(() => ({ a: mk() }), `unsupported value type [${kind}]`, 'find.a')
            rej(() => ({ a: { $eq: mk() } }), `unsupported value type [${kind}]`, 'find.a.$eq')
            rej(() => ({ a: { $gt: mk() } }), `unsupported value type [${kind}]`, 'find.a.$gt')
            rej(() => ({ a: { $in: [mk()] } }), `unsupported value type [${kind}]`, 'find.a.$in[0]')
            assert.ok(true, label)
        }
    })

    it('should reject undefined, NaN and infinities in every scalar position', function() {
        for (let [mk, why] of [[() => undefined, 'undefined is not allowed'], [() => NaN, 'number is not finite'], [() => Infinity, 'number is not finite'], [() => -Infinity, 'number is not finite']]) {
            rej(() => ({ a: mk() }), why, 'find.a')
            for (let op of ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte']) {
                rej(() => ({ a: { [op]: mk() } }), why, `find.a.${op}`)
            }
            for (let op of ['$in', '$nin']) {
                rej(() => ({ a: { [op]: [1, mk()] } }), why, `find.a.${op}[1]`)
            }
        }
    })

    it('should reject strings containing NUL or lone surrogates (in every position and place), accept paired surrogates', function() {
        let nuls = ['\u0000', 'a\u0000', '\u0000a', 'a\u0000b']
        let lones = ['\uD800', '\uDBFF', '\uDC00', '\uDFFF', 'a\uD800', '\uD800a', '\uD83Dx\uDE00', '\uDE00\uD83D', 'x\uDC00y', '😀\uDE00']
        for (let s of nuls) {
            rej(() => ({ a: s }), 'string contains NUL', 'find.a')
            rej(() => ({ a: { $in: [s] } }), 'string contains NUL', 'find.a.$in[0]')
            rej(() => ({ a: { $ne: s } }), 'string contains NUL', 'find.a.$ne')
        }
        for (let s of lones) {
            rej(() => ({ a: s }), 'string contains lone surrogate', 'find.a')
            rej(() => ({ a: { $nin: [s] } }), 'string contains lone surrogate', 'find.a.$nin[0]')
            rej(() => ({ a: { $gt: s } }), 'string contains lone surrogate', 'find.a.$gt')
        }
        ok(() => ({ a: '😀', b: 'x😀y😀', c: '𝄞' }))
    })

    it('should not limit the string length (only the node budget applies)', function() {
        let r = cvOrmFind({ a: 'x'.repeat(1e6) })
        assert.strictEqual(r.a.length, 1e6)
    })

    it('should reject array and nested-object values as field values (no equality on arrays and objects)', function() {
        rej(() => ({ tags: ['x', 'y'] }), 'array value is not supported', 'find.tags')
        rej(() => ({ g: [] }), 'array value is not supported', 'find.g')
        rej(() => ({ g: ['A'] }), 'array value is not supported', 'find.g')
        rej(() => ({ o: { k: 1 } }), 'unexpected key [k] in operator object', 'find.o.k')
    })

})


describe('cvOrmFind 運算子(規則4)', function() {

    it('should accept the eight operators with scalar values, in one operator object (same-field operators are ANDed)', function() {
        ok(() => ({ a: { $eq: 1 } }))
        ok(() => ({ a: { $ne: 'x' } }))
        ok(() => ({ a: { $gt: 1, $gte: 2, $lt: 9, $lte: 8 } }))
        ok(() => ({ a: { $eq: 1, $ne: 2, $gt: 3, $gte: 4, $lt: 5, $lte: 6, $in: [1], $nin: [2] } }))
        ok(() => ({ d: { $gte: new Date(5), $lt: new Date(9) } }))
        ok(() => ({ a: { $eq: true }, b: { $ne: false }, c: { $gt: '' } }))
    })

    it('should accept null only for direct equality, $eq and $ne', function() {
        ok(() => ({ a: null }))
        ok(() => ({ a: { $eq: null } }))
        ok(() => ({ a: { $ne: null } }))
        for (let op of ['$gt', '$gte', '$lt', '$lte']) {
            rej(() => ({ a: { [op]: null } }), 'null is not allowed here', `find.a.${op}`)
        }
        for (let op of ['$in', '$nin']) {
            rej(() => ({ a: { [op]: [null] } }), 'null is not allowed here', `find.a.${op}[0]`)
            rej(() => ({ a: { [op]: ['x', null] } }), 'null is not allowed here', `find.a.${op}[1]`)
        }
    })

    it('should reject array and object values for every comparison operator', function() {
        for (let op of ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte']) {
            rej(() => ({ a: { [op]: [1] } }), 'unsupported value type [array]', `find.a.${op}`)
            rej(() => ({ a: { [op]: {} } }), 'unsupported value type [object]', `find.a.${op}`)
            rej(() => ({ a: { [op]: { $gt: 1 } } }), 'unsupported value type [object]', `find.a.${op}`)
        }
    })

    it('should reject an empty operator object and mixed or nested objects', function() {
        rej(() => ({ a: {} }), 'empty operator object', 'find.a')
        rej(() => ({ a: Object.create(null) }), 'empty operator object', 'find.a')
        rej(() => ({ a: { $gt: 20, name: 'x' } }), 'unexpected key [name] in operator object', 'find.a.name')
        rej(() => ({ a: { name: 'x' } }), 'unexpected key [name] in operator object', 'find.a.name')
        rej(() => ({ a: { '': 1 } }), 'unexpected key [] in operator object', 'find.a.')
        rej(() => ({ a: { $gt: 20, $foo: 1 } }), 'unsupported operator [$foo]', 'find.a.$foo')
    })

    it('should accept a null-prototype operator object but reject class instances and other non-plain operator objects', function() {
        ok(() => ({ a: Object.assign(Object.create(null), { $gt: 1 }) }))
        rej(() => ({ a: Object.assign(new Foo(), { $gt: 1 }) }), 'unsupported value type [object]', 'find.a')
        rej(() => ({ a: new Map([['$gt', 1]]) }), 'unsupported value type [Map]', 'find.a')
        rej(() => ({ a: /x/ }), 'unsupported value type [RegExp]', 'find.a')
    })

})


describe('cvOrmFind $in/$nin(規則5)', function() {

    it('should accept scalar arrays (mixed scalar types, duplicates) and copy them into new arrays', function() {
        let src = ['a', 1, true, new Date(5), 'a', -0, '']
        let r = ok(() => ({ x: { $in: src.slice(), $nin: [1, 2] } }))
        assert.ok(Array.isArray(r.x.$in))
        assert.notStrictEqual(r.x.$in, src)
        ok(() => ({ id: { $in: ['a1', 'a1'] } }))
    })

    it('should accept $in:[] (always false) but reject $nin:[] (always true), also inside $and/$or', function() {
        let r = ok(() => ({ g: { $in: [] } }))
        assert.deepStrictEqual(r.g.$in, [])
        ok(() => ({ $and: [{ g: { $in: [] } }] }))
        ok(() => ({ $or: [{ g: { $in: [] } }, { id: 'a1' }] }))
        rej(() => ({ g: { $nin: [] } }), '$nin with empty array is always true', 'find.g.$nin')
        rej(() => ({ $or: [{ g: { $nin: [] } }] }), '$nin with empty array is always true', 'find.$or[0].g.$nin')
        rej(() => ({ $and: [{ id: 'a1' }, { $or: [{ g: { $nin: [] } }] }] }), '$nin with empty array', 'find.$and[1].$or[0].g.$nin')
        rej(() => ({ g: { $in: [], $nin: [] } }), '$nin with empty array', 'find.g.$nin')
    })

    it('should reject non-array values (including array-likes and typed arrays) with "value must be an array"', function() {
        for (let op of ['$in', '$nin']) {
            for (let mk of [() => 'A', () => 5, () => null, () => undefined, () => ({}), () => ({ 0: 'a', length: 1 }), () => new Set(['a']), () => new Uint8Array(1), () => Buffer.from('a'), () => true, () => ({ type: 'select', table: 't' })]) {
                rej(() => ({ g: { [op]: mk() } }), 'value must be an array', `find.g.${op}`)
            }
        }
    })

    it('should reject array elements that are not scalars', function() {
        for (let [mk, why] of [[() => ['A'], 'unsupported value type [array]'], [() => ({ a: 1 }), 'unsupported value type [object]'], [() => /A/, 'unsupported value type [RegExp]'], [() => undefined, 'undefined is not allowed'], [() => 1n, 'unsupported value type [bigint]'], [() => Symbol('s'), 'unsupported value type [symbol]'], [() => () => 1, 'unsupported value type [function]'], [() => new String('A'), 'unsupported value type [String]'], [() => new Date(NaN), 'invalid Date']]) {
            rej(() => ({ g: { $in: [mk()] } }), why, 'find.g.$in[0]')
            rej(() => ({ g: { $nin: ['A', mk()] } }), why, 'find.g.$nin[1]')
        }
    })

    it('should enforce the length limit: 10000 accepted and 10001 rejected, before iterating', function() {
        let r = cvOrmFind({ a: { $in: fills(10000), $nin: fills(10000) } })
        assert.strictEqual(r.a.$in.length, 10000)
        assert.strictEqual(r.a.$nin.length, 10000)
        rej(() => ({ a: { $in: fills(10001) } }), 'array is too large (> 10000)', 'find.a.$in')
        rej(() => ({ a: { $nin: fills(10001) } }), 'array is too large (> 10000)', 'find.a.$nin')
    })

})


describe('cvOrmFind $and/$or(規則6)', function() {

    it('should accept non-empty arrays of non-empty condition objects, nested, with fields, and with both keys', function() {
        ok(() => ({ $and: [{ g: 'A' }, { age: { $gt: 20 } }] }))
        ok(() => ({ $or: [{ g: 'A' }, { age: 50 }] }))
        ok(() => ({ $and: [{ $or: [{ g: 'A' }, { g: 'B' }] }, { age: { $lt: 40 } }] }))
        ok(() => ({ g: 'A', $or: [{ age: 20 }, { age: 30 }] }))
        ok(() => ({ $and: [{ g: 'A' }], $or: [{ age: 20 }] }))
        ok(() => ({ $or: [{ g: 'A' }], g: 'B' }))
        ok(() => ({ $and: [{ g: 'A' }] }))
        ok(() => ({ $or: [{ $and: [{ $or: [{ a: 1, b: { $gt: 2 } }] }] }] }))
    })

    it('should reject empty arrays, {} elements, non-arrays and non-object elements', function() {
        for (let op of ['$and', '$or']) {
            rej(() => ({ [op]: [] }), `${op} with empty array`, `find.${op}`)
            rej(() => ({ [op]: [{}] }), 'empty condition', `find.${op}[0]`)
            rej(() => ({ [op]: [{ a: 1 }, {}] }), 'empty condition', `find.${op}[1]`)
            rej(() => ({ [op]: [Object.create(null)] }), 'empty condition', `find.${op}[0]`)
            rej(() => ({ [op]: [{ [op]: [{}] }] }), 'empty condition', `find.${op}[0].${op}[0]`)
            rej(() => ({ [op]: { a: 1 } }), 'value must be an array', `find.${op}`)
            rej(() => ({ [op]: 'x' }), 'value must be an array', `find.${op}`)
            rej(() => ({ [op]: null }), 'value must be an array', `find.${op}`)
            rej(() => ({ [op]: undefined }), 'value must be an array', `find.${op}`)
            rej(() => ({ [op]: 5 }), 'value must be an array', `find.${op}`)
            for (let [mk, kind] of [[() => 'x', 'string'], [() => null, 'null'], [() => undefined, 'undefined'], [() => [{ a: 1 }], 'array'], [() => 5, 'number'], [() => new Foo(), 'object'], [() => new Map(), 'Map'], [() => () => 1, 'function'], [() => new Date(0), 'Date']]) {
                rej(() => ({ [op]: [{ a: 1 }, mk()] }), `condition must be a plain object, got [${kind}]`, `find.${op}[1]`)
            }
        }
    })

    it('should enforce the length limit: 1000 accepted and 1001 rejected, for $and and $or', function() {
        for (let op of ['$and', '$or']) {
            let r = cvOrmFind({ [op]: fills(1000).map((k) => ({ id: k })) })
            assert.strictEqual(r[op].length, 1000)
            rej(() => ({ [op]: fills(1001).map((k) => ({ id: k })) }), 'array is too large (> 1000)', `find.${op}`)
        }
    })

    it('should reject an empty array in one logic key even when the other is valid', function() {
        rej(() => ({ $and: [{ g: 'A' }], $or: [] }), '$or with empty array', 'find.$or')
        rej(() => ({ $or: [], $and: [{ g: 'A' }] }), '$or with empty array', 'find.$or')
    })

})


describe('cvOrmFind 白名單外(規則7)', function() {

    let outer = ['$not', '$nor', '$where', '$expr', '$text', '$comment', '$jsonSchema', '$custom', '$function', '$regex', '$options', '$exists', '$type', '$mod', '$elemMatch', '$size', '$all', '$like', '$ilike', '$null', '$notNull', '$equals', '$bitsAllSet', '$bitsAnySet', '$bitsAllClear', '$near', '$geoWithin', '$sample', '$rand', '$x', '$', '$$', '$AND', '$Or', '$IN', '$eq ']
    let docOnly = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin']

    it('should reject every non-whitelisted operator at document level (even with a scalar, array, object or function value)', function() {
        for (let op of [...outer, ...docOnly]) {
            for (let mk of [() => 1, () => [], () => ({}), () => 'x', () => () => 1, () => [{ a: 1 }]]) {
                rej(() => ({ [op]: mk() }), `unsupported operator [${op}]`, `find.${op}`)
            }
        }
    })

    it('should reject every non-whitelisted operator at field level, including field-level $and/$or', function() {
        for (let op of [...outer, '$and', '$or']) {
            rej(() => ({ a: { [op]: 1 } }), `unsupported operator [${op}]`, `find.a.${op}`)
            rej(() => ({ a: { $gt: 1, [op]: 1 } }), `unsupported operator [${op}]`, `find.a.${op}`)
        }
        rej(() => ({ a: { $and: [{ $gt: 1 }] } }), 'unsupported operator [$and]', 'find.a.$and')
        rej(() => ({ a: { $or: [{ $gt: 1 }] } }), 'unsupported operator [$or]', 'find.a.$or')
    })

    it('should reject the whitelisted operator after a non-whitelisted one and vice versa (order does not matter)', function() {
        rej(() => ({ a: { $not: { $gt: 1 }, $gt: 2 } }), 'unsupported operator [$not]')
        rej(() => ({ a: { $gt: 2, $not: { $gt: 1 } } }), 'unsupported operator [$not]')
        rej(() => ({ $where: 'true', a: 1 }), 'unsupported operator [$where]')
        rej(() => ({ a: 1, $where: 'true' }), 'unsupported operator [$where]')
    })

    it('should reject $where and $function values before touching them (no function is called)', function() {
        let called = 0
        rej(() => ({
            $where() {
                called++
                return true
            }
        }), 'unsupported operator [$where]', 'find.$where')
        rej(() => ({
            a: {
                $function: {
                    body() {
                        called++
                    },
                    args: [],
                    lang: 'js'
                }
            }
        }), 'unsupported operator [$function]', 'find.a.$function')
        assert.strictEqual(called, 0)
    })

    it('should reject Symbol keys at every level (sequelize operators, well-known symbols, symbol-only objects)', function() {
        rej(() => ({ [Symbol.for('and')]: [{ g: 'A' }] }), 'symbol key is not allowed', 'find')
        rej(() => ({ [Symbol.iterator]: 1 }), 'symbol key is not allowed', 'find')
        rej(() => ({ [Symbol('x')]: 1 }), 'symbol key is not allowed', 'find')
        rej(() => ({ id: 'a1', [Symbol('x')]: 1 }), 'symbol key is not allowed', 'find')
        rej(() => ({ a: { $gt: 1, [Symbol.for('gt')]: 1 } }), 'symbol key is not allowed', 'find.a')
        rej(() => ({ $and: [{ g: 'A', [Symbol('x')]: 1 }] }), 'symbol key is not allowed', 'find.$and[0]')
        rej(() => hidden({}, Symbol('x'), 1), 'symbol key is not allowed', 'find') //不可列舉之Symbol鍵
        rej(() => Object.assign(Object.create(null), { [Symbol('s')]: 1 }), 'symbol key is not allowed', 'find')
    })

})


describe('cvOrmFind 欄名(規則8)', function() {

    it('should accept names matching ^[\\p{L}_][\\p{L}\\p{M}\\p{N}_]*$ up to 128 characters, case-sensitively', function() {
        for (let k of ['a', 'A', '_', '_a', 'a1', 'a_b', 'ID', 'id', 'Id', '中文', '姓名2', 'é', 'á', 'Ａ', 'ñ', 'x'.repeat(128), '𠀀'.repeat(64)]) {
            let r = ok(() => ({ [k]: 1 }))
            assert.deepStrictEqual(Object.keys(r), [k])
        }
        let r = cvOrmFind({ ID: 1, id: 2 })
        assert.deepStrictEqual(Object.keys(r), ['ID', 'id'])
    })

    it('should reject dotted, $-leading, hyphenated, spaced, quoted, arrow, cast, digit-leading and empty names', function() {
        for (let k of ['', '1a', '0', '1.5', '-1', 'a-b', 'a b', ' a', 'a ', 'a.b', 'o.k', 'a$b', 'a"b', 'a\'b', 'a`b', 'a;b', 'a--', 'a->b', 'a->>b', 'a#>b', 'g->>k', 'age::text', 'a::int', 'a[0]', 'a(1)', 'a\nb', 'a\u0000', '́a', '٣', '٣a', '*', 'a/*', 'a=b', 'a,b', 'ａ　ｂ', 'a\u2028b', '\uD800', 'a\uD800']) {
            rej(() => ({ [k]: 1 }), 'unsupported column name', undefined)
        }
    })

    it('should reject a $-leading key as an operator (not as a column) and echo only a cleaned, shortened key', function() {
        rej(() => ({ $name$: 'x' }), 'unsupported operator [$name$]', 'find.$name$')
        rej(() => ({ ['$' + 'k'.repeat(1000000)]: 1 }), 'unsupported operator', undefined)
        let e = rej(() => ({ ['a'.repeat(129)]: 1 }), 'column name is too long (> 128)')
        assert.ok(e.message.length < 400, String(e.message.length))
    })

    it('should reject __proto__ as an own key at every level (JSON.parse and computed key)', function() {
        rej(() => JSON.parse('{"__proto__":"x"}'), 'unsupported column name [__proto__]', 'find.__proto__')
        rej(() => JSON.parse('{"__proto__":{"a":1}}'), 'unsupported column name [__proto__]', 'find.__proto__')
        rej(() => ({ ['__proto__']: 'x' }), 'unsupported column name [__proto__]', 'find.__proto__')
        rej(() => JSON.parse('{"$and":[{"__proto__":"x"}]}'), 'unsupported column name [__proto__]', 'find.$and[0].__proto__')
        rej(() => JSON.parse('{"a":{"__proto__":"x"}}'), 'unexpected key [__proto__] in operator object', 'find.a.__proto__')
    })

    it('should accept Object.prototype member names as ordinary column names and keep them as own data of a null-prototype object', function() {
        for (let k of ['constructor', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'length', 'prototype', '__defineGetter__', '__lookupGetter__', 'toLocaleString']) {
            let r = cvOrmFind({ [k]: 'x', id: 'a1' })
            assert.strictEqual(Object.getPrototypeOf(r), null)
            assert.strictEqual(r[k], 'x')
            assert.deepStrictEqual(Object.keys(r), [k, 'id'])
        }
    })

    it('should treat length as an ordinary column name and never iterate by it (no lodash-like array-like handling)', function() {
        let r = cvOrmFind({ length: 3, id: 'a1' })
        assert.deepStrictEqual(Object.keys(r), ['length', 'id'])
        assert.strictEqual(r.length, 3)
        for (let n of [0, 1, 2, 5, -0, 1000, 4294967295, Number.MAX_SAFE_INTEGER]) {
            let r2 = cvOrmFind({ length: n, a: 1 })
            assert.deepStrictEqual(Object.keys(r2), ['length', 'a'])
            assert.ok(Object.is(r2.length, n))
        }
    })

    it('should count the name length in UTF-16 code units (64 astral letters = 128 accepted, 65 rejected)', function() {
        ok(() => ({ ['𠀀'.repeat(64)]: 1 }))
        rej(() => ({ ['𠀀'.repeat(65)]: 1 }), 'column name is too long (> 128)')
        ok(() => ({ ['x'.repeat(128)]: 1 }))
        rej(() => ({ ['x'.repeat(129)]: 1 }), 'column name is too long (> 128)')
    })

})


describe('cvOrmFind 上限與opt(規則9)', function() {

    it('should accept logic nesting depth 32 and reject 33 (circular references are rejected by the same limit)', function() {
        ok(() => chain(32))
        rej(() => chain(33), 'nesting is too deep')
        rej(() => chain(40), 'nesting is too deep')
        let a = {}
        a.$and = [a]
        rej(() => a, 'nesting is too deep')
        let b = { $or: [] }
        b.$or.push({ $and: [b] })
        rej(() => b, 'nesting is too deep')
        let c = {}
        c.x = c //循環於欄值: 欄值為條件物件非運算子物件, 以運算子物件規則拒收
        rej(() => c, 'unexpected key [x] in operator object')
    })

    it('should count nodes (condition objects, operator objects, scalars): 100000 accepted and 100001 rejected, and stop at once', function() {
        let mk = (n) => {
            let o = {}
            for (let i = 0; i < n; i++) {
                o[`f${i}`] = i
            }
            return o
        }
        assert.strictEqual(Object.keys(cvOrmFind(mk(99999))).length, 99999) //1個條件物件 + 99999個純量
        rej(() => mk(100000), 'condition is too large')
        //運算子物件與其值各計: {a:{$gt:1}} = 條件物件1 + 運算子物件1 + 純量1
        let nested = (n) => {
            let o = {}
            for (let i = 0; i < n; i++) {
                o[`f${i}`] = { $gt: i }
            }
            return o
        }
        assert.strictEqual(Object.keys(cvOrmFind(nested(49999))).length, 49999) //1 + 49999*2 = 99999
        rej(() => nested(50000), 'condition is too large') //1 + 100000
        //null與Date之欄位等值、$in/$nin之每個元素亦各計1
        let fieldsOf = (n, mk) => {
            let o = {}
            for (let i = 0; i < n; i++) {
                o[`f${i}`] = mk()
            }
            return o
        }
        assert.strictEqual(Object.keys(cvOrmFind(fieldsOf(99999, () => null))).length, 99999)
        rej(() => fieldsOf(100000, () => null), 'condition is too large')
        assert.strictEqual(Object.keys(cvOrmFind(fieldsOf(99999, () => new Date(5)))).length, 99999)
        rej(() => fieldsOf(100000, () => new Date(5)), 'condition is too large')
        assert.strictEqual(Object.keys(cvOrmFind(fieldsOf(99999, () => 'x'))).length, 99999)
        let sets = (n) => fieldsOf(n, () => ({ $in: fills(10000) })) //每欄: 運算子物件1 + 元素10000
        assert.strictEqual(Object.keys(cvOrmFind(sets(9))).length, 9) //1 + 9*10001 = 90010
        rej(() => sets(10), 'condition is too large') //1 + 10*10001 = 100011
        let lists = (n) => ({ $or: Array.from({ length: n }, () => ({ a: 1 })) }) //每項: 條件物件1 + 純量1
        assert.strictEqual(cvOrmFind(lists(1000)).$or.length, 1000)
        let many = (n) => ({ $and: Array.from({ length: n }, () => ({ $or: lists(1000).$or })) }) //每個$and元素: 條件物件1 + 1000*2 = 2001
        assert.strictEqual(cvOrmFind(many(49)).$and.length, 49) //1 + 49*2001 = 98050
        rej(() => many(50), 'condition is too large') //1 + 50*2001 = 100051
    })

    it('should reject shared references that expand exponentially, fast', function() {
        let x = { a: 1 }
        for (let i = 0; i < 25; i++) {
            x = { $and: [x, x] }
        }
        let t0 = Date.now()
        rej(() => x, 'condition is too large')
        assert.ok(Date.now() - t0 < 5000, 'must fail fast')
        let y = fills(20)
        let big = { $in: y }
        let z = {}
        for (let i = 0; i < 6000; i++) {
            z[`f${i}`] = big //同一運算子物件被6000個欄共用: 6000*(運算子物件1+元素20)=126000 > 100000
        }
        rej(() => z, 'condition is too large')
    })

    it('should lower every limit through opt (depth, list, in, nodes, key) and keep the default for the others', function() {
        ok(() => chain(2), { maxDepth: 2 })
        rej(() => chain(3), 'nesting is too deep', undefined, { maxDepth: 2 })
        ok(() => chain(32), { maxIn: 5 })
        for (let op of ['$and', '$or']) {
            ok(() => ({ [op]: fills(3).map((k) => ({ id: k })) }), { maxList: 3 })
            rej(() => ({ [op]: fills(4).map((k) => ({ id: k })) }), 'array is too large (> 3)', `find.${op}`, { maxList: 3 })
        }
        for (let op of ['$in', '$nin']) {
            ok(() => ({ a: { [op]: fills(3) } }), { maxIn: 3 })
            rej(() => ({ a: { [op]: fills(4) } }), 'array is too large (> 3)', `find.a.${op}`, { maxIn: 3 })
        }
        ok(() => ({ abcde: 1 }), { maxKey: 5 })
        rej(() => ({ abcdef: 1 }), 'column name is too long (> 5)', undefined, { maxKey: 5 })
        ok(() => ({ a: 1, b: 2 }), { maxNodes: 3 }) //1 + 2
        rej(() => ({ a: 1, b: 2, c: 3 }), 'condition is too large', undefined, { maxNodes: 3 })
        ok(() => ({ a: 1 }), {}) //未給之項沿用預設
    })

    it('should never raise a limit through opt (values above the defaults are clamped to the defaults)', function() {
        rej(() => chain(33), 'nesting is too deep', undefined, { maxDepth: 100 })
        rej(() => ({ a: { $in: fills(10001) } }), 'array is too large (> 10000)', 'find.a.$in', { maxIn: 20000 })
        rej(() => ({ a: { $nin: fills(10001) } }), 'array is too large (> 10000)', 'find.a.$nin', { maxIn: Number.MAX_SAFE_INTEGER })
        rej(() => ({ $and: fills(1001).map((k) => ({ id: k })) }), 'array is too large (> 1000)', 'find.$and', { maxList: 5000 })
        rej(() => ({ ['x'.repeat(129)]: 1 }), 'column name is too long (> 128)', undefined, { maxKey: 1000 })
        let mk = (n) => {
            let o = {}
            for (let i = 0; i < n; i++) {
                o[`f${i}`] = i
            }
            return o
        }
        rej(() => mk(100000), 'condition is too large', undefined, { maxNodes: 1e9 })
    })

    it('should accept opt = undefined or null, and throw invalid opt for a bad opt (before checking find)', function() {
        ok(() => ({ a: 1 }), undefined)
        ok(() => ({ a: 1 }), null)
        for (let key of ['maxDepth', 'maxList', 'maxIn', 'maxNodes', 'maxKey']) {
            for (let bad of [0, -1, 1.5, NaN, Infinity, 2 ** 53, '5', null, true, {}, [], () => 1]) {
                assert.throws(() => cvOrmFind({ a: 1 }, { [key]: bad }), (e) => e instanceof Error && e.message === `invalid opt: ${key} must be a positive integer`, `${key}=${String(bad)}`)
            }
        }
        for (let bad of ['x', 5, true, () => 1, Symbol('s')]) {
            assert.throws(() => cvOrmFind({ a: 1 }, bad), (e) => e instanceof Error && e.message === 'invalid opt: opt must be an object')
        }
        assert.throws(() => cvOrmFind(null, { maxIn: 0 }), /^Error: invalid opt: /) //opt先於find
        assert.throws(() => cvOrmFind({ a: 1 }, {
            get maxIn() {
                throw new Error('SECRET-getter')
            }
        }), (e) => e.message === 'invalid opt: accessor option [maxIn] is not allowed') //存取器不被呼叫(其拋出之值不外洩)
    })

    it('should not offer any switch that relaxes operators or names (unknown options throw)', function() {
        for (let k of ['allowRegex', 'regex', 'ops', 'allowNull', 'allowDot', 'allowNin', 'strict', 'maxdepth', 'maxin', '$regex', '']) {
            assert.throws(() => cvOrmFind({ a: { $regex: 'x' } }, { [k]: true }), (e) => e instanceof Error && e.message === `invalid opt: unknown option [${k}]`, k)
        }
        rej(() => ({ a: { $regex: 'x' } }), 'unsupported operator [$regex]')
        assert.throws(() => cvOrmFind({ a: 1 }, ['x']), /invalid opt: unknown option \[0\]/)
    })

})


describe('cvOrmFind 異常結構(規則10)', function() {

    it('should reject accessor properties at every level (document, operator object, array element)', function() {
        rej(() => ({
            get a() {
                return 1
            }
        }), 'accessor property is not allowed', 'find')
        rej(() => ({
            a: {
                get $gt() {
                    return 1
                }
            }
        }), 'accessor property is not allowed', 'find.a')
        rej(() => ({
            $and: [{
                get a() {
                    return 1
                }
            }]
        }), 'accessor property is not allowed', 'find.$and[0]')
        rej(() => ({
            a: {
                $in: Object.defineProperty([], '0', {
                    get() {
                        return 1
                    },
                    enumerable: true
                })
            }
        }), 'accessor element is not allowed', 'find.a.$in[0]')
        rej(() => ({
            $or: Object.defineProperty([], '0', {
                get() {
                    return { g: 'A' }
                },
                enumerable: true
            })
        }), 'accessor element is not allowed', 'find.$or[0]')
        let n = 0
        let o = {
            get a() {
                n++
                return 1
            }
        }
        rej(() => o, 'accessor property')
        assert.strictEqual(n, 0) //存取器未被呼叫
        let set = hidden({}, 'x', 1)
        Object.defineProperty(set, 'y', { get() {}, set() {}, enumerable: true, configurable: true })
        rej(() => set, 'non-enumerable property is not allowed') //x為不可列舉(先遇到)
    })

    it('should reject non-enumerable properties and elements', function() {
        rej(() => hidden({}, 'g', 'A'), 'non-enumerable property is not allowed', 'find')
        rej(() => ({ a: hidden({}, '$gt', 1) }), 'non-enumerable property is not allowed', 'find.a')
        rej(() => ({ $and: [hidden({}, 'g', 'A')] }), 'non-enumerable property is not allowed', 'find.$and[0]')
        rej(() => ({ g: { $in: hidden(['A'], '0', 'A') } }), 'non-enumerable element is not allowed', 'find.g.$in[0]')
        rej(() => ({ $or: hidden([{ g: 'A' }], '0', { g: 'A' }) }), 'non-enumerable element is not allowed', 'find.$or[0]')
        rej(() => withEnumerable(hidden({}, 'a', 1), 'b', 2), 'non-enumerable property is not allowed', 'find')
    })

    it('should reject sparse arrays, extra own properties on arrays (string, symbol, index-like) and non-array array-likes', function() {
        rej(() => ({ g: { $in: ['A', , 'B'] } }), 'sparse array hole at index 1', 'find.g.$in')
        rej(() => ({ g: { $in: new Array(3) } }), 'sparse array hole at index 0', 'find.g.$in')
        rej(() => ({ $and: [{ a: 1 }, , { b: 2 }] }), 'sparse array hole at index 1', 'find.$and')
        let a = ['A']
        a.extra = 1
        rej(() => ({ g: { $in: a } }), 'array carries extra properties', 'find.g.$in')
        let s = ['A']
        s[Symbol('x')] = 1
        rej(() => ({ g: { $in: s } }), 'array carries extra properties', 'find.g.$in')
        let neg = ['A']
        neg['-1'] = 'x'
        rej(() => ({ g: { $in: neg } }), 'array carries extra properties', 'find.g.$in')
        let frac = ['A']
        frac['1.5'] = 'x'
        rej(() => ({ g: { $in: frac } }), 'array carries extra properties', 'find.g.$in')
        rej(() => ({ $and: Object.assign([{ a: 1 }], { extra: { b: 2 } }) }), 'array carries extra properties', 'find.$and')
        let h = [1, , 3]
        h.extra = 1 //洞與額外屬性並存(自有鍵數恰為n+1)仍須擋下
        rej(() => ({ g: { $in: h } }), undefined, 'find.g.$in')
    })

    it('should read the array length exactly once and use only that value', function() {
        let seqLength = (arr, first) => {
            let calls = 0
            return new Proxy(arr, {
                get(t, p, r) {
                    if (p === 'length') {
                        calls++
                        return calls === 1 ? first : 99
                    }
                    return Reflect.get(t, p, r)
                }
            })
        }
        let a = cvOrmFind({ $and: seqLength([{ name: 'aa' }, { n: 10 }], 2) })
        assert.deepStrictEqual(a.$and.length, 2)
        let o = cvOrmFind({ $or: seqLength([{ name: 'aa' }, { n: 10 }], 2) })
        assert.deepStrictEqual(o.$or.length, 2)
        let s = cvOrmFind({ n: { $in: seqLength([1, 2], 2) } })
        assert.deepStrictEqual(s.n.$in, [1, 2])
        let n = cvOrmFind({ n: { $nin: seqLength([1, 2], 2) } })
        assert.deepStrictEqual(n.n.$nin, [1, 2])
        //讀到2後再讀為99: 若再讀一次會依99檢查洞或額外屬性而reject
    })

    it('should reject a Proxy array whose length is not a non-negative integer, without coercing it', function() {
        let coerced = 0
        let evil = {
            valueOf() {
                coerced++
                return 1
            },
            toString() {
                coerced++
                return '1'
            }
        }
        for (let bad of ['2', -1, 1.5, NaN, evil, undefined, null, Infinity, 2 ** 40]) {
            let p = new Proxy(['A'], {
                get(t, k, r) {
                    return k === 'length' ? bad : Reflect.get(t, k, r)
                }
            })
            let e = errOf(() => ({ g: { $in: p } }))
            assert.ok(reMsg.test(e.message), e.message)
            assert.ok(/invalid array length|array is too large/.test(e.message), e.message)
        }
        assert.strictEqual(coerced, 0)
    })

    it('should accept array subclasses and arrays with a changed prototype as plain arrays in the copy', function() {
        class MyArr extends Array {}
        let src = MyArr.from([1, 2])
        let r = cvOrmFind({ a: { $in: src } })
        assert.strictEqual(Object.getPrototypeOf(r.a.$in), Array.prototype)
        assert.deepStrictEqual(r.a.$in, [1, 2])
        let sp = [1, 2]
        Object.setPrototypeOf(sp, null)
        assert.deepStrictEqual(cvOrmFind({ a: { $in: sp } }).a.$in, [1, 2])
    })

    it('should reject array-like objects and Symbol.toStringTag-forged arrays (only real arrays are arrays)', function() {
        rej(() => ({ g: { $in: { 0: 'a', length: 1 } } }), 'value must be an array', 'find.g.$in')
        rej(() => ({ $and: { 0: { a: 1 }, length: 1 } }), 'value must be an array', 'find.$and')
        rej(() => ({ g: { $in: Object.defineProperty({ 0: 'a', length: 1 }, Symbol.toStringTag, { value: 'Array' }) } }), 'value must be an array', 'find.g.$in')
        rej(() => ({ g: { $in: Object.setPrototypeOf({ 0: 'a', length: 1 }, Array.prototype) } }), 'value must be an array', 'find.g.$in')
    })

    it('should not use array-like iteration on objects that carry a length key (R-OBJ-ITER-01)', function() {
        for (let n of [0, 1, 2, 3, 100, 4294967295, Number.MAX_SAFE_INTEGER]) {
            let r = cvOrmFind({ length: n, a: { $gt: 1, $lt: 9 }, b: 'x' })
            assert.deepStrictEqual(Object.keys(r), ['length', 'a', 'b'])
            assert.ok(Object.is(r.length, n))
        }
        rej(() => ({ a: { length: 3, 0: 1, 1: 2, 2: 3 } }), 'unexpected key', undefined)
    })

})


describe('cvOrmFind 檢查之值即使用之值(規則11)', function() {

    it('should return a deep fresh copy for rich inputs and not modify the input (also frozen inputs)', function() {
        let inner = { $gt: 1 }
        let list = [{ a: 1 }, { b: inner }]
        let f = Object.freeze({
            $or: Object.freeze(list),
            c: Object.freeze({ $in: Object.freeze([1, 2]) }),
            d: Object.freeze(new Date(5)),
            e: null,
            n: Object.freeze({ $nin: Object.freeze(['x']), $eq: 'y' }),
        })
        let before = JSON.stringify(f)
        let r = cvOrmFind(f)
        assert.strictEqual(JSON.stringify(f), before)
        assertFresh(f, r)
        assert.notStrictEqual(r.$or[1].b, inner)
        assert.ok(Array.isArray(r.c.$in))
        //複本之改動不影響輸入, 輸入之改動不影響複本
        r.c.$in.push(3)
        assert.strictEqual(list.length, 2)
        let g = { a: { $in: [1, 2] }, $and: [{ b: 1 }] }
        let r2 = cvOrmFind(g)
        g.a.$in.push(3)
        g.$and.push({ c: 1 })
        g.$and[0].b = 99
        assert.deepStrictEqual(toPlain(r2), { a: { $in: [1, 2] }, $and: [{ b: 1 }] })
    })

    it('should create every object with a null prototype and every array as a new dense Array', function() {
        let r = cvOrmFind({ $and: [{ a: { $gt: 1, $in: [1, 2] } }, { $or: [{ b: 'x' }] }], c: 'z' })
        let walk = (v) => {
            if (v === null || typeof v !== 'object' || isDate(v)) {
                return
            }
            if (Array.isArray(v)) {
                assert.strictEqual(Object.getPrototypeOf(v), Array.prototype)
                assert.strictEqual(Object.keys(v).length, v.length)
                v.forEach(walk)
                return
            }
            assert.strictEqual(Object.getPrototypeOf(v), null)
            Object.keys(v).forEach((k) => walk(v[k]))
        }
        walk(r)
    })

    it('should read every property exactly once and use only that value (Proxy trap counts)', function() {
        let counts = {}
        let gets = []
        let ownKeysCalls = 0
        let target = { a: 1, b: { $gt: 2 } }
        let p = new Proxy(target, {
            ownKeys(t) {
                ownKeysCalls++
                return Reflect.ownKeys(t)
            },
            getOwnPropertyDescriptor(t, k) {
                counts[k] = (counts[k] || 0) + 1
                let d = Reflect.getOwnPropertyDescriptor(t, k)
                if (counts[k] > 1) {
                    return { ...d, value: 'changed' }
                }
                return d
            },
            get(t, k) {
                gets.push(k)
                return Reflect.get(t, k)
            },
        })
        let nf = cvOrmFind(p)
        assert.strictEqual(nf.a, 1)
        assert.deepStrictEqual(toPlain(nf.b), { $gt: 2 })
        assert.strictEqual(counts.a, 1)
        assert.strictEqual(counts.b, 1)
        assert.strictEqual(ownKeysCalls, 1)
        assert.deepStrictEqual(gets.filter((k) => typeof k === 'string'), []) //不經get陷阱讀資料屬性(僅取內部標籤時讀Symbol.toStringTag)
    })

    it('should read nested objects and array elements once (descriptor reads of a nested Proxy and of array indexes)', function() {
        let counts = { inner: 0, el0: 0 }
        let inner = new Proxy({ $gt: 5 }, {
            getOwnPropertyDescriptor(t, k) {
                counts.inner++
                let d = Reflect.getOwnPropertyDescriptor(t, k)
                return counts.inner > 1 ? { ...d, value: 6 } : d
            }
        })
        let arr = new Proxy([{ x: 1 }], {
            getOwnPropertyDescriptor(t, k) {
                if (k === '0') {
                    counts.el0++
                    let d = Reflect.getOwnPropertyDescriptor(t, k)
                    return counts.el0 > 1 ? { ...d, value: { x: 2 } } : d
                }
                return Reflect.getOwnPropertyDescriptor(t, k)
            }
        })
        let r = cvOrmFind({ a: inner, $or: arr })
        assert.deepStrictEqual(toPlain(r), { a: { $gt: 5 }, $or: [{ x: 1 }] })
        assert.strictEqual(counts.inner, 1)
        assert.strictEqual(counts.el0, 1)
    })

    it('should be immune to Object.prototype pollution (enumerable members, get/set/value/writable/enumerable/configurable)', function() {
        let names = ['polluted', 'get', 'set', 'value', 'writable', 'enumerable', 'configurable', '$custom', '$and', 'hasOwnProperty_x']
        try {
            for (let k of names) {
                Object.prototype[k] = k === 'get' || k === 'set' ? 1 : { x: 1 }
            }
            let f = { a: 1, $and: [{ b: 2 }, { c: { $gt: 3, $in: [1, 2] } }], d: { $nin: ['x'] } }
            let r = cvOrmFind(f)
            assert.deepStrictEqual(Object.keys(r), ['a', '$and', 'd'])
            assert.deepStrictEqual(toPlain(r), toPlain(f))
            assert.strictEqual(Object.keys(r.$and[1].c).includes('polluted'), false)
            assert.deepStrictEqual(Reflect.ownKeys(cvOrmFind({})), [])
            assert.deepStrictEqual(Reflect.ownKeys(cvOrmFind()), [])
            rej(() => ({ a: { $foo: 1 } }), 'unsupported operator [$foo]', 'find.a.$foo')
            //被汙染之value/enumerable不得使存取器或不可列舉屬性被當成一般資料屬性
            rej(() => ({
                get a() {
                    return 1
                }
            }), 'accessor property is not allowed', 'find')
            rej(() => hidden({}, 'a', 1), 'non-enumerable property is not allowed', 'find')
            rej(() => ({
                a: {
                    $in: Object.defineProperty([], '0', {
                        __proto__: null,
                        get() {
                            return 1
                        },
                        enumerable: true
                    })
                }
            }), 'accessor element is not allowed', 'find.a.$in[0]')
        }
        finally {
            for (let k of names) {
                delete Object.prototype[k]
            }
        }
        assert.strictEqual(Object.prototype.polluted, undefined)
    })

    it('should be immune to Array.prototype pollution of indexes (values and setters)', function() {
        let saved = Object.getOwnPropertyDescriptor(Array.prototype, '0')
        let setterCalls = 0
        try {
            Array.prototype[5] = { a: 'polluted' }
            Object.defineProperty(Array.prototype, '0', {
                configurable: true,
                get() {
                    return 'polluted0'
                },
                set() {
                    setterCalls++
                }
            })
            let r = cvOrmFind({ $and: [{ b: 1 }, { c: 2 }], x: { $in: [1, 2, 3] }, y: { $nin: ['q'] } })
            assert.deepStrictEqual(toPlain(r), { $and: [{ b: 1 }, { c: 2 }], x: { $in: [1, 2, 3] }, y: { $nin: ['q'] } })
            assert.strictEqual(setterCalls, 0)
            assert.strictEqual(Object.getOwnPropertyDescriptor(r.x.$in, '0').value, 1)
        }
        finally {
            delete Array.prototype[5]
            delete Array.prototype[0]
            if (saved) {
                Object.defineProperty(Array.prototype, '0', saved)
            }
        }
    })

    it('should not be affected by later overrides of Array.prototype.push, Object.prototype.hasOwnProperty and Reflect.ownKeys', function() {
        let sp = Array.prototype.push
        let sh = Object.prototype.hasOwnProperty
        let so = Reflect.ownKeys
        let sd = Object.getOwnPropertyDescriptor
        try {
            Array.prototype.push = () => {
                throw new Error('push called')
            }
            Object.prototype.hasOwnProperty = () => {
                throw new Error('hasOwnProperty called')
            }
            Reflect.ownKeys = () => {
                throw new Error('ownKeys called')
            }
            Object.getOwnPropertyDescriptor = () => {
                throw new Error('getOwnPropertyDescriptor called')
            }
            let r = cvOrmFind({ a: 1, $or: [{ b: { $in: [1, 2] } }, { c: null }] })
            assert.deepStrictEqual(toPlain(r), { a: 1, $or: [{ b: { $in: [1, 2] } }, { c: null }] })
            rej(() => ({ a: undefined }), 'undefined is not allowed', 'find.a')
        }
        finally {
            Array.prototype.push = sp
            Object.prototype.hasOwnProperty = sh
            Reflect.ownKeys = so
            Object.getOwnPropertyDescriptor = sd
        }
    })

    it('should return independent copies for repeated calls on the same input and keep no state between calls', function() {
        let f = { a: { $in: [1, 2] }, $or: [{ b: 1 }] }
        let r1 = cvOrmFind(f)
        let r2 = cvOrmFind(f)
        assert.notStrictEqual(r1, r2)
        assert.notStrictEqual(r1.a, r2.a)
        assert.notStrictEqual(r1.a.$in, r2.a.$in)
        assert.notStrictEqual(r1.$or[0], r2.$or[0])
        r1.a.$in.push(3)
        assert.deepStrictEqual(toPlain(cvOrmFind(f)), toPlain(f))
        //失敗後不影響下一次(節點預算與路徑無跨呼叫狀態)
        let big = {}
        for (let i = 0; i < 99999; i++) {
            big[`f${i}`] = i
        }
        assert.doesNotThrow(() => cvOrmFind(big))
        assert.throws(() => cvOrmFind({ ...big, x: 1 }), /condition is too large/)
        assert.doesNotThrow(() => cvOrmFind(big))
    })

    it('should never call the caller toString, valueOf, toJSON or Symbol.toPrimitive', function() {
        let called = []
        let spy = (name) => () => {
            called.push(name)
            return 'x'
        }
        let o = { toString: spy('toString'), valueOf: spy('valueOf'), toJSON: spy('toJSON'), [Symbol.toPrimitive]: spy('toPrimitive') }
        rej(() => ({ a: o }), 'unexpected key [toString] in operator object')
        rej(() => o, 'unsupported value type [function]', 'find.toString') //toString符合欄名文法, 被拒者為其值(函數), 不得被呼叫
        rej(() => ({ x: { $eq: o } }), 'unsupported value type [object]', 'find.x.$eq')
        let d = new Date(5)
        d.toString = spy('d.toString')
        d.valueOf = spy('d.valueOf')
        d.toJSON = spy('d.toJSON')
        Object.defineProperty(d, Symbol.toPrimitive, { value: spy('d.toPrimitive'), configurable: true })
        cvOrmFind({ d, a: { $in: [d] } })
        let p = new Proxy({ a: 1 }, {})
        cvOrmFind(p)
        assert.deepStrictEqual(called, [])
    })

})


describe('cvOrmFind 錯誤格式與例外轉換(規則12)', function() {

    it('should format messages as invalid find: reason at [path] with paths of keys and indexes', function() {
        rej(() => ({ $and: [{ a: 1 }, { b: { $gt: undefined } }] }), 'undefined is not allowed', 'find.$and[1].b.$gt')
        rej(() => ({ a: { $foo: 1 } }), 'unsupported operator [$foo]', 'find.a.$foo')
        rej(() => ({ id: { $in: ['a', 'b', 'c', NaN] } }), 'number is not finite', 'find.id.$in[3]')
        rej(() => ({ $or: [{ a: 1 }, { a: 2 }, { $and: [{ x: { $nin: [] } }] }] }), '$nin with empty array', 'find.$or[2].$and[0].x.$nin')
        rej(() => null, 'condition must be a plain object, got [null]', 'find')
        let e = rej(() => ({ a: 1, $and: [{ b: 2 }, { c: { $eq: Symbol('s') } }] }))
        assert.strictEqual(e.message, 'invalid find: unsupported value type [symbol] at [find.$and[1].c.$eq]')
        assert.strictEqual(e.name, 'Error')
    })

    it('should throw synchronously an Error (never return, never a Promise)', function() {
        let threw = false
        let r
        try {
            r = cvOrmFind(null)
        }
        catch (err) {
            threw = true
            assert.ok(err instanceof Error)
        }
        assert.strictEqual(threw, true)
        assert.strictEqual(r, undefined)
    })

    it('should bound the message length and clean control characters, lone surrogates and line separators in echoed names', function() {
        let f = { name: undefined }
        for (let i = 0; i < 30; i++) {
            f = { $or: [f, { value: 1 }] }
        }
        let e = errOf(() => f) //路徑為30層之find.$or[0].$or[0]...name, 須被截短(...開頭, 保留結尾100字元)
        assert.ok(e.message.length < 200, String(e.message.length))
        assert.ok(e.message.includes(' at [...'), e.message)
        assert.ok(reMsg.test(e.message), e.message)
        assert.ok(e.message.endsWith('.name]'), e.message)
        for (let k of ['a\nb\u0000', 'a\u2028b', 'a\u0085b', 'a\uD800b', 'a\u007fb', ' \r\t']) {
            let e2 = errOf(() => ({ [k]: 1 }))
            assert.ok(!/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(e2.message), JSON.stringify(e2.message))
            assert.ok(!/[\uD800-\uDFFF]/.test(e2.message), JSON.stringify(e2.message))
            assert.ok(reMsg.test(e2.message), JSON.stringify(e2.message))
        }
        let e3 = errOf(() => ({ ['$' + 'k'.repeat(1000000)]: 1 }))
        assert.ok(e3.message.length < 400, String(e3.message.length))
        let e4 = errOf(() => ({ ['k'.repeat(1000000)]: 1 }))
        assert.ok(e4.message.length < 400, String(e4.message.length))
        let deepKeys = {}
        deepKeys[`${'long'.repeat(10)}`] = { [`${'deep'.repeat(10)}`]: { $foo: 1 } }
        let e5 = errOf(() => deepKeys)
        assert.ok(e5.message.length < 400, String(e5.message.length))
    })

    it('should not echo any value of the input (secret strings, numbers, tags, class names) in the message', function() {
        let secret = 'SECRET-7f3a'
        class SECRETCLASS {}
        let bads = [
            () => ({ a: `${secret}\u0000` }),
            () => ({ a: `${secret}\uD800` }),
            () => ({ a: { $in: [secret, null] } }),
            () => ({ a: { $gt: new Date(NaN) } }),
            () => ({ a: new SECRETCLASS() }),
            () => ({ a: Object.create({ [Symbol.toStringTag]: secret }) }),
            () => ({ a: Object.assign(Object.create(null), { [Symbol.toStringTag]: secret }) }),
            () => ({ a: Object.defineProperty({}, Symbol.toStringTag, { value: secret }) }),
            () => ({ a: Object.create({ [Symbol.toStringTag]: 'SECRETTOKEN' }) }), //標籤為純英數(不含連字號)亦不得回顯
            () => ({ a: Object.defineProperty({}, Symbol.toStringTag, { value: 'SECRETTOKEN' }) }),
            () => ({ a: Object.setPrototypeOf(new Map(), Object.create({ [Symbol.toStringTag]: 'SECRETTOKEN' })) }),
            () => ({ a: { $eq: { [secret]: 1 } } }),
            () => ({ a: [secret] }),
            () => ({ a: { $in: [[secret]] } }),
            () => ({ a: { $in: [{ x: secret }] } }),
            () => ({ $and: [secret] }),
            () => ({ $and: [{ a: secret }, { b: [secret] }] }),
            () => secret,
            () => [secret],
            () => new Map([[secret, secret]]),
            () => ({ a: Buffer.from(secret) }),
            () => ({ a: new String(secret) }),
            () => ({ a: { $gt: NaN, $lt: 1234567.891 } }),
            () => ({ a: { $in: [1e20, Infinity] } }),
        ]
        for (let mk of bads) {
            let e = errOf(mk)
            assert.ok(reMsg.test(e.message), e.message)
            assert.ok(!e.message.includes('SECRET'), `echoed a value: ${e.message}`)
            assert.ok(!e.message.includes('1234567'), `echoed a number: ${e.message}`)
            assert.ok(!e.message.includes('99999999999999999999') && !e.message.includes('1e+20'), `echoed a number: ${e.message}`)
        }
    })

    it('should turn any exception of caller hooks into invalid find with a fixed reason and the path of the failure', function() {
        let why = 'an exception was thrown while reading the condition'
        let trap = (name, err) => new Proxy({ a: 1 }, {
            [name]() {
                throw err
            }
        })
        rej(() => trap('ownKeys', new Error('SECRET-keys')), why, 'find')
        rej(() => ({ x: trap('ownKeys', new Error('SECRET-keys')) }), why, 'find.x')
        rej(() => ({ $and: [{ a: 1 }, trap('getOwnPropertyDescriptor', new Error('SECRET-gopd'))] }), why, 'find.$and[1]')
        rej(() => ({ $and: [{ a: 1 }, trap('getPrototypeOf', new Error('SECRET-gpo'))] }), why, 'find.$and[1]')
        rej(() => ({
            a: {
                get [Symbol.toStringTag]() {
                    throw new Error('SECRET-tag')
                }
            }
        }), why, 'find.a')
        rej(() => ({
            get [Symbol.toStringTag]() {
                throw new Error('SECRET-tag2')
            }
        }), why, 'find')
        let r = Proxy.revocable({}, {})
        r.revoke()
        rej(() => r.proxy, why, 'find')
        rej(() => ({ a: r.proxy }), why, 'find.a')
        rej(() => ({ $or: [r.proxy] }), why, 'find.$or[0]')
        rej(() => ({ a: { $in: r.proxy } }), why, 'find.a.$in')
        let rr = Proxy.revocable([], {})
        rr.revoke()
        rej(() => ({ a: { $in: rr.proxy } }), why, 'find.a.$in')
        for (let name of ['ownKeys', 'getOwnPropertyDescriptor', 'getPrototypeOf', 'get']) {
            let e = errOf(() => ({
                a: new Proxy({ a: 1 }, {
                    [name]() {
                        throw new Error('SECRET-msg')
                    }
                })
            }))
            assert.ok(!e.message.includes('SECRET'), e.message)
        }
    })

    it('should convert thrown non-Error values, hostile errors and forged invalid find errors, never rethrowing them', function() {
        let bomb = () => {
            let o = {}
            Object.defineProperty(o, 'message', {
                get() {
                    throw o
                },
                enumerable: false
            })
            return o
        }
        let forgedObj = { message: 'invalid find: forged at [find]' }
        let forgedErr = new Error('invalid find: pretend at [find.a]')
        let shaped = { reason: 'MARKER-trap' } //與本模組內部失敗物件同形(reason字串)
        let shapedErr = Object.assign(new Error('x'), { reason: 'MARKER-trap' })
        let thrown = [bomb(), 'plain string', null, undefined, 42, forgedObj, forgedErr, shaped, shapedErr, Symbol('s'), {
            toString() {
                throw new Error('x')
            }
        }]
        for (let t of thrown) {
            let e = errOf(() => ({
                a: new Proxy({}, {
                    getPrototypeOf() {
                        throw t
                    }
                })
            }))
            assert.ok(e instanceof Error && e !== t, 'must be a new Error')
            assert.strictEqual(e.message, 'invalid find: an exception was thrown while reading the condition at [find.a]')
        }
    })

    it('should be re-entrant: a caller trap may call cvOrmFind (also failing) without affecting the outer call, budget or path', function() {
        let inner = 0
        let p = new Proxy({ g: 'A' }, {
            getOwnPropertyDescriptor(t, k) {
                inner++
                assert.deepStrictEqual(toPlain(cvOrmFind({ z: 1, $or: [{ y: 2 }] })), { z: 1, $or: [{ y: 2 }] })
                assert.throws(() => cvOrmFind(null), /^Error: invalid find: condition must be a plain object, got \[null\] at \[find\]$/)
                assert.throws(() => cvOrmFind({ q: undefined }), /at \[find\.q\]$/)
                return Reflect.getOwnPropertyDescriptor(t, k)
            }
        })
        let r = cvOrmFind({ $and: [p, { b: 1 }] })
        assert.deepStrictEqual(toPlain(r), { $and: [{ g: 'A' }, { b: 1 }] })
        assert.ok(inner >= 1)
        //外層超過節點預算時, 內層呼叫不得重置外層之預算
        let o = {}
        for (let i = 0; i < 99998; i++) {
            o[`f${i}`] = i
        }
        o.z = new Proxy({ $gt: 1 }, {
            getOwnPropertyDescriptor(t, k) {
                cvOrmFind({ z: 1 }) //若共用狀態, 內層結束時可能重置或還原外層預算
                return Reflect.getOwnPropertyDescriptor(t, k)
            }
        })
        //條件物件1 + 99998純量 + z之運算子物件1 + $gt之純量1 = 100001
        let e = errOf(() => o)
        assert.ok(/condition is too large at \[find\.z\.\$gt\]$/.test(e.message), e.message)
        //外層之例外路徑不受內層失敗影響
        let q = new Proxy({ $gt: 1 }, {
            getOwnPropertyDescriptor(t, k) {
                try {
                    cvOrmFind({ deep: { deeper: { $bad: 1 } } })
                }
                catch (err) {
                    assert.ok(err instanceof Error) //內層失敗被自己攔下, 不影響外層
                }
                throw new Error('outer failure')
            }
        })
        rej(() => ({ a: 1, c: q }), 'an exception was thrown', 'find.c')
    })

})


describe('cvOrmFind 純JS(規則13)', function() {

    let src = fs.readFileSync(fpSrc, 'utf8')

    it('should not import any module, nor mention Node APIs or lodash in the source', function() {
        assert.ok(!/^\s*import\s/m.test(src), 'must not import')
        assert.ok(!/\brequire\s*\(/.test(src), 'must not require')
        assert.ok(!/\bBuffer\b/.test(src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')), 'must not use Buffer')
        assert.ok(!/\bprocess\b/.test(src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')), 'must not use process')
        assert.ok(!/lodash/.test(src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')), 'must not use lodash')
        assert.ok(/^export default cvOrmFind\s*$/m.test(src), 'must export default cvOrmFind')
    })

    it('should load and work in a context without Node globals (no process, Buffer, require, console)', function() {
        let code = src.replace(/^export default cvOrmFind\s*$/m, 'globalThis.__cvOrmFind = cvOrmFind')
        assert.notStrictEqual(code, src)
        let ctx = vm.createContext({})
        vm.runInContext(code, ctx)
        let script = `
            (function() {
                let out = {}
                out.noNode = [typeof process, typeof Buffer, typeof require, typeof module, typeof globalThis.global]
                let f = globalThis.__cvOrmFind
                let ok = (v) => { let r = f(v); return JSON.stringify(r) }
                let bad = (v) => { try { f(v); return 'NO THROW' } catch (e) { return e.message } }
                out.ok = [ok(undefined), ok({}), ok({ a: 1, b: { $in: [1, 2], $gt: 0 }, $or: [{ c: null }, { d: new Date(5) }] })]
                out.bad = [bad(null), bad({ a: undefined }), bad({ $where: 1 }), bad({ a: { $in: [] , $nin: [] } }), bad({ ['a.b']: 1 })]
                out.date = f({ d: new Date(5) }).d instanceof Date
                out.proto = Object.getPrototypeOf(f({ a: 1 })) === null
                return JSON.stringify(out)
            })()
        `
        let out = JSON.parse(vm.runInContext(script, ctx))
        assert.deepStrictEqual(out.noNode, ['undefined', 'undefined', 'undefined', 'undefined', 'undefined'])
        assert.deepStrictEqual(out.ok, ['{}', '{}', '{"a":1,"b":{"$in":[1,2],"$gt":0},"$or":[{"c":null},{"d":"1970-01-01T00:00:00.005Z"}]}'])
        assert.deepStrictEqual(out.bad, [
            'invalid find: condition must be a plain object, got [null] at [find]',
            'invalid find: undefined is not allowed at [find.a]',
            'invalid find: unsupported operator [$where] at [find.$where]',
            'invalid find: $nin with empty array is always true at [find.a.$nin]',
            'invalid find: unsupported column name [a.b] at [find.a.b]',
        ])
        assert.strictEqual(out.date, true)
        assert.strictEqual(out.proto, true)
    })

})


describe('cvOrmFind 契約案例表(R-FIND-01)', function() {

    let { cases, seed, columns } = cvOrmFindCases

    //獨立於實作之參考比對器: 依族別語意計算find命中之id集合, 用以核對案例表之ids
    let isNil = (v) => v === undefined || v === null
    let cmp = (fam, a, b) => {
        //回傳-1/0/1, 不可比較者回傳undefined
        let ta = isDate(a) ? 'date' : typeof a
        let tb = isDate(b) ? 'date' : typeof b
        if (fam === 'sql' && ta !== tb) {
            //SQL族: 數字與字串依欄型轉換(字串須為數值格式)
            let na = ta === 'string' && a.trim() !== '' ? Number(a) : a
            let nb = tb === 'string' && b.trim() !== '' ? Number(b) : b
            if (typeof na === 'number' && typeof nb === 'number' && !Number.isNaN(na) && !Number.isNaN(nb)) {
                return na < nb ? -1 : na > nb ? 1 : 0
            }
            return undefined
        }
        if (ta !== tb) {
            return undefined
        }
        let x = ta === 'date' ? a.getTime() : a
        let y = tb === 'date' ? b.getTime() : b
        if (ta === 'boolean') {
            x = x ? 1 : 0
            y = y ? 1 : 0
        }
        return x < y ? -1 : x > y ? 1 : 0
    }
    let eq = (fam, a, b) => (b === null ? isNil(a) : !isNil(a) && cmp(fam, a, b) === 0)
    let matchField = (fam, a, cond) => {
        if (cond === null || typeof cond !== 'object' || isDate(cond)) {
            return eq(fam, a, cond)
        }
        return Object.keys(cond).every((op) => {
            let b = cond[op]
            let c = (isNil(a) || b === null) ? undefined : cmp(fam, a, b)
            switch (op) {
            case '$eq': return eq(fam, a, b)
            case '$ne': return fam === 'mongo' ? !eq(fam, a, b) : (b === null ? !isNil(a) : !isNil(a) && c !== 0 && c !== undefined)
            case '$gt': return c !== undefined && c > 0
            case '$gte': return c !== undefined && c >= 0
            case '$lt': return c !== undefined && c < 0
            case '$lte': return c !== undefined && c <= 0
            case '$in': return b.some((x) => eq(fam, a, x))
            case '$nin': return fam === 'mongo' ? !b.some((x) => eq(fam, a, x)) : (!isNil(a) && !b.some((x) => eq(fam, a, x)))
            default: throw new Error(`reference: unknown operator ${op}`)
            }
        })
    }
    let matchDoc = (fam, row, doc) => Object.keys(doc).every((k) => {
        if (k === '$and') {
            return doc.$and.every((d) => matchDoc(fam, row, d))
        }
        if (k === '$or') {
            return doc.$or.some((d) => matchDoc(fam, row, d))
        }
        return matchField(fam, row[k], doc[k])
    })
    let refIds = (fam, find) => seed().filter((row) => matchDoc(fam, row, find)).map((row) => row.id)

    it('should have the documented shape: unique ids, group letters, known rules, expects, why/ids/schema/need only where meaningful', function() {
        let rules = new Set(['WL-01', 'WL-02', 'WL-03', 'WL-04', 'WL-05', 'WL-06', 'WL-07', 'WL-S1', 'WL-S2', 'WL-N1', 'WL-N2', 'WL-E1', 'WL-E2', 'WL-E3', 'WL-E4', 'WL-E5', 'WL-F1', 'WL-F2', 'WL-F3', 'WL-L1', 'WL-L2', 'WL-L3', 'WL-L4', 'WL-H1', 'WL-H2', 'WL-H3', 'WL-H5'])
        let ids = new Set()
        let allIds = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']
        for (let c of cases) {
            assert.ok(!ids.has(c.id), `duplicate id ${c.id}`)
            ids.add(c.id)
            assert.ok(/^[TECILNFXVH]\d{2}$/.test(c.id), c.id)
            assert.strictEqual(c.group, c.id[0], c.id)
            assert.ok(rules.has(c.rule), `${c.id}: unknown rule ${c.rule}`)
            assert.ok(typeof c.label === 'string' && c.label.length > 0, c.id)
            assert.strictEqual(typeof c.find, 'function', c.id)
            assert.ok(['ALL', 'OK', 'REJ'].includes(c.expect), c.id)
            if (c.expect === 'REJ') {
                assert.ok(typeof c.why === 'string' && c.why.length > 0, `${c.id}: REJ needs why`)
                assert.strictEqual(c.ids, undefined, `${c.id}: REJ must not have ids`)
                assert.strictEqual(c.schema, undefined, c.id)
                assert.strictEqual(c.need, undefined, c.id)
            }
            else {
                assert.strictEqual(c.why, undefined, `${c.id}: only REJ has why`)
                assert.ok(c.ids && Array.isArray(c.ids.mongo) && Array.isArray(c.ids.sql), `${c.id}: needs ids.mongo and ids.sql`)
                for (let fam of ['mongo', 'sql', 'mdb']) {
                    if (c.ids[fam] === undefined) {
                        assert.notStrictEqual(fam, 'mongo')
                        assert.notStrictEqual(fam, 'sql')
                        continue
                    }
                    assert.deepStrictEqual(c.ids[fam], c.ids[fam].slice().sort(), `${c.id}: ids.${fam} must be ascending`)
                    assert.ok(c.ids[fam].every((x) => allIds.includes(x)), c.id)
                    assert.strictEqual(new Set(c.ids[fam]).size, c.ids[fam].length, c.id)
                }
                assert.deepStrictEqual(Object.keys(c.ids).filter((k) => !['mongo', 'sql', 'mdb'].includes(k)), [], c.id)
                if (c.expect === 'ALL') {
                    assert.deepStrictEqual(c.ids.mongo, allIds)
                    assert.deepStrictEqual(c.ids.sql, allIds)
                }
                if (c.schema !== undefined) {
                    assert.strictEqual(c.schema, true, c.id)
                }
                if (c.need !== undefined) {
                    assert.deepStrictEqual(Object.keys(c.need), ['maxIn'], c.id)
                    assert.ok(Number.isInteger(c.need.maxIn) && c.need.maxIn > 0, c.id)
                }
            }
        }
        //只有N08與E25有mdb覆寫鍵
        assert.deepStrictEqual(cases.filter((c) => c.ids && c.ids.mdb !== undefined).map((c) => c.id), ['E25', 'N08'])
    })

    it('should contain all 191 shapes of the audit catalogue', function() {
        let want = []
        let rg = (g, n) => {
            for (let i = 1; i <= n; i++) {
                want.push(`${g}${String(i).padStart(2, '0')}`)
            }
        }
        rg('T', 21)
        rg('E', 25)
        rg('C', 15)
        rg('I', 19)
        rg('L', 16)
        rg('N', 14)
        rg('F', 20)
        rg('X', 38)
        rg('V', 10)
        rg('H', 13)
        assert.strictEqual(want.length, 191)
        let have = new Set(cases.map((c) => c.id))
        for (let id of want) {
            assert.ok(have.has(id), `missing ${id}`)
        }
    })

    it('should provide a fresh 6-row seed (a1~a6) whose keys are the documented columns', function() {
        let s1 = seed()
        let s2 = seed()
        assert.deepStrictEqual(s1.map((r) => r.id), ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'])
        assert.notStrictEqual(s1, s2)
        assert.notStrictEqual(s1[0], s2[0])
        assert.notStrictEqual(s1[0].d, s2[0].d)
        for (let r of s1) {
            for (let k of Object.keys(r)) {
                assert.ok(k in columns, k)
            }
        }
        assert.ok(isDate(s1[0].d) && isDate(s1[1].d))
        assert.strictEqual(s1[3].age, null)
        assert.strictEqual('t' in s1[5], false) //a6缺欄
        assert.deepStrictEqual(Object.keys(columns), ['id', 'name', 'age', 'g', 't', 'flag', 'd'])
    })

    it('should return a fresh find on every call of find()', function() {
        for (let c of cases) {
            let a = c.find()
            let b = c.find()
            if (a !== null && (typeof a === 'object') && !(typeof a === 'function')) {
                assert.notStrictEqual(a, b, c.id)
            }
        }
    })

    it('should agree with an independent reference matcher: ids.mongo and ids.sql of every ALL/OK case', function() {
        let n = 0
        for (let c of cases) {
            if (c.expect === 'REJ') {
                continue
            }
            let f = c.find()
            let all = cvOrmFind(f)
            let g = Object.keys(all).length === 0 ? {} : f
            assert.deepStrictEqual(refIds('mongo', g), c.ids.mongo, `${c.id} mongo`)
            assert.deepStrictEqual(refIds('sql', g), c.ids.sql, `${c.id} sql`)
            n++
        }
        assert.strictEqual(n, cases.filter((c) => c.expect !== 'REJ').length)
        assert.ok(n >= 70, String(n))
    })

    cases.forEach((c) => {
        it(`${c.id} [${c.rule}] ${c.expect} ${c.label}`, function() {
            if (c.expect === 'REJ') {
                rej(() => c.find(), c.why)
                return
            }
            let f = c.find()
            let r = cvOrmFind(f)
            assert.strictEqual(Object.getPrototypeOf(r), null)
            if (c.expect === 'ALL') {
                assert.deepStrictEqual(Reflect.ownKeys(r), [])
                return
            }
            assert.ok(Reflect.ownKeys(r).length > 0)
            assert.deepStrictEqual(toPlain(r), toPlain(f))
            assertFresh(f, r)
        })
    })

    it('should reject exactly the cases a mdb-like opt (maxIn 2000) cannot accept: only the need cases change', function() {
        for (let c of cases) {
            if (c.expect === 'REJ') {
                continue
            }
            let f = c.find()
            if (c.need && c.need.maxIn > 2000) {
                rej(() => f, 'array is too large (> 2000)', undefined, { maxIn: 2000 })
            }
            else {
                assert.doesNotThrow(() => cvOrmFind(c.find(), { maxIn: 2000 }), c.id)
            }
        }
    })

})


describe('cvOrmFind 敵意輸入預言機(pg/reladb 形狀層, R-FIND-01)', function() {

    let cases = oracle.cases

    it('should have unique ids, a known source, and a note for every case where w-orm-postgresql cvFind differs from the rule', function() {
        let ids = new Set()
        let diff = 0
        for (let c of cases) {
            assert.ok(!ids.has(c.id), c.id)
            ids.add(c.id)
            assert.ok(['pg-accepts', 'pg-rejects', 'pg-top', 'reladb'].includes(c.from), c.id)
            assert.ok(['OK', 'ALL', 'REJ'].includes(c.expect), c.id)
            assert.ok(c.pg === 'OK' || c.pg === 'REJ', c.id)
            let en = c.expect === 'ALL' ? 'OK' : c.expect
            if (c.pg !== en) {
                diff++
                assert.ok(/^WL-[A-Z]?\d?/.test(c.note), `${c.id} ${c.label}: pg differs, note must name the rule`)
            }
        }
        assert.ok(cases.length >= 300, String(cases.length))
        assert.ok(diff >= 30, String(diff))
    })

    cases.forEach((c) => {
        it(`${c.id} [${c.from}] ${c.expect} ${c.label}`, function() {
            if (c.expect === 'REJ') {
                rej(() => c.find())
                return
            }
            let f = c.find()
            let r = cvOrmFind(f)
            assert.strictEqual(Object.getPrototypeOf(r), null)
            if (c.expect === 'ALL') {
                assert.deepStrictEqual(Reflect.ownKeys(r), [])
            }
            else {
                assert.ok(Reflect.ownKeys(r).length > 0)
                assert.deepStrictEqual(toPlain(r), toPlain(f))
                assertFresh(f, r)
            }
        })
    })

})


describe('cvOrmFind 外審補強(R-FIND-01 規則2、9~12)', function() {

    let nullp = (o) => Object.setPrototypeOf(o, null)
    let objp = (o) => Object.setPrototypeOf(o, Object.prototype)
    let ch = (cp) => String.fromCharCode(cp)
    let revokedProxy = () => {
        let r = Proxy.revocable({}, {})
        r.revoke()
        return r.proxy
    }
    let why = 'an exception was thrown while reading the condition'

    it('should reject re-prototyped built-ins with internal slots at the top level (null prototype and Object.prototype)', function() {
        let mks = [
            ['Map', () => new Map([['id', 'a1']])],
            ['Set', () => new Set(['a1'])],
            ['WeakMap', () => new WeakMap()],
            ['WeakSet', () => new WeakSet()],
            ['Promise', () => Promise.resolve(1)],
            ['rejected Promise (must not leave an unhandled rejection)', () => {
                let p = Promise.reject(new Error('x'))
                p.catch(() => {})
                return p
            }],
            ['ArrayBuffer', () => new ArrayBuffer(8)],
            ['SharedArrayBuffer', () => new SharedArrayBuffer(8)],
            ['DataView', () => new DataView(new ArrayBuffer(8))],
            ['Uint8Array(0)', () => new Uint8Array(0)],
            ['Uint8Array(4)', () => new Uint8Array(4)],
            ['Float64Array(2)', () => new Float64Array(2)],
            ['Symbol wrapper', () => Object(Symbol('s'))],
            ['BigInt wrapper', () => Object(1n)],
            ['WeakRef', () => new WeakRef({})],
        ]
        for (let [label, mk] of mks) {
            for (let setp of [nullp, objp]) {
                let e = errOf(() => setp(mk()))
                assert.ok(reMsg.test(e.message) && e.message.includes('condition must be a plain object'), `${label}: ${e.message}`)
            }
        }
    })

    it('should not leave an unhandled rejection when it probes a re-prototyped rejected Promise', async function() {
        let seen = []
        let h = (reason) => {
            seen.push(reason)
        }
        process.on('unhandledRejection', h)
        try {
            for (let setp of [nullp, objp]) {
                let p = Promise.reject(new Error('probe-target'))
                p.catch(() => {})
                rej(() => setp(p), 'condition must be a plain object', 'find')
            }
            await new Promise((resolve) => setTimeout(resolve, 30))
        }
        finally {
            process.off('unhandledRejection', h)
        }
        assert.deepStrictEqual(seen.map((r) => String(r && r.message)), [])
    })

    it('should reject a re-prototyped TypedArray at every condition position before enumerating its index keys', function() {
        let ta = () => nullp(new Uint8Array(4))
        rej(() => ta(), 'condition must be a plain object', 'find')
        rej(() => ({ $and: [ta()] }), 'condition must be a plain object', 'find.$and[0]')
        rej(() => ({ a: ta() }), 'unsupported value type', 'find.a')
        rej(() => ({ a: { $eq: ta() } }), 'unsupported value type', 'find.a.$eq')
    })

    it('documents the limit: a re-prototyped Map that carries own enumerable data properties is read as a plain bag of its own properties', function() {
        let m = Object.assign(nullp(new Map([['x', 1]])), { g: 'A' })
        assert.deepStrictEqual(toPlain(cvOrmFind(m)), { g: 'A' })
        assert.deepStrictEqual(toPlain(cvOrmFind({ $and: [Object.assign(nullp(new Set()), { g: 'A' })] })), { $and: [{ g: 'A' }] })
    })

    it('should return a fresh object for {} and for an empty null-prototype input, and keep no state between results', function() {
        let e1 = Object.create(null)
        assert.notStrictEqual(cvOrmFind(e1), e1)
        let a = cvOrmFind({})
        let b = cvOrmFind({})
        assert.notStrictEqual(a, b)
        a.id = 'x'
        assert.deepStrictEqual(Reflect.ownKeys(cvOrmFind({})), [])
        assert.deepStrictEqual(Reflect.ownKeys(cvOrmFind()), [])
    })

    it('should reject a Proxy array whose ownKeys hides an index and lists an extra key, in all four list positions', function() {
        let lie = (arr) => new Proxy(arr, {
            ownKeys(t) {
                return Reflect.ownKeys(t).filter((k) => k !== '0')
            }
        })
        rej(() => ({ a: { $in: lie(Object.assign([1], { extra: 1 })) } }), 'array carries extra properties', 'find.a.$in')
        rej(() => ({ a: { $nin: lie(Object.assign([1], { extra: 1 })) } }), 'array carries extra properties', 'find.a.$nin')
        rej(() => ({ $and: lie(Object.assign([{ a: 1 }], { extra: 1 })) }), 'array carries extra properties', 'find.$and')
        rej(() => ({ $or: lie(Object.assign([{ a: 1 }], { extra: 1 })) }), 'array carries extra properties', 'find.$or')
    })

    it('should reject extra own properties (string, symbol, non-canonical index) on the arrays of $in, $nin, $and and $or', function() {
        let positions = [
            ['$in', 'A', (a) => ({ g: { $in: a } }), 'find.g.$in'],
            ['$nin', 'A', (a) => ({ g: { $nin: a } }), 'find.g.$nin'],
            ['$and', { g: 'A' }, (a) => ({ $and: a }), 'find.$and'],
            ['$or', { g: 'A' }, (a) => ({ $or: a }), 'find.$or'],
        ]
        for (let [, el, mk, at] of positions) {
            for (let k of ['extra', '01', '-0', '1.0', ' 1', '1e0', '4294967295', Symbol('x')]) {
                let a = [el]
                a[k] = 'v'
                rej(() => mk(a), 'array carries extra properties', at)
            }
            ok(() => mk([el, el]))
        }
    })

    it('should convert read exceptions of non-plain values to the fixed reason in every scalar position (revoked Proxy, throwing tag getter)', function() {
        let throwing = () => {
            let m = new Map()
            Object.defineProperty(m, Symbol.toStringTag, {
                __proto__: null,
                get() {
                    throw new Error('MARKER')
                }
            })
            return m
        }
        for (let op of ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte']) {
            rej(() => ({ a: { [op]: revokedProxy() } }), why, `find.a.${op}`)
            rej(() => ({ a: { [op]: throwing() } }), why, `find.a.${op}`)
        }
        for (let op of ['$in', '$nin']) {
            rej(() => ({ a: { [op]: [revokedProxy()] } }), why, `find.a.${op}[0]`)
            rej(() => ({ a: { [op]: ['x', throwing()] } }), why, `find.a.${op}[1]`)
        }
        rej(() => throwing(), why, 'find')
        rej(() => ({ a: throwing() }), why, 'find.a')
        rej(() => ({ $or: [throwing()] }), why, 'find.$or[0]')
        rej(() => ({ $and: [revokedProxy()] }), why, 'find.$and[0]')
    })

    it('should show only fixed kinds for custom tags, also tags that look like built-in names', function() {
        for (let tag of ['Mapx', 'Object2', 'Map2', 'SECRETTOKEN', 'Date ']) {
            let e = rej(() => ({ a: Object.create({ [Symbol.toStringTag]: tag }) }), 'unsupported value type [object]', 'find.a')
            assert.ok(!e.message.includes(tag.trim()), e.message)
        }
        let e2 = rej(() => ({ a: { $eq: Object.assign(Object.create(null), { [Symbol.toStringTag]: 'Mapx' }) } }), 'unsupported value type [object]')
        assert.ok(!e2.message.includes('Mapx'), e2.message)
    })

    it('should read opt only as own data properties (inherited values ignored, accessors and unknown symbol or non-enumerable keys rejected)', function() {
        let f = () => ({ a: { $in: [1, 2, 3] } })
        ok(f, Object.create({ maxIn: 1 })) //繼承值不生效
        try {
            Object.prototype.maxIn = 1
            ok(f)
            ok(f, {})
        }
        finally {
            delete Object.prototype.maxIn
        }
        ok(f, { maxIn: undefined })
    })

    it('should read known opt values from their descriptors only (a get trap is never called and the descriptor value is the one used)', function() {
        let gets = 0
        let opt = new Proxy({ maxIn: 5 }, {
            get() {
                gets++
                return undefined
            }
        })
        rej(() => ({ a: { $in: fills(6) } }), 'array is too large (> 5)', 'find.a.$in', opt)
        ok(() => ({ a: { $in: fills(5) } }), opt)
        assert.strictEqual(gets, 0)
    })

    it('should reject unknown opt keys of any kind and convert opt trap exceptions to invalid opt', function() {
        let msg = (opt) => {
            try {
                cvOrmFind({ a: 1 }, opt)
            }
            catch (err) {
                return err instanceof Error ? err.message : `non-Error thrown: ${String(err)}`
            }
            return 'ACCEPT'
        }
        assert.strictEqual(msg({ [Symbol('x')]: 1 }), 'invalid opt: unknown option [symbol]')
        assert.strictEqual(msg(Object.defineProperty({}, 'unknown', { __proto__: null, value: 1 })), 'invalid opt: unknown option [unknown]')
        assert.strictEqual(msg(Object.defineProperty({}, 'maxIn', {
            __proto__: null,
            get() {
                throw 'MARKER'
            }
        })), 'invalid opt: accessor option [maxIn] is not allowed')
        assert.strictEqual(msg(new Proxy({}, {
            ownKeys() {
                throw 'MARKER'
            }
        })), 'invalid opt: can not read opt')
        assert.strictEqual(msg(new Proxy({ maxDepth: 5 }, {
            getOwnPropertyDescriptor() {
                throw 'MARKER'
            }
        })), 'invalid opt: can not read option [maxDepth]')
        assert.strictEqual(msg(null), 'ACCEPT')
        assert.strictEqual(msg({ maxIn: undefined }), 'ACCEPT')
        let reads = 0
        assert.strictEqual(msg(Object.defineProperty({}, 'maxKey', {
            __proto__: null,
            get() {
                reads++
                return 5
            }
        })), 'invalid opt: accessor option [maxKey] is not allowed')
        assert.strictEqual(reads, 0) //存取器不被呼叫
    })

    it('should read length exactly once per list and never read array indexes through the get trap', function() {
        let counts = { length: 0, index: 0 }
        let spy = (arr) => new Proxy(arr, {
            get(t, k, r) {
                if (k === 'length') {
                    counts.length++
                }
                else if (typeof k === 'string' && /^\d+$/.test(k)) {
                    counts.index++
                }
                return Reflect.get(t, k, r)
            }
        })
        let positions = [
            ['$in', () => ({ g: { $in: spy(['A', 'B']) } })],
            ['$nin', () => ({ g: { $nin: spy(['A', 'B']) } })],
            ['$and', () => ({ $and: spy([{ g: 'A' }, { h: 'B' }]) })],
            ['$or', () => ({ $or: spy([{ g: 'A' }, { h: 'B' }]) })],
        ]
        for (let [label, mk] of positions) {
            counts.length = 0
            counts.index = 0
            cvOrmFind(mk())
            assert.strictEqual(counts.length, 1, `${label} length reads`)
            assert.strictEqual(counts.index, 0, `${label} index reads`)
        }
    })

    it('should call ownKeys and getPrototypeOf once per condition or operator object, and read the tag once', function() {
        let n = { ownKeys: 0, proto: 0, tag: 0, str: 0 }
        let spy = (target) => new Proxy(target, {
            ownKeys(t) {
                n.ownKeys++
                return Reflect.ownKeys(t)
            },
            getPrototypeOf(t) {
                n.proto++
                return Reflect.getPrototypeOf(t)
            },
            get(t, k, r) {
                if (k === Symbol.toStringTag) {
                    n.tag++
                }
                else {
                    n.str++
                }
                return Reflect.get(t, k, r)
            },
        })
        cvOrmFind({ $and: [spy({ a: spy({ $gt: 1 }) })] })
        assert.deepStrictEqual(n, { ownKeys: 2, proto: 2, tag: 2, str: 0 })
    })

    it('should validate every occurrence of a shared object on its own (copies equal their own read, a later invalid read is rejected)', function() {
        let reads = 0
        let p = new Proxy({ $gt: 1 }, {
            getOwnPropertyDescriptor(t, k) {
                reads++
                return { ...Reflect.getOwnPropertyDescriptor(t, k), value: reads }
            }
        })
        assert.deepStrictEqual(toPlain(cvOrmFind({ a: p, b: p })), { a: { $gt: 1 }, b: { $gt: 2 } })
        assert.strictEqual(reads, 2)
        let reads2 = 0
        let q = new Proxy({ $gt: 1 }, {
            getOwnPropertyDescriptor(t, k) {
                reads2++
                return { ...Reflect.getOwnPropertyDescriptor(t, k), value: reads2 === 1 ? 1 : NaN }
            }
        })
        rej(() => ({ a: q, b: q }), 'number is not finite', 'find.b.$gt')
    })

    it('should check lone surrogates without String.prototype.isWellFormed (fallback), also when Object.prototype has a function of that name', function() {
        let code = fs.readFileSync(fpSrc, 'utf8').replace(/^export default cvOrmFind\s*$/m, 'globalThis.__f = cvOrmFind')
        let lones = [ch(0xD800), ch(0xDBFF), ch(0xDC00), ch(0xDFFF), `a${ch(0xD800)}`, `${ch(0xD800)}a`, `x${ch(0xDC00)}y`, `${ch(0xD83D)}x${ch(0xDE00)}`, `${ch(0xDE00)}${ch(0xD83D)}`, `${ch(0xD83D)}${ch(0xDE00)}${ch(0xDE00)}`]
        let pair = `${ch(0xD83D)}${ch(0xDE00)}`
        let run = (withProtoFn) => {
            let ctx = vm.createContext({ LONES: lones, PAIR: pair })
            vm.runInContext('delete String.prototype.isWellFormed', ctx)
            vm.runInContext(code, ctx)
            if (withProtoFn) {
                vm.runInContext('Object.prototype.isWellFormed = () => true', ctx)
            }
            return JSON.parse(vm.runInContext(`(function() {
                let f = globalThis.__f
                let bad = (v) => { try { f(v); return 'ACCEPT' } catch (e) { return e.message } }
                let res = []
                for (let s of LONES) {
                    res.push(bad({ a: s }), bad({ a: { $eq: s } }), bad({ a: { $in: [s] } }), bad({ $and: [{ a: s }] }))
                }
                res.push(JSON.stringify(f({ a: PAIR })))
                return JSON.stringify(res)
            })()`, ctx))
        }
        let expect = []
        for (let i = 0; i < lones.length; i++) {
            expect.push('invalid find: string contains lone surrogate at [find.a]', 'invalid find: string contains lone surrogate at [find.a.$eq]', 'invalid find: string contains lone surrogate at [find.a.$in[0]]', 'invalid find: string contains lone surrogate at [find.$and[0].a]')
        }
        expect.push(JSON.stringify({ a: pair }))
        assert.deepStrictEqual(run(false), expect)
        assert.deepStrictEqual(run(true), expect)
    })

    it('should take the time of a Date from its internal slot in every scalar position (subclass with overridden getTime, null prototype, cross realm)', function() {
        class D extends Date {
            getTime() {
                return 42
            }
        }
        let mks = [
            ['subclass', () => new D(7)],
            ['null prototype', () => nullp(new Date(7))],
            ['cross realm', () => vm.runInNewContext('new Date(7)')],
        ]
        let pos = [
            ['direct', (d) => ({ a: d }), (r) => r.a],
            ['$eq', (d) => ({ a: { $eq: d } }), (r) => r.a.$eq],
            ['$ne', (d) => ({ a: { $ne: d } }), (r) => r.a.$ne],
            ['$gt', (d) => ({ a: { $gt: d } }), (r) => r.a.$gt],
            ['$gte', (d) => ({ a: { $gte: d } }), (r) => r.a.$gte],
            ['$lt', (d) => ({ a: { $lt: d } }), (r) => r.a.$lt],
            ['$lte', (d) => ({ a: { $lte: d } }), (r) => r.a.$lte],
            ['$in', (d) => ({ a: { $in: [d] } }), (r) => r.a.$in[0]],
            ['$nin', (d) => ({ a: { $nin: [d] } }), (r) => r.a.$nin[0]],
        ]
        for (let [dl, mkd] of mks) {
            for (let [pl, mkf, get] of pos) {
                let r = cvOrmFind(mkf(mkd()))
                let v = get(r)
                assert.ok(isDate(v), `${dl} ${pl}`)
                assert.strictEqual(Date.prototype.getTime.call(v), 7, `${dl} ${pl}`)
                assert.strictEqual(Object.getPrototypeOf(v), Date.prototype, `${dl} ${pl}`)
            }
        }
    })

    it('should count depth for $or and mixed chains like $and (32 accepted, 33 rejected), also with a lowered maxDepth', function() {
        let mk = (n, ops) => {
            let o = { g: 'A' }
            for (let i = 0; i < n; i++) {
                o = { [ops[i % ops.length]]: [o] }
            }
            return o
        }
        for (let ops of [['$or'], ['$and', '$or'], ['$or', '$and']]) {
            ok(() => mk(32, ops))
            rej(() => mk(33, ops), 'nesting is too deep')
            ok(() => mk(3, ops), { maxDepth: 3 })
            rej(() => mk(4, ops), 'nesting is too deep', undefined, { maxDepth: 3 })
        }
    })

    it('should not count the list arrays themselves in the node budget (exact boundaries for $in, $nin, $and, $or)', function() {
        ok(() => ({ a: { $in: [1] } }), { maxNodes: 3 }) //條件物件1 + 運算子物件1 + 元素1
        rej(() => ({ a: { $in: [1] } }), 'condition is too large', undefined, { maxNodes: 2 })
        ok(() => ({ a: { $nin: [1, 2] } }), { maxNodes: 4 })
        rej(() => ({ a: { $nin: [1, 2] } }), 'condition is too large', undefined, { maxNodes: 3 })
        ok(() => ({ $and: [{ a: 1 }] }), { maxNodes: 3 }) //條件物件1 + 元素條件物件1 + 純量1
        rej(() => ({ $and: [{ a: 1 }] }), 'condition is too large', undefined, { maxNodes: 2 })
        ok(() => ({ $or: [{ a: 1 }, { b: 2 }] }), { maxNodes: 5 })
        rej(() => ({ $or: [{ a: 1 }, { b: 2 }] }), 'condition is too large', undefined, { maxNodes: 4 })
    })

    it('should keep at most 30 characters of an echoed key (and ...), in the reason and in the path', function() {
        let k = `bad-${'x'.repeat(40)}`
        let shown = `${k.slice(0, 30)}...`
        let e = rej(() => ({ [k]: 1 }), 'unsupported column name')
        assert.strictEqual(e.message, `invalid find: unsupported column name [${shown}] at [find.${shown}]`)
        let k2 = `$${'y'.repeat(40)}`
        let shown2 = `${k2.slice(0, 30)}...`
        let e2 = rej(() => ({ a: { [k2]: 1 } }), 'unsupported operator')
        assert.strictEqual(e2.message, `invalid find: unsupported operator [${shown2}] at [find.a.${shown2}]`)
        let k3 = `$${'z'.repeat(40)}`
        let e3 = rej(() => ({ [k3]: 1 }), 'unsupported operator')
        assert.strictEqual(e3.message, `invalid find: unsupported operator [${`${k3.slice(0, 30)}...`}] at [find.${`${k3.slice(0, 30)}...`}]`)
    })

    it('should replace format characters, separators and brackets in echoed keys and keep paired surrogates', function() {
        for (let cp of [0x202E, 0x200B, 0xFEFF, 0x2028, 0x2029, 0x00AD, 0x2066, 0x061C, 0xE000]) {
            let e = rej(() => ({ [`a${ch(cp)}b`]: 1 }), 'unsupported column name')
            assert.strictEqual(e.message, 'invalid find: unsupported column name [a?b] at [find.a?b]', `U+${cp.toString(16)}`)
        }
        let forged = 'x] at [find.y'
        let e2 = rej(() => ({ [forged]: 1 }), 'unsupported column name')
        assert.strictEqual(e2.message, 'invalid find: unsupported column name [x? at ?find.y] at [find.x? at ?find.y]')
        assert.strictEqual((e2.message.match(/ at \[/g) || []).length, 1)
        let emoji = `${ch(0xD83D)}${ch(0xDE00)}x`
        let e3 = rej(() => ({ [emoji]: 1 }), 'unsupported column name')
        assert.strictEqual(e3.message, `invalid find: unsupported column name [${emoji}] at [find.${emoji}]`)
    })

    it('should not echo a value together with an invalid column name or operator key', function() {
        for (let k of ['bad.key', 'bad key', 'a-b', '1a', '$bad']) {
            for (let mk of [(v) => ({ [k]: v }), (v) => ({ [k]: { $eq: v } }), (v) => ({ $and: [{ [k]: v }] }), (v) => ({ a: { [k]: v } })]) {
                let e = errOf(() => mk('MARKER-private-value'))
                assert.ok(reMsg.test(e.message) && !e.message.includes('MARKER') && !e.message.includes('private'), e.message)
            }
        }
    })

    it('should keep validating and building messages after RegExp.prototype.exec and String.prototype methods are replaced', function() {
        let longKey = `${'k'.repeat(50)}-`
        let shown = `${'k'.repeat(30)}...`
        let sExec = RegExp.prototype.exec
        let sIdx = String.prototype.indexOf
        let sCc = String.prototype.charCodeAt
        let sSl = String.prototype.slice
        let results = []
        let deep = () => {
            let f = { name: undefined }
            for (let i = 0; i < 30; i++) {
                f = { $or: [f, { value: 1 }] }
            }
            return f
        }
        let deepExpected = errOf(deep).message //路徑超過120字元而截短(尚未覆寫前取得)
        assert.ok(deepExpected.includes(' at [...'), deepExpected)
        let mks = [() => ({ 'a.b': 1 }), () => ({ a: 'x\u0000y' }), () => ({ a: ch(0xD800) }), () => ({ $x: 1 }), () => ({ a: { $foo: 1 } }), () => null, () => ({ [longKey]: 1 }), deep]
        try {
            RegExp.prototype.exec = function() {
                return [''] //令global比對無窮迴圈、test恆為真
            }
            String.prototype.indexOf = function() {
                return -1
            }
            String.prototype.charCodeAt = function() {
                return 0
            }
            String.prototype.slice = function() {
                return ''
            }
            for (let mk of mks) {
                try {
                    cvOrmFind(mk())
                    results.push('ACCEPT')
                }
                catch (err) {
                    results.push(err.message)
                }
            }
            results.push(JSON.stringify(cvOrmFind({ a: { $in: [1, 2] } })))
        }
        finally {
            RegExp.prototype.exec = sExec
            String.prototype.indexOf = sIdx
            String.prototype.charCodeAt = sCc
            String.prototype.slice = sSl
        }
        assert.deepStrictEqual(results, [
            'invalid find: unsupported column name [a.b] at [find.a.b]',
            'invalid find: string contains NUL at [find.a]',
            'invalid find: string contains lone surrogate at [find.a]',
            'invalid find: unsupported operator [$x] at [find.$x]',
            'invalid find: unsupported operator [$foo] at [find.a.$foo]',
            'invalid find: condition must be a plain object, got [null] at [find]',
            `invalid find: unsupported column name [${shown}] at [find.${shown}]`,
            deepExpected,
            '{"a":{"$in":[1,2]}}',
        ])
    })

    it('should pin the semantic ids of the mdb override cells of the case table (N08, E25) and nothing else', function() {
        let byId = new Map(cvOrmFindCases.cases.map((c) => [c.id, c]))
        assert.deepStrictEqual(byId.get('N08').ids, { mongo: ['a2', 'a4', 'a5', 'a6'], sql: ['a2', 'a5'], mdb: ['a2', 'a4', 'a5', 'a6'] })
        assert.deepStrictEqual(byId.get('E25').ids, { mongo: ['a2'], sql: ['a2'], mdb: ['a1', 'a2'] })
    })

    it('should include accepted cases exactly at the shared limits where every backend is expected to cope, and keep need only for the large $in', function() {
        let byId = new Map(cvOrmFindCases.cases.map((c) => [c.id, c]))
        assert.strictEqual(byId.get('H28').expect, 'OK')
        assert.deepStrictEqual(byId.get('H28').need, { maxIn: 10000 })
        assert.strictEqual(cvOrmFind(byId.get('H28').find()).name.$in.length, 10000)
        assert.deepStrictEqual(cvOrmFindCases.cases.filter((c) => c.need).map((c) => c.id), ['H07', 'H28'])
    })

})


describe('cvOrmFind 隨機結構之性質(規則3~6, 11)', function() {

    let lcg = (seed) => {
        let s = seed >>> 0
        return () => {
            s = (Math.imul(s, 1664525) + 1013904223) >>> 0
            return s / 4294967296
        }
    }
    let pick = (r, arr) => arr[Math.floor(r() * arr.length)]
    let cols = ['a', 'b', 'name', 'age', 'g', 'x_1', '中文', 'length', 'constructor']
    let scalars = [() => 'x', () => '', () => 'it\'s', () => '$a$', () => 0, () => -0, () => 1.5, () => 20, () => -7, () => true, () => false, () => '😀', () => new Date(1e12), () => 'a\nb']

    //gen, 產生合法之條件樹, 並登記每個純量位置(slot)以便置換為非法值
    let gen = (r, slots) => {
        let doc = (depth) => {
            //同一物件內之鍵不重複(重複賦值會使先前登記之位置不在樹內)
            let o = {}
            let used = new Set()
            let nk = 1 + Math.floor(r() * 3)
            for (let i = 0; i < nk; i++) {
                let kind = r()
                if (kind < 0.15 && depth < 5) {
                    let lk = pick(r, ['$and', '$or'])
                    if (used.has(lk)) {
                        continue
                    }
                    used.add(lk)
                    let n = 1 + Math.floor(r() * 3)
                    o[lk] = Array.from({ length: n }, () => doc(depth + 1))
                }
                else if (kind < 0.45) {
                    let ck = pick(r, cols)
                    if (used.has(ck)) {
                        continue
                    }
                    used.add(ck)
                    let ops = {}
                    let usedOps = new Set()
                    let nops = 1 + Math.floor(r() * 3)
                    for (let j = 0; j < nops; j++) {
                        let op = pick(r, ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin'])
                        if (usedOps.has(op)) {
                            continue
                        }
                        usedOps.add(op)
                        if (op === '$in' || op === '$nin') {
                            let n = op === '$in' ? Math.floor(r() * 4) : 1 + Math.floor(r() * 3)
                            let arr = Array.from({ length: n }, () => pick(r, scalars)())
                            ops[op] = arr
                            arr.forEach((_, idx) => slots.push({ parent: arr, key: idx, kind: 'in' }))
                        }
                        else if (op === '$eq' || op === '$ne') {
                            ops[op] = r() < 0.2 ? null : pick(r, scalars)()
                            if (ops[op] !== null) {
                                slots.push({ parent: ops, key: op, kind: 'eq' })
                            }
                        }
                        else {
                            ops[op] = pick(r, scalars)()
                            slots.push({ parent: ops, key: op, kind: 'cmp' })
                        }
                    }
                    o[ck] = ops
                }
                else {
                    let k = pick(r, cols)
                    if (used.has(k)) {
                        continue
                    }
                    used.add(k)
                    o[k] = r() < 0.15 ? null : pick(r, scalars)()
                    if (o[k] !== null) {
                        slots.push({ parent: o, key: k, kind: 'eq' })
                    }
                }
            }
            if (Object.keys(o).length === 0) {
                o.a = 'x'
                slots.push({ parent: o, key: 'a', kind: 'eq' })
            }
            return o
        }
        return doc(0)
    }
    let badAll = [() => undefined, () => NaN, () => Infinity, () => -Infinity, () => 10n, () => Symbol('s'), () => () => 1, () => /x/, () => new Map(), () => new Set(), () => new Number(1), () => new String('s'), () => new Date(NaN), () => Buffer.from('a'), () => 'a\u0000b', () => '\uD800', () => [], () => ['x'], () => ({}), () => ({ a: 1 }), () => new Foo(), () => new Proxy({}, {}), () => Promise.resolve(1)]

    it('should accept every generated valid find and return a fresh equal copy (400 random trees)', function() {
        for (let seed = 1; seed <= 400; seed++) {
            let slots = []
            let t = gen(lcg(seed), slots)
            let r = cvOrmFind(t)
            assert.deepStrictEqual(toPlain(r), toPlain(t), `seed ${seed}`)
            assertFresh(t, r)
        }
    })

    it('should reject every generated find after replacing one scalar by an invalid value (any position, any kind)', function() {
        let n = 0
        for (let seed = 1; seed <= 150; seed++) {
            let probe = []
            gen(lcg(seed), probe)
            for (let si = 0; si < probe.length; si++) {
                for (let mkBad of badAll) {
                    let slots = []
                    let t = gen(lcg(seed), slots)
                    let s = slots[si]
                    s.parent[s.key] = mkBad()
                    let e
                    try {
                        cvOrmFind(t)
                    }
                    catch (err) {
                        e = err
                    }
                    assert.ok(e instanceof Error && reMsg.test(e.message), `seed ${seed} slot ${si} (${s.kind}) bad ${mkBad.toString()}: ${e && e.message}`)
                    n++
                }
            }
        }
        assert.ok(n > 5000, String(n))
    })

    it('should reject null in comparison and set positions of random trees but accept it in equality positions', function() {
        let nCmp = 0
        let nEq = 0
        for (let seed = 1; seed <= 200; seed++) {
            let probe = []
            gen(lcg(seed), probe)
            for (let si = 0; si < probe.length; si++) {
                let slots = []
                let t = gen(lcg(seed), slots)
                let s = slots[si]
                s.parent[s.key] = null
                if (s.kind === 'eq') {
                    assert.doesNotThrow(() => cvOrmFind(t), `seed ${seed} slot ${si}`)
                    nEq++
                }
                else {
                    assert.throws(() => cvOrmFind(t), /null is not allowed here/, `seed ${seed} slot ${si}`)
                    nCmp++
                }
            }
        }
        assert.ok(nCmp > 100 && nEq > 100, `${nCmp} ${nEq}`)
    })

})


describe('cvOrmFind 極大輸入(子行程, R-FIND-01)', function() {

    let run = (name, execArgv = ['--max-old-space-size=64', '--expose-gc'], timeout = 60000) => runChildCase(fpRunner, name, { execArgv, timeout })

    let rejectedFast = (name, why) => {
        let { r, status } = run(name)
        assert.strictEqual(status, 0, name)
        assert.strictEqual(r.ok, false, `${name}: must reject`)
        assert.ok(r.err.startsWith('invalid find: ') && r.err.includes(why), `${name}: ${r.err}`)
        assert.ok(r.ms < 5000, `${name}: ${r.ms} ms`)
        assert.ok(r.heapMB < 40, `${name}: ${r.heapMB} MB`)
    }

    it('should reject exponential shared references (depth 25 and 40) within the node budget, quickly and without much memory', function() {
        rejectedFast('dag:25', 'condition is too large')
        rejectedFast('dag:40', 'nesting is too deep')
    })

    it('should reject a very deep chain (100000 levels) by the depth limit without a stack overflow', function() {
        rejectedFast('deep:100000', 'nesting is too deep')
    })

    it('should reject arrays whose length reads 4294967295 (Proxy and sparse) without allocating or iterating', function() {
        rejectedFast('inlen:4294967295', 'array is too large')
        rejectedFast('inlen:100001', 'array is too large')
        rejectedFast('sparse:4294967295', 'array is too large')
        rejectedFast('andlen:4294967295', 'array is too large')
        rejectedFast('andlen:1001', 'array is too large')
    })

    it('should reject an object with more own keys than the node limit', function() {
        rejectedFast('keys:200000', 'condition is too large')
    })

    it('should reject a re-prototyped 10MB TypedArray before enumerating its index keys (no out-of-memory)', function() {
        rejectedFast('taproto:10000000', 'condition must be a plain object')
    })

    it('should treat length as an ordinary column name even for huge values (no iteration, no allocation)', function() {
        for (let n of [4294967295, 9007199254740991, 1e9, 3]) {
            let { r, status } = run(`lenkey:${n}`)
            assert.strictEqual(status, 0)
            assert.strictEqual(r.ok, true, `lenkey:${n}: ${r.err}`)
            assert.deepStrictEqual(r.keys, ['length', 'a'])
            assert.strictEqual(r.lengthKept, true)
            assert.ok(r.ms < 1000, `${r.ms} ms`)
            assert.ok(r.heapMB < 4, `${r.heapMB} MB`)
        }
    })

    it('should accept a 5MB string and 99999 fields in a limited process', function() {
        let { r, status } = run('str:5000000', ['--max-old-space-size=96', '--expose-gc'])
        assert.strictEqual(status, 0)
        assert.strictEqual(r.ok, true, r.err)
        assert.ok(r.ms < 5000, `${r.ms} ms`)
        let m = run('many:99999', ['--max-old-space-size=128', '--expose-gc'])
        assert.strictEqual(m.status, 0)
        assert.strictEqual(m.r.ok, true, m.r.err)
        assert.ok(m.r.ms < 10000, `${m.r.ms} ms`)
    })

})
