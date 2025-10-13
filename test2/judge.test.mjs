import assert from 'assert'
import judge from '../src/judge.mjs'
import Decimal from 'decimal.js'


describe(`judge`, function() {

    it(`should return true when input 0, '>=', 0, { withPreciseNum: false }`, function() {
        let r = judge(0, '>=', 0, { withPreciseNum: false })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input 1, '>=', 1, { withPreciseNum: false }`, function() {
        let r = judge(1, '>=', 1, { withPreciseNum: false })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input 0.3, '>=', 0.1 + 0.2, { withPreciseNum: false }`, function() {
        let r = judge(0.3, '>=', 0.1 + 0.2, { withPreciseNum: false })
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input 0.3, '>=', 0.1 + 0.2, { withPreciseNum: true }`, function() {
        let r = judge(0.3, '>=', 0.1 + 0.2, { withPreciseNum: true })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input 0.3, '>=', Decimal.sum(0.1, 0.2).toString(), { withPreciseNum: false }`, function() {
        let r = judge(0.3, '>=', Decimal.sum(0.1, 0.2).toString(), { withPreciseNum: false })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input Decimal.sum(0.1, 0.2).toString(), '>=', 0.3, { withPreciseNum: false }`, function() {
        let r = judge(Decimal.sum(0.1, 0.2).toString(), '>=', 0.3, { withPreciseNum: false })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return false when input 4.67 + 7.12 + 94.4, '>=',  94.4 + 7.12 + 4.67, { withPreciseNum: false }`, function() {
        let r = judge(4.67 + 7.12 + 94.4, '>=', 94.4 + 7.12 + 4.67, { withPreciseNum: false })
        let rr = false
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input 4.67 + 7.12 + 94.4, '>=',  94.4 + 7.12 + 4.67, { withPreciseNum: true }`, function() {
        let r = judge(4.67 + 7.12 + 94.4, '>=', 94.4 + 7.12 + 4.67, { withPreciseNum: true })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return true when input Decimal.sum(4.67, 7.12, 94.4).toString(), '>=', Decimal.sum(94.4, 7.12, 4.67).toString(), { withPreciseNum: false }`, function() {
        let r = judge(Decimal.sum(4.67, 7.12, 94.4).toString(), '>=', Decimal.sum(94.4, 7.12, 4.67).toString(), { withPreciseNum: false })
        let rr = true
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input ''`, function() {
        let r = ''
        try {
            r = judge('')
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input false`, function() {
        let r = ''
        try {
            r = judge(false)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input []`, function() {
        let r = ''
        try {
            r = judge([])
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input {}`, function() {
        let r = ''
        try {
            r = judge({})
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input null`, function() {
        let r = ''
        try {
            r = judge(null)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input undefined`, function() {
        let r = ''
        try {
            r = judge(undefined)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '' when input NaN`, function() {
        let r = ''
        try {
            r = judge(NaN)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'x1 is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

})
