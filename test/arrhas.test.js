import assert from 'assert'
import arrhas from '../src/arrhas.mjs'


describe(`arrhas`, function() {

    it(`should return true when input [1, 2, 3, '4', 5, 'abc'], 2`, function() {
        let r = arrhas([1, 2, 3, '4', 5, 'abc'], 2)
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [1, 2, 3, '4', 5, 'abc'], 6`, function() {
        let r = arrhas([1, 2, 3, '4', 5, 'abc'], 6)
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return true when input [1, 2, 3, '4', 5, 'abc'], [2]`, function() {
        let r = arrhas([1, 2, 3, '4', 5, 'abc'], [2])
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [1, 2, 3, '4', 5, 'abc'], [6]`, function() {
        let r = arrhas([1, 2, 3, '4', 5, 'abc'], [6])
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return true when input [1, 2, 3, '4', 5, 'abc'], ['4', 2]`, function() {
        let r = arrhas([1, 2, 3, '4', 5, 'abc'], ['4', 2])
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [1, 2, 3, '4', 5, 'abc'], ['7', 6]`, function() {
        let r = arrhas([1, 2, 3, '4', 5, 'abc'], ['7', 6])
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return true when input [1, true, 2, 3, '4', true, 5, 'abc'], true`, function() {
        let r = arrhas([1, true, 2, 3, '4', true, 5, 'abc'], true)
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [1, true, 2, 3, '4', true, 5, 'abc'], false`, function() {
        let r = arrhas([1, true, 2, 3, '4', true, 5, 'abc'], false)
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return true when input [1, true, 2, 3, '4', true, 5, 'abc'], [true]`, function() {
        let r = arrhas([1, true, 2, 3, '4', true, 5, 'abc'], [true])
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [1, true, 2, 3, '4', true, 5, 'abc'], [false]`, function() {
        let r = arrhas([1, true, 2, 3, '4', true, 5, 'abc'], [false])
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return true when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' }`, function() {
        let r = arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' })
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'opqr' }`, function() {
        let r = arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'opqr' })
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return true when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }]`, function() {
        let r = arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }])
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'opqr' }]`, function() {
        let r = arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'opqr' }])
        let rr = false
        assert.strict.deepEqual(r, rr)
    })

    it(`should return true when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }]`, function() {
        let r = arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }])
        let rr = true
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['7', { x: 'opqr' }]`, function() {
        let r = arrhas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['7', { x: 'opqr' }])
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
