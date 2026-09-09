import assert from 'assert'
import b642obj from '../src/b642obj.mjs'


describe(`b642obj`, function() {

    it(`should return [1, '3', 'abc'] when input 'WzEsIjMiLCJhYmMiXQ=='`, function() {
        let r = b642obj('WzEsIjMiLCJhYmMiXQ==')
        let rr = [1, '3', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, '', null, null, [], {}, '3', 'abc'] when input 'WzEsIiIsbnVsbCxudWxsLFtdLHt9LCIzIiwiYWJjIl0='`, function() {
        //array內undefined轉為base64會成為null
        let r = b642obj('WzEsIiIsbnVsbCxudWxsLFtdLHt9LCIzIiwiYWJjIl0=')
        let rr = [1, '', null, null, [], {}, '3', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc' } when input 'eyJhIjoxMi4zNCwiYiI6ImFiYyJ9'`, function() {
        let r = b642obj('eyJhIjoxMi4zNCwiYiI6ImFiYyJ9')
        let rr = { a: 12.34, b: 'abc' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} } when input 'eyJhIjoxMi4zNCwiYiI6ImFiYyIsImMiOiIiLCJkIjpudWxsLCJmIjpbXSwiZyI6e319'`, function() {
        //object內值為undefined會連同key都消失
        let r = b642obj('eyJhIjoxMi4zNCwiYiI6ImFiYyIsImMiOiIiLCJkIjpudWxsLCJmIjpbXSwiZyI6e319')
        let rr = { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input 'IiI='`, function() {
        let r = b642obj('IiI=')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input 'W10='`, function() {
        let r = b642obj('W10=')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input 'e30='`, function() {
        let r = b642obj('e30=')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input 'bnVsbA=='`, function() {
        let r = b642obj('bnVsbA==')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input ''`, function() {
        let r = b642obj('')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input []`, function() {
        let r = b642obj([])
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = b642obj({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input null`, function() {
        let r = b642obj(null)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input undefined`, function() {
        let r = b642obj(undefined)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input NaN`, function() {
        let r = b642obj(NaN)
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input a valid base64 with returnWithStateAndMsg`, function() {
        let r = b642obj('eyJhIjoxfQ==', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: { a: 1 } }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid b64' } when input NaN with returnWithStateAndMsg`, function() {
        let r = b642obj(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid b64' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'j2o: <SyntaxError>' } when the decoded text is not a valid json with returnWithStateAndMsg`, function() {
        //內部呼叫之錯誤須前置來源函數名
        let r = b642obj('bm90LWpzb24=', { returnWithStateAndMsg: true }) //'not-json'之base64
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('j2o: ') === 0, true, `msg 應標明來源函數, got ${r.msg}`)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = b642obj('eyJhIjoxfQ==', { returnWithStateAndMsg: 'yes' })
        let rr = { a: 1 }
        assert.strict.deepStrictEqual(r, rr)
    })

})
