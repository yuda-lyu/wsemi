import assert from 'assert'
import j2o from '../src/j2o.mjs'


describe(`j2o`, function() {

    it(`should return [1, '3', 'abc'] when input [1,"3","abc"]`, function() {
        let r = j2o('[1,"3","abc"]')
        let rr = [1, '3', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, '', null, null, [], {}, '3', 'abc'] when input '[1,"",null,null,[],{},"3","abc"]'`, function() {
        let r = j2o('[1,"",null,null,[],{},"3","abc"]')
        let rr = [1, '', null, null, [], {}, '3', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc' } when input '{"a":12.34,"b":"abc"}'`, function() {
        let r = j2o('{"a":12.34,"b":"abc"}')
        let rr = { a: 12.34, b: 'abc' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} } when input '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}'`, function() {
        let r = j2o('{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}')
        let rr = { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 123 when input '123'`, function() {
        let r = j2o('123')
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 123.456 when input '123.456'`, function() {
        let r = j2o('123.456')
        let rr = 123.456
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123' when input '"123"'`, function() {
        let r = j2o('"123"')
        let rr = '123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123.456' when input '"123.456"'`, function() {
        let r = j2o('"123.456"')
        let rr = '123.456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return true when input 'true'`, async function() {
        let r = j2o('true')
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input '""'`, function() {
        let r = j2o('""')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input '[]'`, function() {
        let r = j2o('[]')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input '{}'`, function() {
        let r = j2o('{}')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input 'null'`, function() {
        let r = j2o('null')
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input ''`, function() {
        let r = j2o('')
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input '{"a":1}' with returnWithStateAndMsg`, function() {
        let r = j2o('{"a":1}', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: { a: 1 } }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid v' } when input NaN with returnWithStateAndMsg`, function() {
        let r = j2o(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid v' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: <SyntaxError> } when input is not a valid json with returnWithStateAndMsg`, function() {
        //原碼catch吞掉解析錯誤而回{}, 與「輸入本就是{}」無從分辨
        let r = j2o('not-json', { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'error')
        assert.strict.deepStrictEqual(r.msg.indexOf('SyntaxError') === 0, true, `msg 應為解析錯誤, got ${r.msg}`)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = j2o('{"a":1}', { returnWithStateAndMsg: 'yes' })
        let rr = { a: 1 }
        assert.strict.deepStrictEqual(r, rr)
    })

})
