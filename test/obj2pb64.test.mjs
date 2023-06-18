import assert from 'assert'
import obj2pb64 from '../src/obj2pb64.mjs'
import pb642obj from '../src/pb642obj.mjs'


describe(`obj2pb64`, function() {
    let key = '1234567890abcdef'
    let k
    let o = {}

    k = 1
    o[k] = {
        in: [1, '3', 'abc'],
        out: [1, '3', 'abc']
    }
    it(`should return true(in==out) when input ${o[k].in}, '${key}'`, function() {
        k = 1
        let b64 = obj2pb64(o[k].in, key)
        let r = pb642obj(b64, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 2
    o[k] = {
        in: [1, '', null, undefined, [], {}, '3', 'abc'],
        out: [1, '', null, null, [], {}, '3', 'abc']
    }
    it(`should return true(in==out) when input ${o[k].in}, '${key}'`, function() {
        k = 2
        let b64 = obj2pb64(o[k].in, key)
        let r = pb642obj(b64, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 3
    o[k] = {
        in: { a: 12.34, b: 'abc' },
        out: { a: 12.34, b: 'abc' }
    }
    it(`should return true(in==out) when input ${o[k].in}, '${key}'`, function() {
        k = 3
        let b64 = obj2pb64(o[k].in, key)
        let r = pb642obj(b64, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 4
    o[k] = {
        in: { a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} },
        out: { a: 12.34, b: 'abc', c: '', d: null, f: [], g: {} }
    }
    it(`should return true(in==out) when input ${o[k].in}, '${key}'`, function() {
        k = 4
        let b64 = obj2pb64(o[k].in, key)
        let r = pb642obj(b64, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 5
    o[k] = {
        in: `{ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`,
        out: `{ a: 12.34, b: 'abc', c: '', d: null, e: undefined, f: [], g: {} }`
    }
    it(`should return true(in==out) when input ${o[k].in}, '${key}'`, function() {
        k = 5
        let b64 = obj2pb64(o[k].in, key)
        let r = pb642obj(b64, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    k = 6
    o[k] = {
        in: 123456.789,
        out: 123456.789
    }
    it(`should return true(in==out) when input ${o[k].in}, '${key}'`, function() {
        k = 6
        let b64 = obj2pb64(o[k].in, key)
        let r = pb642obj(b64, key)
        let rr = o[k].out
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = obj2pb64('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = obj2pb64([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = obj2pb64({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = obj2pb64(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = obj2pb64(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
