import assert from 'assert'
import str2u8arr from '../src/str2u8arr.mjs'


describe(`str2u8arr`, function() {
    let u8a = new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135])

    it(`should return ${u8a} when input 'test中文'`, function() {
        let r = str2u8arr('test中文')
        let rr = u8a
        assert.strict.deepStrictEqual(r, rr)
    })

    // it(`should return new Uint8Array() when input '1.25'`, function() {
    //     let r = str2u8arr('1.25')
    //     let rr = new Uint8Array()
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    it(`should return new Uint8Array() when input 2.25`, function() {
        let r = str2u8arr(2.25)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input ''`, function() {
        let r = str2u8arr('')
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input []`, function() {
        let r = str2u8arr([])
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input {}`, function() {
        let r = str2u8arr({})
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input null`, function() {
        let r = str2u8arr(null)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input undefined`, function() {
        let r = str2u8arr(undefined)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Uint8Array() when input NaN`, function() {
        let r = str2u8arr(NaN)
        let rr = new Uint8Array()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input 'abc' with returnWithStateAndMsg`, function() {
        let r = str2u8arr('abc', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: new Uint8Array([97, 98, 99]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid str' } when input NaN with returnWithStateAndMsg`, function() {
        let r = str2u8arr(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid str' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = str2u8arr('abc', { returnWithStateAndMsg: 'yes' })
        let rr = new Uint8Array([97, 98, 99])
        assert.strict.deepStrictEqual(r, rr)
    })

})
