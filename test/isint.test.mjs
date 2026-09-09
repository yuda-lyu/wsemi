import assert from 'assert'
import isint from '../src/isint.mjs'


describe(`isint`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isint('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isint('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isint(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isint('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '125'`, function() {
        let r = isint('125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 125`, function() {
        let r = isint(125)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input -125`, function() {
        let r = isint(-125)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input 1.25`, function() {
        let r = isint(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isint(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isint('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isint('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isint('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isint('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isint(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isint([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isint([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isint([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isint([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isint(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isint({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isint({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isint({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isint(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isint(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isint(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input Infinity by default`, function() {
        let r = isint(Infinity)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input Number.MAX_SAFE_INTEGER + 1 by default`, function() {
        let r = isint(Number.MAX_SAFE_INTEGER + 1)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 125 and opt.useLimitSafe=true`, function() {
        let r = isint(125, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input Number.MAX_SAFE_INTEGER and opt.useLimitSafe=true`, function() {
        let r = isint(Number.MAX_SAFE_INTEGER, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input Number.MIN_SAFE_INTEGER and opt.useLimitSafe=true`, function() {
        let r = isint(Number.MIN_SAFE_INTEGER, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input Number.MAX_SAFE_INTEGER + 1 and opt.useLimitSafe=true`, function() {
        let r = isint(Number.MAX_SAFE_INTEGER + 1, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input Number.MIN_SAFE_INTEGER - 2 and opt.useLimitSafe=true`, function() {
        let r = isint(Number.MIN_SAFE_INTEGER - 2, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1e308 and opt.useLimitSafe=true`, function() {
        let r = isint(1e308, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input Infinity and opt.useLimitSafe=true`, function() {
        let r = isint(Infinity, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -Infinity and opt.useLimitSafe=true`, function() {
        let r = isint(-Infinity, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1e400' and opt.useLimitSafe=true`, function() {
        let r = isint('1e400', { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25 and opt.useLimitSafe=true`, function() {
        let r = isint(1.25, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN and opt.useLimitSafe=true`, function() {
        let r = isint(NaN, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input Infinity and opt.useLimitSafe='true'`, function() {
        let r = isint(Infinity, { useLimitSafe: 'true' })
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input Infinity and opt=null`, function() {
        let r = isint(Infinity, null)
        assert.strict.deepStrictEqual(r, true)
    })

})
