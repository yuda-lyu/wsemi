import assert from 'assert'
import binstr from '../src/binstr.mjs'


describe(`binstr`, function() {

    it(`should return true when input '1.25abc', 'ab'`, function() {
        let r = binstr('1.25abc', 'ab')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '1.25abc中文測試', 'ab'`, function() {
        let r = binstr('1.25abc中文測試', 'ab')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '1.25abc中文測試', '文'`, function() {
        let r = binstr('1.25abc中文測試', '文')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '1.25abc中文測試', 'a中'`, function() {
        let r = binstr('1.25abc中文測試', 'a中')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '1.25abc中文測試', 'c中'`, function() {
        let r = binstr('1.25abc中文測試', 'c中')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '1.25abc', 'ax'`, function() {
        let r = binstr('1.25abc', 'ax')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '1.25abc', ['ab', 'ax']`, function() {
        let r = binstr('1.25abc', ['ab', 'ax'])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '1.25abc', ['ab', '5a']`, function() {
        let r = binstr('1.25abc', ['ab', '5a'])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '1.25abc', ['ab', '25']`, function() {
        let r = binstr('1.25abc', ['ab', '25'])
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '1.25abc', ['ab', 25]`, function() {
        let r = binstr('1.25abc', ['ab', 25])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', '', 'ax']`, function() {
        let r = binstr('1.25abc', ['ab', '', 'ax'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', [], 'ax']`, function() {
        let r = binstr('1.25abc', ['ab', [], 'ax'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', {}, 'ax']`, function() {
        let r = binstr('1.25abc', ['ab', {}, 'ax'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', undefined, 'ax']`, function() {
        let r = binstr('1.25abc', ['ab', undefined, 'ax'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', null, 'ax']`, function() {
        let r = binstr('1.25abc', ['ab', null, 'ax'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['123', 1.25, 'ax']`, function() {
        let r = binstr('1.25abc', ['123', 1.25, 'ax'])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should false true when input '1.25abc', 'ab', 'all'`, function() {
        let r = binstr('1.25abc', 'ab', 'all')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '1.25abc', 'ax', 'all'`, function() {
        let r = binstr('1.25abc', 'ax', 'all')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', 'ax'], 'all'`, function() {
        let r = binstr('1.25abc', ['ab', 'ax'], 'all')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return true when input '1.25abc', ['ab', '5a'], 'all'`, function() {
        let r = binstr('1.25abc', ['ab', '5a'], 'all')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return true when input '1.25abc', ['ab', '25'], 'all'`, function() {
        let r = binstr('1.25abc', ['ab', '25'], 'all')
        assert.strict.deepStrictEqual(r, true)
    })

    it(`should return false when input '1.25abc', ['ab', 25], 'all'`, function() {
        let r = binstr('1.25abc', ['ab', 25], 'all')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', '', 'ax'], 'all'`, function() {
        let r = binstr('1.25abc', ['ab', '', 'ax'], 'all')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', [], 'ax'], 'all'`, function() {
        let r = binstr('1.25abc', ['ab', [], 'ax'], 'all')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', {}, 'ax'], 'all'`, function() {
        let r = binstr('1.25abc', ['ab', {}, 'ax'], 'all')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', undefined, 'ax'], 'all'`, function() {
        let r = binstr('1.25abc', ['ab', undefined, 'ax'], 'all')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['ab', null, 'ax'], 'all'`, function() {
        let r = binstr('1.25abc', ['ab', null, 'ax'], 'all')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input '1.25abc', ['123', 1.25, 'ax'], 'all'`, function() {
        let r = binstr('1.25abc', ['123', 1.25, 'ax'], 'all')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input ''`, function() {
        let r = binstr('')
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input []`, function() {
        let r = binstr([])
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input {}`, function() {
        let r = binstr({})
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input null`, function() {
        let r = binstr(null)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input undefined`, function() {
        let r = binstr(undefined)
        assert.strict.deepStrictEqual(r, false)
    })

    it(`should return false when input NaN`, function() {
        let r = binstr(NaN)
        assert.strict.deepStrictEqual(r, false)
    })

})
