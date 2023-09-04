import assert from 'assert'
import bufRead from '../src/bufRead.mjs'


describe(`bufRead`, function() {
    let offset = 0
    let isBE = true
    let mLen = 52
    let nBytes = 8
    let b = new Uint8Array([66, 117, 16, 240, 246, 48, 64, 0])
    let j = 1447656645380

    it(`should return ${j} when input ${b}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(b, offset, isBE, mLen, nBytes)
        let rr = j
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input '1.25', ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead('1.25', offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input 2.25, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(2.25, offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input '', ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead('', offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input [], ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead([], offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input {}, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead({}, offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input null, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(null, offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input undefined, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(undefined, offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input NaN, ${offset}, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(NaN, offset, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, null, ${isBE}, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(b, null, isBE, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, ${offset}, null, ${mLen}, ${nBytes}`, function() {
        let r = bufRead(b, offset, null, mLen, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, ${offset}, ${isBE}, null, ${nBytes}`, function() {
        let r = bufRead(b, offset, isBE, null, nBytes)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return ${j} when input ${b}, ${offset}, ${isBE}, ${mLen}, null`, function() {
        let r = bufRead(b, offset, isBE, mLen, null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

})
