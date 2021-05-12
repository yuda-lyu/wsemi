import assert from 'assert'
import arrat from '../src/arrat.mjs'


describe(`arrat`, function() {

    it(`should return [2] when input [1, 2, 3, '4', 5, 'abc'], 1`, function() {
        let r = arrat([1, 2, 3, '4', 5, 'abc'], 1)
        let rr = [2]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [2, 3, '4', 5] when input [1, 2, 3, '4', 5, 'abc'], 1, 4`, function() {
        let r = arrat([1, 2, 3, '4', 5, 'abc'], 1, 4)
        let rr = [2, 3, '4', 5]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], 1, 10`, function() {
        let r = arrat([1, 2, 3, '4', 5, 'abc'], 1, 10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], 1, -10`, function() {
        let r = arrat([1, 2, 3, '4', 5, 'abc'], 1, -10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], -1, 10`, function() {
        let r = arrat([1, 2, 3, '4', 5, 'abc'], -1, 10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], -1, -10`, function() {
        let r = arrat([1, 2, 3, '4', 5, 'abc'], -1, -10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], 10`, function() {
        let r = arrat([1, 2, 3, '4', 5, 'abc'], 10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [1, 2, 3, '4', 5, 'abc'], -10`, function() {
        let r = arrat([1, 2, 3, '4', 5, 'abc'], -10)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
