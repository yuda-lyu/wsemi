import assert from 'assert'
import trim from '../src/trim.mjs'


describe(`trim`, function() {

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

})
