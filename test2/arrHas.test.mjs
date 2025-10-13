import assert from 'assert'
import arrHas from '../src/arrHas.mjs'


describe(`arrHas`, function() {

    it(`should return true when input [1, 2, 3, '4', 5, 'abc'], 2`, function() {
        let r = arrHas([1, 2, 3, '4', 5, 'abc'], 2)
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [1, 2, 3, '4', 5, 'abc'], 6`, function() {
        let r = arrHas([1, 2, 3, '4', 5, 'abc'], 6)
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input [1, 2, 3, '4', 5, 'abc'], [2]`, function() {
        let r = arrHas([1, 2, 3, '4', 5, 'abc'], [2])
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [1, 2, 3, '4', 5, 'abc'], [6]`, function() {
        let r = arrHas([1, 2, 3, '4', 5, 'abc'], [6])
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input [1, 2, 3, '4', 5, 'abc'], ['4', 2]`, function() {
        let r = arrHas([1, 2, 3, '4', 5, 'abc'], ['4', 2])
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [1, 2, 3, '4', 5, 'abc'], ['7', 6]`, function() {
        let r = arrHas([1, 2, 3, '4', 5, 'abc'], ['7', 6])
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input [1, true, 2, 3, '4', true, 5, 'abc'], true`, function() {
        let r = arrHas([1, true, 2, 3, '4', true, 5, 'abc'], true)
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [1, true, 2, 3, '4', true, 5, 'abc'], false`, function() {
        let r = arrHas([1, true, 2, 3, '4', true, 5, 'abc'], false)
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input [1, true, 2, 3, '4', true, 5, 'abc'], [true]`, function() {
        let r = arrHas([1, true, 2, 3, '4', true, 5, 'abc'], [true])
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [1, true, 2, 3, '4', true, 5, 'abc'], [false]`, function() {
        let r = arrHas([1, true, 2, 3, '4', true, 5, 'abc'], [false])
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' }`, function() {
        let r = arrHas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'opqr' }`, function() {
        let r = arrHas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'opqr' })
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }]`, function() {
        let r = arrHas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }])
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'opqr' }]`, function() {
        let r = arrHas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'opqr' }])
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }]`, function() {
        let r = arrHas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }])
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['7', { x: 'opqr' }]`, function() {
        let r = arrHas([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['7', { x: 'opqr' }])
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ''`, function() {
        let r = arrHas('')
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input []`, function() {
        let r = arrHas([])
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input {}`, function() {
        let r = arrHas({})
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input null`, function() {
        let r = arrHas(null)
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input undefined`, function() {
        let r = arrHas(undefined)
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input NaN`, function() {
        let r = arrHas(NaN)
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], ''`, function() {
        let r = arrHas([], '')
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], []`, function() {
        let r = arrHas([], [])
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], {}`, function() {
        let r = arrHas([], {})
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], null`, function() {
        let r = arrHas([], null)
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input [], undefined`, function() {
        let r = arrHas([], undefined)
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], ''`, function() {
        let r = arrHas(['abc'], '')
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], []`, function() {
        let r = arrHas(['abc'], [])
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], {}`, function() {
        let r = arrHas(['abc'], {})
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], null`, function() {
        let r = arrHas(['abc'], null)
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input ['abc'], undefined`, function() {
        let r = arrHas(['abc'], undefined)
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

})
