import assert from 'assert'
import o2b from '../src/o2b.mjs'


describe('o2b', function() {

    it("should return 'WzEsIjMiLCJhYmMiXQ==' when input [1, '3', 'abc']", function() {
        let r = o2b([1, '3', 'abc'])
        let rr = 'WzEsIjMiLCJhYmMiXQ=='
        assert.strict.deepEqual(r, rr)
    })

    it("should return 'WzEsIiIsbnVsbCxudWxsLFtdLHt9LCIzIiwiYWJjIl0=' when input [1, '', null, undefined, [], {}, '3', 'abc']", function() {
        let r = o2b([1, '', null, undefined, [], {}, '3', 'abc'])
        let rr = 'WzEsIiIsbnVsbCxudWxsLFtdLHt9LCIzIiwiYWJjIl0='
        assert.strict.deepEqual(r, rr)
    })

    it("should return 'eyJhIjoxMi4zNCwiYiI6ImFiYyJ9' when input { a: 12.34, b: 'abc' }", function() {
        let r = o2b({ a: 12.34, b: 'abc' })
        let rr = 'eyJhIjoxMi4zNCwiYiI6ImFiYyJ9'
        assert.strict.deepEqual(r, rr)
    })

    it("should return 'eyJhIjoxMi4zNCwiYiI6ImFiYyIsImMiOiIiLCJkIjpudWxsLCJmIjpbXSwiZyI6e319' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }", function() {
        let r = o2b({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = 'eyJhIjoxMi4zNCwiYiI6ImFiYyIsImMiOiIiLCJkIjpudWxsLCJmIjpbXSwiZyI6e319'
        assert.strict.deepEqual(r, rr)
    })

    it("sould return 'IiI=' when input ''", function() {
        let r = o2b('')
        let rr = 'IiI='
        assert.strict.deepEqual(r, rr)
    })

    it("sould return 'W10=' when input []", function() {
        let r = o2b([])
        let rr = 'W10='
        assert.strict.deepEqual(r, rr)
    })

    it("sould return 'e30=' when input {}", function() {
        let r = o2b({})
        let rr = 'e30='
        assert.strict.deepEqual(r, rr)
    })

    it("sould return 'bnVsbA==' when input null", function() {
        let r = o2b(null)
        let rr = 'bnVsbA=='
        assert.strict.deepEqual(r, rr)
    })

    it("sould return '' when input undefined", function() {
        let r = o2b(undefined)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

})
