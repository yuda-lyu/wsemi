import assert from 'assert'
import getTimeFromUnit from '../src/getTimeFromUnit.mjs'


describe(`getTimeFromUnit`, function() {

    it(`should return 'YYYY' when input 'years'`, function() {
        let r = getTimeFromUnit('years')
        let rr = 'YYYY'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'YYYY-MM' when input 'months'`, function() {
        let r = getTimeFromUnit('months')
        let rr = 'YYYY-MM'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'YYYY-MM-DD' when input 'days'`, function() {
        let r = getTimeFromUnit('days')
        let rr = 'YYYY-MM-DD'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'YYYY-MM-DDTHH' when input 'hours'`, function() {
        let r = getTimeFromUnit('hours')
        let rr = 'YYYY-MM-DDTHH'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'YYYY-MM-DDTHH:mm' when input 'minutes'`, function() {
        let r = getTimeFromUnit('minutes')
        let rr = 'YYYY-MM-DDTHH:mm'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'YYYY-MM-DDTHH:mm:ssZ' when input 'seconds'`, function() {
        let r = getTimeFromUnit('seconds')
        let rr = 'YYYY-MM-DDTHH:mm:ss'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = getTimeFromUnit('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = getTimeFromUnit([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = getTimeFromUnit({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = getTimeFromUnit(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = getTimeFromUnit(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = getTimeFromUnit(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
