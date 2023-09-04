import assert from 'assert'
import obj2u8arr from '../src/obj2u8arr.mjs'


describe(`obj2u8arr`, function() {
    let data = {
        a: [123, 45.67, 'test中文'],
        b: {
            c: new Uint8Array([66, 97, 115]),
        },
    }
    let cdata = `{ a: [123, 45.67, 'test中文'], b: { c: new Uint8Array([66, 97, 115]) } }`
    let u8a = new Uint8Array([
        64, 24, 0, 0, 0, 0, 0, 0, 91, 53, 56, 44,
        51, 93, 123, 34, 97, 34, 58, 91, 49, 50, 51, 44,
        52, 53, 46, 54, 55, 44, 34, 116, 101, 115, 116, 228,
        184, 173, 230, 150, 135, 34, 93, 44, 34, 98, 34, 58,
        123, 34, 99, 34, 58, 34, 91, 85, 105, 110, 116, 56,
        65, 114, 114, 97, 121, 93, 58, 58, 48, 34, 125, 125,
        66, 97, 115
    ])
    let cu8a = `new Uint8Array([ 64, 24, 0, 0, 0, 0, 0, 0, 91, 53, 56, 44, 51, 93, 123, 34, 97, 34, 58, 91, 49, 50, 51, 44, 52, 53, 46, 54, 55, 44, 34, 116, 101, 115, 116, 228, 184, 173, 230, 150, 135, 34, 93, 44, 34, 98, 34, 58, 123, 34, 99, 34, 58, 34, 91, 85, 105, 110, 116, 56, 65, 114, 114, 97, 121, 93, 58, 58, 48, 34, 125, 125, 66, 97, 115 ])`

    it(`should return ${cu8a} when input ${cdata}`, function() {
        let r = obj2u8arr(data)
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ''`, function() {
        let r = obj2u8arr('')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input []`, function() {
        let r = obj2u8arr([])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input {}`, function() {
        let r = obj2u8arr({})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = obj2u8arr(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input undefined`, function() {
        let r = obj2u8arr(undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input NaN`, function() {
        let r = obj2u8arr(NaN)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

})
