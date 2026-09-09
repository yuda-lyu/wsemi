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

    it(`should return null when input NaN`, function() {
        let r = str2hint(NaN)
        let rr = null
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input 'abc' with returnWithStateAndMsg`, function() {
        let r = str2hint('abc', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: 807794786 }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg: 0 } when input '' with returnWithStateAndMsg`, function() {
        //空字串為合法輸入, 對應0, 不可視為失敗
        let r = str2hint('', { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: 0 }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid str' } when input NaN with returnWithStateAndMsg`, function() {
        let r = str2hint(NaN, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid str' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = str2hint('abc', { returnWithStateAndMsg: 'yes' })
        let rr = 807794786
        assert.strict.deepStrictEqual(r, rr)
    })

})
