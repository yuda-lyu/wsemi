import assert from 'assert'
import arrPull from '../src/arrPull.mjs'


describe(`arrPull`, function() {

    it(`should return [ 2, 3, 5, 'abc' ] when input [1, 2, 3, 4, 5, 'abc'], [1, 4]`, function() {
        let r = arrPull([1, 2, 3, 4, 5, 'abc'], [1, 4])
        let rr = [2, 3, 5, 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 2, 3, '4', 5, 'abc' ] when input [1, 2, 3, '4', 5, 'abc'], [1, 4]`, function() {
        let r = arrPull([1, 2, 3, '4', 5, 'abc'], [1, 4])
        let rr = [2, 3, '4', 5, 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 1, 2, 3, '4', 5, 'abc' ] when input [1, 2, 3, '4', 5, 'abc'], [6, 7]`, function() {
        let r = arrPull([1, 2, 3, '4', 5, 'abc'], [6, 7])
        let rr = [1, 2, 3, '4', 5, 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrPull('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrPull([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrPull({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrPull(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrPull(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function() {
        let r = arrPull(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrPull([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrPull([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrPull([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrPull([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrPull([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrPull(['abc'], '')
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrPull(['abc'], [])
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrPull(['abc'], {})
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrPull(['abc'], null)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrPull(['abc'], undefined)
        let rr = ['abc']
        assert.strict.deepStrictEqual(r, rr)
    })

})
