import assert from 'assert'
import strmid from '../src/strmid.mjs'


describe(`strmid`, function() {

    it(`sould return 's' when input 'test中文', 2, 1`, function() {
        let r = strmid('test中文', 2, 1)
        let rr = 's'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return 's' when input 'test中文', 2, 3`, function() {
        let r = strmid('test中文', 2, 3)
        let rr = 'st中'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return 'st中文' when input 'test中文', 2, 10`, function() {
        let r = strmid('test中文', 2, 10)
        let rr = 'st中文'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, 0`, function() {
        let r = strmid('test中文', 2, 0)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, -1`, function() {
        let r = strmid('test中文', 2, -1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 10, 1`, function() {
        let r = strmid('test中文', 10, 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return 't' when input 'test中文', 0, 1`, function() {
        let r = strmid('test中文', 0, 1)
        let rr = 't'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', -1, 1`, function() {
        let r = strmid('test中文', -1, 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, ''`, function() {
        let r = strmid('test中文', 2, '')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, []`, function() {
        let r = strmid('test中文', 2, [])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, {}`, function() {
        let r = strmid('test中文', 2, {})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, null`, function() {
        let r = strmid('test中文', 2, null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 2, undefined`, function() {
        let r = strmid('test中文', 2, undefined)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', '', 1`, function() {
        let r = strmid('test中文', '', 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', [], 1`, function() {
        let r = strmid('test中文', [], 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}, 1`, function() {
        let r = strmid('test中文', {}, 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null, 1`, function() {
        let r = strmid('test中文', null, 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', undefined, 1`, function() {
        let r = strmid('test中文', undefined, 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input '', 2, 1`, function() {
        let r = strmid('', 2, 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input [], 2, 1`, function() {
        let r = strmid([], 2, 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input {}, 2, 1`, function() {
        let r = strmid({}, 2, 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input null, 2, 1`, function() {
        let r = strmid(null, 2, 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input undefined, 2, 1`, function() {
        let r = strmid(undefined, 2, 1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = strmid('')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strmid([])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strmid({})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strmid(null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strmid(undefined)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

})
