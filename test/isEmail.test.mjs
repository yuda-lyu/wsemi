import assert from 'assert'
import isEmail from '../src/isEmail.mjs'


describe(`isEmail`, function() {

    it(`should return true when input 'abc@mail.com'`, function() {
        let r = isEmail('abc@mail.com')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'abc'`, function() {
        let r = isEmail('abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc#'`, function() {
        let r = isEmail('abc#')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc@'`, function() {
        let r = isEmail('abc@')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc@a'`, function() {
        let r = isEmail('abc@a')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc@a.b'`, function() {
        let r = isEmail('abc@a.b')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc@com'`, function() {
        let r = isEmail('abc@com')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc@a.b.t'`, function() {
        let r = isEmail('abc@a.b.t')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 'abc@a.com'`, function() {
        let r = isEmail('abc@a.com')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 'a bc@a.com'`, function() {
        let r = isEmail('a bc@a.com')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 'a.bc@a.com'`, function() {
        let r = isEmail('a.bc@a.com')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 'a_bc@a.com'`, function() {
        let r = isEmail('a_bc@a.com')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '2019-01-01'`, function() {
        let r = isEmail('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isEmail('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isEmail('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isEmail('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isEmail(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 0`, function() {
        let r = isEmail(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isEmail(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input -125`, function() {
        let r = isEmail(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isEmail(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isEmail(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '0'`, function() {
        let r = isEmail('0')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isEmail('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '-125'`, function() {
        let r = isEmail('-125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isEmail('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isEmail('-1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isEmail('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isEmail('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isEmail('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isEmail('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isEmail(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isEmail([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isEmail([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isEmail([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isEmail([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isEmail(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isEmail({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isEmail({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isEmail({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isEmail(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isEmail(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isEmail(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
