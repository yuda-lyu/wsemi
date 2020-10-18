import assert from 'assert'
import repObj from '../src/repObj.mjs'


describe(`repObj`, function() {

    it(`should return [{ a: 12.45, b: 'opqr' }, { a: 12.45, b: 'opqr' }] when input { a: 12.45, b: 'opqr' }, 2`, function() {
        let r = repObj({ a: 12.45, b: 'opqr' }, 2)
        assert.strict.deepStrictEqual(r, [{ a: 12.45, b: 'opqr' }, { a: 12.45, b: 'opqr' }])
    })

    it(`should return [] when input { a: 12.45, b: 'opqr' }, 0`, function() {
        let r = repObj({ a: 12.45, b: 'opqr' }, 0)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input { a: 12.45, b: 'opqr' }, -1`, function() {
        let r = repObj({ a: 12.45, b: 'opqr' }, -1)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return ['abc', 'abc'] when input 'abc', 2`, function() {
        let r = repObj('abc', 2)
        assert.strict.deepStrictEqual(r, ['abc', 'abc'])
    })

    it(`should return [12.34, 12.34] when input 12.34, 2`, function() {
        let r = repObj(12.34, 2)
        assert.strict.deepStrictEqual(r, [12.34, 12.34])
    })

    it(`should return [] when input '', 2`, function() {
        let r = repObj('', 2)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input [], 2`, function() {
        let r = repObj([], 2)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input {}, 2`, function() {
        let r = repObj({}, 2)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input null, 2`, function() {
        let r = repObj(null, 2)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input undefined, 2`, function() {
        let r = repObj(undefined, 2)
        assert.strict.deepStrictEqual(r, [])
    })


    it(`should return [] when input 'abc', ''`, function() {
        let r = repObj('abc', '')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 'abc', []`, function() {
        let r = repObj('abc', [])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 'abc', {}`, function() {
        let r = repObj('abc', {})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 'abc', null`, function() {
        let r = repObj('abc', null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return [] when input 'abc', undefined`, function() {
        let r = repObj('abc', undefined)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input ''`, function() {
        let r = repObj('')
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input []`, function() {
        let r = repObj([])
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input {}`, function() {
        let r = repObj({})
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input null`, function() {
        let r = repObj(null)
        assert.strict.deepStrictEqual(r, [])
    })

    it(`should return '' when input undefined`, function() {
        let r = repObj(undefined)
        assert.strict.deepStrictEqual(r, [])
    })

})
