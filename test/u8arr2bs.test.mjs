import assert from 'assert'
import u8arr2bs from '../src/u8arr2bs.mjs'


describe(`u8arr2bs`, function() {

    it(`should return  when input new Uint8Array([97, 98, 99])`, function() {
        let r = u8arr2bs(new Uint8Array([97, 98, 99]))
        let rr = 'abc'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '1.25' when input new Uint8Array([49, 46, 50, 53])`, function() {
        let r = u8arr2bs(new Uint8Array([49, 46, 50, 53]))
        let rr = '1.25'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 2.25`, function() {
        let r = u8arr2bs(new Uint8Array())
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = u8arr2bs('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = u8arr2bs([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = u8arr2bs({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = u8arr2bs(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = u8arr2bs(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = u8arr2bs(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
