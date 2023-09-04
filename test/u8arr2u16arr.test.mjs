import assert from 'assert'
import u8arr2u16arr from '../src/u8arr2u16arr.mjs'


describe(`u8arr2u16arr`, function() {

    let u8a = new Uint8Array([66, 97, 115])
    let u16a = new Uint16Array([66, 97, 115])
    it(`should return ${u16a} when input ${u8a}`, function() {
        let r = u8arr2u16arr(u8a)
        let rr = u16a
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input '1.25'`, function() {
        let r = u8arr2u16arr('1.25')
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input 2.25`, function() {
        let r = u8arr2u16arr(2.25)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input ''`, function() {
        let r = u8arr2u16arr('')
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input []`, function() {
        let r = u8arr2u16arr([])
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input {}`, function() {
        let r = u8arr2u16arr({})
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input null`, function() {
        let r = u8arr2u16arr(null)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input undefined`, function() {
        let r = u8arr2u16arr(undefined)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint16Array() when input NaN`, function() {
        let r = u8arr2u16arr(NaN)
        let rr = new Uint16Array()
        assert.strict.deepStrictEqual(r, rr)
    })

})
