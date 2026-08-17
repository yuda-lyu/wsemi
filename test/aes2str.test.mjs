import assert from 'assert'
import aes2str from '../src/aes2str.mjs'


describe(`aes2str`, function() {
    let k
    let o = {}

    let str = 'test中文abcdefghijklmn'
    let key = '1234567890abcdefghijk'

    k = 1
    o[k] = '53616c7465645f5f47214797ac01bc03cceb69ebced4948501ab94ca9644a6dfd277456aead4432cb9c9d74c38c42c79'
    it(`sould return '${str}' when input '${o[k]}', '${key}'`, function() {
        k = 1
        let r = aes2str(o[k], key)
        let rr = str
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = 'U2FsdGVkX1+5XAjQqzPU2AEJP8064+DXmzZsyWbJVW2r9vDhDIn5kL074yCK/uPp'
    it(`sould return '${str}' when input '${o[k]}', '${key}', true`, function() {
        k = 2
        let r = aes2str(o[k], key, true)
        let rr = str
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould fallback base64 to false when base64 is an invalid type`, function() {
        //base64非布林值時回退為false, 即視來源為hex, 結果須等同明確傳false
        for (let v of ['', [], {}, null, 1]) {
            let r = aes2str(o[1], key, v)
            assert.strict.deepStrictEqual(r, str)
        }
    })

    it(`should return '' when key is an invalid type`, function() {
        assert.strict.deepStrictEqual(aes2str(o[1], ''), '')
        assert.strict.deepStrictEqual(aes2str(o[1], []), '')
        assert.strict.deepStrictEqual(aes2str(o[1], {}), '')
        assert.strict.deepStrictEqual(aes2str(o[1], null), '')
        assert.strict.deepStrictEqual(aes2str(o[1], undefined), '')
    })

    it(`should return '' when input 12.34`, function() {
        let r = aes2str(12.34)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input [1, '3', 'abc']`, function() {
        let r = aes2str([1, '3', 'abc'])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input { a: 12.34, b: 'abc' }`, function() {
        let r = aes2str({ a: 12.34, b: 'abc' })
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = aes2str({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = aes2str('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = aes2str([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = aes2str({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = aes2str(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = aes2str(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = aes2str(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
