import assert from 'assert'
import genID from '../src/genID.mjs'


describe(`genID`, function() {

    it(`should length eq. 32 return true when no input`, function() {
        let r = genID()
        assert.strict.deepStrictEqual(r.length, 32)
    })

    it(`should return '' when input '100abc'`, function() {
        let r = genID('100abc')
        assert.strict.deepStrictEqual(r.length, 32)
    })

    it(`should return '' when input ''`, function() {
        let r = genID('')
        assert.strict.deepStrictEqual(r.length, 32)
    })

    it(`should return '' when input []`, function() {
        let r = genID([])
        assert.strict.deepStrictEqual(r.length, 32)
    })

    it(`should return '' when input {}`, function() {
        let r = genID({})
        assert.strict.deepStrictEqual(r.length, 32)
    })

    it(`should return '' when input null`, function() {
        let r = genID(null)
        assert.strict.deepStrictEqual(r.length, 32)
    })

    it(`should length eq. 32 return true when input undefined`, function() {
        let r = genID(undefined)
        assert.strict.deepStrictEqual(r.length, 32)
    })

    it(`should length eq. 32 return true when input NaN`, function() {
        let r = genID(NaN)
        assert.strict.deepStrictEqual(r.length, 32)
    })

})
