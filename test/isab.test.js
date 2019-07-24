import assert from 'assert'
import isab from '../src/isab.mjs'


describe(`isab`, function() {

    it(`should return true when input new ArrayBuffer(1)`, function() {
        let ab = new ArrayBuffer(1)
        let r = isab(ab)
        assert.strict.deepEqual(r, true)
    })

    it(`should return false when input new Uint8Array(1)`, function() {
        let u8a = new Uint8Array(1)
        let r = isab(u8a)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56:789+08:00'`, function() {
        let r = isab('2019-01-01T12:34:56:789+08:00')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:66:789+08:00'`, function() {
        let r = isab('2019-01-01T12:34:66:789+08:00')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:56+08:00'`, function() {
        let r = isab('2019-01-01T12:34:56+08:00')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-01-01T12:34:66+08:00'`, function() {
        let r = isab('2019-01-01T12:34:66+08:00')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-21-01T12:34:56+08:00'`, function() {
        let r = isab('2019-21-01T12:34:56+08:00')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-01-01'`, function() {
        let r = isab('2019-01-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-21-01'`, function() {
        let r = isab('2019-21-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-01'`, function() {
        let r = isab('2019-01')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '2019-21'`, function() {
        let r = isab('2019-21')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input function() {}`, function() {
        let r = isab(function() {})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 0`, function() {
        let r = isab(0)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 125`, function() {
        let r = isab(125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -125`, function() {
        let r = isab(-125)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 1.25`, function() {
        let r = isab(1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input -1.25`, function() {
        let r = isab(-1.25)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '0'`, function() {
        let r = isab('0')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125'`, function() {
        let r = isab('125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-125'`, function() {
        let r = isab('-125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '1.25'`, function() {
        let r = isab('1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '-1.25'`, function() {
        let r = isab('-1.25')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '125abc'`, function() {
        let r = isab('125abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc125'`, function() {
        let r = isab('abc125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abC125'`, function() {
        let r = isab('abC125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'ABC125'`, function() {
        let r = isab('ABC125')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc'`, function() {
        let r = isab('abc')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'ABC'`, function() {
        let r = isab('ABC')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '中文'`, function() {
        let r = isab('中文')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'abc中文'`, function() {
        let r = isab('abc中文')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input 'ABC中文'`, function() {
        let r = isab('ABC中文')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '1234中文'`, function() {
        let r = isab('1234中文')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '12.34中文'`, function() {
        let r = isab('12.34中文')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input '12a5'`, function() {
        let r = isab('12a5')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = isab('')
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input false`, function() {
        let r = isab(false)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = isab([])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{}]`, function() {
        let r = isab([{}])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input [{ a: 123 }]`, function() {
        let r = isab([{ a: 123 }])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['']`, function() {
        let r = isab([''])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input ['abc']`, function() {
        let r = isab(['abc'])
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = isab({})
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123 }`, function() {
        let r = isab({ a: 123 })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = isab({ a: 123, b: null, c: [45.67] })
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = isab(null)
        assert.strict.deepEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = isab(undefined)
        assert.strict.deepEqual(r, false)
    })

})
