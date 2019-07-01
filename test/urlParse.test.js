import assert from 'assert'
import urlParse from '../src/urlParse.mjs'


describe(`urlParse`, function() {

    it(`should return true when input 'http://localhost:3000/index.html?a=12.34&b=xyz&abc=xyz123.456'`, function() {
        let r = urlParse('http://localhost:3000/index.html?a=12.34&b=xyz&abc=xyz123.456')
        assert.strict.deepEqual(r, { a: '12.34', abc: 'xyz123.456', b: 'xyz' })
    })

    it(`should return true when input 'index.html?a=12.34&b=xyz&abc=xyz123.456'`, function() {
        let r = urlParse('index.html?a=12.34&b=xyz&abc=xyz123.456')
        assert.strict.deepEqual(r, { a: '12.34', abc: 'xyz123.456', b: 'xyz' })
    })

    it(`should return true when input '/?a=12.34&b=xyz&abc=xyz123.456'`, function() {
        let r = urlParse('/?a=12.34&b=xyz&abc=xyz123.456')
        assert.strict.deepEqual(r, { a: '12.34', abc: 'xyz123.456', b: 'xyz' })
    })

    it(`should return true when input '?a=12.34&b=xyz&abc=xyz123.456'`, function() {
        let r = urlParse('?a=12.34&b=xyz&abc=xyz123.456')
        assert.strict.deepEqual(r, { a: '12.34', abc: 'xyz123.456', b: 'xyz' })
    })

    it(`should return false when input '125'`, function() {
        let r = urlParse('125')
        assert.strict.deepEqual(r, {})
    })

    it(`should return false when input 1.25`, function() {
        let r = urlParse(1.25)
        assert.strict.deepEqual(r, {})
    })

    it(`should return false when input ''`, function() {
        let r = urlParse('')
        assert.strict.deepEqual(r, {})
    })

    it(`should return false when input []`, function() {
        let r = urlParse([])
        assert.strict.deepEqual(r, {})
    })

    it(`should return false when input {}`, function() {
        let r = urlParse({})
        assert.strict.deepEqual(r, {})
    })

    it(`should return false when input null`, function() {
        let r = urlParse(null)
        assert.strict.deepEqual(r, {})
    })

    it(`should return false when input undefined`, function() {
        let r = urlParse(undefined)
        assert.strict.deepEqual(r, {})
    })

})
