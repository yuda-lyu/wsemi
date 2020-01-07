import assert from 'assert'
import str2u8arr from '../src/str2u8arr.mjs'


describe(`str2u8arr`, function() {
    let u8a = new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135])

    it(`should return ${u8a} when input 'test中文'`, function() {
        let r = str2u8arr('test中文')
        let rr = u8a
        assert.strict.deepEqual(r, rr)
    })

    // it(`should return new Uint8Array() when input '1.25'`, function() {
    //     let r = str2u8arr('1.25')
    //     let rr = new Uint8Array()
    //     assert.strict.deepEqual(r, rr)
    // })

    it(`should return new Uint8Array() when input 2.25`, function() {
        let r = str2u8arr(2.25)
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input ''`, function() {
        let r = str2u8arr('')
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input []`, function() {
        let r = str2u8arr([])
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input {}`, function() {
        let r = str2u8arr({})
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input null`, function() {
        let r = str2u8arr(null)
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

    it(`should return new Uint8Array() when input undefined`, function() {
        let r = str2u8arr(undefined)
        let rr = new Uint8Array()
        assert.strict.deepEqual(r, rr)
    })

})
