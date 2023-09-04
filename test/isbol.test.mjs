import assert from 'assert'
import isbol from '../src/isbol.mjs'


describe(`isbol`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = isbol('2019-01-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isbol('2019-21-01')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isbol('1.25')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isbol('125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isbol(125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isbol(-125)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isbol(1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isbol(-1.25)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isbol('125abc')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isbol('abc125')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isbol('12a5')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isbol('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input false`, function() {
        let r = isbol(false)
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input []`, function() {
        let r = isbol([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isbol([{}])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isbol([{ a: 123 }])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isbol([''])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isbol(['abc'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isbol({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isbol({ a: 123 })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isbol({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isbol(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isbol(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = isbol(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
