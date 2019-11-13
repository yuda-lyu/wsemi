import assert from 'assert'
import iseobj from '../src/iseobj.mjs'


describe(`iseobj`, function() {

    it(`should return false when input '2019-01-01'`, function() {
        let r = iseobj('2019-01-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = iseobj('2019-21-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = iseobj('2019-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = iseobj('2019-21')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = iseobj(function() {})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = iseobj(0)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = iseobj(125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = iseobj(-125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = iseobj(1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = iseobj(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = iseobj('0')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = iseobj('125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = iseobj('-125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = iseobj('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = iseobj('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = iseobj('125abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = iseobj('abc125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = iseobj('12a5')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = iseobj('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = iseobj(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = iseobj([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = iseobj([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = iseobj([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = iseobj([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = iseobj(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = iseobj({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return true when input { a: 123 }`, function() {
        let r = iseobj({ a: 123 })
        assert.strict.deepEqual(r, true)
    })

    it(`should return true when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = iseobj({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input null`, function() {
        let r = iseobj(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = iseobj(undefined)
        assert.strict.deepEqual(r, false)
    })

})