import assert from 'assert'
import getBufferSize from '../src/getBufferSize.mjs'


describe(`getBufferSize`, function() {

    it(`should return 4 when input new Uint8Array([1, 2, 3, 123])`, function() {
        let r = getBufferSize(new Uint8Array([1, 2, 3, 123]))
        let rr = 4
        assert.strict.deepEqual(r, rr)
    })

    it(`should return 0 when input ''`, function() {
        let r = getBufferSize('')
        let rr = null
        assert.strict.deepEqual(r, rr)
    })

    it(`should return 0 when input []`, function() {
        let r = getBufferSize([])
        let rr = null
        assert.strict.deepEqual(r, rr)
    })

    it(`should return 0 when input {}`, function() {
        let r = getBufferSize({})
        let rr = null
        assert.strict.deepEqual(r, rr)
    })

    it(`should return 0 when input null`, function() {
        let r = getBufferSize(null)
        let rr = null
        assert.strict.deepEqual(r, rr)
    })

    it(`should return 0 when input undefined`, function() {
        let r = getBufferSize(undefined)
        let rr = null
        assert.strict.deepEqual(r, rr)
    })

})
