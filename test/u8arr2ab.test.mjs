import assert from 'assert'
import u8arr2ab from '../src/u8arr2ab.mjs'


describe(`u8arr2ab`, function() {

    it(`should return [object ArrayBuffer] when input new Uint8Array([66, 97, 115])`, function() {
        let u8a = new Uint8Array([66, 97, 115])
        let r = u8arr2ab(u8a)
        let rr = u8a.buffer
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input '1.25'`, function() {
        let r = u8arr2ab('1.25')
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 2.25`, function() {
        let r = u8arr2ab(2.25)
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = u8arr2ab('')
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = u8arr2ab([])
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = u8arr2ab({})
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = u8arr2ab(null)
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = u8arr2ab(undefined)
        let rr = new ArrayBuffer()
        assert.strict.deepStrictEqual(r, rr)
    })

})
