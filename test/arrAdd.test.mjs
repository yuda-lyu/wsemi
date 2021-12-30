import assert from 'assert'
import arrAdd from '../src/arrAdd.mjs'


describe(`arrAdd`, function() {

    it(`should return [1.1, 2.1, 3.1, 4.1] when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1]`, function() {
        let r = arrAdd([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1])
        let rr = [1.1, 2.1, 3.1, 4.1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [12.1, 24.1, 36.1, 48.1] when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44]`, function() {
        let r = arrAdd([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44])
        let rr = [12.1, 24.1, 36.1, 48.1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1.1, 2.1, 0.1, null] when input [1, '2', null, null], [0.1, 0.1, 0.1, null]`, function() {
        let r = arrAdd([1, '2', null, null], [0.1, 0.1, 0.1, null])
        let rr = [1.1, 2.1, 0.1, null]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [3, 5] when input [1, 2], [2, 3]`, function() {
        let r = arrAdd([1, 2], [2, 3])
        let rr = [3, 5]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2]`, function() {
        let r = arrAdd([1, 2], [2])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3, 4]`, function() {
        let r = arrAdd([1, 2], [2, 3, 4])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, 2], [2, 3], [4, 5]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5])
        let rr = [7, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5, 6]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5, 6])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [13, 17] when input [1, 2], [2, 3], [4, 5], [6, 7]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6, 7])
        let rr = [13, 17]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7, 8]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6, 7, 8])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [21, 26] when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6, 7], [8, 9])
        let rr = [21, 26]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7], [8]`, function() {
        let r = arrAdd([1, 2], [2, 3], [4, 5], [6, 7], [8])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, '2'], [2, 3], [4, 5]`, function() {
        let r = arrAdd([1, '2'], [2, 3], [4, 5])
        let rr = [7, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, 2], ['2', 3], [4, 5]`, function() {
        let r = arrAdd([1, 2], ['2', 3], [4, 5])
        let rr = [7, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [7, 10] when input [1, '2'], [2, '3'], [4, '5']`, function() {
        let r = arrAdd([1, '2'], [2, '3'], [4, '5'])
        let rr = [7, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [7, 5] when input [1, 'a'], [2, 'b'], [4, '5']`, function() {
        let r = arrAdd([1, 'a'], [2, 'b'], [4, '5'])
        let rr = [7, 5]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrAdd('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrAdd([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrAdd({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrAdd(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrAdd(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrAdd([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrAdd([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrAdd([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrAdd([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrAdd([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrAdd(['abc'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrAdd(['abc'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrAdd(['abc'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrAdd(['abc'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrAdd(['abc'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
