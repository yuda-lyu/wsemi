import assert from 'assert'
import asind from '../src/asind.mjs'


describe(`asind`, function() {

    it(`should return 0 when input 0`, function() {
        let r = asind(0)
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 30.000000000000004 when input 0.5`, function() {
        let r = asind(0.5)
        let rr = 30.000000000000004
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 44.99999999999999 when input 0.7071067811865475`, function() {
        let r = asind(0.7071067811865475)
        let rr = 44.99999999999999
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 59.99999999999999 when input 0.8660254037844386`, function() {
        let r = asind(0.8660254037844386)
        let rr = 59.99999999999999
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 90 when input 1`, function() {
        let r = asind(1)
        let rr = 90
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -30.000000000000004 when input -0.5`, function() {
        let r = asind(-0.5)
        let rr = -30.000000000000004
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -44.99999999999999 when input -0.7071067811865475`, function() {
        let r = asind(-0.7071067811865475)
        let rr = -44.99999999999999
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -59.99999999999999 when input -0.8660254037844386`, function() {
        let r = asind(-0.8660254037844386)
        let rr = -59.99999999999999
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return -90 when input -1`, function() {
        let r = asind(-1)
        let rr = -90
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = asind('')
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input false`, function() {
        let r = asind(false)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input []`, function() {
        let r = asind([])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{}]`, function() {
        let r = asind([{}])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = asind([{ a: 123 }])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['']`, function() {
        let r = asind([''])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input ['abc']`, function() {
        let r = asind(['abc'])
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input {}`, function() {
        let r = asind({})
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = asind({ a: 123 })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = asind({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input null`, function() {
        let r = asind(null)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input undefined`, function() {
        let r = asind(undefined)
        assert.strict.deepStrictEqual(r, null)
    })

    it(`should return null when input NaN`, function() {
        let r = asind(NaN)
        assert.strict.deepStrictEqual(r, null)
    })

})
