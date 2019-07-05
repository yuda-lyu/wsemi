import assert from 'assert'
import ispm from '../src/ispm.mjs'


describe(`ispm`, function() {

    it(`should return true when input new Promise(function() {})`, function() {
        let r = ispm(new Promise(function() {}))
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input '2019/01/01'`, function() {
        let r = ispm('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019/21/01'`, function() {
        let r = ispm('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = ispm(function() {})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = ispm('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = ispm('125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = ispm(125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = ispm(-125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = ispm(1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = ispm(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = ispm('125abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = ispm('abc125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = ispm('12a5')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = ispm('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = ispm(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = ispm([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = ispm([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = ispm([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = ispm([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = ispm(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = ispm({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = ispm({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = ispm({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = ispm(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = ispm(undefined)
        assert.strict.deepEqual(r, false)
    })

})
