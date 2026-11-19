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
        assert.throws(r, { message: 'invalid v: must be a safe integer' })
    })

    it(`should throw when input Number.MIN_SAFE_INTEGER - 1 and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint(Number.MIN_SAFE_INTEGER - 1, { useLimitSafe: true })
        }
        assert.throws(r, { message: 'invalid v: must be a safe integer' })
    })

    it(`should throw when input Infinity and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint(Infinity, { useLimitSafe: true })
        }
        assert.throws(r, { message: 'invalid v: must be a safe integer' })
    })

    it(`should throw when input -Infinity and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint(-Infinity, { useLimitSafe: true })
        }
        assert.throws(r, { message: 'invalid v: must be a safe integer' })
    })

    it(`should throw when input '1e400' and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint('1e400', { useLimitSafe: true })
        }
        assert.throws(r, { message: 'invalid v: must be a safe integer' })
    })

    it(`should throw when input 1e308 and opt.useLimitSafe=true`, function() {
        let r = () => {
            return cint(1e308, { useLimitSafe: true })
        }
        assert.throws(r, { message: 'invalid v: must be a safe integer' })
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
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'invalid v: must be a safe integer' })
    })

    it(`should return { state: 'error', msg } when input Number.MAX_SAFE_INTEGER + 1 and opt.useLimitSafe=true and opt.returnWithStateAndMsg=true`, function() {
        let r = cint(Number.MAX_SAFE_INTEGER + 1, { useLimitSafe: true, returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'error', msg: 'invalid v: must be a safe integer' })
    })

    it(`should return { state: 'success', msg: 9007199254740991 } when input Infinity and opt.useClampSafe=true and opt.returnWithStateAndMsg=true`, function() {
        let r = cint(Infinity, { useClampSafe: true, returnWithStateAndMsg: true })
        assert.strict.deepStrictEqual(r, { state: 'success', msg: 9007199254740991 })
    })

    it(`should throw when input Infinity and opt.useLimitSafe=true and opt.returnWithStateAndMsg=false`, function() {
        let r = () => {
            return cint(Infinity, { useLimitSafe: true, returnWithStateAndMsg: false })
        }
        assert.throws(r, { message: 'invalid v: must be a safe integer' })
    })

    it(`should return 2 when input 1.5 and opt.returnWithStateAndMsg='true'`, function() {
        let r = cint(1.5, { returnWithStateAndMsg: 'true' })
        assert.strict.deepStrictEqual(r, 2)
    })

})


//W-21③: cint行為不改, JSDoc寫明超出安全整數範圍會失真, 要精確先以iseint判斷(使用者2026-11-16「W-21, 1至3都甲」)
describe(`cint 超出安全整數範圍之失真(W-21③: 行為不改, 以iseint判斷精確性)`, function() {

    it(`should keep returning the distorted values beyond the safe integer range (behavior unchanged)`, function() {
        assert.strict.deepStrictEqual(cint(2 ** 60), 1152921504606847000)
        assert.strict.deepStrictEqual(cint('9007199254740993'), 9007199254740992)
        assert.strict.deepStrictEqual(cint('1.0000000000000001'), 1)
    })

    it(`should give iseint false for exactly the inputs whose cint conversion is not exact`, async function() {
        let { default: iseint } = await import('../src/iseint.mjs')
        //iseint為true者, cint之結果與數值相等(無損); 為false者(非安全整數、精度遺失之字串)才可能失真
        for (let v of [2 ** 60, '9007199254740993', '1.0000000000000001', '4503599627370496.5', 1e21, Infinity]) {
            assert.strict.deepStrictEqual([String(v), iseint(v)], [String(v), false])
        }
        for (let v of [125, '125', ' 12 ', '1.0', '1.5e1', 9007199254740991, '-9007199254740991']) {
            assert.strict.deepStrictEqual([String(v), iseint(v), cint(v) === Number(v)], [String(v), true, true])
        }
    })

    it(`should state it in the JSDoc`, async function() {
        let fs = await import('fs')
        let s = fs.readFileSync(new URL('../src/cint.mjs', import.meta.url), 'utf8')
        assert.strict.ok(/超出安全整數範圍[^\n]*失真/.test(s) && /iseint/.test(s))
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`cint 包裝物件(R-WRAPPER-01, W-20: 轉型函數照舊拆包)`, function() {

    it(`should convert the wrapper of a number or a numeric string by its primitive value (the same as the primitive)`, function() {
        //W-20: 判斷函數isnum只收原始值, 轉型函數cint經_unbox先拆包, 結果同原始值
        let pairs = [[1.5, 2], [-1.5, -1], [0, 0], [-0, 0], [125, 125], ['1.5', 2], ['-1.5', -1], [' 12 ', 12], ['0x10', 16], [Infinity, 1.7976931348623157e+308]]
        for (let [p, want] of pairs) {
            assert.strict.deepStrictEqual([String(p), cint(p)], [String(p), want])
            assert.strict.deepStrictEqual([String(p), cint(Object(p))], [String(p), want])
        }
    })

    it(`should give 0 for the wrapper of a non-number (NaN, non-numeric string, boolean), the same as the primitive`, function() {
        for (let p of [NaN, 'abc', '', ' ', true, false]) {
            assert.strict.deepStrictEqual([String(p), cint(Object(p))], [String(p), cint(p)])
            assert.strict.deepStrictEqual([String(p), cint(Object(p))], [String(p), 0])
        }
    })

    it(`should follow opt (useClampSafe, useLimitSafe, returnWithStateAndMsg) the same way for a wrapper`, function() {
        assert.strict.deepStrictEqual(cint(new Number(2 ** 60), { useClampSafe: true }), Number.MAX_SAFE_INTEGER)
        assert.strict.deepStrictEqual(cint(new String('1.5'), { returnWithStateAndMsg: true }), { state: 'success', msg: 2 })
        assert.strict.throws(() => cint(new Number(Infinity), { useLimitSafe: true }), { message: 'invalid v: must be a safe integer' })
    })

    it(`should treat a wrapper in opt as not given (isbol only accepts primitives, W-20): new Boolean(true) does not turn on useClampSafe`, function() {
        assert.strict.deepStrictEqual(cint(2 ** 60, { useClampSafe: new Boolean(true) }), 1152921504606847000)
        assert.strict.deepStrictEqual(cint(1.5, { returnWithStateAndMsg: new Boolean(true) }), 2)
    })

})
