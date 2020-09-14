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

})
