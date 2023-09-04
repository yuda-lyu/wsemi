import assert from 'assert'
import istimemsTZ from '../src/istimemsTZ.mjs'


describe(`istimemsTZ`, function() {

    it(`should return false when input '2019-01-91T82:73:64:321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64:321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64:321'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64:321'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64:321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64:321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64:321'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64:321'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64:321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64:321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64:321'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64:321'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64:321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64:321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64:321'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64:321'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64:321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64:321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64:321'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64:321'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64:321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64:321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64:321'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64:321'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64:321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64:321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64:321'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64:321'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64:321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64:321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64:321'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64:321'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56:321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56:321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56:321'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56:321'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56:321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56:321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56:321'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56:321'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56:321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56:321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56:321'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56:321'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56:321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56:321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56:321'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56:321'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56:321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56:321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56:321'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56:321'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56:321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56:321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56:321'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56:321'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56:321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56:321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56:321'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56:321'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56:321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56:321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56:321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56:321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56:321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56:321'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56:321'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56:321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.abcZ'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.abcZ'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.abc'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.abc'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.abcZ'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.abcZ'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.abc'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.abc'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.abcZ'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.abcZ'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.abc'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.abc'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.abcZ'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.abcZ'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.abc'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.abc'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.abcZ'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.abcZ'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.abc'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.abc'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.abcZ'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.abcZ'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.abc'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.abc'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.abcZ'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.abcZ'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.abc'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.abc'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.abcZ'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.abcZ'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.abc'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.abc'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.abcZ'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.abcZ'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.abc'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.abc'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.abcZ'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.abcZ'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.abc'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.abc'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.abcZ'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.abcZ'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.abc'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.abc'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.abcZ'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.abcZ'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.abc'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.abc'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.abcZ'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.abcZ'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.abc'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.abc'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.abcZ'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.abcZ'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.abc'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.abc'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.abcZ'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.abcZ'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.abc'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.abc'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.abcZ'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56.abcZ'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.abcZ')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56.abc+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.abc+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.abc'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56.abc'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.4321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.4321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.4321'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.4321'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.4321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.4321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.4321'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.4321'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.4321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.4321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.4321'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.4321'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.4321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.4321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.4321'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.4321'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.4321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.4321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.4321'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.4321'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.4321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.4321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.4321'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.4321'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.4321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.4321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.4321'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.4321'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.4321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.4321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.4321'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.4321'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.4321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.4321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.4321'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.4321'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.4321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.4321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.4321'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.4321'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.4321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.4321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.4321'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.4321'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.4321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.4321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.4321'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.4321'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.4321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.4321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.4321'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.4321'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.4321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.4321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.4321'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.4321'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.4321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.4321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.4321'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.4321'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.4321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56.4321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.4321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56.4321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.4321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.4321'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56.4321'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.4321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.21Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.21Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.21'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.21'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.21Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.21Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.21'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.21'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.21Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.21Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.21'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.21'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.21Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.21Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.21'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.21'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.21Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.21Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.21'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.21'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.21Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.21Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.21'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.21'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.21Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.21Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.21'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.21'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.21Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.21Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.21'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.21'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.21Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.21Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.21'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.21'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.21Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.21Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.21'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.21'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.21Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.21Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.21'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.21'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.21Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.21Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.21'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.21'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.21Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.21Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.21'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.21'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.21Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.21Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.21'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.21'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.21Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.21Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.21'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.21'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.21Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56.21Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56.21+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.21'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56.21'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64.321'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64.321'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64.321'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64.321'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64.321'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64.321'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64.321'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64.321'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64.321'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64.321'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64.321'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64.321'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64.321'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64.321'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64.321'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64.321'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56.321'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56.321'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56.321'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56.321'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56.321'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56.321'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56.321'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56.321'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.321Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.321Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56.321'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56.321'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.321Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.321Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56.321'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56.321'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.321Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.321Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56.321'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56.321'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.321Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.321Z')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '2019-21-01T12:34:56.321Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.321Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.321+08:00')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '2019-21-01T12:34:56.321+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.321+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56.321'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56.321'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56.321')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:64'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:64'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:64'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:64'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:64'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:64'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:64'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:64'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:64'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:64'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:64'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:64'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:64'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:64'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:64'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:64'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:64')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73:56'`, function() {
        let r = istimemsTZ('2019-01-91T82:73:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73:56'`, function() {
        let r = istimemsTZ('2019-21-91T82:73:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73:56'`, function() {
        let r = istimemsTZ('2019-01-01T82:73:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73:56'`, function() {
        let r = istimemsTZ('2019-21-01T82:73:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73:56'`, function() {
        let r = istimemsTZ('2019-01-91T12:73:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73:56'`, function() {
        let r = istimemsTZ('2019-21-91T12:73:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73:56'`, function() {
        let r = istimemsTZ('2019-01-01T12:73:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73:56'`, function() {
        let r = istimemsTZ('2019-21-01T12:73:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34:56'`, function() {
        let r = istimemsTZ('2019-01-91T82:34:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34:56'`, function() {
        let r = istimemsTZ('2019-21-91T82:34:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34:56'`, function() {
        let r = istimemsTZ('2019-01-01T82:34:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34:56'`, function() {
        let r = istimemsTZ('2019-21-01T82:34:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34:56'`, function() {
        let r = istimemsTZ('2019-01-91T12:34:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34:56'`, function() {
        let r = istimemsTZ('2019-21-91T12:34:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56'`, function() {
        let r = istimemsTZ('2019-01-01T12:34:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56'`, function() {
        let r = istimemsTZ('2019-21-01T12:34:56')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:73Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:73Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:73+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:73+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:73'`, function() {
        let r = istimemsTZ('2019-01-91T82:73')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:73'`, function() {
        let r = istimemsTZ('2019-21-91T82:73')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:73Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:73Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:73+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:73+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:73'`, function() {
        let r = istimemsTZ('2019-01-01T82:73')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:73'`, function() {
        let r = istimemsTZ('2019-21-01T82:73')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:73Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:73Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:73+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:73+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:73'`, function() {
        let r = istimemsTZ('2019-01-91T12:73')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:73'`, function() {
        let r = istimemsTZ('2019-21-91T12:73')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:73Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:73Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:73+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:73+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:73'`, function() {
        let r = istimemsTZ('2019-01-01T12:73')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:73'`, function() {
        let r = istimemsTZ('2019-21-01T12:73')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34Z'`, function() {
        let r = istimemsTZ('2019-01-91T82:34Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34Z'`, function() {
        let r = istimemsTZ('2019-21-91T82:34Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82:34+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82:34+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82:34'`, function() {
        let r = istimemsTZ('2019-01-91T82:34')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82:34'`, function() {
        let r = istimemsTZ('2019-21-91T82:34')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34Z'`, function() {
        let r = istimemsTZ('2019-01-01T82:34Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34Z'`, function() {
        let r = istimemsTZ('2019-21-01T82:34Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82:34+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82:34+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82:34'`, function() {
        let r = istimemsTZ('2019-01-01T82:34')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82:34'`, function() {
        let r = istimemsTZ('2019-21-01T82:34')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34Z'`, function() {
        let r = istimemsTZ('2019-01-91T12:34Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34Z'`, function() {
        let r = istimemsTZ('2019-21-91T12:34Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12:34+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12:34+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12:34'`, function() {
        let r = istimemsTZ('2019-01-91T12:34')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12:34'`, function() {
        let r = istimemsTZ('2019-21-91T12:34')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34Z'`, function() {
        let r = istimemsTZ('2019-01-01T12:34Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34Z'`, function() {
        let r = istimemsTZ('2019-21-01T12:34Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12:34+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12:34+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34'`, function() {
        let r = istimemsTZ('2019-01-01T12:34')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34'`, function() {
        let r = istimemsTZ('2019-21-01T12:34')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82Z'`, function() {
        let r = istimemsTZ('2019-01-91T82Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82Z'`, function() {
        let r = istimemsTZ('2019-21-91T82Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T82+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T82+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T82'`, function() {
        let r = istimemsTZ('2019-01-91T82')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T82'`, function() {
        let r = istimemsTZ('2019-21-91T82')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82Z'`, function() {
        let r = istimemsTZ('2019-01-01T82Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82Z'`, function() {
        let r = istimemsTZ('2019-21-01T82Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T82+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T82+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T82'`, function() {
        let r = istimemsTZ('2019-01-01T82')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T82'`, function() {
        let r = istimemsTZ('2019-21-01T82')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12Z'`, function() {
        let r = istimemsTZ('2019-01-91T12Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12Z'`, function() {
        let r = istimemsTZ('2019-21-91T12Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12+08:00'`, function() {
        let r = istimemsTZ('2019-01-91T12+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12+08:00'`, function() {
        let r = istimemsTZ('2019-21-91T12+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91T12'`, function() {
        let r = istimemsTZ('2019-01-91T12')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91T12'`, function() {
        let r = istimemsTZ('2019-21-91T12')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12Z'`, function() {
        let r = istimemsTZ('2019-01-01T12Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12Z'`, function() {
        let r = istimemsTZ('2019-21-01T12Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12+08:00'`, function() {
        let r = istimemsTZ('2019-01-01T12+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12+08:00'`, function() {
        let r = istimemsTZ('2019-21-01T12+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12'`, function() {
        let r = istimemsTZ('2019-01-01T12')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12'`, function() {
        let r = istimemsTZ('2019-21-01T12')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91Z'`, function() {
        let r = istimemsTZ('2019-01-91Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91Z'`, function() {
        let r = istimemsTZ('2019-21-91Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91+08:00'`, function() {
        let r = istimemsTZ('2019-01-91+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91+08:00'`, function() {
        let r = istimemsTZ('2019-21-91+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-91'`, function() {
        let r = istimemsTZ('2019-01-91')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-91'`, function() {
        let r = istimemsTZ('2019-21-91')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01Z'`, function() {
        let r = istimemsTZ('2019-01-01Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01Z'`, function() {
        let r = istimemsTZ('2019-21-01Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01+08:00'`, function() {
        let r = istimemsTZ('2019-01-01+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01+08:00'`, function() {
        let r = istimemsTZ('2019-21-01+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01-01'`, function() {
        let r = istimemsTZ('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = istimemsTZ('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01Z'`, function() {
        let r = istimemsTZ('2019-01Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21Z'`, function() {
        let r = istimemsTZ('2019-21Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01+08:00'`, function() {
        let r = istimemsTZ('2019-01+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21+08:00'`, function() {
        let r = istimemsTZ('2019-21+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = istimemsTZ('2019-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = istimemsTZ('2019-21')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019Z'`, function() {
        let r = istimemsTZ('2019Z')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019+08:00'`, function() {
        let r = istimemsTZ('2019+08:00')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019'`, function() {
        let r = istimemsTZ('2019')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = istimemsTZ(function() {})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = istimemsTZ(0)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = istimemsTZ(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = istimemsTZ(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = istimemsTZ(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = istimemsTZ(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = istimemsTZ('0')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = istimemsTZ('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = istimemsTZ('-125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = istimemsTZ('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = istimemsTZ('-1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = istimemsTZ('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = istimemsTZ('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abC125'`, function() {
        let r = istimemsTZ('abC125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC125'`, function() {
        let r = istimemsTZ('ABC125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc'`, function() {
        let r = istimemsTZ('abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC'`, function() {
        let r = istimemsTZ('ABC')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '中文'`, function() {
        let r = istimemsTZ('中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc中文'`, function() {
        let r = istimemsTZ('abc中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'ABC中文'`, function() {
        let r = istimemsTZ('ABC中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1234中文'`, function() {
        let r = istimemsTZ('1234中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12.34中文'`, function() {
        let r = istimemsTZ('12.34中文')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = istimemsTZ('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = istimemsTZ('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = istimemsTZ(false)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = istimemsTZ([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = istimemsTZ([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = istimemsTZ([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = istimemsTZ([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = istimemsTZ(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = istimemsTZ({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = istimemsTZ({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = istimemsTZ({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = istimemsTZ(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = istimemsTZ(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = istimemsTZ(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
