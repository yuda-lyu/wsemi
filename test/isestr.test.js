import assert from 'assert'
import isestr from '../src/isestr.mjs'


describe(`isestr`, function() {

    it(`should return true when input '2019/01/01'`, function() {
        let r = isestr('2019/01/01')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '2019/21/01'`, function() {
        let r = isestr('2019/21/01')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '1.25'`, function() {
        let r = isestr('1.25')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '125'`, function() {
        let r = isestr('125')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input 125`, function() {
        let r = isestr(125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isestr(-125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isestr(1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isestr(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input '125abc'`, function() {
        let r = isestr('125abc')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 'abc125'`, function() {
        let r = isestr('abc125')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '12a5'`, function() {
        let r = isestr('12a5')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input ''`, function() {
        let r = isestr('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isestr(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isestr([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isestr([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isestr([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isestr([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isestr(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isestr({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isestr({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isestr({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isestr(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isestr(undefined)
        assert.strict.deepEqual(r, false)
    })

})
