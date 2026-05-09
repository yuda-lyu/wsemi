import assert from 'assert'
import cstr from '../src/cstr.mjs'


describe(`cstr`, function() {

    it(`should return 1.25 when input '1.25'`, function() {
        let r = cstr('1.25')
        assert.strict.deepStrictEqual(r, '1.25')
    })

    it(`should return 2.25 when input 2.25`, function() {
        let r = cstr(2.25)
        assert.strict.deepStrictEqual(r, '2.25')
    })

    it(`should return '' when input ''`, function() {
        let r = cstr('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = cstr([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = cstr({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = cstr(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = cstr(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input NaN`, function() {
        let r = cstr(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '0' when input 0n`, function() {
        let r = cstr(0n)
        assert.strict.deepStrictEqual(r, '0')
    })

    it(`should return '123' when input 123n`, function() {
        let r = cstr(123n)
        assert.strict.deepStrictEqual(r, '123')
    })

    it(`should return '-123' when input -123n`, function() {
        let r = cstr(-123n)
        assert.strict.deepStrictEqual(r, '-123')
    })

    it(`should return '9007199254740993' when input BigInt超過Number.MAX_SAFE_INTEGER`, function() {
        let r = cstr(BigInt('9007199254740993'))
        assert.strict.deepStrictEqual(r, '9007199254740993')
    })

    it(`should return '123' when input Object(123n) (boxed BigInt)`, function() {
        let r = cstr(Object(123n))
        assert.strict.deepStrictEqual(r, '123')
    })

})
