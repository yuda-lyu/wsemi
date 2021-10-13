import assert from 'assert'
import replace from '../src/replace.mjs'


describe(`replace`, function() {

    it(`should return '1.20bc' when input '1.25abc', '5a', '0'`, function() {
        let r = replace('1.25abc', '5a', '0')
        assert.strict.deepStrictEqual(r, '1.20bc')
    })

    it(`should return '1.2bc' when input '1.25abc', '5a', ''`, function() {
        let r = replace('1.25abc', '5a', '')
        assert.strict.deepStrictEqual(r, '1.2bc')
    })

    it(`should return '' when input '1.25abc', '5a', []`, function() {
        let r = replace('1.25abc', '5a', [])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', '5a', {}`, function() {
        let r = replace('1.25abc', '5a', {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', '5a', null`, function() {
        let r = replace('1.25abc', '5a', null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', '5a', undefined`, function() {
        let r = replace('1.25abc', '5a', undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', ''`, function() {
        let r = replace('1.25abc', '')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', []`, function() {
        let r = replace('1.25abc', [])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', {}`, function() {
        let r = replace('1.25abc', {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', null`, function() {
        let r = replace('1.25abc', null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25abc', undefined`, function() {
        let r = replace('1.25abc', undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = replace('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = replace([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = replace({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = replace(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = replace(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

})
