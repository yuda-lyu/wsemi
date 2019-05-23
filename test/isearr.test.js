import assert from 'assert'
import isearr from '../src/isearr.mjs'


describe(`isearr`, function() {

    it(`should return false when input '2019/01/01'`, function() {
        let r = isearr('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019/21/01'`, function() {
        let r = isearr('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isearr('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isearr('125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isearr(125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isearr(-125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isearr(1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isearr(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isearr('125abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isearr('abc125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isearr('12a5')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isearr('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isearr(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isearr([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isearr([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input [{ a: 123 }]`, function() {
        let r = isearr([{ a: 123 }])
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input ['']`, function() {
        let r = isearr([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input ['abc']`, function() {
        let r = isearr(['abc'])
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input {}`, function() {
        let r = isearr({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isearr({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isearr({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isearr(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isearr(undefined)
        assert.strict.deepEqual(r, false)
    })

})
