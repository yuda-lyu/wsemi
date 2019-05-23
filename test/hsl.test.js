import assert from 'assert'
import hsl from '../src/hsl.mjs'


describe(`hsl`, function() {

    it(`should return '#ffffff' when input 0, 0.5, 1`, function() {
        let r = hsl(0, 0.5, 1)
        let rr = '#ffffff'
        assert.strict.deepEqual(r, rr)
    })

    it(`should return '#bfaa40' when input 0.5, 0.5, 0.5`, function() {
        let r = hsl(0.5, 0.5, 0.5)
        let rr = '#bfaa40'
        assert.strict.deepEqual(r, rr)
    })

    it(`should return '#808080' when input 0.5, 0, 0.5`, function() {
        let r = hsl(0.5, 0, 0.5)
        let rr = '#808080'
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input '125'`, function() {
        let r = hsl('125')
        assert.strict.deepEqual(r, '')
    })

    it(`should return false when input 1.25`, function() {
        let r = hsl(1.25)
        assert.strict.deepEqual(r, '')
    })

    it(`should return false when input 0, 1.25`, function() {
        let r = hsl(0, 1.25)
        assert.strict.deepEqual(r, '')
    })

    it(`should return false when input 0, 0, 1.25`, function() {
        let r = hsl(0, 0, 1.25)
        assert.strict.deepEqual(r, '')
    })

    it(`should return false when input ''`, function() {
        let r = hsl('')
        assert.strict.deepEqual(r, '')
    })

    it(`should return false when input []`, function() {
        let r = hsl([])
        assert.strict.deepEqual(r, '')
    })

    it(`should return false when input {}`, function() {
        let r = hsl({})
        assert.strict.deepEqual(r, '')
    })

    it(`should return false when input null`, function() {
        let r = hsl(null)
        assert.strict.deepEqual(r, '')
    })

    it(`should return false when input undefined`, function() {
        let r = hsl(undefined)
        assert.strict.deepEqual(r, '')
    })

})
