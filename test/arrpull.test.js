import assert from 'assert'
import arrpull from '../src/arrpull.mjs'


describe(`arrpull`, function() {

    it(`should return [ { x: 2, y: 'y2' } ] when input [{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x'`, function() {
        let r = arrpull([{ x: 1, y: 'y1' }, { x: 2, y: 'y2' }], [{ x: 1, y: 'y3' }], 'x')
        let rr = [{ x: 2, y: 'y2' }]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [1, '3', 4, '3', 'abc'] when input [1, 2, '3', 4, '3', 'abc'], [2]`, function() {
        let r = arrpull([1, 2, '3', 4, '3', 'abc'], [2])
        let rr = [1, '3', 4, '3', 'abc']
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [1, 4, 'abc'] when input [1, 2, '3', 4, '3', 'abc'], [2, '3']`, function() {
        let r = arrpull([1, 2, '3', 4, '3', 'abc'], [2, '3'])
        let rr = [1, 4, 'abc']
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [1, 4] when input [1, 2, '3', 4, '3', 'abc'], [2, '3', 'abc']`, function() {
        let r = arrpull([1, 2, '3', 4, '3', 'abc'], [2, '3', 'abc'])
        let rr = [1, 4]
        assert.strict.deepEqual(r, rr)
    })

    it(`should return ['abc'] when input ['abc'], [1]`, function() {
        let r = arrpull(['abc'], [1])
        let rr = ['abc']
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrpull('')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrpull([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrpull({})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrpull(null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrpull(undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], ''`, function() {
        let r = arrpull([], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], []`, function() {
        let r = arrpull([], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], {}`, function() {
        let r = arrpull([], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], null`, function() {
        let r = arrpull([], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input [], undefined`, function() {
        let r = arrpull([], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], ''`, function() {
        let r = arrpull(['abc'], '')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], []`, function() {
        let r = arrpull(['abc'], [])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], {}`, function() {
        let r = arrpull(['abc'], {})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], null`, function() {
        let r = arrpull(['abc'], null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input ['abc'], undefined`, function() {
        let r = arrpull(['abc'], undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

})
