import assert from 'assert'
import arrProduct from '../src/arrProduct.mjs'


describe(`arrProduct`, function() {

    it(`should return 1 when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1]`, function() {
        let r = arrProduct([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1])
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 33 when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44]`, function() {
        let r = arrProduct([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44])
        let rr = 33
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0.4 when input [1, '2', null, null], [0.1, 0.1, 0.1, null]`, function() {
        let r = arrProduct([1, '2', null, null], [0.1, 0.1, 0.1, null])
        let rr = 0.4
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 8 when input [1, 2], [2, 3]`, function() {
        let r = arrProduct([1, 2], [2, 3])
        let rr = 8
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2]`, function() {
        let r = arrProduct([1, 2], [2])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3, 4]`, function() {
        let r = arrProduct([1, 2], [2, 3, 4])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 38 when input [1, 2], [2, 3], [4, 5]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5])
        let rr = 38
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4, 5, 6]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5, 6])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 258 when input [1, 2], [2, 3], [4, 5], [6, 7]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6, 7])
        let rr = 258
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4, 5], [6, 7, 8]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6, 7, 8])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4, 5], [6]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2274 when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6, 7], [8, 9])
        let rr = 2274
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [1, 2], [2, 3], [4, 5], [6, 7], [8]`, function() {
        let r = arrProduct([1, 2], [2, 3], [4, 5], [6, 7], [8])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 38 when input [1, '2'], [2, 3], [4, 5]`, function() {
        let r = arrProduct([1, '2'], [2, 3], [4, 5])
        let rr = 38
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 38 when input [1, 2], ['2', 3], [4, 5]`, function() {
        let r = arrProduct([1, 2], ['2', 3], [4, 5])
        let rr = 38
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 38 when input [1, '2'], [2, '3'], [4, '5']`, function() {
        let r = arrProduct([1, '2'], [2, '3'], [4, '5'])
        let rr = 38
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 13 when input [1, 'a'], [2, 'b'], [4, '5']`, function() {
        let r = arrProduct([1, 'a'], [2, 'b'], [4, '5'])
        let rr = 13
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = arrProduct('')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input []`, function() {
        let r = arrProduct([])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input {}`, function() {
        let r = arrProduct({})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = arrProduct(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input undefined`, function() {
        let r = arrProduct(undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input NaN`, function() {
        let r = arrProduct(NaN)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], ''`, function() {
        let r = arrProduct([], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], []`, function() {
        let r = arrProduct([], [])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], {}`, function() {
        let r = arrProduct([], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], null`, function() {
        let r = arrProduct([], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [], undefined`, function() {
        let r = arrProduct([], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], ''`, function() {
        let r = arrProduct(['abc'], '')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], []`, function() {
        let r = arrProduct(['abc'], [])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], {}`, function() {
        let r = arrProduct(['abc'], {})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], null`, function() {
        let r = arrProduct(['abc'], null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc'], undefined`, function() {
        let r = arrProduct(['abc'], undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

})
