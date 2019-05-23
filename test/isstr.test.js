import assert from 'assert'
import isstr from '../src/isstr.mjs'


describe(`isstr`, function() {

    it(`should return true when input '2019/01/01'`, function() {
        let r = isstr('2019/01/01')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '2019/21/01'`, function() {
        let r = isstr('2019/21/01')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '2019/01'`, function() {
        let r = isstr('2019/01')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '2019/21'`, function() {
        let r = isstr('2019/21')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input function() {}`, function() {
        let r = isstr(function() {})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isstr(0)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isstr(125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isstr(-125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isstr(1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isstr(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input '0'`, function() {
        let r = isstr('0')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '125'`, function() {
        let r = isstr('125')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '-125'`, function() {
        let r = isstr('-125')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '1.25'`, function() {
        let r = isstr('1.25')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '-1.25'`, function() {
        let r = isstr('-1.25')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '125abc'`, function() {
        let r = isstr('125abc')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 'abc125'`, function() {
        let r = isstr('abc125')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input '12a5'`, function() {
        let r = isstr('12a5')
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input ''`, function() {
        let r = isstr('')
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input false`, function() {
        let r = isstr(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isstr([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isstr([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isstr([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isstr([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isstr(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isstr({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isstr({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isstr({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isstr(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isstr(undefined)
        assert.strict.deepEqual(r, false)
    })

})
