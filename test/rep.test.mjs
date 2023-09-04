import assert from 'assert'
import rep from '../src/rep.mjs'


describe(`rep`, function() {

    it(`should return 'abcabc' when input 'abc', 2`, function() {
        let r = rep('abc', 2)
        assert.strict.deepStrictEqual(r, 'abcabc')
    })

    it(`should return '' when input 'abc', 0`, function() {
        let r = rep('abc', 0)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc', -1`, function() {
        let r = rep('abc', -1)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = rep('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = rep([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = rep({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = rep(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = rep(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = rep(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

})
