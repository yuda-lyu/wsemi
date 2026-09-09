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

    it(`should return '' when input NaN`, function() {
        let r = obj2pb64(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input { a: 1 } and a key with returnWithStateAndMsg`, function() {
        //opt為第3參數, 因第2參數key為既有參數; AES帶隨機salt故每次結果不同, 只驗狀態與可解回
        let r = obj2pb64({ a: 1 }, 'k', { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r.state, 'success')
        assert.strict.deepStrictEqual(typeof r.msg === 'string' && r.msg.length > 0, true)
    })

    it(`should return { state: 'error', msg: 'invalid data' } when input undefined with returnWithStateAndMsg`, function() {
        let r = obj2pb64(undefined, 'k', { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid data' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid key' } when key is not a string with returnWithStateAndMsg`, function() {
        let r = obj2pb64({ a: 1 }, NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid key' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = obj2pb64({ a: 1 }, 'k', { returnWithStateAndMsg: 'yes' })
        assert.strict.deepStrictEqual(typeof r === 'string' && r.length > 0, true)
    })

})
