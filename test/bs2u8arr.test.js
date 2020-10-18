import assert from 'assert'
import bs2u8arr from '../src/bs2u8arr.mjs'


describe(`bs2u8arr`, function() {

    it(`should return new Uint8Array([97, 98, 99]) when input 'abc'`, function() {
        let r = bs2u8arr('abc')
        let rr = new Uint8Array([97, 98, 99])
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array([49, 46, 50, 53]) when input '1.25'`, function() {
        let r = bs2u8arr('1.25')
        let rr = new Uint8Array([49, 46, 50, 53])
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input 2.25`, function() {
        let r = bs2u8arr(2.25)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input ''`, function() {
        let r = bs2u8arr('')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input []`, function() {
        let r = bs2u8arr([])
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input {}`, function() {
        let r = bs2u8arr({})
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input null`, function() {
        let r = bs2u8arr(null)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input undefined`, function() {
        let r = bs2u8arr(undefined)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

})
