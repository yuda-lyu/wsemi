import assert from 'assert'
import cstr from '../src/cstr.mjs'


describe(`cstr`, function() {

    it(`should return 1.25 when input '1.25'`, function() {
        let r = cstr('1.25')
        assert.strict.deepStrictEqual(r, '1.25')
    })

    it(`should return 2.25 when input 2.25`, function() {
        let r = cstr(2.25)
        assert.strict.deepStrictEqual(r, '2.25')
    })

    it(`should return '' when input ''`, function() {
        let r = cstr('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = cstr([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = cstr({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = cstr(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = cstr(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = cstr(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

})
