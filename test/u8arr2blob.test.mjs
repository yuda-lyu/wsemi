import assert from 'assert'
import u8arr2blob from '../src/u8arr2blob.mjs'


describe(`u8arr2blob`, function() {

    //舊版nodejs沒有Blob，只有瀏覽器才有，新版nodejs已內建故可測
    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
    })

    it(`should return { state: 'success', msg: new Blob([u8a]) } when input new Uint8Array([66, 97, 115]) with returnWithStateAndMsg`, function() {
        if (typeof Blob === 'undefined') {
            this.skip() //舊版nodejs無Blob
        }
        let u8a = new Uint8Array([66, 97, 115])
        let r = u8arr2blob(u8a, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: new Blob([u8a]) }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid u8a' } when input NaN with returnWithStateAndMsg`, function() {
        if (typeof Blob === 'undefined') {
            this.skip()
        }
        let r = u8arr2blob(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid u8a' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return new Blob() when input NaN`, function() {
        if (typeof Blob === 'undefined') {
            this.skip()
        }
        let r = u8arr2blob(NaN)
        let rr = new Blob()
        assert.strict.deepStrictEqual(r, rr)
    })

    // it(`should return [object Blob] when input new Uint8Array([66, 97, 115])`, function() {
    //     let u8a = new Uint8Array([66, 97, 115])
    //     let r = u8arr2blob(u8a)
    //     let rr = new Blob(u8a)
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return '' when input '1.25'`, function() {
    //     let r = u8arr2blob('1.25')
    //     let rr = new Blob()
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return '' when input 2.25`, function() {
    //     let r = u8arr2blob(2.25)
    //     let rr = new Blob()
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return '' when input ''`, function() {
    //     let r = u8arr2blob('')
    //     let rr = new Blob()
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return '' when input []`, function() {
    //     let r = u8arr2blob([])
    //     let rr = new Blob()
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return '' when input {}`, function() {
    //     let r = u8arr2blob({})
    //     let rr = new Blob()
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return '' when input null`, function() {
    //     let r = u8arr2blob(null)
    //     let rr = new Blob()
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return '' when input undefined`, function() {
    //     let r = u8arr2blob(undefined)
    //     let rr = new Blob()
    //     assert.strict.deepStrictEqual(r, rr)
    // })

    // it(`should return '' when input NaN`, function() {
    //     let r = u8arr2blob(NaN)
    //     let rr = new Blob()
    //     assert.strict.deepStrictEqual(r, rr)
    // })

})
