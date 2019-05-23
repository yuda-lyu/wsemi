import assert from 'assert'
import fuzzfind from '../src/fuzzfind.mjs'


describe(`fuzzfind`, function() {

    it(`should return true when input ['abc', 'def123', '中文測試'], 'ef'`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], 'ef')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input ['abc', 'def123', '中文測試'], '文'`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], '文')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input ['abc', 'def123', '中文測試'], 'xyz'`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], 'xyz')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc', 'def123', '中文測試'], '英'`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], '英')
        assert.strict.deepEqual(r, false)
    })

    it(`should return 100 when input ['abc', 'def123', '中文測試'], 'ef', true`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], 'ef', true)
        assert.strict.deepEqual(r, 100)
    })

    it(`should return 50 when input ['abc', 'def123', '中文測試'], 'efgg', true`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], 'efgg', true)
        assert.strict.deepEqual(r, 50)
    })

    it(`should return 40 when input ['abc', 'def123', '中文測試'], 'efgg英', true`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], 'efgg英', true)
        assert.strict.deepEqual(r, 40)
    })

    it(`should return 25 when input ['abc', 'def123', '中文測試'], 'efgg 英', true`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], 'efgg 英', true)
        assert.strict.deepEqual(r, 25)
    })

    it(`should return 63 when input ['abc', 'def123', '中文測試'], 'efgg中文測試', true`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], 'efgg中文測試', true)
        assert.strict.deepEqual(r, 63)
    })

    it(`should return 75 when input ['abc', 'def123', '中文測試'], 'efgg 中文測試', true`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], 'efgg 中文測試', true)
        assert.strict.deepEqual(r, 75)
    })

    it(`should return 0 when input ['abc', 'def123', '中文測試'], 'xyz', true`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], 'xyz', true)
        assert.strict.deepEqual(r, 0)
    })

    it(`should return 0 when input ['abc', 'def123', '中文測試'], '英', true`, function() {
        let r = fuzzfind(['abc', 'def123', '中文測試'], '英', true)
        assert.strict.deepEqual(r, 0)
    })

    it(`should return false when input '1.25'`, function() {
        let r = fuzzfind('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 2.25`, function() {
        let r = fuzzfind(2.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = fuzzfind('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = fuzzfind([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = fuzzfind({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = fuzzfind(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = fuzzfind(undefined)
        assert.strict.deepEqual(r, false)
    })

})
