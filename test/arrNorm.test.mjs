import assert from 'assert'
import arrNorm from '../src/arrNorm.mjs'


describe(`arrNorm`, function() {

    it(`should return 5.477225575051661 when input [1, 2, 3, 4]`, function() {
        let r = arrNorm([1, 2, 3, 4])
        let rr = 5.477225575051661
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.2 when input [0.1, 0.1, 0.1, 0.1]`, function() {
        let r = arrNorm([0.1, 0.1, 0.1, 0.1])
        let rr = 0.2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 60.249481325568276 when input [11, 22, 33, 44]`, function() {
        let r = arrNorm([11, 22, 33, 44])
        let rr = 60.249481325568276
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 5.477225575051661 when input [1, '2', 3, 4]`, function() {
        let r = arrNorm([1, '2', 3, 4])
        let rr = 5.477225575051661
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2.23606797749979 when input [1, '2', null, null]`, function() {
        let r = arrNorm([1, '2', null, null])
        let rr = 2.23606797749979
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = arrNorm('')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input []`, function() {
        let r = arrNorm([])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input {}`, function() {
        let r = arrNorm({})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = arrNorm(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input undefined`, function() {
        let r = arrNorm(undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], ''`, function() {
        let r = arrNorm([], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], []`, function() {
        let r = arrNorm([], [])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], {}`, function() {
        let r = arrNorm([], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], null`, function() {
        let r = arrNorm([], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], undefined`, function() {
        let r = arrNorm([], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], ''`, function() {
        let r = arrNorm(['abc'], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], []`, function() {
        let r = arrNorm(['abc'], [])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], {}`, function() {
        let r = arrNorm(['abc'], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], null`, function() {
        let r = arrNorm(['abc'], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], undefined`, function() {
        let r = arrNorm(['abc'], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

})
