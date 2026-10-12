import assert from 'assert'
import xss from 'xss'
import clearXSS from '../src/clearXSS.mjs'


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

})
