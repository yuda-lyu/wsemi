import assert from 'assert'
import str2aes from '../src/str2aes.mjs'


describe(`str2aes`, function() {
    let str = 'test中文abcdefghijklmn'
    let key = '1234567890abcdefghijk'

    it(`sould return 96*char(hex) when input '${str}', '${key}'`, function() {
        let r = str2aes(str, key)
        let rr = 96
        assert.strict.deepStrictEqual(r.length, rr)
    })

    it(`sould return 64*char(base64) when input '${str}', '${key}', true`, function() {
        let r = str2aes(str, key, true)
        let rr = 64
        assert.strict.deepStrictEqual(r.length, rr)
    })

    it(`should return '' when input 12.34`, function() {
        let r = str2aes(12.34)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input [1, '3', 'abc']`, function() {
        let r = str2aes([1, '3', 'abc'])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input { a: 12.34, b: 'abc' }`, function() {
        let r = str2aes({ a: 12.34, b: 'abc' })
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = str2aes({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = str2aes('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = str2aes([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = str2aes({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = str2aes(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = str2aes(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = str2aes(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
