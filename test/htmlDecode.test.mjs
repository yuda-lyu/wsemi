import assert from 'assert'
import htmlDecode from '../src/htmlDecode.mjs'
import htmlEncode from '../src/htmlEncode.mjs'


describe(`htmlDecode`, function() {

    it(`should return 'foo&bar' when input 'foo&#x26;bar'`, function() {
        let r = htmlDecode('foo&#x26;bar')
        let rr = `foo&bar`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'foo © bar ≠ baz 𝌆 qux' bar &#x2260; baz &#x1D306; qux' when input 'foo &#xA9; bar &#x2260; baz &#x1D306; qux'`, function() {
        let r = htmlDecode('foo &#xA9; bar &#x2260; baz &#x1D306; qux')
        let rr = `foo © bar ≠ baz 𝌆 qux`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '<img src="x"" onerror="prompt(1)">' onerror=&#x22;prompt(1)&#x22;&#x3E;' when input '&#x3C;img src=&#x22;x&#x22;&#x22; onerror=&#x22;prompt(1)&#x22;&#x3E;'`, function() {
        let r = htmlDecode('&#x3C;img src=&#x22;x&#x22;&#x22; onerror=&#x22;prompt(1)&#x22;&#x3E;')
        let rr = `<img src="x"" onerror="prompt(1)">`
        assert.strict.deepStrictEqual(r, rr)
    })

    //he 2(純ESM, 具名匯出decode)代表字元: 具名實體、無分號之舊式實體、十六進位與十進位數值參照(含CJK、astral)、未知實體原樣保留
    it(`should return '&' when input '&amp;' and '<b>"x"</b>' when input '&lt;b&gt;&quot;x&quot;&lt;/b&gt;' (named entities)`, function() {
        assert.strict.deepStrictEqual(htmlDecode('&amp;'), '&')
        assert.strict.deepStrictEqual(htmlDecode('&lt;b&gt;&quot;x&quot;&lt;/b&gt;'), '<b>"x"</b>')
    })

    it(`should return U+00A9 U+00A0 U+2665 when input '&copy;&nbsp;&hearts;' (named entities beyond ASCII; expected value built from code points because U+00A0 is invisible in source)`, function() {
        let r = htmlDecode('&copy;&nbsp;&hearts;')
        let rr = String.fromCodePoint(0xA9, 0xA0, 0x2665)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '中文' when input '&#x4E2D;&#x6587;' or '&#20013;&#25991;' (hex and decimal references of CJK)`, function() {
        assert.strict.deepStrictEqual(htmlDecode('&#x4E2D;&#x6587;'), '中文')
        assert.strict.deepStrictEqual(htmlDecode('&#20013;&#25991;'), '中文')
    })

    it(`should return '😀' when input '&#x1F600;' or '&#128512;' (astral symbol)`, function() {
        assert.strict.deepStrictEqual(htmlDecode('&#x1F600;'), '😀')
        assert.strict.deepStrictEqual(htmlDecode('&#128512;'), '😀')
    })

    it(`should return '中文&測試' when input '中文&amp;測試' (raw non-ASCII kept, entity decoded)`, function() {
        let r = htmlDecode('中文&amp;測試')
        let rr = '中文&測試'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'a© b' when input 'a&copy b' (legacy entity without semicolon) and keep unknown '&zzz;' as is`, function() {
        assert.strict.deepStrictEqual(htmlDecode('a&copy b'), 'a© b')
        assert.strict.deepStrictEqual(htmlDecode('&zzz;'), '&zzz;')
    })

    it(`should decode '&#x80;' to the windows-1252 euro sign and '&#0;' to U+FFFD (HTML spec numeric reference table)`, function() {
        assert.strict.deepStrictEqual(htmlDecode('&#x80;'), String.fromCodePoint(0x20AC))
        assert.strict.deepStrictEqual(htmlDecode('&#0;'), String.fromCodePoint(0xFFFD))
    })

    it(`should pass opt to he: isAttributeValue keeps 'a&copy=1' as is while text mode gives 'a©=1', and strict throws on an unknown entity`, function() {
        assert.strict.deepStrictEqual(htmlDecode('a&copy=1', { isAttributeValue: true }), 'a&copy=1')
        assert.strict.deepStrictEqual(htmlDecode('a&copy=1'), 'a©=1')
        assert.throws(() => htmlDecode('&zzz;', { strict: true }), /Parse error/)
    })

    it(`should round trip: htmlDecode(htmlEncode(s)) equals s for mixed ASCII, CJK, astral, quotes and markup`, function() {
        let s = `foo © <b>中文</b> 😀 "q" & 's'`
        let r = htmlDecode(htmlEncode(s))
        assert.strict.deepStrictEqual(r, s)
    })

    it(`should return '25' when input '25'`, function() {
        let r = htmlDecode('25')
        let rr = '25'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '1.25' when input '1.25'`, function() {
        let r = htmlDecode('1.25')
        let rr = '1.25'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 2.25`, function() {
        let r = htmlDecode(2.25)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = htmlDecode('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = htmlDecode([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = htmlDecode({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = htmlDecode(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = htmlDecode(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = htmlDecode(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
