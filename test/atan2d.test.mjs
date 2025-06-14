import assert from 'assert'
import atan2d from '../src/atan2d.mjs'


describe(`atan2d`, function() {

    it(`should return 0 when input 1, 0`, function() {
        let r = atan2d(1, 0)
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 26.56505117707799 when input 1, 0.5`, function() {
        let r = atan2d(1, 0.5)
        let rr = 26.56505117707799
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 35.264389682754654 when input 1, 0.7071067811865475`, function() {
        let r = atan2d(1, 0.7071067811865475)
        let rr = 35.264389682754654
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 40.89339464913091 when input 1, 0.8660254037844386`, function() {
        let r = atan2d(1, 0.8660254037844386)
        let rr = 40.89339464913091
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 45 when input 1, 1`, function() {
        let r = atan2d(1, 1)
        let rr = 45
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 59.99999999999999 when input 1, 1.7320508075688767`, function() {
        let r = atan2d(1, 1.7320508075688767)
        let rr = 59.99999999999999
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 90 when input 1, Infinity`, function() {
        let r = atan2d(1, Infinity)
        let rr = 90
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -26.56505117707799 when input 1, -0.5`, function() {
        let r = atan2d(1, -0.5)
        let rr = -26.56505117707799
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -35.264389682754654 when input 1, -0.7071067811865475`, function() {
        let r = atan2d(1, -0.7071067811865475)
        let rr = -35.264389682754654
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -40.89339464913091 when input 1, -0.8660254037844386`, function() {
        let r = atan2d(1, -0.8660254037844386)
        let rr = -40.89339464913091
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -45 when input 1, -1`, function() {
        let r = atan2d(1, -1)
        let rr = -45
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -59.99999999999999 when input 1, -1.7320508075688767`, function() {
        let r = atan2d(1, -1.7320508075688767)
        let rr = -59.99999999999999
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -90 when input 1, -Infinity`, function() {
        let r = atan2d(1, -Infinity)
        let rr = -90
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = atan2d('')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input false`, function() {
        let r = atan2d(false)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input []`, function() {
        let r = atan2d([])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{}]`, function() {
        let r = atan2d([{}])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = atan2d([{ a: 123 }])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['']`, function() {
        let r = atan2d([''])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['abc']`, function() {
        let r = atan2d(['abc'])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input {}`, function() {
        let r = atan2d({})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = atan2d({ a: 123 })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = atan2d({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input null`, function() {
        let r = atan2d(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input undefined`, function() {
        let r = atan2d(undefined)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input NaN`, function() {
        let r = atan2d(NaN)
        assert.strict.deepStrictEqual(r, null)
    })

})
