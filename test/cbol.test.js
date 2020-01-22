import assert from 'assert'
import cbol from '../src/cbol.mjs'


describe(`cbol`, function() {

    it(`should return true when input true`, function() {
        let r = cbol(true)
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input false`, function() {
        let r = cbol(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = cbol(0)
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input 1`, function() {
        let r = cbol(1)
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 'true'`, function() {
        let r = cbol('true')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 'tRuE'`, function() {
        let r = cbol('tRuE')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 'TRUE'`, function() {
        let r = cbol('TRUE')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input 'abc'`, function() {
        let r = cbol('abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = cbol('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = cbol([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = cbol({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = cbol(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = cbol(undefined)
        assert.strict.deepEqual(r, false)
    })

})
