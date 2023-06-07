import assert from 'assert'
import str2hint from '../src/str2hint.mjs'


describe(`str2hint`, function() {

    it(`should return 807794786 when input 'abc'`, function() {
        let r = str2hint('abc')
        let rr = 807794786
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 408093746 when input '123'`, function() {
        let r = str2hint('123')
        let rr = 408093746
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 10159942 when input '12.3'`, function() {
        let r = str2hint('12.3')
        let rr = 10159942
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input ''`, function() {
        let r = str2hint('')
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input false`, function() {
        let r = str2hint(false)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input []`, function() {
        let r = str2hint([])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [{}]`, function() {
        let r = str2hint([{}])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input [{ a: 123 }]`, function() {
        let r = str2hint([{ a: 123 }])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['']`, function() {
        let r = str2hint([''])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input ['abc']`, function() {
        let r = str2hint(['abc'])
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input {}`, function() {
        let r = str2hint({})
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input { a: 123 }`, function() {
        let r = str2hint({ a: 123 })
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = str2hint({ a: 123, b: null, c: [45.67] })
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input null`, function() {
        let r = str2hint(null)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return null when input undefined`, function() {
        let r = str2hint(undefined)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

})
