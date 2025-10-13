import assert from 'assert'
import strleft from '../src/strleft.mjs'


describe(`strleft`, function() {

    it(`sould return 'te' when input 'test中文', 2`, function() {
        let r = strleft('test中文', 2)
        let rr = 'te'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'test中文' when input 'test中文', 10`, function() {
        let r = strleft('test中文', 10)
        let rr = 'test中文'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 0`, function() {
        let r = strleft('test中文', 0)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', -1`, function() {
        let r = strleft('test中文', -1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', ''`, function() {
        let r = strleft('test中文', '')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', []`, function() {
        let r = strleft('test中文', [])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}`, function() {
        let r = strleft('test中文', {})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null`, function() {
        let r = strleft('test中文', null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', undefined`, function() {
        let r = strleft('test中文', undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = strleft('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strleft([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strleft({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strleft(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strleft(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input NaN`, function() {
        let r = strleft(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
