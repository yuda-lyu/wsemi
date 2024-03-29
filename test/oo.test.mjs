import assert from 'assert'
import oo from '../src/oo.mjs'


describe(`oo`, function() {

    it(`should return [1, '3', 'abc'] when input [1, '3', 'abc']`, function() {
        let r = oo([1, '3', 'abc'])
        let rr = [1, '3', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, '3', 'abc', null] when input [1, '3', 'abc', function(){}]`, function() {
        let r = oo([1, '3', 'abc', function() {}])
        let rr = [1, '3', 'abc', null]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, '', null, null, [], {}, '3', 'abc'] when input [1, '', null, undefined, [], {}, '3', 'abc']`, function() {
        let r = oo([1, '', null, undefined, [], {}, '3', 'abc'])
        let rr = [1, '', null, null, [], {}, '3', 'abc']
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc' } when input { a: 12.34, b: 'abc' }`, function() {
        let r = oo({ a: 12.34, b: 'abc' })
        let rr = { a: 12.34, b: 'abc' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc' } when input { a: 12.34, b: 'abc', c: function(){} }`, function() {
        let r = oo({ a: 12.34, b: 'abc', c: function() {} })
        let rr = { a: 12.34, b: 'abc' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} } when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = oo({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 123 when input 123`, function() {
        let r = oo(123)
        let rr = 123
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 123.456 when input 123.456`, function() {
        let r = oo(123.456)
        let rr = 123.456
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123' when input '123'`, function() {
        let r = oo('123')
        let rr = '123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123.456' when input '123.456'`, function() {
        let r = oo('123.456')
        let rr = '123.456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = oo('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = oo([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return {} when input {}`, function() {
        let r = oo({})
        let rr = {}
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = oo(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return undefined when input undefined`, function() {
        let r = oo(undefined)
        assert.strict.deepStrictEqual(r, undefined)
    })

    it(`should return undefined when input NaN`, function() {
        let r = oo(NaN)
        let rr = null //NaN為Number, 故o2j轉會為'null', 再j2o反轉為null
        assert.strict.deepStrictEqual(r, rr)
    })

})
