import assert from 'assert'
import cdbl from '../src/cdbl.mjs'


describe(`cdbl`, function() {

    it(`should return 1.25 when input '25'`, function() {
        let r = cdbl('25')
        assert.strict.deepStrictEqual(r, 25)
    })

    it(`should return 1.25 when input '1.25'`, function() {
        let r = cdbl('1.25')
        assert.strict.deepStrictEqual(r, 1.25)
    })

    it(`should return 2.25 when input 2.25`, function() {
        let r = cdbl(2.25)
        assert.strict.deepStrictEqual(r, 2.25)
    })

    it(`should return '' when input ''`, function() {
        let r = cdbl('')
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input []`, function() {
        let r = cdbl([])
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input {}`, function() {
        let r = cdbl({})
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input null`, function() {
        let r = cdbl(null)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input undefined`, function() {
        let r = cdbl(undefined)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input NaN`, function() {
        let r = cdbl(NaN)
        assert.strict.deepStrictEqual(r, 0)
    })

})
