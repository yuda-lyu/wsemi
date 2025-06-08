import assert from 'assert'
import htmlDecode from '../src/htmlDecode.mjs'


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
