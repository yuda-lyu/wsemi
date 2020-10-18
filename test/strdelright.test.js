import assert from 'assert'
import strdelright from '../src/strdelright.mjs'


describe(`strdelright`, function() {

    it(`sould return 'test' when input 'test中文', 2`, function() {
        let r = strdelright('test中文', 2)
        let rr = 'test'
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 10`, function() {
        let r = strdelright('test中文', 10)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', 0`, function() {
        let r = strdelright('test中文', 0)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', -1`, function() {
        let r = strdelright('test中文', -1)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', ''`, function() {
        let r = strdelright('test中文', '')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', []`, function() {
        let r = strdelright('test中文', [])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}`, function() {
        let r = strdelright('test中文', {})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null`, function() {
        let r = strdelright('test中文', null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', undefined`, function() {
        let r = strdelright('test中文', undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = strdelright('')
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strdelright([])
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strdelright({})
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strdelright(null)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strdelright(undefined)
        let rr = ''
        assert.strict.deepStrictEqual(r, rr)
    })

})
