import assert from 'assert'
import b642str from '../src/b642str.mjs'


describe(`b642str`, function() {

    it(`should return 'test中文' when input 'dGVzdOS4reaWhw=='`, function() {
        let r = b642str('dGVzdOS4reaWhw==')
        let rr = 'test中文'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 12.34`, function() {
        let r = b642str(12.34)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input [1, '3', 'abc']`, function() {
        let r = b642str([1, '3', 'abc'])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input { a: 12.34, b: 'abc' }`, function() {
        let r = b642str({ a: 12.34, b: 'abc' })
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = b642str({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = b642str('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = b642str([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = b642str({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = b642str(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = b642str(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = b642str(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: 'abc' } when input 'YWJj' with returnWithStateAndMsg`, function() {
        let r = b642str('YWJj', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: 'abc' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid b64' } when input NaN with returnWithStateAndMsg`, function() {
        let r = b642str(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid b64' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = b642str('YWJj', { returnWithStateAndMsg: 'yes' })
        let rr = 'abc'
        assert.strict.deepStrictEqual(r, rr)
    })

})
