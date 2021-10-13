import assert from 'assert'
//import u8arr2blob from '../src/u8arr2blob.mjs'


describe(`u8arr2blob`, function() {

    //nodejs沒有Blob，只有瀏覽器才有
    it(`need test in browser`, function() {
        assert.strict.deepStrictEqual(1, 1)
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

})
