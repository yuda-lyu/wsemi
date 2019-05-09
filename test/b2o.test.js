import assert from 'assert'
import b2o from '../src/b2o.mjs'


describe('b2o', function() {

    it("should return [1, '3', 'abc'] when input 'WzEsIjMiLCJhYmMiXQ=='", function() {
        let r = b2o('WzEsIjMiLCJhYmMiXQ==')
        let rr = [1, '3', 'abc']
        assert.strict.deepEqual(r, rr)
    })

    it("should return [1, '', null, null, [], {}, '3', 'abc'] when input 'WzEsIiIsbnVsbCxudWxsLFtdLHt9LCIzIiwiYWJjIl0='", function() {
        //array內undefined轉為base64會成為null
        let r = b2o('WzEsIiIsbnVsbCxudWxsLFtdLHt9LCIzIiwiYWJjIl0=')
        let rr = [1, '', null, null, [], {}, '3', 'abc']
        assert.strict.deepEqual(r, rr)
    })

    it("should return { a: 12.34, b: 'abc' } when input 'eyJhIjoxMi4zNCwiYiI6ImFiYyJ9'", function() {
        let r = b2o('eyJhIjoxMi4zNCwiYiI6ImFiYyJ9')
        let rr = { a: 12.34, b: 'abc' }
        assert.strict.deepEqual(r, rr)
    })

    it("should return { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} } when input 'eyJhIjoxMi4zNCwiYiI6ImFiYyIsImMiOiIiLCJkIjpudWxsLCJmIjpbXSwiZyI6e319'", function() {
        //object內值為undefined會連同key都消失
        let r = b2o('eyJhIjoxMi4zNCwiYiI6ImFiYyIsImMiOiIiLCJkIjpudWxsLCJmIjpbXSwiZyI6e319')
        let rr = { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} }
        assert.strict.deepEqual(r, rr)
    })

    it("sould return '' when input 'IiI='", function() {
        let r = b2o('IiI=')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it("sould return [] when input 'W10='", function() {
        let r = b2o('W10=')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it("sould return {} when input 'e30='", function() {
        let r = b2o('e30=')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it("sould return null when input 'bnVsbA=='", function() {
        let r = b2o('bnVsbA==')
        let rr = null
        assert.strict.deepEqual(r, rr)
    })

    it("sould return {} when input ''", function() {
        let r = b2o('')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it('sould return {} when input []', function() {
        let r = b2o([])
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it('sould return {} when input {}', function() {
        let r = b2o({})
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it('sould return {} when input null', function() {
        let r = b2o(null)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it('sould return {} when input undefined', function() {
        let r = b2o(undefined)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

})
