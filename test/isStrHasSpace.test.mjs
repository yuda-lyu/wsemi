import assert from 'assert'
import isStrHasSpace from '../src/isStrHasSpace.mjs'


describe(`isStrHasSpace`, function() {

    it(`should return true when input 'abc 125'`, function() {
        let r = isStrHasSpace('abc 125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input ' abc'`, function() {
        let r = isStrHasSpace(' abc')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'abc '`, function() {
        let r = isStrHasSpace('abc ')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input ' '`, function() {
        let r = isStrHasSpace(' ')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a\\tb' (tab)`, function() {
        let r = isStrHasSpace('a\tb')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a\\nb' (newline)`, function() {
        let r = isStrHasSpace('a\nb')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isStrHasSpace('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abcdef'`, function() {
        let r = isStrHasSpace('abcdef')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '123456'`, function() {
        let r = isStrHasSpace('123456')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '!@#$%^'`, function() {
        let r = isStrHasSpace('!@#$%^')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '中文'`, function() {
        let r = isStrHasSpace('中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isStrHasSpace('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isStrHasSpace(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isStrHasSpace([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isStrHasSpace({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isStrHasSpace(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isStrHasSpace(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isStrHasSpace(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
