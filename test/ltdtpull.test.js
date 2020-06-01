import assert from 'assert'
import ltdtpull from '../src/ltdtpull.mjs'


describe(`ltdtpull`, function() {

    it(`should return [ { x: 2, y: 'y2' } ] when input [{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x'`, function() {
        let r = ltdtpull([{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x')
        let rr = [{ x: 2, y: 'y2' }]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [ { id: 2, v: 'v2' } ] when input [{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [{ id: 1, v: '-v1' }, { id: 3, v: '-v3' }], 'id'`, function() {
        let r = ltdtpull([{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [{ id: 1, v: '-v1' }, { id: 3, v: '-v3' }], 'id')
        let rr = [{ id: 2, v: 'v2' }]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [ { id: 2, v: 'v2' } ] when input [{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [], 'id'`, function() {
        let r = ltdtpull([{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }], [], 'id')
        let rr = [{ id: 1, v: 'v1' }, { id: 2, v: 'v2' }, { id: 3, v: 'v3' }]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = ltdtpull('')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = ltdtpull([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = ltdtpull({})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = ltdtpull(null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = ltdtpull(undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = ltdtpull([], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = ltdtpull([], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = ltdtpull([], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = ltdtpull([], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = ltdtpull([], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = ltdtpull(['abc'], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = ltdtpull(['abc'], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = ltdtpull(['abc'], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = ltdtpull(['abc'], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = ltdtpull(['abc'], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

})
