import assert from 'assert'
import arrFind from '../src/arrFind.mjs'


describe(`arrFind`, function() {

    it(`should return [1] when input [1, 2, 3, '4', 5, 'abc'], 2`, function() {
        let r = arrFind([1, 2, 3, '4', 5, 'abc'], 2)
        let rr = [1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [-1] when input [1, 2, 3, '4', 5, 'abc'], 12`, function() {
        let r = arrFind([1, 2, 3, '4', 5, 'abc'], 12)
        let rr = [-1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [-1] when input [1, 2, 3, '4', 5], [6]`, function() {
        let r = arrFind([1, 2, 3, '4', 5], [6])
        let rr = [-1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1] when input [1, 2, 3, '4', 5, 'abc'], [2]`, function() {
        let r = arrFind([1, 2, 3, '4', 5, 'abc'], [2])
        let rr = [1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [3, 1] when input [1, 2, 3, '4', 5, 'abc'], ['4', 2]`, function() {
        let r = arrFind([1, 2, 3, '4', 5, 'abc'], ['4', 2])
        let rr = [3, 1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1] when input [1, true, 2, 3, '4', true, 5, 'abc'], true`, function() {
        let r = arrFind([1, true, 2, 3, '4', true, 5, 'abc'], true)
        let rr = [1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1] when input [1, true, 2, 3, '4', true, 5, 'abc'], [true]`, function() {
        let r = arrFind([1, true, 2, 3, '4', true, 5, 'abc'], [true])
        let rr = [1]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [2] when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' }`, function() {
        let r = arrFind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], { x: 'xyz' })
        let rr = [2]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [2] when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }]`, function() {
        let r = arrFind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [{ x: 'xyz' }])
        let rr = [2]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [4, 2] when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }]`, function() {
        let r = arrFind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], ['4', { x: 'xyz' }])
        let rr = [4, 2]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [-1, 2] when input [1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [7, { x: 'xyz' }]`, function() {
        let r = arrFind([1, 2, { x: 'xyz' }, 3, '4', 5, 'abc'], [7, { x: 'xyz' }])
        let rr = [-1, 2]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [-1, 3] when input [1, 2, 3, '4', 5], [6, '4']`, function() {
        let r = arrFind([1, 2, 3, '4', 5], [6, '4'])
        let rr = [-1, 3]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrFind([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], [2]`, function() {
        let r = arrFind([], [2])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrFind('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrFind([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrFind({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrFind(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrFind(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrFind([], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrFind([], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrFind([], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrFind([], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrFind([], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrFind(['abc'], '')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrFind(['abc'], [])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrFind(['abc'], {})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrFind(['abc'], null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrFind(['abc'], undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
