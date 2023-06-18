import assert from 'assert'
import arrAt from '../src/arrAt.mjs'


describe(`arrAt`, function() {

    it(`should return [2] when input [1, 2, 3, '4', 5, 'abc'], 1`, function() {
        let r = arrAt([1, 2, 3, '4', 5, 'abc'], 1)
        let rr = [2]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [2, 3, '4', 5] when input [1, 2, 3, '4', 5, 'abc'], 1, 4`, function() {
        let r = arrAt([1, 2, 3, '4', 5, 'abc'], 1, 4)
        let rr = [2, 3, '4', 5]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], 1, 10`, function() {
        let r = arrAt([1, 2, 3, '4', 5, 'abc'], 1, 10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], 1, -10`, function() {
        let r = arrAt([1, 2, 3, '4', 5, 'abc'], 1, -10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], -1, 10`, function() {
        let r = arrAt([1, 2, 3, '4', 5, 'abc'], -1, 10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], -1, -10`, function() {
        let r = arrAt([1, 2, 3, '4', 5, 'abc'], -1, -10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], 10`, function() {
        let r = arrAt([1, 2, 3, '4', 5, 'abc'], 10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], -10`, function() {
        let r = arrAt([1, 2, 3, '4', 5, 'abc'], -10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], [2]`, function() {
        let r = arrAt([], [2])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrAt([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrAt([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrAt([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrAt([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrAt([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrAt(['abc'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrAt(['abc'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrAt(['abc'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrAt(['abc'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrAt(['abc'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrAt('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrAt([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrAt({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrAt(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrAt(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
