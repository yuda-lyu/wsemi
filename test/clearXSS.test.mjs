import assert from 'assert'
import xss from 'xss'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import each from 'lodash-es/each.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import clearXSS from '../src/clearXSS.mjs'
import isarr from '../src/isarr.mjs'
import isobj from '../src/isobj.mjs'
import isestr from '../src/isestr.mjs'
import { runChildCase } from './tools/runChildCase.mjs'

let __dirname = dirname(fileURLToPath(import.meta.url))


describe(`clearXSS`, function() {
    let k
    let x = {}
    let fx = {}

    k = 1
    x[k] = `><script>alert('XSS')</script>`
    fx[k] = `>&lt;script>alert('XSS')&lt;/script>`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 1
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 2
    x[k] = `='><script>alert('XSS')</script>`
    fx[k] = `='>&lt;script>alert('XSS')&lt;/script>`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 2
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 3
    x[k] = `"><script>alert('XSS')</script>`
    fx[k] = `">&lt;script>alert('XSS')&lt;/script>`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 3
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 4
    x[k] = `<script>alert('XSS')</script>`
    fx[k] = `&lt;script>alert('XSS')&lt;/script>`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 4
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 5
    x[k] = `<script>alert (vulnerable)</script>`
    fx[k] = `&lt;script>alert (vulnerable)&lt;/script>`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 5
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 6
    x[k] = `%3Cscript%3Ealert('XSS')%3C/script%3E`
    fx[k] = `%3Cscript%3Ealert('XSS')%3C/script%3E`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 6
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 7
    x[k] = `<script>alert('XSS')</script>`
    fx[k] = `&lt;script>alert('XSS')&lt;/script>`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 7
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 8
    x[k] = `<img src="javascript:alert('XSS')">`
    fx[k] = `<img src>`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 8
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 9
    x[k] = `<img src="http://888.888.com/999.png" onerror="alert('XSS')">`
    fx[k] = `<img src="http://888.888.com/999.png">`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 9
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 10
    x[k] = `<div style="height:expression(alert('XSS'),1)"></div>`
    fx[k] = `<div style="height:expression(alert('XSS'),1)"></div>`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 10
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 11
    x[k] = 123
    fx[k] = 123
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 11
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 12
    x[k] = 12.34
    fx[k] = 12.34
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 12
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 13
    x[k] = '12.34'
    fx[k] = '12.34'
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 13
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 14
    x[k] = '12.34abc'
    fx[k] = '12.34abc'
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 14
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 15
    x[k] = `[123,'12.34',abc',345xyz','',[],{},null,undefined]`
    fx[k] = `[123,'12.34',abc',345xyz','',[],{},null,undefined]`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 15
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    k = 16
    x[k] = `{a:123,b:'345xyz'}`
    fx[k] = `{a:123,b:'345xyz'}`
    it(`should return ' + fx[k] + ' when input ' + x[k]`, function() {
        k = 16
        let r = clearXSS(x[k])
        assert.strict.deepStrictEqual(r, fx[k])
    })

    it(`should return '' when input ''`, function() {
        let r = clearXSS('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return [] when input []`, function() {
        let r = clearXSS([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return {} when input {}`, function() {
        let r = clearXSS({})
        assert.strict.deepStrictEqual(r, {})
    })

    it(`should return null when input null`, function() {
        let r = clearXSS(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return undefined when input undefined`, function() {
        let r = clearXSS(undefined)
        assert.strict.deepStrictEqual(r, undefined)
    })

    it(`should return undefined when input NaN`, function() {
        let r = clearXSS(NaN)
        assert.strict.deepStrictEqual(r, NaN)
    })

    describe(`標籤外之文字只轉義會開始標籤之<`, function() {

        //不會開始標籤之<(後接空白、數字、符號、非英文字母)與標籤外之>維持原樣
        let keep = [
            'a < b',
            '1 > 0',
            'x <= 5',
            'x>=3',
            '溫度 > 30°C',
            '孔深 < 500 m 且 > 10 m',
            'if (a < b && c > d)',
            '<3',
            '2<3',
            'x<=y',
            '3<4>2',
            '<新增>',
            '輸入 -> 輸出 <- 回饋',
            '> 引用一段話\n\n- 若 a < b 則停止\n- `x => y`',
        ]
        for (let s of keep) {
            it(`should keep ${JSON.stringify(s)}`, function() {
                assert.strict.deepStrictEqual(clearXSS(s), s)
            })
        }

        //<後接英文字母、斜線、驚嘆號、問號, 或位於結尾者轉義(結尾之<於兩欄相鄰組進畫面時會與後一欄開頭拼成標籤)
        let esc = [
            ['a<b', 'a&lt;b'],
            ['x<y>z', 'x&lt;y>z'],
            ['a <', 'a &lt;'],
            ['x<', 'x&lt;'],
            ['請見 <https://example.com>', '請見 &lt;https://example.com>'],
            ['<script>alert(1)</script>', '&lt;script>alert(1)&lt;/script>'],
            ['<SCRIPT>alert(1)</SCRIPT>', '&lt;SCRIPT>alert(1)&lt;/SCRIPT>'],
            ['A<B', 'A&lt;B'],
            ['<img src="x" onerror="alert(1)"', '&lt;img src="x" onerror="alert(1)"'],
            ['<svg onload=alert(1)//', '&lt;svg onload=alert(1)//'],
            ['</title><script>alert(1)</script>', '&lt;/title>&lt;script>alert(1)&lt;/script>'],
            ['<!DOCTYPE html>', '&lt;!DOCTYPE html>'],
            ['<?xml version="1.0"?><script>alert(1)</script>', '&lt;?xml version="1.0"?>&lt;script>alert(1)&lt;/script>'],
        ]
        for (let [s, e] of esc) {
            it(`should escape ${JSON.stringify(s)}`, function() {
                assert.strict.deepStrictEqual(clearXSS(s), e)
            })
        }

        it(`should escape the former of two adjacent <`, function() {
            //js-xss於第二個<前切段而分段轉義, 前者位於段尾視為結尾而轉義, 只多轉義不影響安全
            assert.strict.deepStrictEqual(clearXSS('a << b'), 'a &lt;< b')
            assert.strict.deepStrictEqual(clearXSS('x <<= 2'), 'x &lt;<= 2')
        })

        it(`should apply to strings inside objects and arrays`, function() {
            let r = clearXSS({ a: 'a < b', b: ['<script>', 1] })
            assert.strict.deepStrictEqual(r, { a: 'a < b', b: ['&lt;script>', 1] })
        })

    })

    describe(`白名單內標籤、事件屬性、網址、style、屬性值與註解之處理不變`, function() {

        let same = [
            ['<img src=x onerror=alert(1)>', '<img src>'],
            ['<b onclick=alert(1)>x</b>', '<b>x</b>'],
            ['<a href="javascript:alert(1)">x</a>', '<a href>x</a>'],
            ['a<b and c>d', 'a<b>d'],
            ['<div style="a:b<c" title="t">x</div>', '<div style="a:b&lt;c">x</div>'],
            ['<!-- x -->y', 'y'],
            //白名單內標籤之屬性值仍由js-xss之escapeAttrValue轉義<>", 不經文字之轉義
            ['<img alt="1 > 0" src="https://a/b.png">', '<img alt="1 &gt; 0" src="https://a/b.png">'],
            ['<a href="https://a/b" title="a<b>c">x</a>', '<a href="https://a/b" title="a&lt;b&gt;c">x</a>'],
            [`<a title='x"y'>z</a>`, '<a title="x&quot;y">z</a>'],
        ]
        for (let [s, e] of same) {
            it(`should keep the handling of ${JSON.stringify(s)}`, function() {
                assert.strict.deepStrictEqual(clearXSS(s), e)
            })
        }

    })

    describe(`兩欄各自清除後相連不會拼出標籤`, function() {

        //相連結果中會開始標籤之<只能是js-xss重建之白名單標籤且不帶事件屬性, 結尾亦不得留下<
        let reStart = /<(?=[A-Za-z!/?]|$)/g
        let reTag = /^<\/?([A-Za-z][A-Za-z0-9-]*)(\s[^<>]*)?\/?>$/
        let isWhite = (name) => Object.prototype.hasOwnProperty.call(xss.whiteList, name)
        let findBad = (r) => {
            reStart.lastIndex = 0
            let m
            while ((m = reStart.exec(r)) !== null) {
                let j = r.indexOf('>', m.index)
                if (j < 0) {
                    return `unclosed: ${r.slice(m.index)}`
                }
                let t = r.slice(m.index, j + 1)
                let mt = reTag.exec(t)
                if (!mt || !isWhite(mt[1].toLowerCase())) {
                    return `tag: ${t}`
                }
                if (/\son[a-z]+\s*=/i.test(t)) {
                    return `event: ${t}`
                }
                reStart.lastIndex = j + 1
            }
            return ''
        }

        let attacks = [
            '<script>alert(1)</script>',
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)>',
            '<svg/onload=alert(1)>',
            '<a href="javascript:alert(1)">x</a>',
            '<iframe src=javascript:alert(1)>',
            '<b onclick=alert(1)>x</b>',
            '<!--><svg onload=alert(1)>-->',
            '<?xml?><svg onload=alert(1)>',
            '</title><script>alert(1)</script>',
            'x<img src=1 onerror=alert(1)>',
            'a <b>粗體</b> c',
            '<table><tr><td>t</td></tr></table>',
        ]

        it(`should not form tags when two cleared fields are joined at any position`, function() {
            let bad = []
            for (let s of attacks) {
                for (let i = 1; i < s.length; i++) {
                    let r = clearXSS(s.slice(0, i)) + clearXSS(s.slice(i))
                    let err = findBad(r)
                    if (err) {
                        bad.push({ s, i, r, err })
                    }
                }
            }
            assert.strict.deepStrictEqual(bad, [])
        })

    })

    describe(`使用端物件之迭代(R-OBJ-ITER-01)`, function() {

        let x = '<script>alert(1)</script>'
        let fx = '&lt;script>alert(1)&lt;/script>'

        //以資料屬性設定自有鍵(含__proto__, 一般賦值會改原型)
        let setOwn = (o, k, v) => {
            Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
            return o
        }

        //獨立於實作之期望值: 物件只依自有可列舉字串鍵、陣列依元素, 字串交clearXSS(字串路徑不受本修正影響), 其餘原樣
        let expected = (v) => {
            if (Array.isArray(v)) {
                return v.map(expected)
            }
            if (Object.prototype.toString.call(v) === '[object Object]') {
                let o = {}
                for (let k of Object.keys(v)) {
                    setOwn(o, k, expected(v[k]))
                }
                return o
            }
            if (typeof v === 'string') {
                return clearXSS(v)
            }
            return v
        }

        //修前之演算法(lodash each遞迴), 供差分; 字串路徑同現行
        let legacyClearXSS = (inp) => {
            let sc = (o) => {
                if (isarr(o) || isobj(o)) {
                    each(o, function(v, k) {
                        o[k] = sc(v)
                    })
                    return o
                }
                else if (isestr(o)) {
                    return clearXSS(o)
                }
                return o
            }
            return sc(cloneDeep(inp))
        }

        //鍵順序與值皆比對(deepStrictEqual不比鍵順序), __proto__自有鍵亦列入
        let same = (r, e) => {
            assert.strict.deepStrictEqual(r, e)
            assert.strict.deepStrictEqual(JSON.stringify(r), JSON.stringify(e))
        }

        describe(`無陣列樣length鍵之樹: 與修前演算法逐案相同(行為鎖定)`, function() {

            let seed = 20261017
            let rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648
                return seed / 2147483648
            }
            let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
            let strs = [x, 'plain', '', 'a < b', '<img src=x onerror=alert(1)>', '<b>粗體</b>', '孔深 < 500 m', 'x<', '<a href="javascript:alert(1)">x</a>']
            //length值皆非陣列樣(非負整數以外): 修前亦以自有鍵迭代
            let lenVals = [-1, 1.5, '3', null, true, NaN, Infinity, {}, [], x, undefined]
            let keyNames = ['a', 'b', 'c', '0', '1', '10', 'constructor', 'toString', '__proto__', 'x y', '中文']

            let gen = (depth) => {
                let t = rnd()
                if (depth <= 0 || t < 0.35) {
                    return pick([...strs, 1, 0, -5, 1.5, true, false, null, undefined])
                }
                if (t < 0.6) {
                    let n = Math.floor(rnd() * 5)
                    let a = []
                    for (let i = 0; i < n; i++) {
                        a.push(gen(depth - 1))
                    }
                    return a
                }
                let o = {}
                let n = Math.floor(rnd() * 5)
                for (let i = 0; i < n; i++) {
                    setOwn(o, pick(keyNames), gen(depth - 1))
                }
                if (rnd() < 0.3) {
                    setOwn(o, 'length', pick(lenVals))
                }
                return o
            }

            //兩個案例共用同一批樹(各自再抽會推進種子而取得不同批)
            let trees = Array.from({ length: 400 }, () => gen(4))

            it(`should equal the legacy algorithm on 400 random trees without array-like length keys`, function() {
                let bad = []
                for (let i = 0; i < 400; i++) {
                    let t = trees[i]
                    let r = clearXSS(t)
                    let e = legacyClearXSS(t)
                    try {
                        same(r, e)
                    }
                    catch (err) {
                        bad.push({ i })
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should equal the independent expectation on the same trees`, function() {
                let bad = []
                for (let i = 0; i < 400; i++) {
                    let t = trees[i]
                    try {
                        same(clearXSS(t), expected(t))
                    }
                    catch (err) {
                        bad.push({ i })
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should keep the legacy result for sparse arrays and non-plain values`, function() {
                let sp = []
                sp[2] = x
                same(clearXSS(sp), legacyClearXSS(sp))
                assert.strict.deepStrictEqual(clearXSS(sp), [undefined, undefined, fx])
                let d = new Date(0)
                let rd = clearXSS(d)
                assert.strict.deepStrictEqual(rd, d)
                assert.ok(rd !== d)
                assert.strict.deepStrictEqual(clearXSS({ a: [1, null, true, undefined, NaN] }), { a: [1, null, true, undefined, NaN] })
            })

        })

        describe(`物件帶陣列樣length鍵(非負整數)時, 各層字串皆清除、不新增索引鍵、length與其他鍵原樣`, function() {

            let cases = [
                ['{length:1,a}', { length: 1, a: x }],
                ['{length:0,a}', { length: 0, a: x }],
                ['{length:2,a}', { length: 2, a: x }],
                ['{length:9,a,b}', { length: 9, a: x, b: x }],
                ['{a,length:1} 鍵序在前', { a: x, length: 1 }],
                ['{length:1,0,1} 數字鍵超過length', { length: 1, 0: x, 1: x }],
                ['{length:3,0} 數字鍵不足length', { length: 3, 0: x }],
                ['{length:2,0,1,a}', { length: 2, 0: x, 1: x, a: x }],
                ['[{length:1,a}]', [{ length: 1, a: x }]],
                ['[{length:2,a:[x,{length:1,b:x}]}]', [{ length: 2, a: [x, { length: 1, b: x }] }]],
                ['{p:{q:{r:{length:5,a}}}} 多層', { p: { q: { r: { length: 5, a: x } } } }],
                ['{length:1,a:{length:1,b:{length:1,c}}} 逐層皆有length', { length: 1, a: { length: 1, b: { length: 1, c: x } } }],
                ['{length:1,list:[x,{length:0,z:x}]}', { length: 1, list: [x, { length: 0, z: x }] }],
                ['{length:1,a:非字串}', { length: 1, a: 1, b: null, c: true, d: undefined, e: [1, 2] }],
                ['{length:1,constructor}', { length: 1, constructor: x }],
                ['{length:1,toString}', { length: 1, toString: x }],
                ['{length:1000,a} 較大之length(行程內只用小值: 失敗時斷言差異輸出會逐鍵展開)', { length: 1000, a: x }],
            ]
            for (let [name, t] of cases) {
                it(`should clean every own key of ${name}`, function() {
                    let r = clearXSS(t)
                    same(r, expected(t))
                })
            }

            it(`should not add index keys to the result`, function() {
                let r = clearXSS({ length: 3, a: x, nest: { length: 2, b: x }, arr: [{ length: 1, c: x }] })
                assert.strict.deepStrictEqual(Object.keys(r), ['length', 'a', 'nest', 'arr'])
                assert.strict.deepStrictEqual(Object.keys(r.nest), ['length', 'b'])
                assert.strict.deepStrictEqual(Object.keys(r.arr[0]), ['length', 'c'])
                assert.strict.strictEqual(r.length, 3)
                assert.strict.strictEqual(r.nest.length, 2)
            })

            it(`should treat length as an ordinary key: its string value is cleaned too`, function() {
                assert.strict.deepStrictEqual(clearXSS({ length: x }), { length: fx })
                assert.strict.deepStrictEqual(clearXSS({ length: { length: 1, a: x } }), { length: { length: 1, a: fx } })
            })

            it(`should not modify the input`, function() {
                let t = { length: 2, a: x, n: { length: 1, b: x }, arr: [{ length: 1, c: x }, x] }
                let before = structuredClone(t)
                clearXSS(t)
                assert.strict.deepStrictEqual(t, before)
                assert.strict.deepStrictEqual(Object.keys(t), ['length', 'a', 'n', 'arr'])
            })

            it(`should accept a deeply frozen input`, function() {
                let t = Object.freeze({ length: 1, a: x, n: Object.freeze({ length: 1, b: x }), arr: Object.freeze([Object.freeze({ length: 1, c: x })]) })
                same(clearXSS(t), expected(t))
            })

            it(`should clean an object without prototype and a class instance with length`, function() {
                let np = Object.create(null)
                np.length = 1
                np.a = x
                let rn = clearXSS(np)
                assert.strict.deepStrictEqual(Object.keys(rn), ['length', 'a'])
                assert.strict.strictEqual(rn.a, fx)

                class P {
                    constructor() {
                        this.length = 1
                        this.a = x
                    }
                }
                let rp = clearXSS(new P())
                assert.ok(rp instanceof P)
                assert.strict.deepStrictEqual(Object.keys(rp), ['length', 'a'])
                assert.strict.strictEqual(rp.a, fx)
            })

            it(`should clean an object whose JSON length is -0 (isLength(-0) is true: array-like before the fix)`, function() {
                let t = JSON.parse('{"length":-0,"a":"' + x + '"}')
                assert.ok(Object.is(t.length, -0))
                let r = clearXSS(t)
                assert.strict.strictEqual(r.a, fx)
                assert.ok(Object.is(r.length, -0))
                assert.strict.deepStrictEqual(Object.keys(r), ['length', 'a'])
            })

            it(`should clean an instance whose prototype has a length getter (cloneDeep keeps the prototype)`, function() {
                class G {
                    get length() {
                        return 1
                    }

                    constructor() {
                        this.a = x
                    }
                }
                let r = clearXSS(new G())
                assert.ok(r instanceof G)
                assert.strict.deepStrictEqual(Object.keys(r), ['a'])
                assert.strict.strictEqual(r.a, fx)
            })

            it(`should iterate own keys only: no inherited key becomes an own key, the prototype is untouched`, function() {
                let proto = { theme: x }
                let o = Object.create(proto)
                o.a = x
                let r = clearXSS(o)
                assert.strict.deepStrictEqual(Object.keys(r), ['a'])
                assert.strict.strictEqual(r.a, fx)
                assert.ok(!Object.prototype.hasOwnProperty.call(r, 'theme'))
                assert.strict.strictEqual(proto.theme, x)
            })

            it(`should treat an object that only pretends to be an Array (Symbol.toStringTag) as an object, not by its length`, function() {
                let o = { [Symbol.toStringTag]: 'Array', length: 2, a: x }
                let r = clearXSS(o)
                assert.strict.deepStrictEqual(Object.keys(r), ['length', 'a'])
                assert.strict.strictEqual(r.a, fx)
                assert.strict.strictEqual(r.length, 2)
            })

            it(`should clean JSON.parse results carrying length`, function() {
                let t = JSON.parse(JSON.stringify({ rows: [{ id: 1, meta: { length: 1, a: x } }, { id: 2, meta: { length: 3, a: x } }] }))
                let r = clearXSS(t)
                assert.strict.strictEqual(r.rows[0].meta.a, fx)
                assert.strict.strictEqual(r.rows[1].meta.a, fx)
                assert.strict.deepStrictEqual(Object.keys(r.rows[1].meta), ['length', 'a'])
            })

        })

        describe(`特殊鍵: __proto__、constructor 與數字鍵`, function() {

            it(`should clean an own __proto__ key without touching the prototype`, function() {
                let t = JSON.parse('{"__proto__":{"a":"<script>alert(1)</script>"},"b":"<script>alert(1)</script>"}')
                let r = clearXSS(t)
                assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                assert.ok(Object.prototype.hasOwnProperty.call(r, '__proto__'))
                assert.strict.strictEqual(Object.getOwnPropertyDescriptor(r, '__proto__').value.a, fx)
                assert.strict.strictEqual(r.b, fx)
                assert.strict.strictEqual(({}).a, undefined)
            })

            it(`should clean an own __proto__ key in an object with length`, function() {
                let t = JSON.parse('{"length":1,"__proto__":{"a":"<script>alert(1)</script>"},"b":"<script>alert(1)</script>"}')
                let r = clearXSS(t)
                assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                assert.strict.strictEqual(Object.getOwnPropertyDescriptor(r, '__proto__').value.a, fx)
                assert.strict.strictEqual(r.b, fx)
                assert.strict.deepStrictEqual(Object.keys(r), ['length', '__proto__', 'b'])
                assert.strict.strictEqual(({}).a, undefined)
            })

            it(`should clean constructor, toString and numeric keys`, function() {
                let r = clearXSS({ constructor: x, toString: x, hasOwnProperty: x, 0: x, 7: x })
                same(r, { 0: fx, 7: fx, constructor: fx, toString: fx, hasOwnProperty: fx })
            })

        })

        describe(`極大length於限額子行程: 時間與記憶體只依實際鍵數`, function() {

            let runner = join(__dirname, 'tools', 'clearXssLenRunner.mjs')
            let MAX = Number.MAX_SAFE_INTEGER
            //limit 64MB: 修前之實作對 length>=5e6 即耗盡堆積(5e6 約需 160MB)而崩潰, 離開碼 134
            let cases = [
                ['len', 5e6],
                ['len', 1e8],
                ['len', MAX],
                ['len', 4294967295],
                ['len', 4294967296],
                ['len', 2 ** 53], //超過 isLength 上限, 修前即以自有鍵迭代, 對照
                ['tag', 1e6], //Symbol.toStringTag偽稱Array(isarr為真之非真陣列): 不得依length建立索引鍵
                ['tag', MAX],
                ['nest', MAX],
                ['keys', MAX],
            ]
            for (let [kind, len] of cases) {
                it(`should finish ${kind}:${len} within 1000 ms and 4 MB of heap, with every string cleaned and no index key`, function() {
                    let rc = runChildCase(runner, `${kind}:${len}`, { execArgv: ['--expose-gc', '--max-old-space-size=64'], allowNoResult: true, timeout: 30000 })
                    assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                    assert.ok(rc.r !== null, 'no result line')
                    let r = rc.r
                    assert.ok(r.cleaned, 'strings not cleaned')
                    assert.ok(r.lengthKept, 'length changed')
                    assert.ok(!r.hasIndexKeys, `index keys added: ${r.keys.slice(0, 5)}`)
                    assert.ok(r.ms < 1000, `ms=${r.ms}`)
                    assert.ok(r.heapMB < 4, `heapMB=${r.heapMB}`)
                    if (kind === 'keys') {
                        assert.strict.strictEqual(r.keys.length, 101)
                    }
                    else {
                        assert.strict.strictEqual(r.keys.length, 2)
                    }
                })
            }

        })

    })

})
