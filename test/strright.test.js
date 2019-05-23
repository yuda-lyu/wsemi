import assert from 'assert'
import strright from '../src/strright.mjs'


describe(`strright`, function() {

    it(`sould return '中文' when input 'test中文', 2`, function() {
        let r = strright('test中文', 2)
        let rr = '中文'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return 'test中文' when input 'test中文', 10`, function() {
        let r = strright('test中文', 10)
        let rr = 'test中文'
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 0`, function() {
        let r = strright('test中文', 0)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', -1`, function() {
        let r = strright('test中文', -1)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', ''`, function() {
        let r = strright('test中文', '')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', []`, function() {
        let r = strright('test中文', [])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}`, function() {
        let r = strright('test中文', {})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null`, function() {
        let r = strright('test中文', null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', undefined`, function() {
        let r = strright('test中文', undefined)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = strright('')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strright([])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strright({})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strright(null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strright(undefined)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

})
