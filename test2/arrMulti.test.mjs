import assert from 'assert'
import arrMulti from '../src/arrMulti.mjs'


describe(`arrMulti`, function() {

    it(`should return [0.1, 0.2, 0.30000000000000004, 0.4] when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1]`, function() {
        let r = arrMulti([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1])
        let rr = [0.1, 0.2, 0.30000000000000004, 0.4]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1.1, 4.4, 9.900000000000002, 17.6] when input [1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44]`, function() {
        let r = arrMulti([1, 2, 3, 4], [0.1, 0.1, 0.1, 0.1], [11, 22, 33, 44])
        let rr = [1.1, 4.4, 9.900000000000002, 17.6]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [0.1, 0.2, 0.1, null] when input [1, '2', null, null], [0.1, 0.1, 0.1, null]`, function() {
        let r = arrMulti([1, '2', null, null], [0.1, 0.1, 0.1, null])
        let rr = [0.1, 0.2, 0.1, null]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [2, 6] when input [1, 2], [2, 3]`, function() {
        let r = arrMulti([1, 2], [2, 3])
        let rr = [2, 6]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2]`, function() {
        let r = arrMulti([1, 2], [2])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3, 4]`, function() {
        let r = arrMulti([1, 2], [2, 3, 4])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [8, 30] when input [1, 2], [2, 3], [4, 5]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5])
        let rr = [8, 30]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5, 6]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5, 6])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [48, 210] when input [1, 2], [2, 3], [4, 5], [6, 7]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6, 7])
        let rr = [48, 210]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7, 8]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6, 7, 8])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [384, 1890] when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6, 7], [8, 9])
        let rr = [384, 1890]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6, 7], [8, 9, 10])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2], [2, 3], [4, 5], [6, 7], [8]`, function() {
        let r = arrMulti([1, 2], [2, 3], [4, 5], [6, 7], [8])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [8, 30] when input [1, '2'], [2, 3], [4, 5]`, function() {
        let r = arrMulti([1, '2'], [2, 3], [4, 5])
        let rr = [8, 30]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [8, 30] when input [1, 2], ['2', 3], [4, 5]`, function() {
        let r = arrMulti([1, 2], ['2', 3], [4, 5])
        let rr = [8, 30]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [8, 30] when input [1, '2'], [2, '3'], [4, '5']`, function() {
        let r = arrMulti([1, '2'], [2, '3'], [4, '5'])
        let rr = [8, 30]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [8, 5] when input [1, 'a'], [2, 'b'], [4, '5']`, function() {
        let r = arrMulti([1, 'a'], [2, 'b'], [4, '5'])
        let rr = [8, 5]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrMulti('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrMulti([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrMulti({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrMulti(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrMulti(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function() {
        let r = arrMulti(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrMulti([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrMulti([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrMulti([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrMulti([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrMulti([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrMulti(['abc'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrMulti(['abc'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrMulti(['abc'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrMulti(['abc'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrMulti(['abc'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
