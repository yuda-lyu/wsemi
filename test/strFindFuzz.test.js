import assert from 'assert'
import strFindFuzz from '../src/strFindFuzz.mjs'


describe(`strFindFuzz`, function() {

    it(`should return 82 when input 'The Woodman(樵夫) set to work at once, and so...', 'Wodooman(樵夫)', true`, function() {
        let r = strFindFuzz('The Woodman(樵夫) set to work at once, and so...', 'Wodooman(樵夫)', true)
        assert.strict.deepEqual(r, 82)
    })

    it(`should return 41.333333333333336 when input 'Wodooman(樵夫)', 'The Woodman(樵夫) set to work at once, and so...', true`, function() {
        let r = strFindFuzz('Wodooman(樵夫)', 'The Woodman(樵夫) set to work at once, and so...', true)
        assert.strict.deepEqual(r, 41.333333333333336)
    })

    it(`should return true when input 'abcdef123中文測試', 'ef'`, function() {
        let r = strFindFuzz('abcdef123中文測試', 'ef')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input ['abc', 'def123', '中文測試'], 'ef'`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], 'ef')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input ['abc', 'def123', '中文測試'], '文'`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], '文')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input ['abc', 'def123', '中文測試'], 'xyz'`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], 'xyz')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc', 'def123', '中文測試'], '英'`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], '英')
        assert.strict.deepEqual(r, false)
    })

    it(`should return 100 when input 'abcdef123中文測試', 'ef', true`, function() {
        let r = strFindFuzz('abcdef123中文測試', 'ef', true)
        assert.strict.deepEqual(r, 100)
    })

    it(`should return 100 when input ['abc', 'def123', '中文測試'], 'ef', true`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], 'ef', true)
        assert.strict.deepEqual(r, 100)
    })

    it(`should return 50 when input ['abc', 'def123', '中文測試'], 'efgg', true`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], 'efgg', true)
        assert.strict.deepEqual(r, 50)
    })

    it(`should return 40 when input ['abc', 'def123', '中文測試'], 'efgg英', true`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], 'efgg英', true)
        assert.strict.deepEqual(r, 40)
    })

    it(`should return 25 when input ['abc', 'def123', '中文測試'], 'efgg 英', true`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], 'efgg 英', true)
        assert.strict.deepEqual(r, 25)
    })

    it(`should return 63 when input ['abc', 'def123', '中文測試'], 'efgg中文測試', true`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], 'efgg中文測試', true)
        assert.strict.deepEqual(r, 63)
    })

    it(`should return 75 when input ['abc', 'def123', '中文測試'], 'efgg 中文測試', true`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], 'efgg 中文測試', true)
        assert.strict.deepEqual(r, 75)
    })

    it(`should return 0 when input ['abc', 'def123', '中文測試'], 'xyz', true`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], 'xyz', true)
        assert.strict.deepEqual(r, 0)
    })

    it(`should return 0 when input ['abc', 'def123', '中文測試'], '英', true`, function() {
        let r = strFindFuzz(['abc', 'def123', '中文測試'], '英', true)
        assert.strict.deepEqual(r, 0)
    })

    it(`should return false when input '1.25'`, function() {
        let r = strFindFuzz('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 2.25`, function() {
        let r = strFindFuzz(2.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = strFindFuzz('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = strFindFuzz([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = strFindFuzz({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = strFindFuzz(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = strFindFuzz(undefined)
        assert.strict.deepEqual(r, false)
    })

})
