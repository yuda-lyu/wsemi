import assert from 'assert'
import rang from '../src/rang.mjs'


describe(`rang`, function() {

    it(`should return [ 0, 10 ] when input 0, 10`, function() {
        let r = rang(0, 10)
        let rr = [0, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0, 5, 10, 15 ] when input 0, 10, 3`, function() {
        let r = rang(0, 10, 3)
        let rr = [0, 5, 10, 15]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [ 0, 3.3333333333333335, 6.666666666666667, 10, 13.333333333333334 ] when 0, 10, 4`, function() {
        let r = rang(0, 10, 4)
        let rr = [0, 3.3333333333333335, 6.666666666666667, 10, 13.333333333333334]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input '', 1`, function() {
        let r = rang('', 1)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input [], 1`, function() {
        let r = rang([], 1)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}, 1`, function() {
        let r = rang({}, 1)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null, 1`, function() {
        let r = rang(null, 1)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined, 1`, function() {
        let r = rang(undefined, 1)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input 123.456`, function() {
        let r = rang(123.456)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input '123.456'`, function() {
        let r = rang('123.456')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = rang('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = rang([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = rang({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = rang(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = rang(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
