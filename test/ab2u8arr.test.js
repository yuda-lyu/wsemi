import assert from 'assert'
import ab2u8arr from '../src/ab2u8arr.mjs'
import u8arr2ab from '../src/u8arr2ab.mjs'


describe('ab2u8arr', function() {

    let u8a = new Uint8Array([66, 97, 115])
    let ab = u8arr2ab(u8a)
    it(`should return ${u8a} when input ${ab}`, function() {
        let r = ab2u8arr(ab)
        let rr = u8a
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input '1.25'`, function() {
        let r = ab2u8arr('1.25')
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input 2.25`, function() {
        let r = ab2u8arr(2.25)
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input ''`, function() {
        let r = ab2u8arr('')
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input []`, function() {
        let r = ab2u8arr([])
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input {}`, function() {
        let r = ab2u8arr({})
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input null`, function() {
        let r = ab2u8arr(null)
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input undefined`, function() {
        let r = ab2u8arr(undefined)
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

})
