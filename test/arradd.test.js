import assert from 'assert'
import arradd from '../src/arradd.mjs'


describe(`arradd`, function() {

    it(`should return [1.1, 2.1, 3.1, 4.1] when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1]`, function() {
        let r = arradd([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1])
        let rr = [1.1, 2.1, 3.1, 4.1]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [3, 5] when input [1, 2], [2, 3]`, function() {
        let r = arradd([1, 2], [2, 3])
        let rr = [3, 5]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2]`, function() {
        let r = arradd([1, 2], [2])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3, 4]`, function() {
        let r = arradd([1, 2], [2, 3, 4])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, 2], [2, 3], [4, 5]`, function() {
        let r = arradd([1, 2], [2, 3], [4, 5])
        let rr = [7, 10]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5, 6]`, function() {
        let r = arradd([1, 2], [2, 3], [4, 5, 6])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4]`, function() {
        let r = arradd([1, 2], [2, 3], [4])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [13, 17] when input [1, 2], [2, 3], [4, 5], [6, 7]`, function() {
        let r = arradd([1, 2], [2, 3], [4, 5], [6, 7])
        let rr = [13, 17]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7, 8]`, function() {
        let r = arradd([1, 2], [2, 3], [4, 5], [6, 7, 8])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6]`, function() {
        let r = arradd([1, 2], [2, 3], [4, 5], [6])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [21, 26] when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9]`, function() {
        let r = arradd([1, 2], [2, 3], [4, 5], [6, 7], [8, 9])
        let rr = [21, 26]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10]`, function() {
        let r = arradd([1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7], [8]`, function() {
        let r = arradd([1, 2], [2, 3], [4, 5], [6, 7], [8])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, '2'], [2, 3], [4, 5]`, function() {
        let r = arradd([1, '2'], [2, 3], [4, 5])
        let rr = [7, 10]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, 2], ['2', 3], [4, 5]`, function() {
        let r = arradd([1, 2], ['2', 3], [4, 5])
        let rr = [7, 10]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, '2'], [2, '3'], [4, '5']`, function() {
        let r = arradd([1, '2'], [2, '3'], [4, '5'])
        let rr = [7, 10]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [7, 5] when input [1, 'a'], [2, 'b'], [4, '5']`, function() {
        let r = arradd([1, 'a'], [2, 'b'], [4, '5'])
        let rr = [7, 5]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arradd('')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arradd([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arradd({})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arradd(null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arradd(undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arradd([], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arradd([], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arradd([], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arradd([], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arradd([], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arradd(['abc'], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arradd(['abc'], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arradd(['abc'], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arradd(['abc'], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arradd(['abc'], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

})
