import assert from 'assert'
import str2b64 from '../src/str2b64.mjs'


describe(`str2b64`, function() {

    it(`should return 'dGVzdOS4reaWhw==' when input 'test中文'`, function() {
        let r = str2b64('test中文')
        let rr = 'dGVzdOS4reaWhw=='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 12.34`, function() {
        let r = str2b64(12.34)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input [1, '3', 'abc']`, function() {
        let r = str2b64([1, '3', 'abc'])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input { a: 12.34, b: 'abc' }`, function() {
        let r = str2b64({ a: 12.34, b: 'abc' })
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = str2b64({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = str2b64('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = str2b64([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = str2b64({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = str2b64(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = str2b64(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = str2b64(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: 'YWJj' } when input 'abc' with returnWithStateAndMsg`, function() {
        let r = str2b64('abc', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: 'YWJj' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid str' } when input NaN with returnWithStateAndMsg`, function() {
        let r = str2b64(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid str' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = str2b64('abc', { returnWithStateAndMsg: 'yes' })
        let rr = 'YWJj'
        assert.strict.deepStrictEqual(r, rr)
    })

})
