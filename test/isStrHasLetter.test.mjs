import assert from 'assert'
import isStrHasLetter from '../src/isStrHasLetter.mjs'


describe(`isStrHasLetter`, function() {

    it(`should return true when input 'abc125'`, function() {
        let r = isStrHasLetter('abc125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'ABC125'`, function() {
        let r = isStrHasLetter('ABC125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'abcdef'`, function() {
        let r = isStrHasLetter('abcdef')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'ABCDEF'`, function() {
        let r = isStrHasLetter('ABCDEF')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'aBcDeF'`, function() {
        let r = isStrHasLetter('aBcDeF')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a'`, function() {
        let r = isStrHasLetter('a')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'Z'`, function() {
        let r = isStrHasLetter('Z')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '中文abc'`, function() {
        let r = isStrHasLetter('中文abc')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '123456'`, function() {
        let r = isStrHasLetter('123456')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '!@#$%^'`, function() {
        let r = isStrHasLetter('!@#$%^')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '中文'`, function() {
        let r = isStrHasLetter('中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01'`, function() {
        let r = isStrHasLetter('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isStrHasLetter('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isStrHasLetter(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isStrHasLetter([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isStrHasLetter({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isStrHasLetter(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isStrHasLetter(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isStrHasLetter(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
