import assert from 'assert'
import timemsTZ2min from '../src/timemsTZ2min.mjs'


describe(`timemsTZ2min`, function() {

    it(`should return '' when input '2019-21-32T98:87:76:987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:76:987'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:76:987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:76:987'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:76:987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:76:987'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:76:987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:76:987'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:76:987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:76:987'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:76:987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:76:987'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:76:987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:76:987'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:76:987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:76:987'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:76:987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:76:987'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:76:987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:76:987'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:76:987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:76:987'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:76:987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:76:987'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:76:987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:76:987'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:76:987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:76:987'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:76:987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:76:987'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:76:987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:76:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:76:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:76:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:76:987'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:76:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:56:987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:56:987'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:56:987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:56:987'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:56:987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:56:987'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:56:987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:56:987'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:56:987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:56:987'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:56:987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:56:987'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:56:987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:56:987'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:56:987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:56:987'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56:987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56:987'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56:987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56:987'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56:987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56:987'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56:987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56:987'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56:987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56:987'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56:987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56:987'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56:987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56:987'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56:987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:56:987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56:987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:56:987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56:987'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:56:987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:76.987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:76.987'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:76.987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:76.987'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:76.987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:76.987'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:76.987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:76.987'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:76.987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:76.987'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:76.987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:76.987'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:76.987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:76.987'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:76.987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:76.987'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:76.987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:76.987'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:76.987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:76.987'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:76.987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:76.987'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:76.987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:76.987'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:76.987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:76.987'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:76.987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:76.987'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:76.987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:76.987'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:76.987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:76.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:76.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:76.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:76.987'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:76.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:56.987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:56.987'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:56.987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:56.987'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:56.987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:56.987'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:56.987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:56.987'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:56.987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:56.987'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:56.987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:56.987'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:56.987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:56.987'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:56.987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:56.987'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56.987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56.987'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56.987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56.987'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56.987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56.987'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56.987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56.987'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56.987Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56.987'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56.987Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56.987'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56.987Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:56.987Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:56.987+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56.987'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '2019-01-02T12:34' when input '2019-01-02T12:34:56.987Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:56.987Z')
        assert.strict.deepStrictEqual(r, '2019-01-02T12:34')
    })

    it(`should return '2019-01-02T12:34' when input '2019-01-02T12:34:56.987+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:56.987+08:00')
        assert.strict.deepStrictEqual(r, '2019-01-02T12:34')
    })

    it(`should return '' when input '2019-01-02T12:34:56.987'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:56.987')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:76Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:76+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:76'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:76Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:76+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:76'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:76Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:76+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:76'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:76Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:76+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:76'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:76Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:76+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:76'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:76Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:76+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:76'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:76Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:76+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:76'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:76Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:76+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:76'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:76Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:76+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:76'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:76Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:76+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:76'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:76Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:76+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:76'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:76Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:76+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:76'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:76Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:76+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:76'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:76Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:76+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:76'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:76Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:76+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:76'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:76Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:76Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:76+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:76'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:56Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:56+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87:56'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:56Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:56+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87:56'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:56Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:56+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87:56'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:56Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:56+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87:56'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:56Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:56+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87:56'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:56Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:56+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87:56'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:56Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:56+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87:56'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:56Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:56+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87:56'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:56Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:87'`, function() {
        let r = timemsTZ2min('2019-21-32T98:87')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:87'`, function() {
        let r = timemsTZ2min('2019-01-32T98:87')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:87'`, function() {
        let r = timemsTZ2min('2019-21-02T98:87')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:87'`, function() {
        let r = timemsTZ2min('2019-01-02T98:87')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:87'`, function() {
        let r = timemsTZ2min('2019-21-32T12:87')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:87'`, function() {
        let r = timemsTZ2min('2019-01-32T12:87')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:87'`, function() {
        let r = timemsTZ2min('2019-21-02T12:87')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:87'`, function() {
        let r = timemsTZ2min('2019-01-02T12:87')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34'`, function() {
        let r = timemsTZ2min('2019-21-32T98:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34'`, function() {
        let r = timemsTZ2min('2019-01-32T98:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34'`, function() {
        let r = timemsTZ2min('2019-21-02T98:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34'`, function() {
        let r = timemsTZ2min('2019-01-02T98:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34'`, function() {
        let r = timemsTZ2min('2019-21-32T12:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34'`, function() {
        let r = timemsTZ2min('2019-01-32T12:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34'`, function() {
        let r = timemsTZ2min('2019-21-02T12:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34'`, function() {
        let r = timemsTZ2min('2019-01-02T12:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98Z'`, function() {
        let r = timemsTZ2min('2019-21-32T98Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T98+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98'`, function() {
        let r = timemsTZ2min('2019-21-32T98')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98Z'`, function() {
        let r = timemsTZ2min('2019-01-32T98Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T98+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98'`, function() {
        let r = timemsTZ2min('2019-01-32T98')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98Z'`, function() {
        let r = timemsTZ2min('2019-21-02T98Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T98+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98'`, function() {
        let r = timemsTZ2min('2019-21-02T98')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98Z'`, function() {
        let r = timemsTZ2min('2019-01-02T98Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T98+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98'`, function() {
        let r = timemsTZ2min('2019-01-02T98')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12Z'`, function() {
        let r = timemsTZ2min('2019-21-32T12Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32T12+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12'`, function() {
        let r = timemsTZ2min('2019-21-32T12')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12Z'`, function() {
        let r = timemsTZ2min('2019-01-32T12Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32T12+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12'`, function() {
        let r = timemsTZ2min('2019-01-32T12')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12Z'`, function() {
        let r = timemsTZ2min('2019-21-02T12Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02T12+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12'`, function() {
        let r = timemsTZ2min('2019-21-02T12')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12Z'`, function() {
        let r = timemsTZ2min('2019-01-02T12Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02T12+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12'`, function() {
        let r = timemsTZ2min('2019-01-02T12')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32Z'`, function() {
        let r = timemsTZ2min('2019-21-32Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32+08:00'`, function() {
        let r = timemsTZ2min('2019-21-32+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32'`, function() {
        let r = timemsTZ2min('2019-21-32')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32Z'`, function() {
        let r = timemsTZ2min('2019-01-32Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32+08:00'`, function() {
        let r = timemsTZ2min('2019-01-32+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32'`, function() {
        let r = timemsTZ2min('2019-01-32')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02Z'`, function() {
        let r = timemsTZ2min('2019-21-02Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02+08:00'`, function() {
        let r = timemsTZ2min('2019-21-02+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02'`, function() {
        let r = timemsTZ2min('2019-21-02')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02Z'`, function() {
        let r = timemsTZ2min('2019-01-02Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02+08:00'`, function() {
        let r = timemsTZ2min('2019-01-02+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02'`, function() {
        let r = timemsTZ2min('2019-01-02')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21Z'`, function() {
        let r = timemsTZ2min('2019-21Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21+08:00'`, function() {
        let r = timemsTZ2min('2019-21+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21'`, function() {
        let r = timemsTZ2min('2019-21')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01Z'`, function() {
        let r = timemsTZ2min('2019-01Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01+08:00'`, function() {
        let r = timemsTZ2min('2019-01+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01'`, function() {
        let r = timemsTZ2min('2019-01')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019Z'`, function() {
        let r = timemsTZ2min('2019Z')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019+08:00'`, function() {
        let r = timemsTZ2min('2019+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019'`, function() {
        let r = timemsTZ2min('2019')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input new ArrayBuffer(1)`, function() {
        let ab = new ArrayBuffer(1)
        let r = timemsTZ2min(ab)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input new Uint8Array(1)`, function() {
        let u8a = new Uint8Array(1)
        let r = timemsTZ2min(u8a)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input function() {}`, function() {
        let r = timemsTZ2min(function() {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 0`, function() {
        let r = timemsTZ2min(0)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 125`, function() {
        let r = timemsTZ2min(125)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -125`, function() {
        let r = timemsTZ2min(-125)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 1.25`, function() {
        let r = timemsTZ2min(1.25)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 1.5`, function() {
        let r = timemsTZ2min(1.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 2.5`, function() {
        let r = timemsTZ2min(2.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -1.25`, function() {
        let r = timemsTZ2min(-1.25)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -1.5`, function() {
        let r = timemsTZ2min(-1.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -2.5`, function() {
        let r = timemsTZ2min(-2.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '0'`, function() {
        let r = timemsTZ2min('0')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '125'`, function() {
        let r = timemsTZ2min('125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-125'`, function() {
        let r = timemsTZ2min('-125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25'`, function() {
        let r = timemsTZ2min('1')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.5'`, function() {
        let r = timemsTZ2min('1.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2.5'`, function() {
        let r = timemsTZ2min('2.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-1.25'`, function() {
        let r = timemsTZ2min('-1.25')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-1.5'`, function() {
        let r = timemsTZ2min('-1.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-2.5'`, function() {
        let r = timemsTZ2min('-2.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '125abc'`, function() {
        let r = timemsTZ2min('125abc')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc125'`, function() {
        let r = timemsTZ2min('abc125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abC125'`, function() {
        let r = timemsTZ2min('abC125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC125'`, function() {
        let r = timemsTZ2min('ABC125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc'`, function() {
        let r = timemsTZ2min('abc')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC'`, function() {
        let r = timemsTZ2min('ABC')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '中文'`, function() {
        let r = timemsTZ2min('中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc中文'`, function() {
        let r = timemsTZ2min('abc中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC中文'`, function() {
        let r = timemsTZ2min('ABC中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1234中文'`, function() {
        let r = timemsTZ2min('1234中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '12.34中文'`, function() {
        let r = timemsTZ2min('12.34中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '12a5'`, function() {
        let r = timemsTZ2min('12a5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = timemsTZ2min('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input false`, function() {
        let r = timemsTZ2min(false)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = timemsTZ2min([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input [{}]`, function() {
        let r = timemsTZ2min([{}])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input [{ a: 123 }]`, function() {
        let r = timemsTZ2min([{ a: 123 }])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ['']`, function() {
        let r = timemsTZ2min([''])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ['abc']`, function() {
        let r = timemsTZ2min(['abc'])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = timemsTZ2min({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input { a: 123 }`, function() {
        let r = timemsTZ2min({ a: 123 })
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = timemsTZ2min({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = timemsTZ2min(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = timemsTZ2min(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

})
