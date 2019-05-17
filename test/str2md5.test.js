import assert from 'assert'
import str2md5 from '../src/str2md5.mjs'


describe('str2md5', function() {

    it(`sould return '5393554e94bf0eb6436f240a4fd71282' when input 'test中文'`, function() {
        let r = str2md5('test中文')
        let rr = '5393554e94bf0eb6436f240a4fd71282'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return 'U5NVTpS/DrZDbyQKT9cSgg==' when input 'test中文', true`, function() {
        let r = str2md5('test中文', true)
        let rr = 'U5NVTpS/DrZDbyQKT9cSgg=='
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', ''`, function() {
        let r = str2md5('test中文', '')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', []`, function() {
        let r = str2md5('test中文', [])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}`, function() {
        let r = str2md5('test中文', {})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null`, function() {
        let r = str2md5('test中文', null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '5393554e94bf0eb6436f240a4fd71282' when input 'test中文', undefined`, function() {
        let r = str2md5('test中文', undefined)
        let rr = '5393554e94bf0eb6436f240a4fd71282'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = str2md5('')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = str2md5([])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = str2md5({})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = str2md5(null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = str2md5(undefined)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

})
