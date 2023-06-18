import assert from 'assert'
import sep from '../src/sep.mjs'


describe(`sep`, function() {

    it(`should return ['1.25', 'abc', 中文'] when input '1.25 abc  中文', ' '`, function() {
        let r = sep('1.25 abc  中文', ' ')
        assert.strict.deepStrictEqual(r, ['1.25', 'abc', '中文'])
    })

    it(`should return ['1.25', 'abc', '中文'] when input '1.25 abc 中文', ' '`, function() {
        let r = sep('1.25 abc 中文', ' ')
        assert.strict.deepStrictEqual(r, ['1.25', 'abc', '中文'])
    })

    it(`should return ['1.25', 'abc', '中文'] when input '1.25*abc*中文', '*'`, function() {
        let r = sep('1.25*abc*中文', '*')
        assert.strict.deepStrictEqual(r, ['1.25', 'abc', '中文'])
    })

    it(`should return [] when input '1.25 abc 中文', ''`, function() {
        let r = sep('1.25 abc 中文', '')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input '1.25 abc 中文', []`, function() {
        let r = sep('1.25 abc 中文', [])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input '1.25 abc 中文', {}`, function() {
        let r = sep('1.25 abc 中文', {})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input '1.25 abc 中文', null`, function() {
        let r = sep('1.25 abc 中文', null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input '1.25 abc 中文', undefined`, function() {
        let r = sep('1.25 abc 中文', undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ''`, function() {
        let r = sep('')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input []`, function() {
        let r = sep([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}`, function() {
        let r = sep({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null`, function() {
        let r = sep(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined`, function() {
        let r = sep(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

})
