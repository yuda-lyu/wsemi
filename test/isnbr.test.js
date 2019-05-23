import assert from 'assert'
import isnbr from '../src/isnbr.mjs'


describe(`isnbr`, function() {

    it(`should return false when input '2019/01/01'`, function() {
        let r = isnbr('2019/01/01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019/21/01'`, function() {
        let r = isnbr('2019/21/01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019/01'`, function() {
        let r = isnbr('2019/01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019/21'`, function() {
        let r = isnbr('2019/21')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isnbr(function() {})
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input 0`, function() {
        let r = isnbr(0)
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 125`, function() {
        let r = isnbr(125)
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input -125`, function() {
        let r = isnbr(-125)
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input 1.25`, function() {
        let r = isnbr(1.25)
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input -1.25`, function() {
        let r = isnbr(-1.25)
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input '0'`, function() {
        let r = isnbr('0')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isnbr('125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = isnbr('-125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isnbr('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isnbr('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isnbr('125abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isnbr('abc125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isnbr('12a5')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isnbr('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isnbr(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isnbr([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isnbr([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isnbr([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isnbr([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isnbr(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isnbr({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isnbr({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isnbr({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isnbr(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isnbr(undefined)
        assert.strict.deepEqual(r, false)
    })

})
