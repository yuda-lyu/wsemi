import assert from 'assert'
import b642obj from '../src/b642obj.mjs'


describe('b642obj', function() {

    it("should return [1, '3', 'abc'] when input 'WzEsIjMiLCJhYmMiXQ=='", function() {
        let r = b642obj('WzEsIjMiLCJhYmMiXQ==')
        let rr = [1, '3', 'abc']
        assert.strict.deepEqual(r, rr)
    })

    it("should return [1, '', null, null, [], {}, '3', 'abc'] when input 'WzEsIiIsbnVsbCxudWxsLFtdLHt9LCIzIiwiYWJjIl0='", function() {
        //array內undefined轉為base64會成為null
        let r = b642obj('WzEsIiIsbnVsbCxudWxsLFtdLHt9LCIzIiwiYWJjIl0=')
        let rr = [1, '', null, null, [], {}, '3', 'abc']
        assert.strict.deepEqual(r, rr)
    })

    it("should return { a: 12.34, b: 'abc' } when input 'eyJhIjoxMi4zNCwiYiI6ImFiYyJ9'", function() {
        let r = b642obj('eyJhIjoxMi4zNCwiYiI6ImFiYyJ9')
        let rr = { a: 12.34, b: 'abc' }
        assert.strict.deepEqual(r, rr)
    })

    it("should return { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} } when input 'eyJhIjoxMi4zNCwiYiI6ImFiYyIsImMiOiIiLCJkIjpudWxsLCJmIjpbXSwiZyI6e319'", function() {
        //object內值為undefined會連同key都消失
        let r = b642obj('eyJhIjoxMi4zNCwiYiI6ImFiYyIsImMiOiIiLCJkIjpudWxsLCJmIjpbXSwiZyI6e319')
        let rr = { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} }
        assert.strict.deepEqual(r, rr)
    })

    it("sould return '' when input 'IiI='", function() {
        let r = b642obj('IiI=')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it("sould return [] when input 'W10='", function() {
        let r = b642obj('W10=')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it("sould return {} when input 'e30='", function() {
        let r = b642obj('e30=')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it("sould return null when input 'bnVsbA=='", function() {
        let r = b642obj('bnVsbA==')
        let rr = null
        assert.strict.deepEqual(r, rr)
    })

    it("sould return {} when input ''", function() {
        let r = b642obj('')
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it('sould return {} when input []', function() {
        let r = b642obj([])
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it('sould return {} when input {}', function() {
        let r = b642obj({})
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it('sould return {} when input null', function() {
        let r = b642obj(null)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

    it('sould return {} when input undefined', function() {
        let r = b642obj(undefined)
        let rr = {}
        assert.strict.deepEqual(r, rr)
    })

})
