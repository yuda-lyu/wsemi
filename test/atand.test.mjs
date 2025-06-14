import assert from 'assert'
import atand from '../src/atand.mjs'


describe(`atand`, function() {

    it(`should return 0 when input 0`, function() {
        let r = atand(0)
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 26.56505117707799 when input 0.5`, function() {
        let r = atand(0.5)
        let rr = 26.56505117707799
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 35.264389682754654 when input 0.7071067811865475`, function() {
        let r = atand(0.7071067811865475)
        let rr = 35.264389682754654
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 40.89339464913091 when input 0.8660254037844386`, function() {
        let r = atand(0.8660254037844386)
        let rr = 40.89339464913091
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 45 when input 1`, function() {
        let r = atand(1)
        let rr = 45
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 59.99999999999999 when input 1.7320508075688767`, function() {
        let r = atand(1.7320508075688767)
        let rr = 59.99999999999999
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 90 when input Infinity`, function() {
        let r = atand(Infinity)
        let rr = 90
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -26.56505117707799 when input -0.5`, function() {
        let r = atand(-0.5)
        let rr = -26.56505117707799
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -35.264389682754654 when input -0.7071067811865475`, function() {
        let r = atand(-0.7071067811865475)
        let rr = -35.264389682754654
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -40.89339464913091 when input -0.8660254037844386`, function() {
        let r = atand(-0.8660254037844386)
        let rr = -40.89339464913091
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -45 when input -1`, function() {
        let r = atand(-1)
        let rr = -45
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -59.99999999999999 when input -1.7320508075688767`, function() {
        let r = atand(-1.7320508075688767)
        let rr = -59.99999999999999
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -90 when input -Infinity`, function() {
        let r = atand(-Infinity)
        let rr = -90
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = atand('')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input false`, function() {
        let r = atand(false)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input []`, function() {
        let r = atand([])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{}]`, function() {
        let r = atand([{}])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = atand([{ a: 123 }])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['']`, function() {
        let r = atand([''])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['abc']`, function() {
        let r = atand(['abc'])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input {}`, function() {
        let r = atand({})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = atand({ a: 123 })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = atand({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input null`, function() {
        let r = atand(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input undefined`, function() {
        let r = atand(undefined)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input NaN`, function() {
        let r = atand(NaN)
        assert.strict.deepStrictEqual(r, null)
    })

})
