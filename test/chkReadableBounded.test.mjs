import assert from 'assert'
import chkReadable from '../src/chkReadable.mjs'
import { boom, revoked } from './tools/hostileValues.mjs'


//第559項⑤(排程第492項第10批): chkReadable之opt.ownKeys
//  (a) 一併讀Symbol鍵之描述子(Symbol鍵之getOwnPropertyDescriptor陷阱拋錯須涵蓋; 原只讀字串鍵之描述子)
//  (b) 列舉有界: 型別陣列(含Buffer)、DataView與String包裝物件之索引鍵為虛擬, Reflect.ownKeys會一次配置全部索引字串(長度大時耗盡記憶體), 且非Proxy之此類物件讀鍵不可能拋錯, 故不列舉;
//      描述子之讀取總量超過opt.maxReads回'structure is too large'
//  規則R-READABLE-01; 期望值皆為手寫; 「不列舉」以載入時注入之Reflect.ownKeys計錄呼叫對象證明(不實際配置超大之索引鍵陣列, 不耗盡記憶體)


const KEYS = 'keys are unreadable'
const LARGE = 'structure is too large'


//load, 以注入之Reflect.ownKeys載入一份新的chkReadable實例(模組載入時取得Reflect.ownKeys, 載入後還原全域不影響該實例); calls記錄其後被呼叫時之對象
let loadSeq = 0
async function load() {
    let calls = []
    let saved = Reflect.ownKeys
    Reflect.ownKeys = function(x) {
        calls.push(x)
        return saved(x)
    }
    let mod
    try {
        loadSeq += 1
        mod = await import(`../src/chkReadable.mjs?bounded=${loadSeq}-${Date.now()}`)
    }
    finally {
        Reflect.ownKeys = saved
    }
    return { chk: mod.default, calls }
}


describe('chkReadable opt.ownKeys: descriptors of Symbol keys', function() {

    let SYM = Symbol('s559')

    //只有Symbol鍵之描述子讀取拋錯之Proxy
    let symTrap = (target) => {
        return new Proxy(target, {
            getOwnPropertyDescriptor(t, k) {
                if (typeof k === 'symbol') {
                    boom()
                }
                return Reflect.getOwnPropertyDescriptor(t, k)
            },
        })
    }

    it('reports keys are unreadable when the getOwnPropertyDescriptor trap throws for a Symbol key (own key)', function() {
        let p = symTrap({ a: 1, [SYM]: 2 })
        assert.strict.deepStrictEqual(chkReadable(p, { ownKeys: true }), KEYS)
        assert.strict.deepStrictEqual(chkReadable(p), '') //預設不讀鍵
    })

    it('reports keys are unreadable when a Symbol key sits on a prototype that is such a Proxy (prototype chain walk)', function() {
        let p = symTrap({ [SYM]: 2 })
        let o = Object.create(p)
        assert.strict.deepStrictEqual(chkReadable(o, { ownKeys: true }), KEYS)
    })

    it('stays readable when the Proxy has no Symbol keys (control: only the Symbol key triggers the throw), and for plain objects with Symbol keys', function() {
        assert.strict.deepStrictEqual(chkReadable(symTrap({ a: 1 }), { ownKeys: true }), '')
        assert.strict.deepStrictEqual(chkReadable({ a: 1, [SYM]: 2 }, { ownKeys: true }), '')
    })

    it('a throwing descriptor trap on a string key is still reported (unchanged)', function() {
        let p = new Proxy({ a: 1 }, { getOwnPropertyDescriptor: boom })
        assert.strict.deepStrictEqual(chkReadable(p, { ownKeys: true }), KEYS)
    })

})


describe('chkReadable opt.ownKeys: bounded enumeration', function() {

    //index-virtual objects: ownKeys of these would allocate every index string
    let virtuals = [
        ['Uint8Array(1e6)', () => new Uint8Array(1e6)],
        ['Buffer.alloc(1e6)', () => Buffer.alloc(1e6)],
        ['Float64Array(1e5)', () => new Float64Array(1e5)],
        ['DataView', () => new DataView(new ArrayBuffer(8))],
        ['String wrapper of 1e6 chars', () => new String('x'.repeat(1e6))], // eslint-disable-line no-new-wrappers
    ]

    for (let [name, mk] of virtuals) {
        it(`does not enumerate the keys of ${name} (readable, Reflect.ownKeys never called with it)`, async function() {
            let { chk, calls } = await load()
            let v = mk()
            assert.strict.deepStrictEqual(chk(v, { ownKeys: true }), '')
            assert.ok(!calls.includes(v), `Reflect.ownKeys must not be called with ${name}`)
            assert.strict.deepStrictEqual(chk(v, { ownKeys: true, deep: true }), '')
            assert.ok(!calls.includes(v), `Reflect.ownKeys must not be called with ${name} (deep)`)
        })

        it(`does not enumerate ${name} when it sits on the prototype chain of a plain object`, async function() {
            let { chk, calls } = await load()
            let v = mk()
            let o = Object.create(v)
            o.own = 1
            assert.strict.deepStrictEqual(chk(o, { ownKeys: true }), '')
            assert.ok(!calls.includes(v), `Reflect.ownKeys must not be called with ${name} on the chain`)
            assert.ok(calls.includes(o), 'the plain object itself is enumerated (control)')
        })
    }

    it('still enumerates ordinary objects, arrays and functions (control: the injected spy is effective)', async function() {
        let { chk, calls } = await load()
        let o = { a: 1 }
        let a = [1, 2]
        let f = function() {}
        for (let v of [o, a, f]) {
            assert.strict.deepStrictEqual(chk(v, { ownKeys: true }), '')
            assert.ok(calls.includes(v))
        }
    })

    it('a Proxy wrapping a typed array is not index-virtual (its keys go through the trap): a throwing ownKeys trap is still reported', function() {
        let p = new Proxy(new Uint8Array(4), { ownKeys: boom })
        assert.strict.deepStrictEqual(chkReadable(p, { ownKeys: true }), KEYS)
    })

    it('an object holding a typed array as a value is unaffected by its size (only own keys of the holder are read)', function() {
        assert.strict.deepStrictEqual(chkReadable({ u: new Uint8Array(1e6) }, { ownKeys: true, deep: true }), '')
    })

    it('a revoked Proxy is still reported by the tag read, before any key enumeration', function() {
        assert.strict.deepStrictEqual(chkReadable(revoked({}), { ownKeys: true }), 'tag is unreadable')
    })

    it('limits the descriptor reads of the prototype chain walk by opt.maxReads: over the limit is structure is too large, within it is readable', function() {
        //無原型之物件(其原型鏈只有自身, 讀取量即自有鍵數)
        let o = Object.create(null)
        for (let i = 0; i < 10; i++) {
            o['k' + i] = i
        }
        assert.strict.deepStrictEqual(chkReadable(o, { ownKeys: true, maxReads: 9 }), LARGE) //10個自有鍵 > 9
        assert.strict.deepStrictEqual(chkReadable(o, { ownKeys: true, maxReads: 10 }), '')
        //Symbol鍵亦計入
        let s = Object.create(null)
        s.a = 1
        s[Symbol('x')] = 2
        assert.strict.deepStrictEqual(chkReadable(s, { ownKeys: true, maxReads: 1 }), LARGE)
        assert.strict.deepStrictEqual(chkReadable(s, { ownKeys: true, maxReads: 2 }), '')
        //預設(5千萬)不受影響
        assert.strict.deepStrictEqual(chkReadable(o, { ownKeys: true }), '')
    })

    it('counts the reads across the whole prototype chain (not per level)', function() {
        let base = Object.create(null)
        Object.assign(base, { b1: 1, b2: 2, b3: 3 })
        let o = Object.create(base)
        o.a1 = 1
        o.a2 = 2
        assert.strict.deepStrictEqual(chkReadable(o, { ownKeys: true, maxReads: 4 }), LARGE) //2 + 3 = 5 > 4
        assert.strict.deepStrictEqual(chkReadable(o, { ownKeys: true, maxReads: 5 }), '')
    })

})
