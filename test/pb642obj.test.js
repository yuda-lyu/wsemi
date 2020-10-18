import assert from 'assert'
import obj2pb64 from '../src/obj2pb64.mjs'
import pb642obj from '../src/pb642obj.mjs'


describe(`pb642obj`, function() {
    let key = '1234567890abcdef'
    let k
    let o = {}

    k = 1
    o[k] = {
        in: obj2pb64([1, '3', 'abc'], key),
        out: [1, '3', 'abc']
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, '${key}'`, function() {
        k = 1
        let r = pb642obj(o[k].in, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        in: obj2pb64([1, '', null, undefined, [], {}, '3', 'abc'], key),
        out: [1, '', null, null, [], {}, '3', 'abc']
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, '${key}'`, function() {
        k = 2
        let r = pb642obj(o[k].in, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        in: obj2pb64({ a: 12.34, b: 'abc' }, key),
        out: { a: 12.34, b: 'abc' }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, '${key}'`, function() {
        k = 3
        let r = pb642obj(o[k].in, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    o[k] = {
        in: obj2pb64({ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }, key),
        out: { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} }
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, '${key}'`, function() {
        k = 4
        let r = pb642obj(o[k].in, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 5
    o[k] = {
        in: obj2pb64(`{ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`, key),
        out: `{ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, '${key}'`, function() {
        k = 5
        let r = pb642obj(o[k].in, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 6
    o[k] = {
        in: obj2pb64(123456.789, key),
        out: 123456.789
    }
    it(`should return ${JSON.stringify(o[k].out)} when input ${JSON.stringify(o[k].in)}, '${key}'`, function() {
        k = 6
        let r = pb642obj(o[k].in, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = pb642obj('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = pb642obj([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = pb642obj({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = pb642obj(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = pb642obj(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
