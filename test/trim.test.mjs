import assert from 'assert'
import trim from '../src/trim.mjs'


describe(`trim`, function() {

    it(`should return 'abc' when input ' abc '`, function() {
        let r = trim(' abc ')
        assert.strict.deepStrictEqual(r, 'abc')
    })

    it(`should return '中 文' when input ' 中 文 '`, function() {
        let r = trim(' 中 文 ')
        assert.strict.deepStrictEqual(r, '中 文')
    })

    it(`should return 'abc 中 文' when input ' abc 中 文 '`, function() {
        let r = trim(' abc 中 文 ')
        assert.strict.deepStrictEqual(r, 'abc 中 文')
    })

    it(`should return 'abc 中 文' when input ' abc 中 文'`, function() {
        let r = trim(' abc 中 文')
        assert.strict.deepStrictEqual(r, 'abc 中 文')
    })

    it(`should return 'abc 中 文' when input 'abc 中 文 '`, function() {
        let r = trim('abc 中 文 ')
        assert.strict.deepStrictEqual(r, 'abc 中 文')
    })

    it(`should return 'abc123' when input ' abc123 '`, function() {
        let r = trim(' abc123 ')
        assert.strict.deepStrictEqual(r, 'abc123')
    })

    it(`should return 'abc123' when input ' abc123 ', { excludeString: true }`, function() {
        let r = trim(' abc123 ', { excludeString: true })
        assert.strict.deepStrictEqual(r, '123')
    })

    it(`should return '123abc' when input ' 123abc ', { excludeString: true }`, function() {
        let r = trim(' 123abc ', { excludeString: true })
        assert.strict.deepStrictEqual(r, '123')
    })

    it(`should return 'a3b321c' when input ' a3b321c ', { excludeString: true }`, function() {
        let r = trim(' a3b321c ', { excludeString: true })
        assert.strict.deepStrictEqual(r, '3b321')
    })

    it(`should return '' when input ''`, function() {
        let r = trim('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = trim([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = trim({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = trim(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = trim(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = trim(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

})
