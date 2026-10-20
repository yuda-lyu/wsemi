import assert from 'assert'
import xss from 'xss'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import vm from 'vm'
import each from 'lodash-es/each.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import clearXSS from '../src/clearXSS.mjs'
import fxss from '../src/_filterXSS.mjs'
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

    describe(`走訪結構: 深度、共用、循環、容器型別(R-XSS-WALK-01)`, function() {

        let x = '<script>alert(1)</script>'
        let fx = '&lt;script>alert(1)&lt;/script>'
        //非冪等字串(R-XSS-WALK-01已知限制): 清一次得nfx, 再清一次得nfx2
        let nx = `<b='<<>`
        let nfx = `&lt;b='<<>`
        let nfx2 = `&lt;b='&lt;<>`

        //以資料屬性設定自有鍵(含__proto__, 一般賦值會改原型)
        let setOwn = (o, k, v) => {
            Object.defineProperty(o, k, { value: v, writable: true, enumerable: true, configurable: true })
            return o
        }

        //鍵順序與值皆比對(deepStrictEqual不比鍵順序)
        let same = (r, e) => {
            assert.strict.deepStrictEqual(r, e)
            assert.strict.deepStrictEqual(JSON.stringify(r), JSON.stringify(e))
        }

        //計filterXSS之取得與呼叫次數(fxss為可變單例, clearXSS每次呼叫經fxss.getFilterXSS取得), 僅同步函數
        let spy = (fun) => {
            let n = { gets: 0, calls: 0 }
            let orig = fxss.getFilterXSS
            fxss.getFilterXSS = (...args) => {
                n.gets++
                let f = orig(...args)
                let w = (c, o) => {
                    n.calls++
                    return f(c, o)
                }
                w.escapeAttrValue = f.escapeAttrValue
                return w
            }
            try {
                fun()
            }
            finally {
                fxss.getFilterXSS = orig
            }
            return n
        }

        //修前之演算法(HEAD: cloneDeep後遞迴), 僅用於淺樹之差分; 字串路徑經現行clearXSS(字串路徑不受走訪重寫影響)
        let headClearXSS = (inp) => {
            let sc = (o) => {
                if (Array.isArray(o)) {
                    for (let i = 0; i < o.length; i++) {
                        o[i] = sc(o[i])
                    }
                    return o
                }
                else if (isobj(o) || isarr(o)) {
                    for (let k of Object.keys(o)) {
                        o[k] = sc(o[k])
                    }
                    return o
                }
                else if (isestr(o)) {
                    return clearXSS(o)
                }
                return o
            }
            return sc(cloneDeep(inp))
        }

        //迭代建構與迭代取葉(深物件不可用遞迴或assert.deepStrictEqual: 失敗時差異輸出會逐層展開而溢位)
        let wrap = (kind, i, cur) => {
            if (kind === 'obj') {
                return { a: cur }
            }
            if (kind === 'arr') {
                return [cur]
            }
            if (kind === 'map') {
                return new Map([['k', cur]])
            }
            if (kind === 'set') {
                return new Set([cur])
            }
            return (i % 2 === 0) ? { a: cur } : [cur] //mixed
        }
        let child = (v) => {
            if (Array.isArray(v)) {
                return v[0]
            }
            if (v instanceof Map) {
                return v.get('k')
            }
            if (v instanceof Set) {
                return [...v][0]
            }
            return v.a
        }
        let build = (kind, n) => {
            let cur = x
            for (let i = 0; i < n; i++) {
                cur = wrap(kind, i, cur)
            }
            return cur
        }
        let leafOf = (v) => {
            let d = 0
            while (typeof v === 'object' && v !== null) {
                v = child(v)
                d++
            }
            return { v, d }
        }

        //收集一棵樹內所有可走訪容器(物件、陣列、Map、Set)之參照, 迭代
        let containersOf = (root) => {
            let seen = new Set()
            let st = [root]
            while (st.length > 0) {
                let v = st.pop()
                if (typeof v !== 'object' || v === null || seen.has(v)) {
                    continue
                }
                if (!Array.isArray(v) && !(v instanceof Map) && !(v instanceof Set) && Object.prototype.toString.call(v) !== '[object Object]') {
                    continue
                }
                seen.add(v)
                if (v instanceof Map) {
                    for (let [, val] of v) {
                        st.push(val)
                    }
                }
                else if (v instanceof Set) {
                    for (let val of v) {
                        st.push(val)
                    }
                }
                else {
                    for (let k of Reflect.ownKeys(v)) {
                        let d = Object.getOwnPropertyDescriptor(v, k)
                        if (d.enumerable && 'value' in d) {
                            st.push(d.value)
                        }
                    }
                }
            }
            return seen
        }

        describe(`JSON可產生之輸入: 與修前演算法逐位元相同(行為鎖定)`, function() {

            let seed = 20261020
            let rnd = () => {
                seed = (seed * 1103515245 + 12345) % 2147483648
                return seed / 2147483648
            }
            let pick = (arr) => arr[Math.floor(rnd() * arr.length)]
            let strs = [x, 'plain', '', ' ', 'a < b', '<img src=x onerror=alert(1)>', '<b>粗體</b>', '孔深 < 500 m', 'x<', '<a href="javascript:alert(1)">x</a>', nx, '<<<i>', '&lt;x&gt;', '<!-- c -->', '<div style="color:red">x</div>']
            let keyNames = ['a', 'b', 'c', '0', '1', '10', 'length', 'constructor', 'toString', '__proto__', 'hasOwnProperty', 'x y', '中文', x]
            let lenVals = [-1, 1.5, '3', null, true, NaN, Infinity, {}, [], x, undefined, 0, 2, -0]

            let gen = (depth) => {
                let t = rnd()
                if (depth <= 0 || t < 0.3) {
                    return pick([...strs, 1, 0, -5, 1.5, true, false, null, -0, 1e21])
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
                if (rnd() < 0.15) {
                    setOwn(o, 'length', pick(lenVals))
                }
                return o
            }

            //兩個案例共用同一批樹(各自再抽會推進種子而取得不同批)
            let N = 3000
            let trees = Array.from({ length: N }, () => gen(6))

            it(`should equal the head algorithm on ${N} random JSON-like trees (values, key order, prototypes)`, function() {
                let bad = []
                for (let i = 0; i < N; i++) {
                    let t = trees[i]
                    try {
                        same(clearXSS(t), headClearXSS(t))
                    }
                    catch (err) {
                        bad.push({ i })
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should not change the input on the same trees`, function() {
                let bad = []
                for (let i = 0; i < N; i++) {
                    let t = trees[i]
                    let before = cloneDeep(t)
                    clearXSS(t)
                    try {
                        same(t, before)
                    }
                    catch (err) {
                        bad.push({ i })
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should return containers that are not shared with the input`, function() {
                let bad = []
                for (let i = 0; i < 600; i++) {
                    let t = trees[i]
                    let a = containersOf(t)
                    for (let c of containersOf(clearXSS(t))) {
                        if (a.has(c)) {
                            bad.push({ i })
                            break
                        }
                    }
                }
                assert.strict.deepStrictEqual(bad, [])
            })

            it(`should clean every string value of nested objects and arrays in order and keep the other values`, function() {
                let inp = { a: x, b: [x, 1, null, true, '', { c: x }], d: { e: { f: [x] } }, g: undefined, h: 0, i: -0, j: 1.5, k: ' ' }
                let r = clearXSS(inp)
                same(r, { a: fx, b: [fx, 1, null, true, '', { c: fx }], d: { e: { f: [fx] } }, g: undefined, h: 0, i: -0, j: 1.5, k: ' ' })
                assert.strict.strictEqual(Object.is(r.i, -0), true)
                assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                assert.strict.strictEqual(inp.a, x)
                assert.strict.strictEqual(inp.b[5].c, x)
            })

            it(`should clean values and keep keys of an object with an own __proto__ key, length key and numeric keys`, function() {
                let t = JSON.parse('{"__proto__":{"a":"<script>alert(1)</script>"},"length":2,"0":"<script>alert(1)</script>","constructor":"<script>alert(1)</script>"}')
                let r = clearXSS(t)
                assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                assert.strict.deepStrictEqual(Object.keys(r), ['0', '__proto__', 'length', 'constructor'])
                assert.strict.strictEqual(Object.getOwnPropertyDescriptor(r, '__proto__').value.a, fx)
                assert.strict.strictEqual(r[0], fx)
                assert.strict.strictEqual(r.length, 2)
                assert.strict.strictEqual(r.constructor, fx)
                assert.strict.strictEqual(({}).a, undefined)
            })

        })

        describe(`深巢狀: 不受呼叫堆疊限制(修前冷行程約1767層即同步拋RangeError)`, function() {

            for (let kind of ['obj', 'arr', 'mixed']) {
                for (let n of [10000, 300000]) {
                    it(`should clean the leaf of ${n} nested ${kind} levels without throwing, keep the depth and not change the input`, function() {
                        let inp = build(kind, n)
                        let r = clearXSS(inp)
                        let lo = leafOf(r)
                        let li = leafOf(inp)
                        assert.ok(lo.v === fx, 'leaf not cleaned')
                        assert.ok(li.v === x, 'input changed')
                        assert.ok(lo.d === n && li.d === n, `depth out=${lo.d} in=${li.d}`)
                        assert.ok(r !== inp)
                    })
                }
            }

            for (let kind of ['map', 'set']) {
                it(`should clean the leaf of 100000 nested ${kind} levels without throwing`, function() {
                    let inp = build(kind, 100000)
                    let r = clearXSS(inp)
                    let lo = leafOf(r)
                    assert.ok(lo.v === fx, 'leaf not cleaned')
                    assert.ok(lo.d === 100000, `depth out=${lo.d}`)
                    assert.ok(leafOf(inp).v === x, 'input changed')
                })
            }

            it(`should clean strings at every level of a deep mixed chain`, function() {
                let n = 20000
                let cur = { s: x }
                for (let i = 0; i < n; i++) {
                    cur = { s: x, a: [cur] }
                }
                let r = clearXSS(cur)
                let c = 0
                let v = r
                while (v !== undefined) {
                    assert.ok(v.s === fx, `level ${c} not cleaned`)
                    v = v.a ? v.a[0] : undefined
                    c++
                }
                assert.strict.strictEqual(c, n + 1)
            })

        })

        describe(`共用子結構(DAG): 同一來源物件只處理一次, 輸出保持共用`, function() {

            it(`should call filterXSS once for 20 levels of objects whose two properties refer to the same child (2^20 calls before)`, function() {
                let cur = { v: x }
                for (let i = 0; i < 20; i++) {
                    cur = { l: cur, r: cur }
                }
                let r
                let n = spy(() => {
                    r = clearXSS(cur)
                })
                assert.strict.strictEqual(n.calls, 1)
                let v = r
                for (let i = 0; i < 20; i++) {
                    assert.ok(v.l === v.r, `level ${i} not shared`)
                    v = v.l
                }
                assert.strict.strictEqual(v.v, fx)
            })

            it(`should call filterXSS once for 20 levels of arrays, Maps, Sets and mixed containers sharing the same child`, function() {
                let mk = {
                    arr: (cur) => [cur, cur],
                    map: (cur) => new Map([['l', cur], ['r', cur]]),
                    set: (cur) => new Set([{ p: cur }, { q: cur }]),
                    mixed: (cur) => ({ l: [cur, cur], r: cur }),
                }
                for (let [name, f] of Object.entries(mk)) {
                    let cur = name === 'map' ? new Map([['v', x]]) : name === 'set' ? new Set([x]) : [x]
                    for (let i = 0; i < 20; i++) {
                        cur = f(cur)
                    }
                    let n = spy(() => {
                        clearXSS(cur)
                    })
                    assert.strict.strictEqual(n.calls, 1, name)
                }
            })

            it(`should keep one output object for an input object referred to by many parents and keep distinct inputs distinct`, function() {
                let o = { t: x }
                let o2 = { t: x } //內容相同但為另一個物件
                let r = clearXSS({ a: o, b: o, c: [o, o], d: o2 })
                assert.ok(r.a === r.b && r.b === r.c[0] && r.c[0] === r.c[1])
                assert.ok(r.d !== r.a)
                assert.strict.strictEqual(r.a.t, fx)
                assert.strict.strictEqual(r.d.t, fx)
                assert.ok(r.a !== o)
            })

            it(`should keep a shared Date, Map and Set shared in the output as copies of the input`, function() {
                let d = new Date(1234567)
                let m = new Map([['k', x]])
                let s = new Set([x])
                let r = clearXSS({ d1: d, d2: d, m1: m, m2: m, s1: s, s2: s })
                assert.ok(r.d1 === r.d2 && r.d1 !== d && r.d1.getTime() === 1234567)
                assert.ok(r.m1 === r.m2 && r.m1 !== m && r.m1.get('k') === fx)
                assert.ok(r.s1 === r.s2 && r.s1 !== s && r.s1.has(fx))
            })

            it(`should clean a string in a shared object once: the result equals the one of the same tree without sharing (the cleaning is not idempotent)`, function() {
                //前提: 清兩次與清一次不同
                assert.strict.strictEqual(clearXSS(nx), nfx)
                assert.strict.strictEqual(clearXSS(clearXSS(nx)), nfx2)
                let o = { t: nx }
                let r = clearXSS({ a: o, b: o })
                assert.strict.strictEqual(r.a.t, nfx)
                let r4 = clearXSS([o, o, o, o])
                assert.strict.deepStrictEqual(r4.map((v) => v.t), [nfx, nfx, nfx, nfx])
                let tree = clearXSS({ a: { t: nx }, b: { t: nx } })
                same(r, tree)
            })

        })

        describe(`循環參照: 不拋, 保持循環, 字串已清除, 不改輸入`, function() {

            it(`should handle an object that refers to itself`, function() {
                let o = { s: x }
                o.self = o
                let r = clearXSS(o)
                assert.ok(r !== o && r.self === r)
                assert.strict.strictEqual(r.s, fx)
                assert.ok(o.self === o && o.s === x)
            })

            it(`should handle an array that contains itself`, function() {
                let a = [x]
                a.push(a)
                let r = clearXSS(a)
                assert.ok(r !== a && r[1] === r && r.length === 2)
                assert.strict.strictEqual(r[0], fx)
                assert.ok(a[1] === a && a[0] === x)
            })

            it(`should handle two objects that refer to each other and keep both strings cleaned`, function() {
                let a = { s: x }
                let b = { s: x, a }
                a.b = b
                let r = clearXSS({ a, b })
                assert.ok(r.a.b === r.b && r.b.a === r.a)
                assert.strict.strictEqual(r.a.s, fx)
                assert.strict.strictEqual(r.b.s, fx)
            })

            it(`should handle a Map, a Set and an object that refer to each other`, function() {
                let m = new Map()
                m.set('self', m)
                m.set('s', x)
                let rm = clearXSS(m)
                assert.ok(rm !== m && rm.get('self') === rm && rm.get('s') === fx)

                let st = new Set()
                st.add(st)
                st.add(x)
                let rs = clearXSS(st)
                assert.ok(rs !== st && rs.has(rs) && rs.has(fx) && rs.size === 2)

                let o = { s: x }
                let mm = new Map([['o', o]])
                o.m = mm
                let ro = clearXSS(o)
                assert.ok(ro.m.get('o') === ro && ro.s === fx)
            })

            it(`should handle a cycle through a Symbol-keyed property`, function() {
                let sym = Symbol('c')
                let o = { s: x }
                o[sym] = o
                let r = clearXSS(o)
                assert.ok(r[sym] === r && r.s === fx)
            })

            it(`should handle a cycle of 200000 nodes`, function() {
                let head = { i: 0, s: x }
                let cur = head
                for (let i = 1; i < 200000; i++) {
                    cur.next = { i, s: x }
                    cur = cur.next
                }
                cur.next = head
                let r = clearXSS(head)
                let v = r
                for (let i = 0; i < 200000; i++) {
                    assert.ok(v.i === i && v.s === fx, `node ${i}`)
                    v = v.next
                }
                assert.ok(v === r)
            })

        })

        describe(`型別處置表(根/物件內/陣列內)`, function() {

            //三個位置: 根、物件內、陣列內; chk(out, inp)依型別斷言
            let positions = [
                ['root', (v) => v, (o) => o],
                ['in object', (v) => ({ k: v }), (o) => o.k],
                ['in array', (v) => [v], (o) => o[0]],
            ]

            describe(`原始值與包裝字串`, function() {
                let prims = {
                    'number': 12.5,
                    'not a number': NaN,
                    '-0': -0,
                    'positive infinity': Infinity,
                    'bigint': 10n,
                    'true': true,
                    'false': false,
                    'null': null,
                    'undefined value': undefined,
                    'empty string': '',
                    'blank string': '  ',
                }
                for (let [name, v] of Object.entries(prims)) {
                    for (let [pos, put, get] of positions) {
                        it(`should return the value as it is: ${name} ${pos}`, function() {
                            assert.ok(Object.is(get(clearXSS(put(v))), v))
                        })
                    }
                }

                it(`should return the same symbol`, function() {
                    let sym = Symbol('s')
                    assert.ok(clearXSS(sym) === sym)
                    assert.ok(clearXSS({ k: sym }).k === sym)
                })

                for (let [pos, put, get] of positions) {
                    it(`should return the cleaned primitive string for a String object ${pos}`, function() {
                        let r = get(clearXSS(put(new String(x)))) // eslint-disable-line no-new-wrappers
                        assert.strict.strictEqual(typeof r, 'string')
                        assert.strict.strictEqual(r, fx)
                    })
                    it(`should return a String object copy for an empty String object, which is not processed as before ${pos}`, function() {
                        let r = get(clearXSS(put(new String('')))) // eslint-disable-line no-new-wrappers
                        assert.strict.strictEqual(r instanceof String, true) //空字串不處理, 原樣(同修前)
                    })
                }
            })

            describe(`複製且無字串者: Date、RegExp、型別陣列、Buffer、ArrayBuffer、包裝Number`, function() {
                let mks = {
                    'Date': [() => new Date(7), (a, b) => a.getTime() === b.getTime()],
                    'RegExp': [() => /a/gi, (a, b) => String(a) === String(b)],
                    'Uint8Array': [() => new Uint8Array([1, 2, 3]), (a, b) => a instanceof Uint8Array && Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0],
                    'Buffer': [() => Buffer.from('ab'), (a, b) => Buffer.isBuffer(a) && a.toString() === b.toString()],
                    'ArrayBuffer': [() => new Uint8Array([4, 5]).buffer, (a, b) => a instanceof ArrayBuffer && a.byteLength === 2 && new Uint8Array(a)[1] === 5],
                    'Number object': [() => new Number(3), (a, b) => a instanceof Number && Number(a) === 3], // eslint-disable-line no-new-wrappers
                }
                for (let [name, [mk, eq]] of Object.entries(mks)) {
                    for (let [pos, put, get] of positions) {
                        it(`should return a copy with the same content: ${name} ${pos}`, function() {
                            let v = mk()
                            let r = get(clearXSS(put(v)))
                            assert.ok(r !== v, 'same reference')
                            assert.ok(eq(r, v), 'content differs')
                        })
                    }
                }
            })

            describe(`不可複製者: 巢狀回同一參照且內部不清除, 根沿用cloneDeep頂層語意`, function() {
                it(`should return the same Error object when nested and not clean its message and properties`, function() {
                    let e = new Error(x)
                    e.extra = x
                    let r = clearXSS({ e, a: [e] })
                    assert.ok(r.e === e && r.a[0] === e)
                    assert.strict.strictEqual(e.message, x)
                    assert.strict.strictEqual(e.extra, x)
                })
                it(`should return {} for an Error object at the root`, function() {
                    same(clearXSS(new Error(x)), {})
                })
                for (let [name, mk] of Object.entries({ 'WeakMap': () => new WeakMap(), 'Promise': () => Promise.resolve(1), 'URL': () => new URL('http://a/b') })) {
                    it(`should return the same ${name} when nested and {} at the root`, function() {
                        let v = mk()
                        let r = clearXSS({ v, a: [v] })
                        assert.ok(r.v === v && r.a[0] === v)
                        same(clearXSS(v), {})
                    })
                }
                it(`should return the same function when nested and not clean its properties`, function() {
                    let f = () => 1
                    f.s = x
                    let r = clearXSS({ f, a: [f] })
                    assert.ok(r.f === f && r.a[0] === f)
                    assert.strict.strictEqual(f.s, x)
                })
                it(`should return a plain object copy with cleaned enumerable properties for a function at the root`, function() {
                    let f = () => 1
                    f.s = x
                    let r = clearXSS(f)
                    assert.strict.strictEqual(typeof r, 'object')
                    assert.strict.strictEqual(r.s, fx)
                    assert.strict.strictEqual(f.s, x)
                })
            })

            describe(`物件形狀`, function() {
                class Foo {
                    constructor() {
                        this.s = x
                        this.n = 1
                    }

                    hello() {
                        return 'hi'
                    }
                }
                for (let [pos, put, get] of positions) {
                    it(`should keep the prototype of a class instance and clean its own strings ${pos}`, function() {
                        let f = new Foo()
                        let r = get(clearXSS(put(f)))
                        assert.ok(r !== f && r instanceof Foo && r.hello() === 'hi')
                        assert.strict.strictEqual(r.s, fx)
                        assert.strict.strictEqual(r.n, 1)
                        assert.strict.strictEqual(f.s, x)
                    })
                }
                it(`should return an ordinary object for an object that is the prototype of its own constructor, as lodash does`, function() {
                    class A {}

                    class B extends A {}
                    B.prototype.s = x
                    let r = clearXSS({ p: B.prototype }).p
                    assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                    assert.strict.strictEqual(r.s, fx)
                    assert.strict.strictEqual(B.prototype.s, x)
                })
                it(`should turn an object without prototype into an ordinary object`, function() {
                    let o = Object.create(null)
                    o.s = x
                    let r = clearXSS({ o }).o
                    assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                    assert.strict.strictEqual(r.s, fx)
                })
                it(`should keep a function-valued own constructor key by reference and an ordinary prototype`, function() {
                    let Z = function() {}
                    let r = clearXSS({ o: { constructor: Z, a: x } }).o
                    assert.ok(r.constructor === Z)
                    assert.strict.strictEqual(r.a, fx)
                    assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                })
                it(`should clean a string-valued own constructor key`, function() {
                    let r = clearXSS(JSON.parse('{"constructor":"<script>alert(1)</script>","a":1}'))
                    assert.strict.strictEqual(r.constructor, fx)
                    assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                })
                it(`should clean the values of own enumerable Symbol-keyed properties, strings and nested objects`, function() {
                    let sym = Symbol('k')
                    let r = clearXSS({ [sym]: x, s: x, t: { [sym]: { u: x } } })
                    assert.strict.strictEqual(r[sym], fx)
                    assert.strict.strictEqual(r.s, fx)
                    assert.strict.strictEqual(r.t[sym].u, fx)
                })
                it(`should not copy a non-enumerable Symbol-keyed or string-keyed property`, function() {
                    let sym = Symbol('k')
                    let o = { s: x }
                    Object.defineProperty(o, sym, { value: x, enumerable: false })
                    Object.defineProperty(o, 'h', { value: x, enumerable: false })
                    let r = clearXSS(o)
                    assert.strict.deepStrictEqual(Reflect.ownKeys(r), ['s'])
                })
                it(`should read an accessor once and return a data property with the cleaned value`, function() {
                    let n = 0
                    let o = {}
                    Object.defineProperty(o, 's', {
                        get() {
                            n++
                            return x
                        },
                        enumerable: true,
                    })
                    let r = clearXSS(o)
                    let d = Object.getOwnPropertyDescriptor(r, 's')
                    assert.strict.strictEqual(d.value, fx)
                    assert.strict.strictEqual(d.get, undefined)
                    assert.strict.strictEqual(n, 1)
                })
                it(`should keep the prototype but not clean nor copy inherited properties`, function() {
                    let p = { s: x }
                    let o = Object.create(p)
                    o.own = x
                    let r = clearXSS(o)
                    assert.strict.strictEqual(Object.getPrototypeOf(r), p)
                    assert.strict.strictEqual(r.own, fx)
                    assert.strict.deepStrictEqual(Object.keys(r), ['own'])
                    assert.strict.strictEqual(p.s, x)
                })
                it(`should return an unfrozen copy of a frozen object`, function() {
                    let o = Object.freeze({ s: x, a: Object.freeze([x]) })
                    let r = clearXSS(o)
                    assert.strict.strictEqual(Object.isFrozen(r), false)
                    same(r, { s: fx, a: [fx] })
                    assert.strict.strictEqual(o.s, x)
                })
                it(`should clean through a Proxy of a plain object`, function() {
                    let r = clearXSS({ p: new Proxy({ s: x }, {}) })
                    assert.strict.strictEqual(r.p.s, fx)
                })
                it(`should turn an arguments object into an ordinary object`, function() {
                    let args = (function() {
                        return arguments
                    })(x, 7)
                    let r = clearXSS({ a: args }).a
                    assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                    same(r, { 0: fx, 1: 7 })
                })
            })

            describe(`陣列形狀`, function() {
                it(`should drop non-index properties and fill holes with undefined`, function() {
                    let a = [x]
                    a.extra = x
                    a[3] = x
                    let r = clearXSS(a)
                    assert.strict.strictEqual(r.length, 4)
                    assert.strict.deepStrictEqual(Object.keys(r), ['0', '1', '2', '3'])
                    assert.strict.strictEqual(r[0], fx)
                    assert.strict.strictEqual(r[1], undefined)
                    assert.strict.strictEqual(r[3], fx)
                    assert.strict.strictEqual(r.extra, undefined)
                })
                it(`should keep the Array subclass`, function() {
                    class Arr2 extends Array {}
                    let a = Arr2.from([x, 'b'])
                    let r = clearXSS({ a }).a
                    assert.ok(r instanceof Arr2 && r !== a && r.length === 2)
                    assert.strict.strictEqual(r[0], fx)
                })
            })

            describe(`偽稱型別之物件(Symbol.toStringTag)`, function() {
                it(`should walk an object that fakes Array with a writable tag by its own keys and keep length as an ordinary key`, function() {
                    let o = { a: x, length: 2, [Symbol.toStringTag]: 'Array' }
                    let r = clearXSS({ c: o }).c
                    assert.ok(!Array.isArray(r))
                    assert.strict.strictEqual(r.a, fx)
                    assert.strict.strictEqual(r.length, 2)
                })
                it(`should walk an object that fakes Array with a non-writable tag without throwing (TypeError before)`, function() {
                    let o = Object.defineProperty({ a: x, length: 2 }, Symbol.toStringTag, { value: 'Array' })
                    let r = clearXSS({ c: o }).c
                    assert.ok(!Array.isArray(r))
                    assert.strict.strictEqual(r.a, fx)
                    assert.strict.strictEqual(r.length, 2)
                    assert.strict.strictEqual(o.a, x)
                })
                it(`should walk an object that fakes Arguments with a non-writable tag by its own keys (lodash keys would give index keys and drop length)`, function() {
                    let o = Object.defineProperty({ a: x, length: 2 }, Symbol.toStringTag, { value: 'Arguments' })
                    let r = clearXSS({ c: o }).c
                    assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                    same(r, { a: fx, length: 2 })
                    assert.strict.strictEqual(o.a, x)
                })
                it(`should copy an object with an enumerable custom tag; its strings are not guaranteed to be cleaned (known limit, same as before)`, function() {
                    let o = { s: x, [Symbol.toStringTag]: 'Foo' }
                    let r = clearXSS({ c: o }).c
                    assert.ok(r !== o)
                    assert.strict.strictEqual(o.s, x)
                    assert.ok(r.s === x || r.s === fx, 'unexpected value')
                })
            })

            describe(`Map與Set`, function() {
                it(`should clean Map values and Set elements, including nested objects, and keep Map keys as they are`, function() {
                    let m = new Map([['k', x], [x, 1], ['o', { s: x }], ['a', [x]]])
                    let r = clearXSS({ m })
                    assert.ok(r.m instanceof Map && r.m !== m)
                    assert.strict.deepStrictEqual([...r.m.keys()], ['k', x, 'o', 'a'])
                    assert.strict.strictEqual(r.m.get('k'), fx)
                    assert.strict.strictEqual(r.m.get(x), 1)
                    assert.strict.strictEqual(r.m.get('o').s, fx)
                    assert.strict.strictEqual(r.m.get('a')[0], fx)
                    assert.strict.strictEqual(m.get('k'), x)
                    let s = new Set([x, 'p', { s: x }])
                    let rs = clearXSS([s])[0]
                    let es = [...rs]
                    assert.ok(rs instanceof Set && rs !== s && es.length === 3)
                    assert.strict.strictEqual(es[0], fx)
                    assert.strict.strictEqual(es[1], 'p')
                    assert.strict.strictEqual(es[2].s, fx)
                    assert.ok(s.has(x))
                })
                it(`should handle a Map and a Set at the root`, function() {
                    assert.strict.strictEqual(clearXSS(new Map([['k', x]])).get('k'), fx)
                    assert.strict.strictEqual(clearXSS(new Set([x])).has(fx), true)
                })
                it(`should keep a Map or Set subclass`, function() {
                    class M2 extends Map {}
                    class S2 extends Set {}
                    let r = clearXSS({ m: new M2([['k', x]]), s: new S2([x]) })
                    assert.ok(r.m instanceof M2 && r.m.get('k') === fx)
                    assert.ok(r.s instanceof S2 && r.s.has(fx))
                })
                it(`should keep the insertion order of Map entries and Set elements`, function() {
                    let m = new Map([['b', 1], ['a', 2], ['c', x]])
                    assert.strict.deepStrictEqual([...clearXSS(m).keys()], ['b', 'a', 'c'])
                    let s = new Set(['z', x, 'y'])
                    assert.strict.deepStrictEqual([...clearXSS(s)], ['z', fx, 'y'])
                })
            })

            describe(`鍵不清除`, function() {
                it(`should not clean string keys of objects and Maps`, function() {
                    let r = clearXSS({ [x]: x, a: { [x]: x } })
                    assert.strict.deepStrictEqual(Object.keys(r), [x, 'a'])
                    assert.strict.strictEqual(r[x], fx)
                    assert.strict.strictEqual(r.a[x], fx)
                    let m = clearXSS(new Map([[x, x]]))
                    assert.strict.deepStrictEqual([...m.entries()], [[x, fx]])
                })
            })

        })

        describe(`lodash複製後之終態、Map/Set補強、跨realm(外審補強)`, function() {

            //三個位置: 根、物件內、陣列內
            let positions = [
                ['root', (v) => v, (o) => o],
                ['in object', (v) => ({ k: v }), (o) => o.k],
                ['in array', (v) => [v], (o) => o[0]],
            ]

            for (let tag of ['Foo', 'String', 'Date', 'Map', 'Error', 'Object']) {
                for (let [pos, put, get] of positions) {
                    it(`should clean an object with a writable, non-enumerable own custom tag ${tag} (lodash unmasks it and treats the object as ordinary) ${pos}`, function() {
                        //修前: cloneDeep揭開可寫標籤並不複製不可列舉之標籤, 複本為一般物件而被清除
                        let o = Object.defineProperty({ s: x, n: { s: x } }, Symbol.toStringTag, { value: tag, writable: true, enumerable: false, configurable: true })
                        let r = get(clearXSS(put(o)))
                        assert.strict.strictEqual(r.s, fx)
                        assert.strict.strictEqual(r.n.s, fx)
                        assert.strict.strictEqual(o.s, x)
                    })
                }
            }

            for (let name of ['Array', 'Arguments']) {
                for (let writable of [true, false]) {
                    for (let enumerable of [true, false]) {
                        for (let [pos, put, get] of positions) {
                            it(`should walk an object faking ${name} (${writable ? 'writable' : 'non-writable'}, ${enumerable ? 'enumerable' : 'non-enumerable'} tag) by its own string keys, keep length as a key ${pos}`, function() {
                                let o = Object.defineProperty({ a: x, length: 2 }, Symbol.toStringTag, { value: name, writable, enumerable, configurable: true })
                                let r = get(clearXSS(put(o)))
                                assert.ok(!Array.isArray(r))
                                assert.strict.strictEqual(r.a, fx)
                                assert.strict.strictEqual(r.length, 2)
                                assert.strict.strictEqual(o.a, x)
                            })
                        }
                    }
                }
            }

            for (let [pos, put, get] of positions) {
                it(`should clean an object faking String (writable, non-enumerable tag, with length) as an ordinary object and not turn it into a string ${pos}`, function() {
                    let o = Object.defineProperty({ s: x, length: 3 }, Symbol.toStringTag, { value: 'String', writable: true, enumerable: false, configurable: true })
                    let r = get(clearXSS(put(o)))
                    assert.strict.strictEqual(typeof r, 'object')
                    assert.strict.strictEqual(r.s, fx)
                    assert.strict.strictEqual(r.length, 3)
                })
            }

            it(`should turn an object faking Array with a null prototype or a prototype-shaped object into an ordinary object`, function() {
                let np = Object.create(null)
                np.s = x
                np[Symbol.toStringTag] = 'Array'
                let r1 = clearXSS({ k: np }).k
                assert.strict.strictEqual(Object.getPrototypeOf(r1), Object.prototype)
                assert.strict.strictEqual(r1.s, fx)

                class K {}

                class L extends K {}
                L.prototype.s = x
                Object.defineProperty(L.prototype, Symbol.toStringTag, { value: 'Array' })
                let r2 = clearXSS({ k: L.prototype }).k
                assert.strict.strictEqual(Object.getPrototypeOf(r2), Object.prototype)
                assert.strict.strictEqual(r2.s, fx)
            })

            it(`should keep the prototype of a class instance faking Array and define its own keys as data properties without calling a prototype setter`, function() {
                let called = 0
                class S {
                    // eslint-disable-next-line accessor-pairs
                    set s(v) {
                        called++
                        this.t = 'set:' + v
                    }
                }
                let o = new S()
                Object.defineProperty(o, 's', { value: x, enumerable: true, writable: true, configurable: true })
                o[Symbol.toStringTag] = 'Array'
                let r = clearXSS({ k: o }).k
                assert.ok(r instanceof S)
                assert.strict.strictEqual(called, 0)
                assert.strict.strictEqual(Object.getOwnPropertyDescriptor(r, 's').value, fx)
                assert.strict.strictEqual(r.t, undefined)
            })

            it(`should not clean the strings of an object with a non-writable, non-enumerable custom tag (lodash cannot unmask it, so it is returned as it is when nested)`, function() {
                let o = Object.defineProperty({ s: x }, Symbol.toStringTag, { value: 'Foo' })
                let r = clearXSS({ k: o }).k
                assert.ok(r === o)
                assert.strict.strictEqual(r.s, x)
            })

            describe(`Date、RegExp、型別陣列、自訂標籤物件之自有物件值屬性: 與其他路徑共用同一輸出並清除(修前同一複本、已清除)`, function() {
                let mks = {
                    'Date': () => new Date(0),
                    'RegExp': () => /a/g,
                    'Uint8Array': () => new Uint8Array([1, 2]),
                    'custom tag': () => ({ [Symbol.toStringTag]: 'Foo' }),
                }
                for (let [name, mk] of Object.entries(mks)) {
                    it(`should clean the object a ${name} refers to and share it with the other path to the same object`, function() {
                        let o = { s: x }
                        let d = mk()
                        d.ref = o
                        let r = clearXSS({ o, d })
                        assert.ok(r.d !== d)
                        assert.ok(r.d.ref === r.o, 'not shared')
                        assert.strict.strictEqual(r.o.s, fx)
                        assert.strict.strictEqual(o.s, x)
                        //物件先、foreign後之順序亦同
                        let r2 = clearXSS({ d: mk(), o })
                        assert.ok(r2.o.s === fx)
                    })

                    it(`should keep a cycle through a ${name} closed on the output`, function() {
                        let o = { s: x }
                        let d = mk()
                        d.ref = o
                        o.d = d
                        let r = clearXSS(o)
                        assert.ok(r.d.ref === r, 'cycle not closed')
                        assert.ok(r.d !== d)
                        assert.strict.strictEqual(r.s, fx)
                    })
                }

                it(`should not overflow the call stack for a 20000-level object chain kept as a Date property, and clean its leaf`, function() {
                    let cur = { s: x }
                    for (let i = 0; i < 20000; i++) {
                        cur = { a: cur }
                    }
                    let d = new Date(0)
                    d.child = cur
                    let r = clearXSS({ d })
                    let v = r.d.child
                    let n = 0
                    while (v.a !== undefined) {
                        v = v.a
                        n++
                    }
                    assert.strict.strictEqual(n, 20000)
                    assert.strict.strictEqual(v.s, fx)
                })

                it(`should convert a child array shared by 100 Dates once (100 distinct outputs before)`, function() {
                    let arr = []
                    for (let i = 0; i < 1000; i++) {
                        arr.push({ s: x })
                    }
                    let ds = []
                    for (let i = 0; i < 100; i++) {
                        let d = new Date(i)
                        d.child = arr
                        ds.push(d)
                    }
                    let r
                    let n = spy(() => {
                        r = clearXSS(ds)
                    })
                    assert.strict.strictEqual(n.calls, 1000)
                    let set = new Set(r.map((v) => v.child))
                    assert.strict.strictEqual(set.size, 1)
                    assert.strict.strictEqual(r[99].child[999].s, fx)
                })
            })

            describe(`建構子與原型之效果: 依複本之終態清除(同修前)`, function() {
                it(`should clean the key a prototype setter creates while the clone is built`, function() {
                    class SetterContainer {
                        // eslint-disable-next-line accessor-pairs
                        set s(v) {
                            this.t = '<script>' + v + '</script>'
                        }
                    }
                    let o = new SetterContainer()
                    Object.defineProperty(o, 's', { value: 'safe', enumerable: true, writable: true, configurable: true })
                    let r = clearXSS({ k: o }).k
                    assert.ok(r instanceof SetterContainer)
                    assert.strict.strictEqual(r.t, '&lt;script>safe&lt;/script>')
                    assert.strict.deepStrictEqual(Object.keys(r), ['t'])
                    assert.strict.strictEqual(o.s, 'safe')
                })

                it(`should clean an index an Array subclass constructor adds beyond the source length`, function() {
                    class ExtendedArray extends Array {
                        constructor(n) {
                            super(n + 1)
                            this[n] = x
                        }
                    }
                    let a = new ExtendedArray(1)
                    a.length = 1
                    a[0] = 'safe'
                    let r = clearXSS({ k: a }).k
                    assert.strict.strictEqual(r.length, 2)
                    assert.strict.strictEqual(r[0], 'safe')
                    assert.strict.strictEqual(r[1], fx)
                })

                it(`should clean a hole of an Array subclass whose prototype provides the index`, function() {
                    class A extends Array {}
                    A.prototype[1] = x
                    let a = new A(3)
                    a[0] = 'a'
                    a[2] = 'c'
                    let r = clearXSS({ k: a }).k
                    assert.ok(r instanceof A)
                    assert.strict.deepStrictEqual([r[0], r[1], r[2]], ['a', fx, 'c'])
                })

                it(`should keep the own enumerable properties of a class instance whose prototype has an accessor of another name`, function() {
                    class B {
                        get v() {
                            return 1
                        }
                    }
                    let b = new B()
                    b.s = x
                    let r = clearXSS({ k: b }).k
                    assert.ok(r instanceof B)
                    assert.strict.strictEqual(r.s, fx)
                    assert.strict.strictEqual(r.v, 1)
                })

                it(`should clean the input of a RegExp match array and keep index and input`, function() {
                    let m = 'a<script>'.match(/a/)
                    let r = clearXSS({ k: m }).k
                    assert.ok(Array.isArray(r))
                    assert.strict.strictEqual(r.index, 0)
                    assert.strict.strictEqual(r.input, clearXSS('a<script>'))
                    assert.strict.strictEqual(m.input, 'a<script>')
                })

                it(`should keep the match array input cleaned for an Array subclass match array too`, function() {
                    class A extends Array {}
                    let a = A.from(['a<script>'])
                    a.index = 3
                    a.input = '<script>x'
                    let r = clearXSS({ k: a }).k
                    assert.strict.strictEqual(r.input, clearXSS('<script>x'))
                })
            })

            describe(`Map與Set補強`, function() {
                it(`should keep an object used as a Map key by reference (not cleaned, not copied) while its value is converted`, function() {
                    let key = { s: x }
                    let m = new Map([[key, key]])
                    let r = clearXSS({ m }).m
                    let ks = [...r.keys()]
                    assert.ok(ks.length === 1 && ks[0] === key)
                    assert.ok(r.has(key))
                    assert.strict.strictEqual(key.s, x)
                    assert.ok(r.get(key) !== key)
                    assert.strict.strictEqual(r.get(key).s, fx)
                })

                it(`should keep and clean the own enumerable properties of a Map or Set`, function() {
                    let m = new Map([['k', x]])
                    m.extra = { s: x }
                    m[Symbol.for('wsemi-test')] = x
                    let s = new Set([x])
                    s.extra = { s: x }
                    let r = clearXSS({ m, s })
                    assert.strict.strictEqual(r.m.get('k'), fx)
                    assert.strict.strictEqual(r.m.extra.s, fx)
                    assert.strict.strictEqual(r.m[Symbol.for('wsemi-test')], fx)
                    assert.ok(r.s.has(fx))
                    assert.strict.strictEqual(r.s.extra.s, fx)
                    assert.strict.strictEqual(m.extra.s, x)
                })

                it(`should keep the instance fields of a Map subclass`, function() {
                    class M3 extends Map {
                        constructor(...a) {
                            super(...a)
                            this.field = 'v'
                        }
                    }
                    let m = new M3([['k', x]])
                    m.other = x
                    let r = clearXSS({ m }).m
                    assert.ok(r instanceof M3)
                    assert.strict.strictEqual(r.field, 'v')
                    assert.strict.strictEqual(r.other, fx)
                    assert.strict.strictEqual(r.get('k'), fx)
                })

                it(`should merge Set elements that become equal after cleaning`, function() {
                    let r = clearXSS(new Set([x, fx, 'p']))
                    assert.strict.deepStrictEqual([...r], [fx, 'p'])
                })

                it(`should keep a Map and a Set with a writable own tag Object as they are`, function() {
                    let m = new Map([['k', x]])
                    Object.defineProperty(m, Symbol.toStringTag, { value: 'Object', writable: true, configurable: true })
                    let s = new Set([x])
                    Object.defineProperty(s, Symbol.toStringTag, { value: 'Object', writable: true, configurable: true })
                    let d = new Date(5)
                    Object.defineProperty(d, Symbol.toStringTag, { value: 'Object', writable: true, configurable: true })
                    let r = clearXSS({ m, s, d })
                    assert.ok(r.m instanceof Map && r.m.get('k') === fx)
                    assert.ok(r.s instanceof Set && r.s.has(fx))
                    assert.strict.strictEqual(r.d.getTime(), 5)
                })

                it(`should not treat an object that only fakes the Map tag with a writable tag as a Map`, function() {
                    //不可寫之偽標籤(如Object.defineProperty(o, Symbol.toStringTag, { value: 'Set' }))使lodash cloneDeep對其呼叫forEach而拋錯, 修前亦同, 不納入
                    let fakeMap = { s: x, [Symbol.toStringTag]: 'Map' }
                    let r
                    assert.doesNotThrow(() => {
                        r = clearXSS({ a: fakeMap })
                    })
                    assert.ok(!(r.a instanceof Map) && r.a !== fakeMap)
                    assert.strict.strictEqual(fakeMap.s, x)
                })

            })

            describe(`跨realm(iframe、vm)之物件`, function() {
                let ctx = (code) => vm.runInNewContext(code, {}, { timeout: 5000 })
                let src = `'<script>alert(1)</script>'`

                for (let [pos, put, get] of positions) {
                    it(`should clean the values of a Map from another realm ${pos}`, function() {
                        let m = ctx(`new Map([['k', ${src}], ['o', { s: ${src} }]])`)
                        assert.ok(!(m instanceof Map))
                        let r = get(clearXSS(put(m)))
                        assert.strict.strictEqual(r.get('k'), fx)
                        assert.strict.strictEqual(r.get('o').s, fx)
                        assert.strict.strictEqual(m.get('k'), x)
                    })

                    it(`should clean the elements of a Set from another realm ${pos}`, function() {
                        let s = ctx(`new Set([${src}, { s: ${src} }])`)
                        assert.ok(!(s instanceof Set))
                        let r = get(clearXSS(put(s)))
                        let es = [...r]
                        assert.strict.strictEqual(es[0], fx)
                        assert.strict.strictEqual(es[1].s, fx)
                    })

                    it(`should clean an object and an array from another realm ${pos}`, function() {
                        let o = ctx(`({ s: ${src}, a: [${src}, { t: ${src} }] })`)
                        let r = get(clearXSS(put(o)))
                        assert.strict.strictEqual(r.s, fx)
                        assert.strict.strictEqual(r.a[0], fx)
                        assert.strict.strictEqual(r.a[1].t, fx)
                        let a = ctx(`[${src}, { t: ${src} }]`)
                        let ra = get(clearXSS(put(a)))
                        assert.strict.strictEqual(ra[0], fx)
                        assert.strict.strictEqual(ra[1].t, fx)
                    })
                }
            })

            describe(`輸出屬性與共用`, function() {
                it(`should define an own __proto__ key as a writable, enumerable and configurable data property`, function() {
                    let t = JSON.parse('{"__proto__":{"a":"<script>alert(1)</script>"},"b":1}')
                    let r = clearXSS(t)
                    let d = Object.getOwnPropertyDescriptor(r, '__proto__')
                    assert.strict.strictEqual(d.writable, true)
                    assert.strict.strictEqual(d.enumerable, true)
                    assert.strict.strictEqual(d.configurable, true)
                    assert.strict.strictEqual(d.value.a, fx)
                    r.__proto__ = 5 // eslint-disable-line no-proto -- 可重新設定(自有資料屬性, 不改原型)
                    assert.strict.strictEqual(Object.getOwnPropertyDescriptor(r, '__proto__').value, 5)
                    assert.strict.strictEqual(Object.getPrototypeOf(r), Object.prototype)
                })

                it(`should clean a String object shared by many properties once, and obtain the options once per call`, function() {
                    let b = new String(x) // eslint-disable-line no-new-wrappers
                    let origOpt = fxss.getOpt
                    let nOpt = 0
                    fxss.getOpt = (...args) => {
                        nOpt++
                        return origOpt(...args)
                    }
                    let r
                    let n
                    try {
                        n = spy(() => {
                            r = clearXSS({ a: b, b, c: [b, b], d: { e: b }, f: x, g: x })
                        })
                    }
                    finally {
                        fxss.getOpt = origOpt
                    }
                    assert.strict.strictEqual(r.a, fx)
                    assert.strict.strictEqual(r.c[1], fx)
                    assert.strict.strictEqual(r.d.e, fx)
                    assert.strict.strictEqual(n.calls, 3) //b一次, 兩個原始字串各一次
                    assert.strict.strictEqual(n.gets, 1)
                    assert.strict.strictEqual(nOpt, 1)
                })
            })

        })

        describe(`字串之取得: 有字串須處理時才取得js-xss, 每次呼叫至多取得一次`, function() {

            it(`should not obtain js-xss for inputs without a string to clean`, function() {
                let inps = [1, null, undefined, true, '', { a: 1, b: [2, null, ''] }, [], new Date(0), new Map([['k', 1]]), new Set([2]), 10n, Symbol('s')]
                for (let v of inps) {
                    let n = spy(() => {
                        clearXSS(v)
                    })
                    assert.strict.strictEqual(n.gets, 0, String(typeof v))
                }
            })

            it(`should obtain js-xss once per call for any number of strings`, function() {
                let n = spy(() => {
                    clearXSS({ a: x, b: [x, x, x], c: new Map([['k', x]]), d: new Set([x]) })
                })
                assert.strict.strictEqual(n.gets, 1)
                assert.strict.strictEqual(n.calls, 6)
                let n2 = spy(() => {
                    clearXSS(x)
                })
                assert.strict.strictEqual(n2.gets, 1)
                assert.strict.strictEqual(n2.calls, 1)
            })

            it(`should call filterXSS in depth-first pre-order of the properties`, function() {
                let order = []
                let orig = fxss.getFilterXSS
                fxss.getFilterXSS = () => {
                    let f = orig()
                    let w = (c, o) => {
                        order.push(c)
                        return f(c, o)
                    }
                    w.escapeAttrValue = f.escapeAttrValue
                    return w
                }
                try {
                    clearXSS({ a: 's1', b: { c: 's2', d: ['s3', { e: 's4' }] }, f: 's5' })
                }
                finally {
                    fxss.getFilterXSS = orig
                }
                assert.strict.deepStrictEqual(order, ['s1', 's2', 's3', 's4', 's5'])
            })

        })

        describe(`極深、大型共用與大型循環於限額子行程`, function() {

            let runner = join(__dirname, 'tools', 'clearXssWalkRunner.mjs')
            let execArgv = ['--expose-gc', '--max-old-space-size=512']

            for (let kind of ['obj', 'arr', 'mixed', 'map', 'set']) {
                let n = (kind === 'map' || kind === 'set') ? 300000 : 1000000 //Map與Set每層配置較大(100萬層Map約444MB)
                it(`should clean the leaf of ${n} nested ${kind} levels within 5 s and 450 MB of heap`, function() {
                    let rc = runChildCase(runner, `deep:${kind}:${n}`, { execArgv, allowNoResult: true, timeout: 60000 })
                    assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal} stderr=${String(rc.stderr).split('\n').find((l) => /FATAL|Error/.test(l)) || ''}`)
                    assert.ok(rc.r !== null, 'no result line')
                    let r = rc.r
                    assert.ok(r.leafCleaned, 'leaf not cleaned')
                    assert.ok(r.inputIntact, 'input changed')
                    assert.ok(r.depthOut === n && r.depthIn === n, `depth out=${r.depthOut} in=${r.depthIn}`)
                    assert.ok(r.calls === 1, `calls=${r.calls}`)
                    assert.ok(r.ms < 5000, `ms=${r.ms}`)
                    assert.ok(r.heapMB < 450, `heapMB=${r.heapMB}`)
                })
            }

            for (let kind of ['obj', 'arr', 'map', 'set', 'mixed']) {
                it(`should clean ${kind} DAG of 1000 levels with one filterXSS call and keep every level shared`, function() {
                    let rc = runChildCase(runner, `dag:${kind}:1000`, { execArgv, allowNoResult: true, timeout: 30000 })
                    assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal}`)
                    assert.ok(rc.r !== null, 'no result line')
                    let r = rc.r
                    assert.strict.strictEqual(r.calls, 1)
                    assert.ok(r.shared, 'not shared')
                    assert.ok(r.steps >= 1000, `steps=${r.steps}`)
                    assert.ok(r.ms < 2000, `ms=${r.ms}`)
                })
            }

            it(`should clean a cycle of 1000000 nodes and close it`, function() {
                let rc = runChildCase(runner, `cycle:1000000`, { execArgv, allowNoResult: true, timeout: 60000 })
                assert.strict.strictEqual(rc.status, 0, `status=${rc.status} signal=${rc.signal}`)
                assert.ok(rc.r !== null, 'no result line')
                assert.ok(rc.r.cleaned && rc.r.closed && rc.r.inputIntact)
                assert.ok(rc.r.ms < 5000, `ms=${rc.r.ms}`)
            })

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
