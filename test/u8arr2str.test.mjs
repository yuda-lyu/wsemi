import assert from 'assert'
import u8arr2str from '../src/u8arr2str.mjs'


describe(`u8arr2str`, function() {

    it(`should return 'test中文' when input new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135])`, function() {
        let r = u8arr2str(new Uint8Array([116, 101, 115, 116, 228, 184, 173, 230, 150, 135]))
        let rr = 'test中文'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input '1.25'`, function() {
        let r = u8arr2str('1.25')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 2.25`, function() {
        let r = u8arr2str(2.25)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = u8arr2str('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = u8arr2str([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = u8arr2str({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = u8arr2str(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = u8arr2str(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = u8arr2str(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
