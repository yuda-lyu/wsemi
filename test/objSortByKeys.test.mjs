import assert from 'assert'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import objSortByKeys from '../src/objSortByKeys.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


//規格: 使用者2026-11-03(dspec〈輸入參數之檢測機制〉§11 第221項 待決第6項, 「都A」; 排程第492項第1批落實)
//  指定keys依序放前、其餘鍵保持原序放後; opt.onlyKeys為true時只保留列出之鍵; keys為[]或含不存在之鍵皆合法; obj非物件、keys非陣列拋錯(訊息依V19、不帶值V20)
//  修前缺陷: 把未列於keys之鍵(排序值0)排在第二個以後之key之前, 非陣列/非物件則靜默回{}


//setOwn, 以資料屬性設定自有鍵(一般賦值對__proto__會改原型)
let setOwn = (o, k, v) => {
    Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
    return o
}

//isIndexKey, JS規定之整數索引鍵(0~2^32-2之正規十進位字串), 這類鍵於物件內恆依數值遞增排在其他字串鍵之前, 與插入順序無關
let isIndexKey = (k) => /^(0|[1-9]\d*)$/.test(k) && Number(k) < 4294967295

//jsOrder, 依JS之自有鍵順序規則由插入序算出實際之鍵序(整數索引鍵遞增在前, 其餘維持插入序)
let jsOrder = (seq) => {
    let ints = seq.filter(isIndexKey).sort((a, b) => Number(a) - Number(b))
    let strs = seq.filter((k) => !isIndexKey(k))
    return [...ints, ...strs]
}

//expectedByKeys, 獨立於實作之期望值(依規格文字): 列出之鍵(字串或數字, 依第一次出現之順序, 且為obj自有可列舉者)在前, 其餘維持原序在後(onlyKeys為true則無)
let expectedByKeys = (obj, arr, onlyKeys = false) => {
    let own = Object.keys(obj)
    let listed = []
    for (let v of arr) {
        if (typeof v !== 'string' && typeof v !== 'number') {
            continue
        }
        let k = String(v)
        if (own.includes(k) && !listed.includes(k)) {
            listed.push(k)
        }
    }
    let rest = onlyKeys ? [] : own.filter((k) => !listed.includes(k))
    let o = {}
    for (let k of [...listed, ...rest]) {
        setOwn(o, k, obj[k])
    }
    return { keys: jsOrder([...listed, ...rest]), o }
}

//same, 鍵順序與值皆比對(deepStrictEqual不比鍵順序)
let same = (r, keys, o) => {
    assert.strict.deepStrictEqual(Object.keys(r), keys)
    assert.strict.deepStrictEqual(r, o)
}

//getDoc, 取src檔之JSDoc區塊(第一個/**至*/)
let getDoc = (name) => {
    let c = fs.readFileSync(fileURLToPath(new URL(`../src/${name}.mjs`, import.meta.url)), 'utf8')
    let i = c.indexOf('/**')
    let j = c.indexOf('*/', i)
    return c.slice(i, j)
}


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
        assert.strict.deepStrictEqual(Object.keys(r), ['x1', 'x2', 'x3'])
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
        assert.strict.deepStrictEqual(Object.keys(r), ['x111', 'x2', 'x33'])
    })

    describe(`指定keys依序放前、其餘保持原序放後(R21: 使用者2026-11-03「都A」)`, function() {

        it(`should put the listed key first and keep the others in original order: objSortByKeys({b:1,a:2,c:3}, ['a']) -> a, b, c`, function() {
            //規格: 「指定keys依序放前、其餘保持原序放後」; 修前得{b,a,c}(未列之b排在a之前)
            let r = objSortByKeys({ b: 1, a: 2, c: 3 }, ['a'])
            assert.strict.deepStrictEqual(Object.keys(r), ['a', 'b', 'c'])
            assert.strict.deepStrictEqual(r, { a: 2, b: 1, c: 3 })
        })

        it(`should put the listed keys first in the listed order (not the object order) and the rest in original order`, function() {
            let r = objSortByKeys({ d: 4, c: 3, b: 2, a: 1 }, ['b', 'a'])
            assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a', 'd', 'c'])
            assert.strict.deepStrictEqual(r, { d: 4, c: 3, b: 2, a: 1 })
        })

        it(`should order the listed keys by the key array even when it lists the last keys of the object first`, function() {
            let r = objSortByKeys({ a: 1, b: 2, c: 3, d: 4 }, ['d', 'c'])
            assert.strict.deepStrictEqual(Object.keys(r), ['d', 'c', 'a', 'b'])
        })

        it(`should keep the original order of all keys when no listed key exists in the object (keys with names that do not exist are legal)`, function() {
            let r = objSortByKeys({ b: 1, a: 2, c: 3 }, ['x', 'y'])
            assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a', 'c'])
            assert.strict.deepStrictEqual(r, { b: 1, a: 2, c: 3 })
        })

        it(`should skip the keys that do not exist and still order the existing listed keys: ['x', 'c', 'y', 'a']`, function() {
            let r = objSortByKeys({ b: 1, a: 2, c: 3 }, ['x', 'c', 'y', 'a'])
            assert.strict.deepStrictEqual(Object.keys(r), ['c', 'a', 'b'])
        })

        it(`should return a copy in the original order when keys is [] (legal, not {})`, function() {
            //規格: 「keys為[]…皆合法」; 修前回{}(isearr([])為false)
            let o = { b: 1, a: 2, c: 3 }
            let r = objSortByKeys(o, [])
            assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a', 'c'])
            assert.strict.deepStrictEqual(r, { b: 1, a: 2, c: 3 })
            assert.ok(r !== o)
        })

        it(`should return {} for an empty object (legal)`, function() {
            assert.strict.deepStrictEqual(objSortByKeys({}, ['a']), {})
            assert.strict.deepStrictEqual(objSortByKeys({}, []), {})
            assert.strict.deepStrictEqual(objSortByKeys({}, ['a'], { onlyKeys: true }), {})
        })

        it(`should place a duplicated listed key once, at its first occurrence`, function() {
            let r = objSortByKeys({ a: 1, b: 2, c: 3 }, ['c', 'a', 'c', 'a'])
            assert.strict.deepStrictEqual(Object.keys(r), ['c', 'a', 'b'])
            assert.strict.deepStrictEqual(Object.keys(objSortByKeys({ a: 1, b: 2, c: 3 }, ['b', 'a', 'b'], { onlyKeys: true })), ['b', 'a'])
        })

        it(`should treat a finite number element as its string key and ignore the elements that are not strings or numbers`, function() {
            let o = { a: 1, 10: 'ten', b: 2, 2: 'two' }
            //整數索引鍵恆排在字串鍵之前(JS規定), 故以字串鍵驗順序、以onlyKeys驗取用
            let r = objSortByKeys(o, [2, null, undefined, {}, [], true, () => 1, Symbol('s'), 10])
            assert.strict.deepStrictEqual(Object.keys(r), ['2', '10', 'a', 'b'])
            let r2 = objSortByKeys(o, [2, null, undefined, {}, [], true, () => 1, Symbol('s'), 'b'], { onlyKeys: true })
            assert.strict.deepStrictEqual(Object.keys(r2), ['2', 'b'])
            assert.strict.deepStrictEqual(r2, { 2: 'two', b: 2 })
        })

        it(`should match the empty-string key by the string '' only`, function() {
            let o = { 'a': 1, '': 'empty', 'b': 2 }
            let r = objSortByKeys(o, [''])
            assert.strict.deepStrictEqual(Object.keys(r), ['', 'a', 'b'])
            assert.strict.deepStrictEqual(Object.keys(objSortByKeys(o, [null, undefined], { onlyKeys: true })), [])
        })

        it(`should not match names inherited from the prototype (constructor, toString, __proto__) as keys of the object`, function() {
            let r = objSortByKeys({ b: 1, a: 2 }, ['constructor', 'toString', '__proto__', 'a'])
            assert.strict.deepStrictEqual(Object.keys(r), ['a', 'b'])
            let r2 = objSortByKeys({ b: 1, a: 2 }, ['constructor', 'toString', '__proto__', 'a'], { onlyKeys: true })
            assert.strict.deepStrictEqual(Object.keys(r2), ['a'])
            assert.strict.deepStrictEqual(Object.getPrototypeOf(r2), Object.prototype)
        })

        it(`should only use own enumerable string keys (inherited and non-enumerable keys are dropped, as before)`, function() {
            let o = Object.create({ z: 0 })
            o.a = 3
            o.b = 1
            Object.defineProperty(o, 'h', { value: 9, enumerable: false })
            let r = objSortByKeys(o, ['z', 'h', 'b'])
            assert.strict.deepStrictEqual(Object.keys(r), ['b', 'a'])
            assert.ok(!('z' in r) && !('h' in r))
        })

        it(`should keep an own __proto__ key (JSON.parse) as an own data property in the result`, function() {
            let o = JSON.parse('{"b":2,"__proto__":{"a":1},"c":3}')
            let r = objSortByKeys(o, ['c', '__proto__'])
            assert.strict.deepStrictEqual(Object.keys(r), ['c', '__proto__', 'b'])
            assert.ok(Object.prototype.hasOwnProperty.call(r, '__proto__'))
            assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
            assert.strict.strictEqual(r.a, undefined)
        })

        it(`should not modify the input object or the key array and should return a new object`, function() {
            let o = { c: 3, b: 2, a: 1 }
            let ks = ['a', 'b']
            let r = objSortByKeys(o, ks)
            assert.ok(r !== o)
            assert.strict.deepStrictEqual(Object.keys(o), ['c', 'b', 'a'])
            assert.strict.deepStrictEqual(ks, ['a', 'b'])
            let r2 = objSortByKeys(o, ks, { onlyKeys: true })
            assert.ok(r2 !== o)
            assert.strict.deepStrictEqual(Object.keys(o), ['c', 'b', 'a'])
        })

        it(`should keep the values as they are (the same references, no copy)`, function() {
            let inner = { x: 1 }
            let r = objSortByKeys({ b: inner, a: [1] }, ['a'])
            assert.strict.strictEqual(r.b, inner)
        })

        it(`should return a plain object for a class instance and for Object.create(null)`, function() {
            class C {
                constructor() {
                    this.b = 1
                    this.a = 2
                }
            }
            let r = objSortByKeys(new C(), ['a'])
            assert.strict.deepStrictEqual(Object.keys(r), ['a', 'b'])
            assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
            let o = Object.create(null)
            o.b = 1
            o.a = 2
            let r2 = objSortByKeys(o, ['a'])
            assert.strict.deepStrictEqual(Object.keys(r2), ['a', 'b'])
        })

        it(`should still list integer-like keys first in ascending order, which JS itself enforces for every object (documented limit)`, function() {
            let r = objSortByKeys({ b: 1, 2: 'x', a: 2, 1: 'y' }, ['a', 2])
            assert.strict.deepStrictEqual(Object.keys(r), ['1', '2', 'a', 'b'])
        })

        it(`should treat only the array-index keys 0..4294967294 as the ones JS forces to the front ('4294967295' and '-1' are ordinary string keys)`, function() {
            //外審terra #3: JSDoc之「整數字串鍵」邊界
            let o = { '4294967295': 1, '-1': 2, 'a': 3, '4294967294': 4 }
            let r = objSortByKeys(o, ['a', '4294967295', '-1', '4294967294'])
            assert.strict.deepStrictEqual(Object.keys(r), ['4294967294', 'a', '4294967295', '-1'])
            let e = expectedByKeys(o, ['a', '4294967295', '-1', '4294967294'])
            assert.strict.deepStrictEqual(Object.keys(r), e.keys)
        })

        it(`should drop Symbol keys of the object (only own enumerable string keys are handled, as before) and never match a Symbol element`, function() {
            //外審terra #1、#6: 字串鍵為本庫既有慣例(R-OBJ-ITER-01、R-ELEM-LEVEL-01), Symbol鍵不納入且已載明於JSDoc
            let s = Symbol('s')
            let o = { b: 1, [s]: 'sym', a: 2 }
            let r = objSortByKeys(o, ['a'])
            assert.strict.deepStrictEqual(Reflect.ownKeys(r), ['a', 'b'])
            assert.strict.deepStrictEqual(Reflect.ownKeys(objSortByKeys(o, [s], { onlyKeys: true })), [])
            assert.ok(getDoc('objSortByKeys').indexOf('Symbol鍵') >= 0)
        })

    })

    describe(`opt.onlyKeys: 只保留列出之鍵(R22: 使用者2026-11-03)`, function() {

        it(`should keep only the listed keys in the listed order: objSortByKeys({b:1,a:2,c:3}, ['a'], {onlyKeys:true}) -> {a:2}`, function() {
            //修前得{b,a,c}(未支援opt)
            let r = objSortByKeys({ b: 1, a: 2, c: 3 }, ['a'], { onlyKeys: true })
            assert.strict.deepStrictEqual(r, { a: 2 })
            assert.strict.deepStrictEqual(Object.keys(r), ['a'])
        })

        it(`should return the listed existing keys in the listed order and drop the rest`, function() {
            let r = objSortByKeys({ d: 4, c: 3, b: 2, a: 1 }, ['c', 'x', 'a'], { onlyKeys: true })
            assert.strict.deepStrictEqual(Object.keys(r), ['c', 'a'])
            assert.strict.deepStrictEqual(r, { c: 3, a: 1 })
        })

        it(`should return {} when keys is [] or lists no existing key (legal)`, function() {
            assert.strict.deepStrictEqual(objSortByKeys({ b: 1, a: 2 }, [], { onlyKeys: true }), {})
            assert.strict.deepStrictEqual(objSortByKeys({ b: 1, a: 2 }, ['x', 'y'], { onlyKeys: true }), {})
        })

        it(`should keep all keys (listed first) when onlyKeys is false`, function() {
            let r = objSortByKeys({ b: 1, a: 2, c: 3 }, ['a'], { onlyKeys: false })
            assert.strict.deepStrictEqual(Object.keys(r), ['a', 'b', 'c'])
        })

        //K3: 非布林視為未給(預設false), 不報錯
        let notBools = [
            ['1', 1],
            ['0', 0],
            [`'true'`, 'true'],
            [`'yes'`, 'yes'],
            ['null', null],
            ['undefined', undefined],
            ['NaN', NaN],
            ['{}', {}],
            ['[]', []],
            ['[true]', [true]],
            ['function', () => true],
            ['new Boolean(true)', Object(true)],
            ['new Boolean(false)', Object(false)], //包裝物件恆為真值, 不可因此啟用onlyKeys
        ]
        for (let [name, v] of notBools) {
            it(`should treat onlyKeys ${name} as not given (default false, no throw): all keys are kept`, function() {
                let r = objSortByKeys({ b: 1, a: 2, c: 3 }, ['a'], { onlyKeys: v })
                assert.strict.deepStrictEqual(Object.keys(r), ['a', 'b', 'c'])
            })
        }

        it(`should treat a missing or non-object opt as not given`, function() {
            for (let opt of [undefined, null, 0, 1, 'onlyKeys', true, [], () => 1]) {
                let r = objSortByKeys({ b: 1, a: 2, c: 3 }, ['a'], opt)
                assert.strict.deepStrictEqual(Object.keys(r), ['a', 'b', 'c'])
            }
        })

        it(`should not read onlyKeys from a function or array opt (only a plain object opt counts; terra #4)`, function() {
            let f = Object.assign(() => 0, { onlyKeys: true })
            let a = Object.assign([], { onlyKeys: true })
            let tagged = Object.assign([], { onlyKeys: true })
            Object.defineProperty(tagged, Symbol.toStringTag, { value: 'Object' }) //真陣列偽稱Object
            for (let opt of [f, a, tagged]) {
                let r = objSortByKeys({ b: 1, a: 2, c: 3 }, ['a'], opt)
                assert.strict.deepStrictEqual(Object.keys(r), ['a', 'b', 'c'])
            }
            //一般物件(含class實例)之onlyKeys仍生效
            class O {
                constructor() {
                    this.onlyKeys = true
                }
            }
            assert.strict.deepStrictEqual(Object.keys(objSortByKeys({ b: 1, a: 2 }, ['a'], new O())), ['a'])
        })

        it(`should not change the result for unknown opt keys`, function() {
            let r = objSortByKeys({ b: 1, a: 2, c: 3 }, ['a'], { onlykeys: true, only: true })
            assert.strict.deepStrictEqual(Object.keys(r), ['a', 'b', 'c'])
        })

    })

    //ws492h(第492項第7批, 使用者2026-11-16「W-16:乙」): obj為第1參數, 非物件一律回輸出型別之空結果{}, 不拋錯(且不檢查keys與opt); keys為次參數, obj為物件時非陣列仍throw(R23)
    //  對應規格: dspec〈輸入參數之檢測機制〉§11「C7結構運算之第1參數(使用者2026-11-16 W-16:乙)」
    describe(`obj非物件回{}、keys非陣列拋錯(R23: 使用者2026-11-03; ws492h W-16乙: obj非物件改回{}; 訊息依V19、不帶值V20)`, function() {

        let msgKeys = 'invalid keys: must be an array'

        //obj無效: 回{}(W-16乙; 原throw invalid obj)
        let badObjs = [
            [`'x'`, 'x'],
            [`''`, ''],
            [`'abc'`, 'abc'],
            ['123', 123],
            ['0', 0],
            ['NaN', NaN],
            ['Infinity', Infinity],
            ['true', true],
            ['false', false],
            ['null', null],
            ['undefined', undefined],
            ['[]', []],
            ['[1]', [1]],
            ['[{ a: 1 }]', [{ a: 1 }]],
            ['function', () => ({ a: 1 })],
            ['Symbol', Symbol('s')],
            ['123n', 123n],
            ['new Map', new Map([['a', 1]])],
            ['new Set', new Set(['a'])],
            ['new Date', new Date()],
            ['new String', Object('abc')],
            ['new Number', Object(1)],
            ['/re/', /re/],
            ['Symbol.toStringTag Array', { [Symbol.toStringTag]: 'Array', length: 2, a: 3, b: 1 }],
        ]
        for (let [name, v] of badObjs) {
            it(`should return {} (no throw) when obj is ${name}`, function() {
                let r = objSortByKeys(v, ['a'])
                assert.strict.deepStrictEqual(r, {})
                assert.strict.deepStrictEqual(Object.getPrototypeOf(r), Object.prototype)
                assert.strict.deepStrictEqual(objSortByKeys(v, 'not-an-array'), {}) //第1參數無效時不檢查keys
                assert.strict.deepStrictEqual(objSortByKeys(v, ['a'], { onlyKeys: true }), {})
            })
        }

        let badKeys = [
            [`'a'`, 'a'],
            [`''`, ''],
            ['123', 123],
            ['NaN', NaN],
            ['true', true],
            ['null', null],
            ['undefined', undefined],
            ['{}', {}],
            ['{ 0: "a", length: 1 }', { 0: 'a', length: 1 }],
            ['function', () => ['a']],
            ['Symbol', Symbol('s')],
            ['new Set', new Set(['a'])],
            ['new Map', new Map()],
            ['new String', Object('a')],
        ]
        for (let [name, v] of badKeys) {
            it(`should throw '${msgKeys}' when keys is ${name}`, function() {
                assert.throws(() => objSortByKeys({ a: 1 }, v), (err) => err instanceof Error && err.message === msgKeys)
            })
        }

        it(`should throw at once for an object that fakes an Array by Symbol.toStringTag, as keys or as obj, without iterating its length (terra #7; R-OBJ-ITER-01 rule 2)`, function() {
            let fake = { [Symbol.toStringTag]: 'Array', 0: 'a', length: Number.MAX_SAFE_INTEGER }
            let t0 = Date.now()
            assert.throws(() => objSortByKeys({ a: 1 }, fake), { message: msgKeys })
            assert.throws(() => objSortByKeys({ a: 1 }, fake, { onlyKeys: true }), { message: msgKeys })
            //真陣列偽稱Object: 仍是陣列(Array.isArray), 可作keys; 不可作obj
            let real = ['b', 'a']
            Object.defineProperty(real, Symbol.toStringTag, { value: 'Object' })
            assert.strict.deepStrictEqual(Object.keys(objSortByKeys({ a: 1, b: 2, c: 3 }, real)), ['b', 'a', 'c'])
            assert.strict.deepStrictEqual(objSortByKeys(real, ['a']), {}) //真陣列偽稱Object仍非obj, 回{}(W-16乙, 不拋錯)
            assert.ok(Date.now() - t0 < 1000)
        })

        it(`should throw when the keys argument is not given`, function() {
            assert.throws(() => objSortByKeys({ a: 1 }), { message: msgKeys })
            assert.throws(() => objSortByKeys({}), { message: msgKeys })
        })

        it(`should return {} on obj first (without checking keys) when both obj and keys are invalid`, function() {
            assert.strict.deepStrictEqual(objSortByKeys('x', 'y'), {})
            assert.strict.deepStrictEqual(objSortByKeys(null), {})
            assert.strict.deepStrictEqual(objSortByKeys(), {})
        })

        it(`should return {} for an invalid obj, and throw for an invalid keys, even when opt.onlyKeys is true`, function() {
            assert.strict.deepStrictEqual(objSortByKeys('x', ['a'], { onlyKeys: true }), {})
            assert.throws(() => objSortByKeys({ a: 1 }, 'a', { onlyKeys: true }), { message: msgKeys })
        })

        it(`should not echo the input value in the message (V20)`, function() {
            let secret = 'SECRET-VALUE-9f3a'
            let msgs = []
            for (let [o, k] of [[secret, ['a']], [{ a: 1 }, secret], [[secret], []], [{ a: 1 }, { 0: secret, length: 1 }]]) {
                try {
                    objSortByKeys(o, k)
                    msgs.push('NOTHROW')
                }
                catch (err) {
                    msgs.push(err.message)
                }
            }
            assert.strict.deepStrictEqual(msgs, ['NOTHROW', msgKeys, 'NOTHROW', msgKeys])
        })

    })

    describe(`JSDoc(V23)`, function() {

        it(`should state the order rule, opt.onlyKeys and the throws`, function() {
            let d = getDoc('objSortByKeys')
            assert.ok(d.indexOf('@param {Array} keys') >= 0)
            assert.ok(d.indexOf('opt.onlyKeys') >= 0)
            assert.ok(d.indexOf('@throws') >= 0)
            assert.ok(d.indexOf('回傳{}') >= 0) //ws492h: obj非物件回傳{}, 不拋錯
            assert.ok(d.indexOf('invalid keys: must be an array') >= 0)
            //修前之簽名說明為fun(回調排序函數)而非keys
            assert.ok(d.indexOf('輸入回調的排序函數') < 0)
        })

    })

    describe(`使用端物件之迭代(R-OBJ-ITER-01)`, function() {

        //物件之迭代一律以Object.keys取自有可列舉字串鍵, length與其他鍵同為一般鍵

        describe(`物件帶陣列樣length鍵(非負整數)時, 一律當一般鍵依自有鍵排序`, function() {

            //[名稱, 物件, 指定鍵陣列, 預期鍵序]; 預期值為手算: 列出之鍵依序放前, 其餘依原順序放後
            let cases = [
                ['{length:1,a:3,b:1} [b,a,length] (修前得{})', { length: 1, a: 3, b: 1 }, ['b', 'a', 'length'], ['b', 'a', 'length']],
                ['{length:1,a:3,b:1} [length,b,a]', { length: 1, a: 3, b: 1 }, ['length', 'b', 'a'], ['length', 'b', 'a']],
                ['{length:1,a:3,b:1} [a,b,length]', { length: 1, a: 3, b: 1 }, ['a', 'b', 'length'], ['a', 'b', 'length']],
                ['{length:2,x2:2,x1:1} [x1,x2] length未列於arr而放後', { length: 2, x2: 2, x1: 1 }, ['x1', 'x2'], ['x1', 'x2', 'length']],
                ['{length:2,x2:2,x1:1} [x2,length,x1]', { length: 2, x2: 2, x1: 1 }, ['x2', 'length', 'x1'], ['x2', 'length', 'x1']],
                ['{length:0,x2:2,x1:1} [x2,x1] (修前得{})', { length: 0, x2: 2, x1: 1 }, ['x2', 'x1'], ['x2', 'x1', 'length']],
                ['{x2:2,length:1000,x1:1} [x1,x2] 較大之length(行程內只用小值: 失敗時斷言差異輸出會逐鍵展開)', { x2: 2, length: 1000, x1: 1 }, ['x1', 'x2'], ['x1', 'x2', 'length']],
            ]
            for (let [name, o, arr, ks] of cases) {
                it(`should order own keys of ${name}`, function() {
                    let r = objSortByKeys(o, arr)
                    assert.strict.deepStrictEqual(Object.keys(r), ks)
                    assert.strict.deepStrictEqual(r, o) //值皆原樣, 不新增、不遺失鍵
                    assert.strict.deepStrictEqual(Object.keys(expectedByKeys(o, arr).o), ks) //期望函數與手算值一致
                })
            }

            it(`should not be affected by a length entry in the key array`, function() {
                let r = objSortByKeys({ a: 1, b: 2, c: 3 }, ['c', 'length', 'a'])
                assert.strict.deepStrictEqual(Object.keys(r), ['c', 'a', 'b']) //length不存在於物件而略過, c、a依序放前, b放後
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

            it(`should return {} for an object that only pretends to be an Array (Symbol.toStringTag) and throw for a keys that is an object with length (not an array); [] as keys is legal`, function() {
                let o = { [Symbol.toStringTag]: 'Array', length: 2, a: 3, b: 1 }
                assert.strict.deepStrictEqual(objSortByKeys(o, ['b', 'a']), {}) //ws492h W-16乙: obj非物件回{}
                assert.strict.deepStrictEqual(objSortByKeys({ length: 1, a: 3 }, []), { length: 1, a: 3 })
                assert.throws(() => objSortByKeys({ length: 1, a: 3 }, { 0: 'a', length: 1 }), { message: 'invalid keys: must be an array' })
            })

        })

        describe(`隨機物件(含陣列樣length鍵、原型鏈名稱、數字與非字串元素)與獨立期望值逐案相同`, function() {

            let seed = 20261019
            let rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648
                return seed / 2147483648
            }
            let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
            let keyNames = ['a', 'b', 'c', 'x1', 'x10', '0', '1', '10', '2', '中文', 'length', 'constructor', 'toString', '__proto__', '']
            let junk = [null, undefined, {}, [], true, false, 1.5, NaN]
            let lenVals = [0, 1, 2, 3, 5, -0, 7, 12, -1, 1.5]

            let cases = Array.from({ length: 600 }, () => {
                let o = {}
                let n = Math.floor(rnd() * 7)
                for (let i = 0; i < n; i++) {
                    let k = pick(keyNames)
                    setOwn(o, k, k === 'length' ? pick(lenVals) : pick([1, 2, 'x', null]))
                }
                let arr = []
                let m = Math.floor(rnd() * 8)
                for (let i = 0; i < m; i++) {
                    let t = rnd()
                    if (t < 0.7) {
                        arr.push(pick(keyNames))
                    }
                    else if (t < 0.85) {
                        arr.push(Number(pick(['0', '1', '10', '2'])))
                    }
                    else {
                        arr.push(pick(junk))
                    }
                }
                let onlyKeys = pick([false, false, true, 1, 'true', undefined])
                return [o, arr, onlyKeys]
            })

            it(`should equal the independent expectation on 600 random objects (default and onlyKeys)`, function() {
                let bad = []
                let withLen = 0
                let withOnly = 0
                for (let i = 0; i < cases.length; i++) {
                    let [o, arr, onlyKeys] = cases[i]
                    try {
                        let e = expectedByKeys(o, arr, onlyKeys === true)
                        same(objSortByKeys(o, arr, { onlyKeys }), e.keys, e.o)
                    }
                    catch (err) {
                        bad.push(i)
                    }
                    if (Object.prototype.hasOwnProperty.call(o, 'length') && Number.isInteger(o.length) && o.length >= 0) {
                        withLen++
                    }
                    if (onlyKeys === true) {
                        withOnly++
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
                assert.ok(withLen >= 40, `withLen=${withLen}`) //須含足夠之帶陣列樣length案例
                assert.ok(withOnly >= 60, `withOnly=${withOnly}`) //須含足夠之onlyKeys案例
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

            it(`should return {} at once (invalid obj, no throw) for an object that only pretends to be an Array, tag:${MAX}, without iterating its length`, function() {
                //Symbol.toStringTag偽稱Array: 非物件, 回{}(ws492h W-16乙: 原同步拋invalid obj; 修前更早為回{})
                let rc = runChildCase(runner, `objSortByKeys:tag:${MAX}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 20000 })
                assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal}`)
                assert.ok(rc.r !== null, 'no result line')
                assert.strict.strictEqual(rc.r.threw, false)
                assert.strict.deepStrictEqual(rc.r.keys, []) //回傳{}, 不依其length迭代
                assert.ok(rc.r.ms < 1000, `ms=${rc.r.ms}`)
            })

        })

    })

})
