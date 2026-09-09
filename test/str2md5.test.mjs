import assert from 'assert'
import str2md5 from '../src/str2md5.mjs'


describe(`str2md5`, function() {

    it(`sould return '5393554e94bf0eb6436f240a4fd71282' when input 'test中文'`, function() {
        let r = str2md5('test中文')
        let rr = '5393554e94bf0eb6436f240a4fd71282'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 'U5NVTpS/DrZDbyQKT9cSgg==' when input 'test中文', true`, function() {
        let r = str2md5('test中文', true)
        let rr = 'U5NVTpS/DrZDbyQKT9cSgg=='
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould fallback base64 to false when input 'test中文', ''`, function() {
        let r = str2md5('test中文', '')
        let rr = '5393554e94bf0eb6436f240a4fd71282'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould fallback base64 to false when input 'test中文', []`, function() {
        let r = str2md5('test中文', [])
        let rr = '5393554e94bf0eb6436f240a4fd71282'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould fallback base64 to false when input 'test中文', {}`, function() {
        let r = str2md5('test中文', {})
        let rr = '5393554e94bf0eb6436f240a4fd71282'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould fallback base64 to false when input 'test中文', null`, function() {
        let r = str2md5('test中文', null)
        let rr = '5393554e94bf0eb6436f240a4fd71282'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould fallback base64 to false when input 'test中文', 1`, function() {
        let r = str2md5('test中文', 1)
        let rr = '5393554e94bf0eb6436f240a4fd71282'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '5393554e94bf0eb6436f240a4fd71282' when input 'test中文', undefined`, function() {
        let r = str2md5('test中文', undefined)
        let rr = '5393554e94bf0eb6436f240a4fd71282'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = str2md5('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = str2md5([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = str2md5({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = str2md5(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = str2md5(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input NaN`, function() {
        let r = str2md5(NaN)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'success', msg } when input 'abc' with returnWithStateAndMsg`, function() {
        //opt為第3參數, 因第2參數base64為既有參數
        let r = str2md5('abc', false, { returnWithStateAndMsg: true })
        let rr = { state: 'success', msg: '900150983cd24fb0d6963f7d28e17f72' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return { state: 'error', msg: 'invalid str' } when input NaN with returnWithStateAndMsg`, function() {
        let r = str2md5(NaN, false, { returnWithStateAndMsg: true })
        let rr = { state: 'error', msg: 'invalid str' }
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should fallback to the plain return value when returnWithStateAndMsg is not a boolean`, function() {
        let r = str2md5('abc', false, { returnWithStateAndMsg: 'yes' })
        let rr = '900150983cd24fb0d6963f7d28e17f72'
        assert.strict.deepStrictEqual(r, rr)
    })

})
