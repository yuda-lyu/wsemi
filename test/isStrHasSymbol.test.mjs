import assert from 'assert'
import isStrHasSymbol from '../src/isStrHasSymbol.mjs'


describe(`isStrHasSymbol`, function() {

    it(`should return true when input 'abc@125'`, function() {
        let r = isStrHasSymbol('abc@125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'abc!def'`, function() {
        let r = isStrHasSymbol('abc!def')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a#b'`, function() {
        let r = isStrHasSymbol('a#b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a$b'`, function() {
        let r = isStrHasSymbol('a$b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a%b'`, function() {
        let r = isStrHasSymbol('a%b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a^b'`, function() {
        let r = isStrHasSymbol('a^b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a&b'`, function() {
        let r = isStrHasSymbol('a&b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a*b'`, function() {
        let r = isStrHasSymbol('a*b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a(b'`, function() {
        let r = isStrHasSymbol('a(b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a)b'`, function() {
        let r = isStrHasSymbol('a)b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a-b'`, function() {
        let r = isStrHasSymbol('a-b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a_b'`, function() {
        let r = isStrHasSymbol('a_b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a=b'`, function() {
        let r = isStrHasSymbol('a=b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a+b'`, function() {
        let r = isStrHasSymbol('a+b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a[b'`, function() {
        let r = isStrHasSymbol('a[b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a{b'`, function() {
        let r = isStrHasSymbol('a{b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a|b'`, function() {
        let r = isStrHasSymbol('a|b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a;b'`, function() {
        let r = isStrHasSymbol('a;b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a:b'`, function() {
        let r = isStrHasSymbol('a:b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a,b'`, function() {
        let r = isStrHasSymbol('a,b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a.b'`, function() {
        let r = isStrHasSymbol('a.b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a?b'`, function() {
        let r = isStrHasSymbol('a?b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a~b'`, function() {
        let r = isStrHasSymbol('a~b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a<b'`, function() {
        let r = isStrHasSymbol('a<b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a>b'`, function() {
        let r = isStrHasSymbol('a>b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a/b'`, function() {
        let r = isStrHasSymbol('a/b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a\\\\b' (backslash)`, function() {
        let r = isStrHasSymbol('a\\b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input "a'b" (single quote)`, function() {
        let r = isStrHasSymbol("a'b")
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a"b' (double quote)`, function() {
        let r = isStrHasSymbol('a"b')
        assert.strict.deepStrictEqual(r, true)
    })

    it('should return true when input `a`b` (backtick)', function() {
        let r = isStrHasSymbol('a`b')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isStrHasSymbol('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abcdef'`, function() {
        let r = isStrHasSymbol('abcdef')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '123456'`, function() {
        let r = isStrHasSymbol('123456')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC'`, function() {
        let r = isStrHasSymbol('ABC')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '中文'`, function() {
        let r = isStrHasSymbol('中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isStrHasSymbol('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isStrHasSymbol(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isStrHasSymbol([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isStrHasSymbol({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isStrHasSymbol(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isStrHasSymbol(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isStrHasSymbol(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
