import assert from 'assert'
import arrPullAt from '../src/arrPullAt.mjs'


describe(`arrPullAt`, function() {

    it(`should return [2, 4, 5, 'abc'] when input [1, 2, 3, 4, 5, 'abc'], [0, 2]`, function() {
        let r = arrPullAt([1, 2, 3, 4, 5, 'abc'], [0, 2])
        let rr = [2, 4, 5, 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, 3, 5, 'abc'] when input [1, 2, 3, '4', 5, 'abc'], [1, 3]`, function() {
        let r = arrPullAt([1, 2, 3, '4', 5, 'abc'], [1, 3])
        let rr = [1, 3, 5, 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, 2, 3, '4', 'abc'] when input [1, 2, 3, '4', 5, 'abc'], [4, 7]`, function() {
        let r = arrPullAt([1, 2, 3, '4', 5, 'abc'], [4, 7])
        let rr = [1, 2, 3, '4', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrPullAt('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrPullAt([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrPullAt({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrPullAt(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrPullAt(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function() {
        let r = arrPullAt(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrPullAt([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrPullAt([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrPullAt([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrPullAt([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrPullAt([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrPullAt(['abc'], '')
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrPullAt(['abc'], [])
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrPullAt(['abc'], {})
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrPullAt(['abc'], null)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrPullAt(['abc'], undefined)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

})
