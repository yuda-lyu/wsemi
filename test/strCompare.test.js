import assert from 'assert'
import strCompare from '../src/strCompare.mjs'


describe(`strCompare`, function() {

    it(`sould return 0.375 when input 'The Woodman(樵夫) set to work at once, and so...', 'Wodooman(樵夫)'`, function() {
        let r = strCompare('The Woodman(樵夫) set to work at once, and so...', 'Wodooman(樵夫)')
        let rr = 0.375
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return 0.6 when input 'test中文', 'test文中'`, function() {
        let r = strCompare('test中文', 'test文中')
        let rr = 0.6
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', ''`, function() {
        let r = strCompare('test中文', '')
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', []`, function() {
        let r = strCompare('test中文', [])
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', {}`, function() {
        let r = strCompare('test中文', {})
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input 'test中文', null`, function() {
        let r = strCompare('test中文', null)
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '5393554e94bf0eb6436f240a4fd71282' when input 'test中文', undefined`, function() {
        let r = strCompare('test中文', undefined)
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input ''`, function() {
        let r = strCompare('')
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input []`, function() {
        let r = strCompare([])
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input {}`, function() {
        let r = strCompare({})
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input null`, function() {
        let r = strCompare(null)
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`sould return '' when input undefined`, function() {
        let r = strCompare(undefined)
        let rr = 0
        assert.strict.deepStrictEqual(r, rr)
    })

})
