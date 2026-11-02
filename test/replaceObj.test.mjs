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

const MSG_C = 'invalid c: must be a string'
const MSG_O = 'invalid o: must be a plain object'


//ws286b: replaceObj(c, o)之c非字串、o非一般物件改拋錯(原回''); o為空物件回c; 略過空鍵; 值轉換(原轉換迴圈算完未存回)改為實際使用; 值之取代為普通文字(含$&等不被特殊解讀)
//  規格: dspec〈輸入參數之檢測機制〉§5.1(同步之字串函數必須參數無效throw Error)、V19(訊息格式)、V20(不回顯輸入值), 使用者2026-11-02逐列確認
//  c為''回傳''(不變), 但o仍須為一般物件(檢測順序: c、o, 皆先於c為''之回傳)
//  值轉換: 字串原樣; 數字、BigInt、Symbol依cstr; 布林為'true'/'false'(不經cstr); 物件與陣列為JSON; null、undefined及其他型別(函式、Date、Map、NaN等)為''
describe(`replaceObj`, function() {

    it(`should return '1.20bc英文' when input '1.25abc中文', { '5a': '0', '中': '英' }`, function() {
        let r = replaceObj('1.25abc中文', { '5a': '0', '中': '英' })
        assert.strict.deepStrictEqual(r, '1.20bc英文')
    })

    it(`should return '1.2bc英文' when input '1.25abc中文', { '5a': '', '中': '英' }`, function() {
        let r = replaceObj('1.25abc中文', { '5a': '', '中': '英' })
        assert.strict.deepStrictEqual(r, '1.2bc英文')
    })

    //null值轉為''(原因轉換結果未存回而回'')
    it(`should return '1.2bc英文' when input '1.25abc中文', { '5a': null, '中': '英' } (null value is replaced by '')`, function() {
        let r = replaceObj('1.25abc中文', { '5a': null, '中': '英' })
        assert.strict.deepStrictEqual(r, '1.2bc英文')
    })

    it(`should throw ${MSG_O} when input '1.25abc', ''`, function() {
        assert.throws(() => replaceObj('1.25abc', ''), { message: MSG_O })
    })

    it(`should throw ${MSG_O} when input '1.25abc', []`, function() {
        assert.throws(() => replaceObj('1.25abc', []), { message: MSG_O })
    })

    it(`should return '1.25abc' (unchanged) when input '1.25abc', {}`, function() {
        let r = replaceObj('1.25abc', {})
        assert.strict.deepStrictEqual(r, '1.25abc')
    })

    it(`should throw ${MSG_O} when input '1.25abc', null`, function() {
        assert.throws(() => replaceObj('1.25abc', null), { message: MSG_O })
    })

    it(`should throw ${MSG_O} when input '1.25abc', undefined`, function() {
        assert.throws(() => replaceObj('1.25abc', undefined), { message: MSG_O })
    })

    it(`should throw ${MSG_O} when input '' without o`, function() {
        assert.throws(() => replaceObj(''), { message: MSG_O })
    })

    it(`should throw ${MSG_C} when input [] / {} / null / undefined / NaN as c`, function() {
        assert.throws(() => replaceObj([]), { message: MSG_C })
        assert.throws(() => replaceObj({}), { message: MSG_C })
        assert.throws(() => replaceObj(null), { message: MSG_C })
        assert.throws(() => replaceObj(undefined), { message: MSG_C })
        assert.throws(() => replaceObj(NaN), { message: MSG_C })
    })

    //--- ws286b: 使用者逐列確認之表 ---

    describe(`user-confirmed rows (ws286b)`, function() {

        //c非字串 -> throw MSG_C(先於o之檢查), 訊息不帶值
        for (let [label, c] of [
            ['123', 123],
            ['0', 0],
            ['NaN', NaN],
            ['true', true],
            ['null', null],
            ['undefined', undefined],
            ['[]', []],
            ['{}', {}],
            ['() => 1', () => 1],
            ['Symbol()', Symbol('x')],
            ['1n', 1n],
        ]) {
            it(`should throw '${MSG_C}' when c is not a string: ${label} (o valid or invalid)`, function() {
                for (let o of [{ a: 'x' }, null, undefined, [], {}]) {
                    assert.throws(() => replaceObj(c, o), (err) => {
                        assert.strict.deepStrictEqual(err instanceof Error, true)
                        assert.strict.deepStrictEqual(err.message, MSG_C)
                        return true
                    })
                }
            })
        }

        it(`should return '' when c is '' and o is a plain object (any plain object)`, function() {
            assert.strict.deepStrictEqual(replaceObj('', { a: 'x' }), '')
            assert.strict.deepStrictEqual(replaceObj('', {}), '')
            assert.strict.deepStrictEqual(replaceObj('', { '': 'x' }), '')
        })

        it(`should throw ${MSG_O} when c is '' but o is not a plain object (o is still required)`, function() {
            assert.throws(() => replaceObj('', null), { message: MSG_O })
            assert.throws(() => replaceObj('', []), { message: MSG_O })
            assert.throws(() => replaceObj('', 'a'), { message: MSG_O })
        })

        //o非一般物件(含陣列) -> throw MSG_O
        for (let [label, o] of [
            ['null', null],
            ['undefined', undefined],
            ['[]', []],
            [`[{ a: 'x' }]`, [{ a: 'x' }]],
            [`''`, ''],
            [`'a'`, 'a'],
            ['0', 0],
            ['1', 1],
            ['NaN', NaN],
            ['true', true],
            ['() => 1', () => 1],
            ['new Map()', new Map()],
            ['new Date(0)', new Date(0)],
            ['Symbol()', Symbol('x')],
            [`{ [Symbol.toStringTag]: 'Array' }`, { [Symbol.toStringTag]: 'Array', a: 'x' }],
        ]) {
            it(`should throw '${MSG_O}' when o is not a plain object: ${label}`, function() {
                assert.throws(() => replaceObj('a-b', o), (err) => {
                    assert.strict.deepStrictEqual(err instanceof Error, true)
                    assert.strict.deepStrictEqual(err.message, MSG_O)
                    return true
                })
            })
        }

        it(`should return c as is for an empty object: replaceObj('abc', {}) -> 'abc'`, function() {
            assert.strict.deepStrictEqual(replaceObj('abc', {}), 'abc')
            assert.strict.deepStrictEqual(replaceObj(' ', {}), ' ')
            assert.strict.deepStrictEqual(replaceObj('a-b', Object.create(null)), 'a-b')
        })

        it(`should skip the empty key: replaceObj('abc', { '': 'x' }) -> 'abc'`, function() {
            assert.strict.deepStrictEqual(replaceObj('abc', { '': 'x' }), 'abc')
            assert.strict.deepStrictEqual(replaceObj('abc', { '': 'x', 'b': 'y' }), 'ayc')
            assert.strict.deepStrictEqual(replaceObj('abc', { 'b': 'y', '': 'x' }), 'ayc')
        })

        //值轉換
        for (let [label, v, rr] of [
            ['1', 1, '1-b'],
            ['0', 0, '0-b'],
            ['-1', -1, '-1-b'],
            ['1.5', 1.5, '1.5-b'],
            ['1e21', 1e21, '1e+21-b'],
            ['-0', -0, '0-b'],
            ['1n', 1n, '1-b'],
            ['true (not through cstr)', true, 'true-b'],
            ['false (not through cstr)', false, 'false-b'],
            [`{ k: 1 } (JSON)`, { k: 1 }, '{"k":1}-b'],
            [`[1, 'x'] (JSON)`, [1, 'x'], '[1,"x"]-b'],
            ['{} (JSON)', {}, '{}-b'],
            ['[] (JSON)', [], '[]-b'],
            ['null', null, '-b'],
            ['undefined', undefined, '-b'],
            [`'' (empty string)`, '', '-b'],
            [`'x'`, 'x', 'x-b'],
            [`Symbol('s') (cstr)`, Symbol('s'), 'Symbol(s)-b'],
            ['NaN (cstr gives empty)', NaN, '-b'],
            ['function (other type)', () => 1, '-b'],
            ['Date (other type)', new Date(0), '-b'],
            ['Map (other type)', new Map(), '-b'],
        ]) {
            it(`should convert the value ${label}: replaceObj('a-b', { a: v }) -> '${rr}'`, function() {
                assert.strict.deepStrictEqual(replaceObj('a-b', { a: v }), rr)
            })
        }

        it(`should return the table rows: { a: 1 } '1-b', { a: true } 'true-b', { a: { k: 1 } } '{"k":1}-b', { a: null } '-b'`, function() {
            assert.strict.deepStrictEqual(replaceObj('a-b', { a: 1 }), '1-b')
            assert.strict.deepStrictEqual(replaceObj('a-b', { a: true }), 'true-b')
            assert.strict.deepStrictEqual(replaceObj('a-b', { a: { k: 1 } }), '{"k":1}-b')
            assert.strict.deepStrictEqual(replaceObj('a-b', { a: [1] }), '[1]-b')
            assert.strict.deepStrictEqual(replaceObj('a-b', { a: null }), '-b')
            assert.strict.deepStrictEqual(replaceObj('a-b', { a: undefined }), '-b')
        })

        it(`the error messages should not carry the input values`, function() {
            assert.throws(() => replaceObj({ secret: 'SECRET-VALUE-123' }, { a: 'x' }), (err) => {
                assert.ok(!err.message.includes('SECRET'), err.message)
                assert.strict.deepStrictEqual(err.message, MSG_C)
                return true
            })
            assert.throws(() => replaceObj('a', { secret: 'SECRET-VALUE-123' }.secret), (err) => {
                assert.ok(!err.message.includes('SECRET'), err.message)
                assert.strict.deepStrictEqual(err.message, MSG_O)
                return true
            })
            assert.throws(() => replaceObj('a', ['SECRET-VALUE-123']), (err) => {
                assert.ok(!err.message.includes('SECRET'), err.message)
                return true
            })
        })

    })

    //--- 值之取代為普通文字: $& $1 $` $' $$ $<name> 皆原樣輸出 ---

    describe(`values are plain text (no special replacement patterns)`, function() {

        for (let v of ['$&', '$&$&', '$1', '$`', `$'`, '$$', '$<a>', '$0', 'x$&y$1z', '$', '$$$']) {
            it(`should output the value as is: ${JSON.stringify(v)}`, function() {
                assert.strict.deepStrictEqual(replaceObj('a-b', { a: v }), v + '-b')
                assert.strict.deepStrictEqual(replaceObj('a a', { a: v }), v + ' ' + v)
            })
        }

        it(`should output $ in the JSON text of an object or array value as is`, function() {
            assert.strict.deepStrictEqual(replaceObj('a-b', { a: { k: '$&' } }), '{"k":"$&"}-b')
            assert.strict.deepStrictEqual(replaceObj('a-b', { a: ['$1', '$$'] }), '["$1","$$"]-b')
        })

        it(`should apply plain values of several keys in order`, function() {
            assert.strict.deepStrictEqual(replaceObj('a-b', { a: '$&', b: '$$' }), '$&-$$')
        })

    })

    //--- 鍵為普通文字(含正規表示式特殊字元) ---

    describe(`keys are plain text (regex special characters)`, function() {

        for (let s of ['.', '*', '+', '?', '^', '$', '(', ')', '[', ']', '{', '}', '|', '\\', '\\d', '(a|b)', '.*', '[a-z]', 'a.b', '$&']) {
            it(`should replace every occurrence of the plain key ${JSON.stringify(s)}`, function() {
                let c = `1${s}2 ${s} a.b axb`
                let rr = c.split(s).join('Z')
                assert.strict.deepStrictEqual(replaceObj(c, { [s]: 'Z' }), rr)
            })
        }

        it(`should not let the key '.' match any character`, function() {
            assert.strict.deepStrictEqual(replaceObj('a.b', { '.': 'Z' }), 'aZb')
            assert.strict.deepStrictEqual(replaceObj('axb', { '.': 'Z' }), 'axb')
        })

    })

    //--- 多鍵依序取代(現有行為) ---

    describe(`several keys are applied in the key order (existing behavior)`, function() {

        it(`should let a later key replace the text inserted by an earlier one`, function() {
            assert.strict.deepStrictEqual(replaceObj('abc', { a: 'b', b: 'c' }), 'ccc')
            assert.strict.deepStrictEqual(replaceObj('abc', { b: 'c', a: 'b' }), 'bcc')
        })

        it(`should end with '' when a value deletes all the text`, function() {
            assert.strict.deepStrictEqual(replaceObj('a', { a: '' }), '')
            assert.strict.deepStrictEqual(replaceObj('aa', { a: '', b: 'x' }), '')
        })

    })

    describe(`使用端物件之迭代(R-OBJ-ITER-01)`, function() {

        let c = 'abc x'

        //以資料屬性設定自有鍵(含__proto__, 一般賦值會改原型)
        let setOwn = (o, k, v) => {
            Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
            return o
        }

        //修前之演算法(lodash each迭代), 原樣複製, 供差分(僅用於有效字典: 全為字串值、無空鍵、值不含$)
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

        //值轉為文字之獨立期望(不依實作): 字串原樣、數字(NaN為'')、BigInt、Symbol、布林轉字串, 物件與陣列為JSON, 其餘為''
        let valText = (v) => {
            if (typeof v === 'string') {
                return v
            }
            if (typeof v === 'number') {
                return Number.isNaN(v) ? '' : String(v)
            }
            if (typeof v === 'bigint' || typeof v === 'symbol' || typeof v === 'boolean') {
                return String(v)
            }
            if (Object.prototype.toString.call(v) === '[object Object]' || Array.isArray(v)) {
                return JSON.stringify(v)
            }
            return ''
        }

        //獨立於實作之期望: c非字串或o非一般物件throw(以{ err }表示), c為''回傳'', 依自有可列舉字串鍵之順序逐一replaceAll(略過空鍵, 值為普通文字)
        let expected = (c, o) => {
            if (typeof c !== 'string') {
                return { err: MSG_C }
            }
            if (Object.prototype.toString.call(o) !== '[object Object]') {
                return { err: MSG_O }
            }
            if (c === '') {
                return ''
            }
            for (let k of Object.keys(o)) {
                if (k === '') {
                    continue
                }
                let t = valText(o[k])
                c = c.replaceAll(k, () => t)
            }
            return c
        }

        //實作結果轉為與expected同形
        let actual = (c, o) => {
            try {
                return replaceObj(c, o)
            }
            catch (err) {
                return { err: err.message }
            }
        }

        describe(`無陣列樣length鍵之字典: 與獨立期望值逐案相同, 有效字典並與修前演算法相同(行為鎖定)`, function() {

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

            it(`should equal the independent expectation on the 400 random dictionaries`, function() {
                let bad = []
                let nonEmpty = 0
                let errs = 0
                for (let i = 0; i < cases.length; i++) {
                    let [cc, o] = cases[i]
                    let r = actual(cc, o)
                    if (JSON.stringify(r) !== JSON.stringify(expected(cc, o))) {
                        bad.push(i)
                    }
                    if (typeof r === 'string' && r !== '') {
                        nonEmpty++
                    }
                    if (typeof r !== 'string') {
                        errs++
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
                assert.ok(nonEmpty >= 100, `nonEmpty=${nonEmpty}`) //亂數案例須含足夠之實際取代結果, 避免全為空字串而空轉
                assert.ok(errs >= 20, `errs=${errs}`) //含足夠之throw案例
            })

            it(`should equal the legacy algorithm on the valid dictionaries (string values without $, no empty key, non-empty)`, function() {
                let n = 0
                let bad = []
                for (let i = 0; i < cases.length; i++) {
                    let [cc, o] = cases[i]
                    let ks = Object.keys(o)
                    let ok = typeof cc === 'string' && cc !== '' && ks.length > 0 && ks.every((k) => k !== '' && typeof o[k] === 'string' && !o[k].includes('$'))
                    if (!ok) {
                        continue
                    }
                    n++
                    if (replaceObj(cc, o) !== legacyReplaceObj(cc, o)) {
                        bad.push(i)
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
                assert.ok(n >= 10, `n=${n}`)
            })

            it(`should convert numeric length values to text and treat length as an ordinary key (not array-like)`, function() {
                assert.strict.strictEqual(replaceObj(c, { length: '5', a: 'x' }), 'xbc x')
                assert.strict.strictEqual(replaceObj(c, { length: '0', a: 'x' }), 'xbc x')
                assert.strict.strictEqual(replaceObj(c, { length: 'length', a: 'x' }), 'xbc x')
                assert.strict.strictEqual(replaceObj(c, { a: 'x', length: 'b' }), 'xbc x')
                assert.strict.strictEqual(replaceObj('lengthabc', { length: 'L', a: 'x' }), 'Lxbc')
                assert.strict.strictEqual(replaceObj(c, { length: 1.5, a: 'x' }), 'xbc x')
                assert.strict.strictEqual(replaceObj(c, { length: -1, a: 'x' }), 'xbc x')
                assert.strict.strictEqual(replaceObj(c, { length: null, a: 'x' }), 'xbc x')
                assert.strict.strictEqual(replaceObj(c, { length: 2 ** 53, a: 'x' }), 'xbc x')
                assert.strict.strictEqual(replaceObj('length abc', { length: 1.5, a: 'x' }), '1.5 xbc')
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

        describe(`物件帶陣列樣length鍵(非負整數)時, 一律當一般鍵依自有鍵取代: 數字值轉為文字`, function() {

            //[名稱, 取代字典, 預期結果]; 預期值為手算: length值為數字, 依cstr轉為文字後取代'length'(c內無'length'故無作用), 其餘鍵照常; 若依陣列樣迭代(只走索引)則不會有'a'→'x'
            let cases = [
                ['{length:0,a:x} (修前length為0而不迭代, 得原字串)', { length: 0, a: 'x' }, 'xbc x'],
                ['{a:x,length:0} 鍵序在前', { a: 'x', length: 0 }, 'xbc x'],
                ['{length:0} 僅length', { length: 0 }, 'abc x'],
                ['{length:1,a:x}', { length: 1, a: 'x' }, 'xbc x'],
                ['{length:2,a:x}', { length: 2, a: 'x' }, 'xbc x'],
                ['{length:9,a:x,b:y}', { length: 9, a: 'x', b: 'y' }, 'xyc x'],
                ['{length:2,0:a,1:b} 數字鍵與length並存(鍵序0,1,length)', { length: 2, 0: 'a', 1: 'b' }, 'abc x'],
                ['{length:1000,a:x} 較大之length(行程內只用小值: 失敗時斷言差異輸出會逐鍵展開)', { length: 1000, a: 'x' }, 'xbc x'],
                ['{n:1,a:x} 對照: 改名length為n', { n: 1, a: 'x' }, 'xbc x'],
            ]
            for (let [name, o, rr] of cases) {
                it(`should return '${rr}' for ${name}`, function() {
                    assert.strict.strictEqual(replaceObj(c, o), rr)
                    assert.strict.deepStrictEqual(expected(c, o), rr) //期望函數與手算值一致
                })
            }

            it(`should replace the text 'length' by the number text when length is a number (array-like iteration would not)`, function() {
                assert.strict.strictEqual(replaceObj('length abc', { length: 3, a: 'x' }), '3 xbc')
                assert.strict.strictEqual(replaceObj('length abc', { a: 'x', length: 3 }), '3 xbc')
            })

            it(`should treat length -0 from JSON as an ordinary key (isLength(-0) is true: array-like before the fix)`, function() {
                let t = JSON.parse('{"length":-0,"a":"x"}')
                assert.ok(Object.is(t.length, -0))
                assert.strict.strictEqual(replaceObj(c, t), 'xbc x')
                let t2 = JSON.parse('{"a":"x","length":-0}')
                assert.strict.strictEqual(replaceObj(c, t2), 'xbc x')
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

            it(`should replace by own keys for an object without prototype and a class instance whose own length is 0`, function() {
                let np = Object.create(null)
                np.a = 'x'
                np.length = 0
                assert.strict.strictEqual(replaceObj(c, np), 'xbc x')
                class P {
                    constructor() {
                        this.a = 'x'
                        this.length = 0
                    }
                }
                assert.strict.strictEqual(replaceObj(c, new P()), 'xbc x')
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

            it(`should visit every own key and read each value exactly once (the converted value is the used value), even with a large length value`, function() {
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
                assert.strict.strictEqual(replaceObj(c, o), c)
                for (let k of Object.keys(reads)) {
                    assert.strict.deepStrictEqual(reads[k], 1, `${k} reads=${reads[k]}`)
                }
            })

            it(`should use the value read once even if a getter returns different values on each read`, function() {
                let n = 0
                let o = {}
                Object.defineProperty(o, 'a', {
                    get() {
                        n++
                        return n === 1 ? 'first' : 'later'
                    },
                    enumerable: true,
                    configurable: true
                })
                assert.strict.strictEqual(replaceObj('a-b', o), 'first-b')
                assert.strict.deepStrictEqual(n, 1)
            })

            it(`should not modify the input nor add index keys`, function() {
                let o = { length: 2, a: 'x', n: { length: 1 }, 0: 'z' }
                let before = structuredClone(o)
                replaceObj(c, o)
                assert.strict.deepStrictEqual(o, before)
                assert.strict.deepStrictEqual(Object.keys(o), ['0', 'length', 'a', 'n'])
            })

            it(`should accept a frozen input`, function() {
                assert.strict.strictEqual(replaceObj(c, Object.freeze({ length: 0, a: 'x' })), 'xbc x')
                assert.strict.strictEqual(replaceObj(c, Object.freeze({ length: '0', a: 'x' })), 'xbc x')
            })

            it(`should reject an object that only pretends to be an Array (Symbol.toStringTag) as not a plain object, by neither its length nor its keys`, function() {
                let o = { [Symbol.toStringTag]: 'Array', length: 2, a: 'x' }
                assert.throws(() => replaceObj(c, o), { message: MSG_O })
                assert.strict.strictEqual(legacyReplaceObj(c, o), '')
                let o0 = { [Symbol.toStringTag]: 'Array', length: 0, a: 'x' }
                assert.throws(() => replaceObj(c, o0), { message: MSG_O })
                assert.throws(() => replaceObj(c, ['x']), { message: MSG_O })
                assert.throws(() => replaceObj(c, 'abc'), { message: MSG_O })
            })

        })

        describe(`自動轉換迴圈仍須求值: JSON.stringify對循環參照與BigInt巢狀值拋錯`, function() {

            it(`should throw TypeError for a circular value, as before the fix`, function() {
                let circ = { n: 1 }
                circ.self = circ
                assert.throws(() => legacyReplaceObj(c, { a: 'x', b: circ }), TypeError)
                assert.throws(() => replaceObj(c, { a: 'x', b: circ }), TypeError)
                assert.throws(() => replaceObj(c, { b: [circ] }), TypeError)
            })

            it(`should throw TypeError for a nested BigInt value, but a direct BigInt value is converted by cstr`, function() {
                assert.throws(() => legacyReplaceObj(c, { a: { n: 1n } }), TypeError)
                assert.throws(() => replaceObj(c, { a: { n: 1n } }), TypeError)
                assert.strict.strictEqual(replaceObj(c, { a: 1n }), '1bc x')
            })

            it(`should evaluate the loop by own keys: a circular value is found even when length is 0 or 1 (array-like iteration skipped it before the fix)`, function() {
                let circ = { n: 1 }
                circ.self = circ
                assert.strict.strictEqual(legacyReplaceObj(c, { length: 0, a: circ }), c) //修前length為0不迭代而不拋錯
                assert.throws(() => replaceObj(c, { length: 0, a: circ }), TypeError)
                assert.throws(() => replaceObj(c, { length: 1, a: circ }), TypeError)
                assert.throws(() => replaceObj(c, { a: circ, length: 3 }), TypeError)
            })

            it(`should convert all values before replacing: a circular value later in the key order still throws`, function() {
                let circ = { n: 1 }
                circ.self = circ
                assert.throws(() => replaceObj(c, { a: 'x', z: circ }), TypeError)
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
            //[形態, length, 預期結果, 預期拋錯訊息(null為不拋錯)]; c為'abc x', 數字length轉為文字後取代'length'(c內無)故不影響
            let cases = [
                ['len', 1e8, 'xbc x', null],
                ['len', MAX, 'xbc x', null],
                ['len', 4294967295, 'xbc x', null],
                ['len', 4294967296, 'xbc x', null],
                ['len', 2 ** 53, 'xbc x', null], //超過isLength上限, 修前即以自有鍵迭代, 對照
                ['strlen', MAX, 'xbc x', null], //length為字串, 修前即以自有鍵迭代, 對照
                ['tag', MAX, null, MSG_O], //Symbol.toStringTag偽稱Array: 非一般物件, 不得依length迭代, 直接拋錯
                ['proto', 1e8, 'xbc x', null], //原型上之length getter
                ['proto', MAX, 'xbc x', null],
                ['hidden', 4294967295, 'xbc x', null], //不可列舉之自有length
                ['hidden', MAX, 'xbc x', null],
                ['keys', MAX, 'abc x', null], //length極大且另有100個自有鍵(值皆為'v', c內無k0~k99故不影響)
            ]
            for (let [kind, len, rr, thrown] of cases) {
                it(`should finish ${kind}:${len} within 1000 ms and 4 MB of heap with ${thrown ? `the error '${thrown}'` : `result '${rr}'`}`, function() {
                    let rc = runChildCase(runner, `replaceObj:${kind}:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 20000 })
                    assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                    assert.ok(rc.r !== null, 'no result line')
                    let r = rc.r
                    if (thrown) {
                        assert.ok(r.threw, 'should throw')
                        assert.strict.strictEqual(r.msg, thrown)
                    }
                    else {
                        assert.ok(!r.threw, `threw: ${r.msg}`)
                        assert.strict.strictEqual(r.result, rr)
                    }
                    assert.ok(r.ms < 1000, `ms=${r.ms}`)
                    assert.ok(r.heapMB < 4, `heapMB=${r.heapMB}`)
                    if (kind === 'keys') {
                        //100個自有鍵之getter皆被讀取且各恰1次, 次數與length無關
                        assert.strict.strictEqual(r.nReads, 100)
                        assert.ok(r.minReads === 1 && r.maxReads === 1, `minReads=${r.minReads} maxReads=${r.maxReads}`)
                    }
                })
            }

        })

    })

})
