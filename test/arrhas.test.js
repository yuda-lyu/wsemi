import assert from 'assert'
import arrhas from '../src/arrhas.mjs'


describe(`arrhas`, function() {

    it(`should return true when input 'abc', 'abc'`, function() {
        let r = arrhas('abc', 'abc')
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input 'abc', 'bcd'`, function() {
        let r = arrhas('abc', 'bcd')
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return true when input 'abc', ['abc', 'bcd']`, function() {
        let r = arrhas('abc', ['abc', 'bcd'])
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input 'abc', ['xyz', 'bcd']`, function() {
        let r = arrhas('abc', ['xyz', 'bcd'])
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return true when input ['abc', 'bcd'], 'abc'`, function() {
        let r = arrhas(['abc', 'bcd'], 'abc')
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['xyz', 'bcd'], 'abc'`, function() {
        let r = arrhas(['xyz', 'bcd'], 'abc')
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return true when input ['abc', 'bcd'], ['abc', 'cde']`, function() {
        let r = arrhas(['abc', 'bcd'], ['abc', 'cde'])
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc', 'bcd'], ['xyz', 'cde']`, function() {
        let r = arrhas(['abc', 'bcd'], ['xyz', 'cde'])
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ''`, function() {
        let r = arrhas('')
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input []`, function() {
        let r = arrhas([])
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input {}`, function() {
        let r = arrhas({})
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input null`, function() {
        let r = arrhas(null)
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input undefined`, function() {
        let r = arrhas(undefined)
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], ''`, function() {
        let r = arrhas([], '')
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], []`, function() {
        let r = arrhas([], [])
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], {}`, function() {
        let r = arrhas([], {})
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], null`, function() {
        let r = arrhas([], null)
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], undefined`, function() {
        let r = arrhas([], undefined)
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], ''`, function() {
        let r = arrhas(['abc'], '')
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], []`, function() {
        let r = arrhas(['abc'], [])
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], {}`, function() {
        let r = arrhas(['abc'], {})
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], null`, function() {
        let r = arrhas(['abc'], null)
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], undefined`, function() {
        let r = arrhas(['abc'], undefined)
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

})
