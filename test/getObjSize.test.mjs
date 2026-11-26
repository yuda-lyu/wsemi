import assert from 'assert'
import getObjSize from '../src/getObjSize.mjs'


describe(`getObjSize`, function() {

    it(`should return 12 when input 'abc123'`, function() {
        let r = getObjSize('abc123')
        let rr = 12
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 8 when input 123.456`, function() {
        let r = getObjSize(123.456)
        let rr = 8
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 22 when input { a: 123, b: 'xyz', c: '45op', d: null }`, function() {
        let r = getObjSize({ a: 123, b: 'xyz', c: '45op', d: null })
        let rr = 22
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 10 when input [1, '3']`, function() {
        let r = getObjSize([1, '3'])
        let rr = 10
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 16 when input [1, '3', 'abc']`, function() {
        let r = getObjSize([1, '3', 'abc'])
        let rr = 16
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 16 when input [1, '3', 'abc', null]`, function() {
        let r = getObjSize([1, '3', 'abc', null])
        let rr = 16
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 16 when input [1, '3', 'abc', null, undefined]`, function() {
        let r = getObjSize([1, '3', 'abc', null, undefined])
        let rr = 16
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 44 when input [{ a: 123, b: 'xyz', c: '45op', d: null }, { aa: 123.456, bb: 'xyz', d: '45op', e: null, f: undefined }]`, function() {
        let r = getObjSize([{ a: 123, b: 'xyz', c: '45op', d: null }, { aa: 123.456, bb: 'xyz', d: '45op', e: null, f: undefined }])
        let rr = 44
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 0 when input ''`, function() {
        let r = getObjSize('')
        let rr = 0
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 0 when input []`, function() {
        let r = getObjSize([])
        let rr = 0
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 0 when input {}`, function() {
        let r = getObjSize({})
        let rr = 0
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 0 when input null`, function() {
        let r = getObjSize(null)
        let rr = 0
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 0 when input undefined`, function() {
        let r = getObjSize(undefined)
        let rr = 0
        assert.strict.deepStrictEqual(r.int, rr)
    })

    it(`should return 0 when input NaN`, function() {
        let r = getObjSize(NaN)
        let rr = 8 //NaN是Number故為8
        assert.strict.deepStrictEqual(r.int, rr)
    })

    //第559項③: 無原型之物件(Object.create(null))原拋TypeError(obj.hasOwnProperty is not a function); 自有鍵hasOwnProperty亦會蓋過原型之方法
    it(`should not throw and count the values of an object without prototype (Object.create(null))`, function() {
        let o = Object.assign(Object.create(null), { a: 123, b: 'xyz' })
        let r = null
        assert.doesNotThrow(() => {
            r = getObjSize(o)
        })
        assert.strict.deepStrictEqual(r, { int: 14, str: '14 bytes' }) //8 + 3 * 2
    })

    it(`should count nested objects without prototype and arrays holding them`, function() {
        let inner = Object.assign(Object.create(null), { x: 1, y: 'ab' })
        let r = getObjSize({ a: inner, b: [inner] })
        assert.strict.deepStrictEqual(r.int, (8 + 4) * 2)
    })

    it(`should not throw when an own key named hasOwnProperty shadows the prototype method`, function() {
        let r = null
        assert.doesNotThrow(() => {
            r = getObjSize({ hasOwnProperty: 5, b: 'xy' })
        })
        assert.strict.deepStrictEqual(r.int, 8 + 4)
    })

    it(`should not throw for a non-plain object without toString (null-prototype object with another tag)`, function() {
        let o = Object.create(null)
        Object.defineProperty(o, Symbol.toStringTag, { value: 'Thing' })
        let r = null
        assert.doesNotThrow(() => {
            r = getObjSize(o)
        })
        assert.strict.deepStrictEqual(r.int, '[object Thing]'.length * 2)
    })

    //JSDoc範例與實際回傳一致(原範例寫// => 12, 實為{ int, str }物件)
    it(`should match the JSDoc examples: an object { int, str }`, function() {
        assert.strict.deepStrictEqual(getObjSize('abc123'), { int: 12, str: '12 bytes' })
        assert.strict.deepStrictEqual(getObjSize({ a: 123, b: 'xyz', c: '45op', d: null }), { int: 22, str: '22 bytes' })
        assert.strict.deepStrictEqual(getObjSize(Object.assign(Object.create(null), { a: 123 })).int, 8)
    })

})
