import assert from 'assert'
import sepTimeTZ from '../src/sepTimeTZ.mjs'


describe(`sepTimeTZ`, function() {

    let def = {
        t: '',
        tz: ''
    }

    it(`should return { t: '', tz: '' } when input new ArrayBuffer(1)`, function() {
        let ab = new ArrayBuffer(1)
        let r = sepTimeTZ(ab)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input new Uint8Array(1)`, function() {
        let u8a = new Uint8Array(1)
        let r = sepTimeTZ(u8a)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-01-01T12:34:56:789'`, function() {
        let r = sepTimeTZ('2019-01-01T12:34:56:789')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-01-01T12:34:66:789'`, function() {
        let r = sepTimeTZ('2019-01-01T12:34:66:789')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return '2019-01-01T12:34' when input '2019-01-01T12:34:56'`, function() {
        let r = sepTimeTZ('2019-01-01T12:34:56')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-01-01T12:34:66'`, function() {
        let r = sepTimeTZ('2019-01-01T12:34:66')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-21-01T12:34:56'`, function() {
        let r = sepTimeTZ('2019-21-01T12:34:56')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-01-01T12:34:56:789+08:00'`, function() {
        let r = sepTimeTZ('2019-01-01T12:34:56:789+08:00')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-01-01T12:34:66:789+08:00'`, function() {
        let r = sepTimeTZ('2019-01-01T12:34:66:789+08:00')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`sould return { t: '2019-01-01T12:34:56', tz: '+08:00' } when input '2019-01-01T12:34:56+08:00'`, function() {
        let r = sepTimeTZ('2019-01-01T12:34:56+08:00')
        let rr = { t: '2019-01-01T12:34:56', tz: '+08:00' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { t: '', tz: '' } when input '2019-01-01T12:34:66+08:00'`, function() {
        let r = sepTimeTZ('2019-01-01T12:34:66+08:00')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-21-01T12:34:56+08:00'`, function() {
        let r = sepTimeTZ('2019-21-01T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-01-01'`, function() {
        let r = sepTimeTZ('2019-01-01')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-21-01'`, function() {
        let r = sepTimeTZ('2019-21-01')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-01'`, function() {
        let r = sepTimeTZ('2019-01')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2019-21'`, function() {
        let r = sepTimeTZ('2019-21')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input function() {}`, function() {
        let r = sepTimeTZ(function() {})
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 0`, function() {
        let r = sepTimeTZ(0)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 125`, function() {
        let r = sepTimeTZ(125)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input -125`, function() {
        let r = sepTimeTZ(-125)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 1.25`, function() {
        let r = sepTimeTZ(1.25)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 1.5`, function() {
        let r = sepTimeTZ(1.5)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 2.5`, function() {
        let r = sepTimeTZ(2.5)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input -1.25`, function() {
        let r = sepTimeTZ(-1.25)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input -1.5`, function() {
        let r = sepTimeTZ(-1.5)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input -2.5`, function() {
        let r = sepTimeTZ(-2.5)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '0'`, function() {
        let r = sepTimeTZ('0')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '125'`, function() {
        let r = sepTimeTZ('125')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '-125'`, function() {
        let r = sepTimeTZ('-125')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '1.25'`, function() {
        let r = sepTimeTZ('1')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '1.5'`, function() {
        let r = sepTimeTZ('1.5')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '2.5'`, function() {
        let r = sepTimeTZ('2.5')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '-1.25'`, function() {
        let r = sepTimeTZ('-1.25')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '-1.5'`, function() {
        let r = sepTimeTZ('-1.5')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '-2.5'`, function() {
        let r = sepTimeTZ('-2.5')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '125abc'`, function() {
        let r = sepTimeTZ('125abc')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 'abc125'`, function() {
        let r = sepTimeTZ('abc125')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 'abC125'`, function() {
        let r = sepTimeTZ('abC125')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 'ABC125'`, function() {
        let r = sepTimeTZ('ABC125')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 'abc'`, function() {
        let r = sepTimeTZ('abc')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 'ABC'`, function() {
        let r = sepTimeTZ('ABC')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '中文'`, function() {
        let r = sepTimeTZ('中文')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 'abc中文'`, function() {
        let r = sepTimeTZ('abc中文')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input 'ABC中文'`, function() {
        let r = sepTimeTZ('ABC中文')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '1234中文'`, function() {
        let r = sepTimeTZ('1234中文')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '12.34中文'`, function() {
        let r = sepTimeTZ('12.34中文')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input '12a5'`, function() {
        let r = sepTimeTZ('12a5')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input ''`, function() {
        let r = sepTimeTZ('')
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input false`, function() {
        let r = sepTimeTZ(false)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input []`, function() {
        let r = sepTimeTZ([])
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input [{}]`, function() {
        let r = sepTimeTZ([{}])
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input [{ a: 123 }]`, function() {
        let r = sepTimeTZ([{ a: 123 }])
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input ['']`, function() {
        let r = sepTimeTZ([''])
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input ['abc']`, function() {
        let r = sepTimeTZ(['abc'])
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input {}`, function() {
        let r = sepTimeTZ({})
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input { a: 123 }`, function() {
        let r = sepTimeTZ({ a: 123 })
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = sepTimeTZ({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input null`, function() {
        let r = sepTimeTZ(null)
        assert.strict.deepStrictEqual(r, def)
    })

    it(`should return { t: '', tz: '' } when input undefined`, function() {
        let r = sepTimeTZ(undefined)
        assert.strict.deepStrictEqual(r, def)
    })

})
