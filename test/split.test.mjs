import assert from 'assert'
import split from '../src/split.mjs'


describe(`split`, function() {

    it(`should return ['1.25', 'abc', '', '中文'] when input '1.25 abc  中文', ' '`, function() {
        let r = split('1.25 abc  中文', ' ')
        assert.strict.deepStrictEqual(r, ['1.25', 'abc', '', '中文'])
    })

    it(`should return ['1.25', 'abc', '中文'] when input '1.25 abc 中文', ' '`, function() {
        let r = split('1.25 abc 中文', ' ')
        assert.strict.deepStrictEqual(r, ['1.25', 'abc', '中文'])
    })

    it(`should return ['1.25', 'abc', '中文'] when input '1.25*abc*中文', '*'`, function() {
        let r = split('1.25*abc*中文', '*')
        assert.strict.deepStrictEqual(r, ['1.25', 'abc', '中文'])
    })

    it(`should return [] when input '1.25 abc 中文', ''`, function() {
        let r = split('1.25 abc 中文', '')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input '1.25 abc 中文', []`, function() {
        let r = split('1.25 abc 中文', [])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input '1.25 abc 中文', {}`, function() {
        let r = split('1.25 abc 中文', {})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input '1.25 abc 中文', null`, function() {
        let r = split('1.25 abc 中文', null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input '1.25 abc 中文', undefined`, function() {
        let r = split('1.25 abc 中文', undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input ''`, function() {
        let r = split('')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input []`, function() {
        let r = split([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}`, function() {
        let r = split({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null`, function() {
        let r = split(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined`, function() {
        let r = split(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input NaN`, function() {
        let r = split(NaN)
        assert.strict.deepStrictEqual(r, [])
    })

})
