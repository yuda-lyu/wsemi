import assert from 'assert'
import cint from '../src/cint.mjs'


describe(`cint`, function() {

    it(`should return 0 when input 0`, function() {
        let r = cint(0)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 0 when input 0.1`, function() {
        let r = cint(0)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 0 when input 0.123456789`, function() {
        let r = cint(0.123456789)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 1 when input 1.4`, function() {
        let r = cint(1.4)
        assert.strict.deepStrictEqual(r, 1)
    })

    it(`should return 2 when input 1.5`, function() {
        let r = cint(1.5)
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 3 when input 2.5`, function() {
        let r = cint(2.5)
        assert.strict.deepStrictEqual(r, 3)
    })

    it(`should return 0 when input -0.123456789`, function() {
        let r = cint(-0.123456789)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return -1 when input -1.4`, function() {
        let r = cint(-1.4)
        assert.strict.deepStrictEqual(r, -1)
    })

    it(`should return -1 when input -1.5`, function() {
        let r = cint(-1.5)
        assert.strict.deepStrictEqual(r, -1)
    })

    it(`should return -2 when input -2.5`, function() {
        let r = cint(-2.5)
        assert.strict.deepStrictEqual(r, -2)
    })

    it(`should return 100 when input 100`, function() {
        let r = cint(100)
        assert.strict.deepStrictEqual(r, 100)
    })

    it(`should return 1234567 when input 1234567`, function() {
        let r = cint(1234567)
        assert.strict.deepStrictEqual(r, 1234567)
    })

    it(`should return 1234568 when input 1234567.89`, function() {
        let r = cint(1234567.89)
        assert.strict.deepStrictEqual(r, 1234568)
    })

    it(`should return 0 when input '0'`, function() {
        let r = cint('0')
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 0 when input '0.1'`, function() {
        let r = cint('0.1')
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 0 when input '0.123456789'`, function() {
        let r = cint('0.123456789')
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 1 when input '1.4'`, function() {
        let r = cint('1.4')
        assert.strict.deepStrictEqual(r, 1)
    })

    it(`should return 2 when input '1.5'`, function() {
        let r = cint('1.5')
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 3 when input '2.5'`, function() {
        let r = cint('2.5')
        assert.strict.deepStrictEqual(r, 3)
    })

    it(`should return 0 when input '-0.123456789'`, function() {
        let r = cint('-0.123456789')
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return -1 when input '-1.4'`, function() {
        let r = cint('-1.4')
        assert.strict.deepStrictEqual(r, -1)
    })

    it(`should return -1 when input '-1.5'`, function() {
        let r = cint('-1.5')
        assert.strict.deepStrictEqual(r, -1)
    })

    it(`should return -2 when input '-2.5'`, function() {
        let r = cint('-2.5')
        assert.strict.deepStrictEqual(r, -2)
    })

    it(`should return 100 when input '100'`, function() {
        let r = cint('100')
        assert.strict.deepStrictEqual(r, 100)
    })

    it(`should return 1234567 when input '1234567'`, function() {
        let r = cint('1234567')
        assert.strict.deepStrictEqual(r, 1234567)
    })

    it(`should return 1234568 when input '1234567.89'`, function() {
        let r = cint('1234567.89')
        assert.strict.deepStrictEqual(r, 1234568)
    })

    it(`should return 0 when input '100abc'`, function() {
        let r = cint('100abc')
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input ''`, function() {
        let r = cint('')
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input []`, function() {
        let r = cint([])
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input {}`, function() {
        let r = cint({})
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input null`, function() {
        let r = cint(null)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input undefined`, function() {
        let r = cint(undefined)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return '' when input NaN`, function() {
        let r = cint(NaN)
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 9007199254740992 when input Number.MAX_SAFE_INTEGER + 1 by default`, function() {
        let r = cint(Number.MAX_SAFE_INTEGER + 1)
        assert.strict.deepStrictEqual(r, 9007199254740992)
    })

    it(`should return 1.7976931348623157e+308 when input Infinity by default`, function() {
        let r = cint(Infinity)
        assert.strict.deepStrictEqual(r, 1.7976931348623157e+308)
    })

    it(`should return -1.7976931348623157e+308 when input -Infinity by default`, function() {
        let r = cint(-Infinity)
        assert.strict.deepStrictEqual(r, -1.7976931348623157e+308)
    })

    it(`should return 2 when input 1.5 and opt.useLimitSafe=true`, function() {
        let r = cint(1.5, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 0 when input NaN and opt.useLimitSafe=true`, function() {
        let r = cint(NaN, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 9007199254740991 when input Number.MAX_SAFE_INTEGER and opt.useLimitSafe=true`, function() {
        let r = cint(Number.MAX_SAFE_INTEGER, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, 9007199254740991)
    })

    it(`should return -9007199254740991 when input Number.MIN_SAFE_INTEGER and opt.useLimitSafe=true`, function() {
        let r = cint(Number.MIN_SAFE_INTEGER, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, -9007199254740991)
    })

    it(`should throw when input Number.MAX_SAFE_INTEGER + 1 and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint(Number.MAX_SAFE_INTEGER + 1, { useLimitSafe: true })
        }
        assert.throws(r, /is not a safe integer/)
    })

    it(`should throw when input Number.MIN_SAFE_INTEGER - 1 and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint(Number.MIN_SAFE_INTEGER - 1, { useLimitSafe: true })
        }
        assert.throws(r, /is not a safe integer/)
    })

    it(`should throw when input Infinity and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint(Infinity, { useLimitSafe: true })
        }
        assert.throws(r, /is not a safe integer/)
    })

    it(`should throw when input -Infinity and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint(-Infinity, { useLimitSafe: true })
        }
        assert.throws(r, /is not a safe integer/)
    })

    it(`should throw when input '1e400' and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint('1e400', { useLimitSafe: true })
        }
        assert.throws(r, /is not a safe integer/)
    })

    it(`should throw when input 1e308 and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint(1e308, { useLimitSafe: true })
        }
        assert.throws(r, /is not a safe integer/)
    })

    it(`should return 9007199254740992 when input Number.MAX_SAFE_INTEGER + 1 and opt.useLimitSafe='true'`, function() {
        let r = cint(Number.MAX_SAFE_INTEGER + 1, { useLimitSafe: 'true' })
        assert.strict.deepStrictEqual(r, 9007199254740992)
    })

    it(`should return 9007199254740992 when input Number.MAX_SAFE_INTEGER + 1 and opt.useLimitSafe=false`, function() {
        let r = cint(Number.MAX_SAFE_INTEGER + 1, { useLimitSafe: false })
        assert.strict.deepStrictEqual(r, 9007199254740992)
    })

    it(`should return 9007199254740992 when input Number.MAX_SAFE_INTEGER + 1 and opt=null`, function() {
        let r = cint(Number.MAX_SAFE_INTEGER + 1, null)
        assert.strict.deepStrictEqual(r, 9007199254740992)
    })

    it(`should return 2 when input 1.5 and opt.useClampSafe=true`, function() {
        let r = cint(1.5, { useClampSafe: true })
        assert.strict.deepStrictEqual(r, 2)
    })

    it(`should return 0 when input NaN and opt.useClampSafe=true`, function() {
        let r = cint(NaN, { useClampSafe: true })
        assert.strict.deepStrictEqual(r, 0)
    })

    it(`should return 9007199254740991 when input Number.MAX_SAFE_INTEGER and opt.useClampSafe=true`, function() {
        let r = cint(Number.MAX_SAFE_INTEGER, { useClampSafe: true })
        assert.strict.deepStrictEqual(r, 9007199254740991)
    })

    it(`should return -9007199254740991 when input Number.MIN_SAFE_INTEGER and opt.useClampSafe=true`, function() {
        let r = cint(Number.MIN_SAFE_INTEGER, { useClampSafe: true })
        assert.strict.deepStrictEqual(r, -9007199254740991)
    })

    it(`should return 9007199254740991 when input Number.MAX_SAFE_INTEGER + 1 and opt.useClampSafe=true`, function() {
        let r = cint(Number.MAX_SAFE_INTEGER + 1, { useClampSafe: true })
        assert.strict.deepStrictEqual(r, 9007199254740991)
    })

    it(`should return -9007199254740991 when input Number.MIN_SAFE_INTEGER - 2 and opt.useClampSafe=true`, function() {
        let r = cint(Number.MIN_SAFE_INTEGER - 2, { useClampSafe: true })
        assert.strict.deepStrictEqual(r, -9007199254740991)
    })

    it(`should return 9007199254740991 when input 1e308 and opt.useClampSafe=true`, function() {
        let r = cint(1e308, { useClampSafe: true })
        assert.strict.deepStrictEqual(r, 9007199254740991)
    })

    it(`should return 9007199254740991 when input Infinity and opt.useClampSafe=true`, function() {
        let r = cint(Infinity, { useClampSafe: true })
        assert.strict.deepStrictEqual(r, 9007199254740991)
    })

    it(`should return -9007199254740991 when input -Infinity and opt.useClampSafe=true`, function() {
        let r = cint(-Infinity, { useClampSafe: true })
        assert.strict.deepStrictEqual(r, -9007199254740991)
    })

    it(`should return 9007199254740991 when input '1e400' and opt.useClampSafe=true`, function() {
        let r = cint('1e400', { useClampSafe: true })
        assert.strict.deepStrictEqual(r, 9007199254740991)
    })

    it(`should return 1.7976931348623157e+308 when input Infinity and opt.useClampSafe='true'`, function() {
        let r = cint(Infinity, { useClampSafe: 'true' })
        assert.strict.deepStrictEqual(r, 1.7976931348623157e+308)
    })

    it(`should return 9007199254740991 when input Infinity and opt.useClampSafe=true with opt.useLimitSafe=true`, function() {
        let r = cint(Infinity, { useClampSafe: true, useLimitSafe: true })
        assert.strict.deepStrictEqual(r, 9007199254740991)
    })

    it(`should return { state: 'success', msg: 2 } when input 1.5 and opt.returnWithStateAndMsg=true`, function() {
        let r = cint(1.5, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'success', msg: 2 })
    })

    it(`should return { state: 'success', msg: -1 } when input '-1.5' and opt.returnWithStateAndMsg=true`, function() {
        let r = cint('-1.5', { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'success', msg: -1 })
    })

    it(`should return { state: 'success', msg: 0 } when input '100abc' and opt.returnWithStateAndMsg=true`, function() {
        let r = cint('100abc', { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'success', msg: 0 })
    })

    it(`should return { state: 'success', msg: 0 } when input -0.4 and opt.returnWithStateAndMsg=true`, function() {
        let r = cint(-0.4, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'success', msg: 0 })
    })

    it(`should return { state: 'success', msg: 9007199254740992 } when input Number.MAX_SAFE_INTEGER + 1 and opt.returnWithStateAndMsg=true`, function() {
        let r = cint(Number.MAX_SAFE_INTEGER + 1, { returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'success', msg: 9007199254740992 })
    })

    it(`should return { state: 'error', msg } when input Infinity and opt.useLimitSafe=true and opt.returnWithStateAndMsg=true`, function() {
        let r = cint(Infinity, { useLimitSafe: true, returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'v[1.7976931348623157e+308] is not a safe integer' })
    })

    it(`should return { state: 'error', msg } when input Number.MAX_SAFE_INTEGER + 1 and opt.useLimitSafe=true and opt.returnWithStateAndMsg=true`, function() {
        let r = cint(Number.MAX_SAFE_INTEGER + 1, { useLimitSafe: true, returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'v[9007199254740992] is not a safe integer' })
    })

    it(`should return { state: 'success', msg: 9007199254740991 } when input Infinity and opt.useClampSafe=true and opt.returnWithStateAndMsg=true`, function() {
        let r = cint(Infinity, { useClampSafe: true, returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'success', msg: 9007199254740991 })
    })

    it(`should throw when input Infinity and opt.useLimitSafe=true and opt.returnWithStateAndMsg=false`, function() {
        let r = () => {
            return cint(Infinity, { useLimitSafe: true, returnWithStateAndMsg: false })
        }
        assert.throws(r, /is not a safe integer/)
    })

    it(`should return 2 when input 1.5 and opt.returnWithStateAndMsg='true'`, function() {
        let r = cint(1.5, { returnWithStateAndMsg: 'true' })
        assert.strict.deepStrictEqual(r, 2)
    })

})
