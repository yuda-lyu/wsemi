import assert from 'assert'
import arrfind from '../src/arrfind.mjs'


describe(`arrfind`, function() {

    it(`should return [1] when input [1, 2, 3, '4', 5, 'abc'], [2]`, function() {
        let r = arrfind([1, 2, 3, '4', 5, 'abc'], [2])
        let rr = [1]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [3, 1] when input [1, 2, 3, '4', 5, 'abc'], ['4', 2]`, function() {
        let r = arrfind([1, 2, 3, '4', 5, 'abc'], ['4', 2])
        let rr = [3, 1]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrfind([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], [2]`, function() {
        let r = arrfind([], [2])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [-1] when input [1, 2, 3, '4', 5], [6]`, function() {
        let r = arrfind([1, 2, 3, '4', 5], [6])
        let rr = [-1]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [-1, 3] when input [1, 2, 3, '4', 5], [6, '4']`, function() {
        let r = arrfind([1, 2, 3, '4', 5], [6, '4'])
        let rr = [-1, 3]
        assert.strict.deepEqual(r, rr)
    })

})
