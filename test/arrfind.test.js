import assert from 'assert'
import arrfind from '../src/arrfind.mjs'


describe(`arrfind`, function() {

    it(`should return [1] when input [1, 2, 3, '4', 5, 'abc'], 2`, function() {
        let r = arrfind([1, 2, 3, '4', 5, 'abc'], 2)
        let rr = [1]
        assert.strict.deepEqual(r, rr)
    })

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

    it(`should return [1] when input [1, true, 2, 3, '4', true, 5, 'abc'], true`, function() {
        let r = arrfind([1, true, 2, 3, '4', true, 5, 'abc'], true)
        let rr = [1]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [1] when input [1, true, 2, 3, '4', true, 5, 'abc'], [true]`, function() {
        let r = arrfind([1, true, 2, 3, '4', true, 5, 'abc'], [true])
        let rr = [1]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [2] when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' }`, function() {
        let r = arrfind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' })
        let rr = [2]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [2] when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }]`, function() {
        let r = arrfind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }])
        let rr = [2]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [2] when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }]`, function() {
        let r = arrfind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }])
        let rr = [4, 2]
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

    it(`should return false when input ''`, function() {
        let r = arrfind('')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input []`, function() {
        let r = arrfind([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input {}`, function() {
        let r = arrfind({})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input null`, function() {
        let r = arrfind(null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input undefined`, function() {
        let r = arrfind(undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], ''`, function() {
        let r = arrfind([], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], []`, function() {
        let r = arrfind([], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], {}`, function() {
        let r = arrfind([], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], null`, function() {
        let r = arrfind([], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input [], undefined`, function() {
        let r = arrfind([], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], ''`, function() {
        let r = arrfind(['abc'], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], []`, function() {
        let r = arrfind(['abc'], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], {}`, function() {
        let r = arrfind(['abc'], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], null`, function() {
        let r = arrfind(['abc'], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return false when input ['abc'], undefined`, function() {
        let r = arrfind(['abc'], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

})
