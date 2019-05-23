import assert from 'assert'
import cint from '../src/cint.mjs'


describe(`cint`, function() {

    it(`should return 0 when input 0`, function() {
        let r = cint(0)
        assert.strict.deepEqual(r, 0)
    })

    it(`should return 0 when input 0.1`, function() {
        let r = cint(0)
        assert.strict.deepEqual(r, 0)
    })

    it(`should return 0 when input 0.123456789`, function() {
        let r = cint(0.123456789)
        assert.strict.deepEqual(r, 0)
    })

    it(`should return 1 when input 1.4`, function() {
        let r = cint(1.4)
        assert.strict.deepEqual(r, 1)
    })

    it(`should return 2 when input 1.5`, function() {
        let r = cint(1.5)
        assert.strict.deepEqual(r, 2)
    })

    it(`should return 3 when input 2.5`, function() {
        let r = cint(2.5)
        assert.strict.deepEqual(r, 3)
    })

    it(`should return 0 when input -0.123456789`, function() {
        let r = cint(-0.123456789)
        assert.strict.deepEqual(r, 0)
    })

    it(`should return -1 when input -1.4`, function() {
        let r = cint(-1.4)
        assert.strict.deepEqual(r, -1)
    })

    it(`should return -1 when input -1.5`, function() {
        let r = cint(-1.5)
        assert.strict.deepEqual(r, -1)
    })

    it(`should return -2 when input -2.5`, function() {
        let r = cint(-2.5)
        assert.strict.deepEqual(r, -2)
    })

    it(`should return 100 when input 100`, function() {
        let r = cint(100)
        assert.strict.deepEqual(r, 100)
    })

    it(`should return 1234567 when input 1234567`, function() {
        let r = cint(1234567)
        assert.strict.deepEqual(r, 1234567)
    })

    it(`should return 1234568 when input 1234567.89`, function() {
        let r = cint(1234567.89)
        assert.strict.deepEqual(r, 1234568)
    })

    it(`should return 0 when input '0'`, function() {
        let r = cint('0')
        assert.strict.deepEqual(r, 0)
    })

    it(`should return 0 when input '0.1'`, function() {
        let r = cint('0.1')
        assert.strict.deepEqual(r, 0)
    })

    it(`should return 0 when input '0.123456789'`, function() {
        let r = cint('0.123456789')
        assert.strict.deepEqual(r, 0)
    })

    it(`should return 1 when input '1.4'`, function() {
        let r = cint('1.4')
        assert.strict.deepEqual(r, 1)
    })

    it(`should return 2 when input '1.5'`, function() {
        let r = cint('1.5')
        assert.strict.deepEqual(r, 2)
    })

    it(`should return 3 when input '2.5'`, function() {
        let r = cint('2.5')
        assert.strict.deepEqual(r, 3)
    })

    it(`should return 0 when input '-0.123456789'`, function() {
        let r = cint('-0.123456789')
        assert.strict.deepEqual(r, 0)
    })

    it(`should return -1 when input '-1.4'`, function() {
        let r = cint('-1.4')
        assert.strict.deepEqual(r, -1)
    })

    it(`should return -1 when input '-1.5'`, function() {
        let r = cint('-1.5')
        assert.strict.deepEqual(r, -1)
    })

    it(`should return -2 when input '-2.5'`, function() {
        let r = cint('-2.5')
        assert.strict.deepEqual(r, -2)
    })

    it(`should return 100 when input '100'`, function() {
        let r = cint('100')
        assert.strict.deepEqual(r, 100)
    })

    it(`should return 1234567 when input '1234567'`, function() {
        let r = cint('1234567')
        assert.strict.deepEqual(r, 1234567)
    })

    it(`should return 1234568 when input '1234567.89'`, function() {
        let r = cint('1234567.89')
        assert.strict.deepEqual(r, 1234568)
    })

    it(`should return 0 when input '100abc'`, function() {
        let r = cint('100abc')
        assert.strict.deepEqual(r, 0)
    })

    it(`should return '' when input ''`, function() {
        let r = cint('')
        assert.strict.deepEqual(r, 0)
    })

    it(`should return '' when input []`, function() {
        let r = cint([])
        assert.strict.deepEqual(r, 0)
    })

    it(`should return '' when input {}`, function() {
        let r = cint({})
        assert.strict.deepEqual(r, 0)
    })

    it(`should return '' when input null`, function() {
        let r = cint(null)
        assert.strict.deepEqual(r, 0)
    })

    it(`should return '' when input undefined`, function() {
        let r = cint(undefined)
        assert.strict.deepEqual(r, 0)
    })

})
