import assert from 'assert'
import fs from 'fs'
import vm from 'vm'
import { fileURLToPath } from 'url'
import getDiagShape from '../src/getDiagShape.mjs'
import getDiag from '../src/getDiag.mjs'
import diagSuite from './tools/diagSuite.mjs'


//getDiagShape為資料值之形狀摘要(只輸出型別、長度與鍵名, 永不輸出值), 規則見sgud/rule/rulebook_diag.md之R-DIAG-01規則15; 輸出文法見JSDoc
//語料H01~H16(src/_diagCases.mjs)於有util與無util兩種環境各跑一次; 以下為語料之外之單元案(輸入空間表: 輸入種類 × 上限 × 永不拋錯 × 值不外洩)


//輸出文法(JSDoc): 全部輸出必為下列之一
const GRAMMAR = /^\((undefined|null|number|boolean|bigint|symbol|function|string|string, empty|array(, length=\d+)?|keys: .*|map(, size=\d+)?|set(, size=\d+)?|binary(, byteLength=\d+)?|date|regexp|promise|error|boxed|opaque|proxy|object|unreadable)\)$/

//SENT, 夾帶於值之哨兵(鍵名除外, 鍵名依規格列出)
const SENT = 'SECRET-5d7e21'


describe(`getDiagShape`, function() {

    it(`should be exported from the package index`, function() {
        let src = fs.readFileSync(fileURLToPath(new URL('../src/index.mjs', import.meta.url)), 'utf8')
        assert.strict.deepStrictEqual(src.includes(`export { default as getDiagShape } from './getDiagShape.mjs'`), true)
    })

    it(`should never output a value: sentinel placed in values (not keys) of every kind never appears`, function() {
        let vs = [
            { a: SENT, b: [SENT], c: { d: SENT } },
            [SENT, { x: SENT }],
            new Map([[SENT, SENT]]),
            new Set([SENT]),
            new Error(SENT),
            Object.assign(new Error('x'), { code: SENT, path: SENT }),
            SENT,
            Buffer.from(SENT),
            new Uint8Array(Buffer.from(SENT)),
            new String(SENT), // eslint-disable-line no-new-wrappers
            Symbol(SENT),
            { [Symbol(SENT)]: SENT },
            new Date(SENT.length),
            new RegExp(SENT),
            Promise.resolve(SENT),
            () => SENT,
            class K {
                static x = SENT
            },
            Object.create({ inherited: SENT }),
            JSON.parse(`{"v":"${SENT}"}`),
        ]
        for (let v of vs) {
            let r = getDiagShape(v)
            assert.strict.deepStrictEqual([typeof r, r.includes(SENT), GRAMMAR.test(r)], ['string', false, true], r)
        }
    })

    it(`should keep key names (structure) in the output and nothing else of the object`, function() {
        assert.strict.deepStrictEqual(getDiagShape({ [`user-${SENT}`]: 1 }), `(keys: user-${SENT})`)
    })

    it(`should bound the output: 300000 keys, a 1MB key, and 20 keys of 200 chars`, function() {
        let big = {}
        for (let i = 0; i < 300000; i++) {
            big[`k${i}`] = i
        }
        let r1 = getDiagShape(big)
        assert.strict.deepStrictEqual([r1.startsWith('(keys: k0,k1,'), r1.endsWith(',...+299980)'), r1.length <= 20 * 34 + 40], [true, true, true])
        let r2 = getDiagShape({ ['q'.repeat(1024 * 1024)]: 1 })
        assert.strict.deepStrictEqual(r2, `(keys: ${'q'.repeat(32)}...)`)
        let o = {}
        for (let i = 0; i < 20; i++) {
            o[`${i}`.padStart(200, 'z')] = 1
        }
        let r3 = getDiagShape(o, { maxKeys: 100, maxKeyLen: 200 })
        assert.strict.deepStrictEqual(r3.length <= 20 * 201 + 40, true)
        //最壞輸出界限: 150個300字元之鍵, maxKeys=100與maxKeyLen=200(硬上限)時, 100鍵 × (200字元+接...) + 分隔與尾註
        let w = {}
        for (let i = 0; i < 150; i++) {
            w[`${i}`.padStart(300, 'w')] = 1
        }
        let r4 = getDiagShape(w, { maxKeys: 100, maxKeyLen: 200 })
        assert.strict.deepStrictEqual([r4.length <= 100 * (200 + 3 + 1) + 40, r4.endsWith(',...+50)')], [true, true])
    })

    it(`should not split a surrogate pair when truncating a key`, function() {
        let r = getDiagShape({ ['a'.repeat(31) + '\u{1F600}' + 'b']: 1 })
        assert.strict.deepStrictEqual(r, `(keys: ${'a'.repeat(31)}...)`)
        assert.strict.deepStrictEqual(/[\ud800-\udbff](?![\udc00-\udfff])/.test(r), false)
    })

    it(`should not mutate or freeze the input`, function() {
        let o = { a: 1, b: { c: 1 } }
        let before = JSON.stringify(o)
        getDiagShape(o)
        getDiagShape(o, { maxKeys: 1 })
        assert.strict.deepStrictEqual([JSON.stringify(o), Object.isFrozen(o), Object.isExtensible(o), Object.keys(o)], [before, false, true, ['a', 'b']])
    })

    it(`should treat opt of any type as defaults and never throw`, function() {
        let o = { a: 1 }
        for (let opt of [undefined, null, 0, 'abc', true, [], () => 1, Symbol('s'), 1n, new Proxy({}, {
            get() {
                throw new Error('trap')
            }
        })]) {
            assert.strict.deepStrictEqual(getDiagShape(o, opt), '(keys: a)', String(typeof opt))
        }
        let { proxy, revoke } = Proxy.revocable({}, {})
        revoke()
        assert.strict.deepStrictEqual(getDiagShape(o, proxy), '(keys: a)')
    })

    it(`should return a string matching the grammar for a seeded random input space (2000 values) and never leak sentinel values`, function() {
        //固定種子之32位元線性同餘產生器(Math.imul與>>>0保精度, 取高位元), 結果可重現
        let seed = 20261031
        let rnd = (n) => {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
            return (seed >>> 8) % n
        }
        let branches = new Set()
        let gen = (depth) => {
            let k = rnd(depth > 2 ? 12 : 20)
            branches.add(k)
            switch (k) {
            case 0: return SENT
            case 1: return rnd(1000)
            case 2: return null
            case 3: return undefined
            case 4: return rnd(2) === 0
            case 5: return BigInt(rnd(100))
            case 6: return Symbol(SENT)
            case 7: return () => SENT
            case 8: return new Error(SENT)
            case 9: return new Date(rnd(1e12))
            case 10: return Buffer.from(SENT)
            case 11: return /x/
            case 12: return [gen(depth + 1), gen(depth + 1)]
            case 13: return { a: gen(depth + 1), b: gen(depth + 1) }
            case 14: return new Map([[SENT, gen(depth + 1)]])
            case 15: return new Set([gen(depth + 1)])
            case 16: return Object.create(null, { v: { value: SENT, enumerable: true } })
            case 17: return Promise.resolve(gen(depth + 1))
            case 18: return new Proxy({ v: SENT }, {})
            default: {
                let o = { self: null, v: SENT }
                o.self = o
                return o
            }
            }
        }
        let kinds = new Set()
        for (let i = 0; i < 2000; i++) {
            let r = getDiagShape(gen(0))
            assert.strict.deepStrictEqual([typeof r, GRAMMAR.test(r), r.includes(SENT)], ['string', true, false], r)
            kinds.add(r.replace(/[:,=].*$/, '').replace(/\)$/, '')) //輸出之種類(去掉細節)
        }
        //產生器之20個分支皆被命中(避免產生器退化而名實不符), 且輸出涵蓋各種類
        assert.strict.deepStrictEqual([...branches].sort((a, b) => a - b), Array.from({ length: 20 }, (_, i) => i))
        for (let k of ['(null', '(undefined', '(number', '(boolean', '(bigint', '(symbol', '(function', '(string', '(array', '(keys', '(map', '(set', '(binary', '(date', '(regexp', '(promise', '(error', '(proxy']) {
            assert.strict.deepStrictEqual(kinds.has(k), true, `kind ${k} not produced: ${[...kinds].join(' ')}`)
        }
    })

    it(`should never throw for hostile inputs: throwing own getters of length, constructor and toStringTag, odd prototypes, frozen and sealed objects`, function() {
        let vs = []
        vs.push(Object.defineProperty({}, 'length', { value: 3, enumerable: false }))
        vs.push(Object.defineProperty({}, 'constructor', {
            enumerable: true,
            get() {
                throw new Error('ctor')
            }
        }))
        vs.push(Object.defineProperty({}, Symbol.toStringTag, {
            enumerable: true,
            get() {
                throw new Error('tag')
            }
        }))
        vs.push(Object.setPrototypeOf({ a: 1 }, null))
        vs.push(Object.setPrototypeOf({ a: 1 }, Array.prototype))
        vs.push(Object.setPrototypeOf([1], null))
        vs.push(Object.setPrototypeOf(new Map(), null))
        vs.push(Object.freeze({ a: 1 }))
        vs.push(Object.seal([1, 2]))
        vs.push(Object.create(Array.prototype))
        vs.push(new (class extends Map {})())
        vs.push(new (class extends Error {})('x'))
        vs.push(globalThis)
        vs.push(process)
        vs.push(Object(1n))
        for (let v of vs) {
            let r
            assert.doesNotThrow(() => {
                r = getDiagShape(v)
            })
            assert.strict.deepStrictEqual([typeof r, GRAMMAR.test(r)], ['string', true], r)
        }
    })

    it(`should treat objects of another realm like objects of this realm`, function() {
        let r = vm.runInNewContext('[getDiagShape([1]), getDiagShape({ a: 1 })]', { getDiagShape })
        assert.strict.deepStrictEqual(JSON.stringify(r), JSON.stringify(['(array, length=1)', '(keys: a)'])) //另一realm之陣列原型不同, 以JSON比對內容
        let v = vm.runInNewContext('({ arr: [1, 2], map: new Map(), obj: { b: 1 } })')
        assert.strict.deepStrictEqual([getDiagShape(v.arr), getDiagShape(v.map), getDiagShape(v.obj), getDiagShape(v)], ['(array, length=2)', '(map, size=0)', '(keys: b)', '(keys: arr,map,obj)'])
    })

    it(`diag.shape should equal getDiagShape and be unaffected by secrets, funLog and logDetail`, function() {
        let v = { id: 1, name: 'n' }
        let ds = [getDiag({}), getDiag({}).with({ values: ['abc12345'] }), getDiag({ logDetail: true }), getDiag({ funLog: () => {} }), getDiag({}, { secrets: ['abc'] }), getDiag({}, {
            secrets: () => {
                throw new Error('x')
            }
        })]
        for (let d of ds) {
            assert.strict.deepStrictEqual([d.shape(v), d.shape(v, { maxKeys: 1 }), d.shape(null), d.shape()], ['(keys: id,name)', '(keys: id,...+1)', '(null)', '(undefined)'])
        }
    })

    diagSuite('getDiagShape')

})
