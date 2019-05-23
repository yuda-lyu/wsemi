import assert from 'assert'
import getltdtkeys from '../src/getltdtkeys.mjs'


describe(`getltdtkeys`, function() {
    let k
    let o = {}

    k = 1
    o[k] = {
        in: [{ a: 123, b: 'xyz', c: '45op', d: null }, { a: 123.456, b: 'xyz', d: '45op', e: '' }],
        out: ['a', 'b', 'c', 'd', 'e']
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${o[k].in}`, function() {
        k = 1
        let r = getltdtkeys(o[k].in)
        let rr = o[k].out
        assert.strict.deepEqual(r, rr)
    })

    it(`should return [] when input { a: 123, b: 'xyz', c: '45op', d: null }`, function() {
        let r = getltdtkeys({ a: 123, b: 'xyz', c: '45op', d: null })
        assert.strict.deepEqual(r, [])
    })

    it(`should return '' when input ''`, function() {
        let r = getltdtkeys('')
        assert.strict.deepEqual(r, [])
    })

    it(`should return '' when input []`, function() {
        let r = getltdtkeys([])
        assert.strict.deepEqual(r, [])
    })

    it(`should return '' when input {}`, function() {
        let r = getltdtkeys({})
        assert.strict.deepEqual(r, [])
    })

    it(`should return '' when input null`, function() {
        let r = getltdtkeys(null)
        assert.strict.deepEqual(r, [])
    })

    it(`should return '' when input undefined`, function() {
        let r = getltdtkeys(undefined)
        assert.strict.deepEqual(r, [])
    })

})
