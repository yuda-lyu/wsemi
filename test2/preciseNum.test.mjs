import assert from 'assert'
import preciseNum from '../src/preciseNum.mjs'


describe(`preciseNum`, function() {

    it(`should return '0' when input 0`, function() {
        let r = preciseNum(0)
        let rr = '0'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '1' when input 1`, function() {
        let r = preciseNum(1)
        let rr = '1'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '0.3' when input 0.3`, function() {
        let r = preciseNum(0.3)
        let rr = '0.3'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '0.3' when input 0.1 + 0.2`, function() {
        let r = preciseNum(0.1 + 0.2)
        let rr = '0.3'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '106.19' when input 4.67 + 7.12 + 94.4`, function() {
        let r = preciseNum(4.67 + 7.12 + 94.4)
        let rr = '106.19'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '106.19' when input 94.4 + 7.12 + 4.67`, function() {
        let r = preciseNum(94.4 + 7.12 + 4.67)
        let rr = '106.19'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input 0, { returnDigit: true }`, function() {
        let r = preciseNum(0, { returnDigit: true })
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 0 when input 1, { returnDigit: true }`, function() {
        let r = preciseNum(1, { returnDigit: true })
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 0.3, { returnDigit: true }`, function() {
        let r = preciseNum(0.3, { returnDigit: true })
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 1 when input 0.1 + 0.2, { returnDigit: true }`, function() {
        let r = preciseNum(0.1 + 0.2, { returnDigit: true })
        let rr = 1
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2 when input 4.67 + 7.12 + 94.4, { returnDigit: true }`, function() {
        let r = preciseNum(4.67 + 7.12 + 94.4, { returnDigit: true })
        let rr = 2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 2 when input 94.4 + 7.12 + 4.67, { returnDigit: true }`, function() {
        let r = preciseNum(94.4 + 7.12 + 4.67, { returnDigit: true })
        let rr = 2
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '-0.3' when input -0.3`, function() {
        let r = preciseNum(-0.3)
        let rr = '-0.3'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '-0.3' when input -0.1 - 0.2`, function() {
        let r = preciseNum(-0.1 - 0.2)
        let rr = '-0.3'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '-106.19' when input -4.67 - 7.12 - 94.4`, function() {
        let r = preciseNum(-4.67 - 7.12 - 94.4)
        let rr = '-106.19'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return '-106.19' when input -94.4 - 7.12 - 4.67`, function() {
        let r = preciseNum(-94.4 - 7.12 - 4.67)
        let rr = '-106.19'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input ''`, function() {
        let r = ''
        try {
            r = preciseNum('')
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input false`, function() {
        let r = ''
        try {
            r = preciseNum(false)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input []`, function() {
        let r = ''
        try {
            r = preciseNum([])
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input {}`, function() {
        let r = ''
        try {
            r = preciseNum({})
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input null`, function() {
        let r = ''
        try {
            r = preciseNum(null)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input undefined`, function() {
        let r = ''
        try {
            r = preciseNum(undefined)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return 'v is not a number' when input NaN`, function() {
        let r = ''
        try {
            r = preciseNum(NaN)
        }
        catch (err) {
            r = err.message
        }
        let rr = 'v is not a number'
        assert.strict.deepStrictEqual(r, rr)
    })

})
