import assert from 'assert'
import ab2blob from '../src/ab2blob.mjs'


describe(`ab2blob`, function() {

    it(`need test in browser`, function() {
    //let ab = new ArrayBuffer(8)
        assert.strict.deepStrictEqual(1, 1)
    })

    it(`should return a Blob of the same bytes when input an ArrayBuffer`, function() {
        if (typeof Blob === 'undefined') {
            this.skip() //舊版nodejs無Blob
        }
        let r = ab2blob(new Uint8Array([66, 97, 115]).buffer)
        let rr = new Blob([new Uint8Array([66, 97, 115])])
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return an empty Blob when input NaN`, function() {
        if (typeof Blob === 'undefined') {
            this.skip()
        }
        let r = ab2blob(NaN)
        let rr = new Blob()
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input an ArrayBuffer with returnWithStateAndMsg`, function() {
        if (typeof Blob === 'undefined') {
            this.skip()
        }
        let r = ab2blob(new Uint8Array([66, 97, 115]).buffer, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: new Blob([new Uint8Array([66, 97, 115])]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid ab' } when input NaN with returnWithStateAndMsg`, function() {
        //原碼無前置檢查, 直接把ab2u8arr之空值包成空Blob, 使無效輸入無從辨識
        if (typeof Blob === 'undefined') {
            this.skip()
        }
        let r = ab2blob(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid ab' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        if (typeof Blob === 'undefined') {
            this.skip()
        }
        let r = ab2blob(new Uint8Array([66, 97, 115]).buffer, { returnWithStateAndMsg: 'yes' })
        let rr = new Blob([new Uint8Array([66, 97, 115])])
        assert.strict.deepStrictEqual(r, rr)
    })

})
