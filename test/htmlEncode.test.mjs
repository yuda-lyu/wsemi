import assert from 'assert'
import htmlEncode from '../src/htmlEncode.mjs'


describe(`htmlEncode`, function() {

    it(`should return 'foo&#x26;bar' when input 'foo&bar'`, function() {
        let r = htmlEncode('foo&bar')
        let rr = `foo&#x26;bar`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'foo &#xA9; bar &#x2260; baz &#x1D306; qux' when input 'foo © bar ≠ baz 𝌆 qux'`, function() {
        let r = htmlEncode('foo © bar ≠ baz 𝌆 qux')
        let rr = `foo &#xA9; bar &#x2260; baz &#x1D306; qux`
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '&#x3C;img src=&#x22;x&#x22;&#x22; onerror=&#x22;prompt(1)&#x22;&#x3E;' when input '<img src="x"" onerror="prompt(1)">'`, function() {
        let r = htmlEncode('<img src="x"" onerror="prompt(1)">')
        let rr = `&#x3C;img src=&#x22;x&#x22;&#x22; onerror=&#x22;prompt(1)&#x22;&#x3E;`
        assert.strict.deepStrictEqual(r, rr)
    })

    //he 2(純ESM, 具名匯出encode)代表字元: 非ASCII(CJK、日文、astral)一律轉十六進位數值參照, 已是實體之&本身再轉義, 引號與反引號轉義
    it(`should return '&#x4E2D;&#x6587;&#x6E2C;&#x8A66;' when input '中文測試' (non-ASCII BMP characters become hex references)`, function() {
        let r = htmlEncode('中文測試')
        let rr = '&#x4E2D;&#x6587;&#x6E2C;&#x8A66;'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '&#x65E5;&#x672C;&#x8A9E;&#x3C;b&#x3E;' when input '日本語<b>' (non-ASCII and markup characters in one string)`, function() {
        let r = htmlEncode('日本語<b>')
        let rr = '&#x65E5;&#x672C;&#x8A9E;&#x3C;b&#x3E;'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '&#x1F600;' when input '😀' (astral symbol is one reference, not two surrogates)`, function() {
        let r = htmlEncode('😀')
        let rr = '&#x1F600;'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '&#x26;amp;' when input '&amp;' (an existing entity is escaped, not kept)`, function() {
        let r = htmlEncode('&amp;')
        let rr = '&#x26;amp;'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '&#x22;&#x27;&#x60;' when input '"\\'\`' (double quote, single quote and backtick)`, function() {
        let r = htmlEncode(`"'\``)
        let rr = '&#x22;&#x27;&#x60;'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should pass opt to he: useNamedReferences gives '&copy;', decimal gives '&#169;', encodeEverything also encodes printable ASCII, allowUnsafeSymbols keeps '<'`, function() {
        assert.strict.deepStrictEqual(htmlEncode('©', { useNamedReferences: true }), '&copy;')
        assert.strict.deepStrictEqual(htmlEncode('©', { decimal: true }), '&#169;')
        assert.strict.deepStrictEqual(htmlEncode('a', { encodeEverything: true }), '&#x61;')
        assert.strict.deepStrictEqual(htmlEncode('<中', { allowUnsafeSymbols: true }), '<&#x4E2D;')
    })

    it(`should return '25' when input '25'`, function() {
        let r = htmlEncode('25')
        let rr = '25'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '1.25' when input '1.25'`, function() {
        let r = htmlEncode('1.25')
        let rr = '1.25'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 2.25`, function() {
        let r = htmlEncode(2.25)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = htmlEncode('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = htmlEncode([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = htmlEncode({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = htmlEncode(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = htmlEncode(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = htmlEncode(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
