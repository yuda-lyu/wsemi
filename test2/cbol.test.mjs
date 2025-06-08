import assert from 'assert'
import cbol from '../src/cbol.mjs'


describe(`cbol`, function() {

    it(`should return true when input true`, function() {
        let r = cbol(true)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input false`, function() {
        let r = cbol(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = cbol(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 1`, function() {
        let r = cbol(1)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'true'`, function() {
        let r = cbol('true')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'tRuE'`, function() {
        let r = cbol('tRuE')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'TRUE'`, function() {
        let r = cbol('TRUE')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'abc'`, function() {
        let r = cbol('abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = cbol('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = cbol([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = cbol({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = cbol(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = cbol(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = cbol(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
