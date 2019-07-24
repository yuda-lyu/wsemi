import assert from 'assert'
import addMonth from '../src/addMonth.mjs'


describe(`addMonth`, function() {

    it(`should return '2019-03' when input '2019-01',2`, function() {
        let r = addMonth('2019-01', 2)
        assert.strict.deepEqual(r, '2019-03')
    })

    it(`should return '2019-01' when input '2018-12',1`, function() {
        let r = addMonth('2018-12', 1)
        assert.strict.deepEqual(r, '2019-01')
    })

    it(`should return '2018-11' when input '2018-12',-1`, function() {
        let r = addMonth('2018-12', -1)
        assert.strict.deepEqual(r, '2018-11')
    })

    it(`should return '' when input 123.456,1`, function() {
        let r = addMonth(123.456, 1)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '123.456',1`, function() {
        let r = addMonth('123.456', 1)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '',1`, function() {
        let r = addMonth('', 1)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input [],1`, function() {
        let r = addMonth([], 1)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input {},1`, function() {
        let r = addMonth({}, 1)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input null,1`, function() {
        let r = addMonth(null, 1)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input undefined,1`, function() {
        let r = addMonth(undefined, 1)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input 123.456`, function() {
        let r = addMonth(123.456)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '123.456'`, function() {
        let r = addMonth('123.456')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = addMonth('')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = addMonth([])
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = addMonth({})
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = addMonth(null)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = addMonth(undefined)
        assert.strict.deepEqual(r, '')
    })

})
