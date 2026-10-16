import assert from 'assert'
import isp0int from '../src/isp0int.mjs'


describe(`isp0int`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isp0int('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isp0int('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isp0int('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isp0int('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isp0int(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input 0`, function() {
        let r = isp0int(0)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 125`, function() {
        let r = isp0int(125)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input -125`, function() {
        let r = isp0int(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isp0int(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isp0int(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '0'`, function() {
        let r = isp0int('0')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '125'`, function() {
        let r = isp0int('125')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '-125'`, function() {
        let r = isp0int('-125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isp0int('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isp0int('-1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isp0int('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isp0int('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isp0int('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isp0int('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isp0int(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isp0int([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isp0int([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isp0int([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isp0int([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isp0int(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isp0int({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isp0int({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isp0int({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isp0int(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isp0int(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isp0int(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input Infinity by default`, function() {
        let r = isp0int(Infinity)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input Number.MAX_SAFE_INTEGER + 1 by default`, function() {
        let r = isp0int(Number.MAX_SAFE_INTEGER + 1)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 0 and opt.useLimitSafe=true`, function() {
        let r = isp0int(0, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input 125 and opt.useLimitSafe=true`, function() {
        let r = isp0int(125, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input Number.MAX_SAFE_INTEGER and opt.useLimitSafe=true`, function() {
        let r = isp0int(Number.MAX_SAFE_INTEGER, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input Number.MAX_SAFE_INTEGER + 1 and opt.useLimitSafe=true`, function() {
        let r = isp0int(Number.MAX_SAFE_INTEGER + 1, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input Infinity and opt.useLimitSafe=true`, function() {
        let r = isp0int(Infinity, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -Infinity and opt.useLimitSafe=true`, function() {
        let r = isp0int(-Infinity, { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1e400' and opt.useLimitSafe=true`, function() {
        let r = isp0int('1e400', { useLimitSafe: true })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input Infinity and opt.useLimitSafe='true'`, function() {
        let r = isp0int(Infinity, { useLimitSafe: 'true' })
        assert.strict.deepStrictEqual(r, true)
    })

})


/* eslint-disable no-new-wrappers */ //本段刻意建立包裝物件以驗R-WRAPPER-01
describe(`isp0int 包裝物件(R-WRAPPER-01)`, function() {

    it(`should return false when input new Number(NaN)`, function() {
        //R-WRAPPER-01 規則2: isnum族隨之一致, 同isp0int(NaN)為false
        assert.strict.deepStrictEqual(isp0int(new Number(NaN)), false)
    })

    it(`should return true when input new Number(2)`, function() {
        //R-WRAPPER-01 規則1: 包裝物件視同其型別, 依其原始值判定(同isp0int(2))
        assert.strict.deepStrictEqual(isp0int(new Number(2)), true)
    })

})
