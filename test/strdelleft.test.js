import assert from 'assert'
import strdelleft from '../src/strdelleft.mjs'


describe('strdelleft', function() {

    it(`sould return 'st中文' when input 'test中文', 2`, function() {
        let r = strdelleft('test中文', 2)
        let rr = 'st中文'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 10`, function() {
        let r = strdelleft('test中文', 10)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 0`, function() {
        let r = strdelleft('test中文', 0)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', -1`, function() {
        let r = strdelleft('test中文', -1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', ''`, function() {
        let r = strdelleft('test中文', '')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', []`, function() {
        let r = strdelleft('test中文', [])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}`, function() {
        let r = strdelleft('test中文', {})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null`, function() {
        let r = strdelleft('test中文', null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', undefined`, function() {
        let r = strdelleft('test中文', undefined)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = strdelleft('')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strdelleft([])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strdelleft({})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strdelleft(null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strdelleft(undefined)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })


})
