import assert from 'assert'
import replaceObj from '../src/replaceObj.mjs'


describe(`replaceObj`, function() {

    it(`should return '1.20bc英文' when input '1.25abc中文', { '5a': '0', '中': '英' }`, function() {
        let r = replaceObj('1.25abc中文', { '5a': '0', '中': '英' })
        assert.strict.deepEqual(r, '1.20bc英文')
    })

    it(`should return '1.20bc英文' when input '1.25abc中文', { '5a': '', '中': '英' }`, function() {
        let r = replaceObj('1.25abc中文', { '5a': '', '中': '英' })
        assert.strict.deepEqual(r, '1.2bc英文')
    })

    it(`should return '1.20bc英文' when input '1.25abc中文', { '5a': null, '中': '英' }`, function() {
        let r = replaceObj('1.25abc中文', { '5a': null, '中': '英' })
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '1.25abc', ''`, function() {
        let r = replaceObj('1.25abc', '')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '1.25abc', []`, function() {
        let r = replaceObj('1.25abc', [])
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '1.25abc', {}`, function() {
        let r = replaceObj('1.25abc', {})
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '1.25abc', null`, function() {
        let r = replaceObj('1.25abc', null)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input '1.25abc', undefined`, function() {
        let r = replaceObj('1.25abc', undefined)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = replaceObj('')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = replaceObj([])
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = replaceObj({})
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = replaceObj(null)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = replaceObj(undefined)
        assert.strict.deepEqual(r, '')
    })

})
