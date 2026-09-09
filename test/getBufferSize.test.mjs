import assert from 'assert'
import getBufferSize from '../src/getBufferSize.mjs'


describe(`getBufferSize`, function() {

    it(`should return 4 when input new Uint8Array([1, 2, 3, 123])`, function() {
        let r = getBufferSize(new Uint8Array([1, 2, 3, 123]))
        let rr = 4
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input new Uint8Array(0)`, function() {
        //長度0之buffer須回0而非null; 原以真值判斷byteLength, 0為假故會逐層落空最終回null
        let r = getBufferSize(new Uint8Array(0))
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input new Uint16Array(0)`, function() {
        let r = getBufferSize(new Uint16Array(0))
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input an empty ArrayBuffer`, function() {
        let r = getBufferSize(new ArrayBuffer(0))
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 6 when input new Uint16Array([1, 2, 3]) (byteLength not element count)`, function() {
        let r = getBufferSize(new Uint16Array([1, 2, 3]))
        let rr = 6
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input ''`, function() {
        let r = getBufferSize('')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input []`, function() {
        let r = getBufferSize([])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input {}`, function() {
        let r = getBufferSize({})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input null`, function() {
        let r = getBufferSize(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input undefined`, function() {
        let r = getBufferSize(undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input NaN`, function() {
        let r = getBufferSize(NaN)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

})
