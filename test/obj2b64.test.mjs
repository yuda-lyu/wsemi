import assert from 'assert'
import obj2b64 from '../src/obj2b64.mjs'


describe(`obj2b64`, function() {

    it(`should return 'WzEsIjMiLCJhYmMiXQ==' when input [1, '3', 'abc']`, function() {
        let r = obj2b64([1, '3', 'abc'])
        let rr = 'WzEsIjMiLCJhYmMiXQ=='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'WzEsIiIsbnVsbCxudWxsLFtdLHt9LCIzIiwiYWJjIl0=' when input [1, '', null, undefined, [], {}, '3', 'abc']`, function() {
        let r = obj2b64([1, '', null, undefined, [], {}, '3', 'abc'])
        let rr = 'WzEsIiIsbnVsbCxudWxsLFtdLHt9LCIzIiwiYWJjIl0='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'eyJhIjoxMi4zNCwiYiI6ImFiYyJ9' when input { a: 12.34, b: 'abc' }`, function() {
        let r = obj2b64({ a: 12.34, b: 'abc' })
        let rr = 'eyJhIjoxMi4zNCwiYiI6ImFiYyJ9'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'eyJhIjoxMi4zNCwiYiI6ImFiYyIsImMiOiIiLCJkIjpudWxsLCJmIjpbXSwiZyI6e319' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = obj2b64({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = 'eyJhIjoxMi4zNCwiYiI6ImFiYyIsImMiOiIiLCJkIjpudWxsLCJmIjpbXSwiZyI6e319'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'IiI=' when input ''`, function() {
        let r = obj2b64('')
        let rr = 'IiI='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'W10=' when input []`, function() {
        let r = obj2b64([])
        let rr = 'W10='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'e30=' when input {}`, function() {
        let r = obj2b64({})
        let rr = 'e30='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'bnVsbA==' when input null`, function() {
        let r = obj2b64(null)
        let rr = 'bnVsbA=='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = obj2b64(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
