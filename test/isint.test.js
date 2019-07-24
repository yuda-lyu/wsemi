import assert from 'assert'
import isint from '../src/isint.mjs'


describe(`isint`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isint('2019-01-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isint('2019-21-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isint(function() {})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isint('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input '125'`, function() {
        let r = isint('125')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 125`, function() {
        let r = isint(125)
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input -125`, function() {
        let r = isint(-125)
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input 1.25`, function() {
        let r = isint(1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isint(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isint('125abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isint('abc125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isint('12a5')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isint('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isint(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isint([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isint([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isint([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isint([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isint(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isint({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isint({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isint({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isint(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isint(undefined)
        assert.strict.deepEqual(r, false)
    })

})
