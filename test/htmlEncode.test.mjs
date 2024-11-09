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
