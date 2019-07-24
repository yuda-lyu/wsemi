import assert from 'assert'
import isobj0 from '../src/isobj0.mjs'


describe(`isobj0`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isobj0('2019-01-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isobj0('2019-21-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isobj0('2019-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isobj0('2019-21')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isobj0(function() {})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isobj0(0)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isobj0(125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isobj0(-125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isobj0(1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isobj0(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = isobj0('0')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isobj0('125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = isobj0('-125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isobj0('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isobj0('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isobj0('125abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isobj0('abc125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isobj0('12a5')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isobj0('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isobj0(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isobj0([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isobj0([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isobj0([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isobj0([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isobj0(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input {}`, function() {
        let r = isobj0({})
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isobj0({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isobj0({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isobj0(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isobj0(undefined)
        assert.strict.deepEqual(r, false)
    })

})
