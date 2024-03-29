import assert from 'assert'
import o2j from '../src/o2j.mjs'


describe(`o2j`, function() {

    it(`should return '[1,"3","abc"]' when input [1, '3', 'abc']`, function() {
        let r = o2j([1, '3', 'abc'])
        let rr = '[1,"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[1,"",null,null,[],{},"3","abc"]' when input [1, '', null, undefined, [], {}, '3', 'abc']`, function() {
        let r = o2j([1, '', null, undefined, [], {}, '3', 'abc'])
        let rr = '[1,"",null,null,[],{},"3","abc"]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc"}' when input { a: 12.34, b: 'abc' }`, function() {
        let r = o2j({ a: 12.34, b: 'abc' })
        let rr = '{"a":12.34,"b":"abc"}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}' when input { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, function() {
        let r = o2j({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} })
        let rr = '{"a":12.34,"b":"abc","c":"","d":null,"f":[],"g":{}}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123' when input 123`, function() {
        let r = o2j(123)
        let rr = '123'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '123.456' when input 123.456`, function() {
        let r = o2j(123.456)
        let rr = '123.456'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '"123"' when input '123'`, function() {
        let r = o2j('123')
        let rr = '"123"'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '"123.456"' when input '123.456'`, function() {
        let r = o2j('123.456')
        let rr = '"123.456"'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'true' when input true`, function() {
        let r = o2j(true)
        let rr = 'true'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '""' when input ''`, function() {
        let r = o2j('')
        let rr = '""'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '[]' when input []`, function() {
        let r = o2j([])
        let rr = '[]'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '{}' when input {}`, function() {
        let r = o2j({})
        let rr = '{}'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'null' when input null`, function() {
        let r = o2j(null)
        let rr = 'null'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = o2j(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = o2j(NaN)
        let rr = 'null' //NaN是Number, 轉JSON字串會變成null
        assert.strict.deepStrictEqual(r, rr)
    })

})
