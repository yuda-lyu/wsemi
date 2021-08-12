import assert from 'assert'
import timems2hour from '../src/timems2hour.mjs'


describe(`timems2hour`, function() {

    it(`should return '' when input '2019-21-32T98:76:65:123+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:76:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76:65:123'`, function() {
        let r = timems2hour('2019-21-32T98:76:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:65:123+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:76:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:65:123'`, function() {
        let r = timems2hour('2019-01-32T98:76:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:65:123+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:76:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:65:123'`, function() {
        let r = timems2hour('2019-21-02T98:76:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:65:123+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:76:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:65:123'`, function() {
        let r = timems2hour('2019-01-02T98:76:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:65:123+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:76:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:65:123'`, function() {
        let r = timems2hour('2019-21-32T12:76:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:65:123+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:76:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:65:123'`, function() {
        let r = timems2hour('2019-01-32T12:76:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:65:123+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:76:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:65:123'`, function() {
        let r = timems2hour('2019-21-02T12:76:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:65:123+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:76:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:65:123'`, function() {
        let r = timems2hour('2019-01-02T12:76:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:65:123+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:34:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:65:123'`, function() {
        let r = timems2hour('2019-21-32T98:34:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:65:123+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:34:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:65:123'`, function() {
        let r = timems2hour('2019-01-32T98:34:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:65:123+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:34:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:65:123'`, function() {
        let r = timems2hour('2019-21-02T98:34:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:65:123+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:34:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:65:123'`, function() {
        let r = timems2hour('2019-01-02T98:34:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:65:123+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:34:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:65:123'`, function() {
        let r = timems2hour('2019-21-32T12:34:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:65:123+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:34:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:65:123'`, function() {
        let r = timems2hour('2019-01-32T12:34:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:65:123+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:34:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:65:123'`, function() {
        let r = timems2hour('2019-21-02T12:34:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:65:123+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:34:65:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:65:123'`, function() {
        let r = timems2hour('2019-01-02T12:34:65:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76:56:123+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:76:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76:56:123'`, function() {
        let r = timems2hour('2019-21-32T98:76:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:56:123+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:76:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:56:123'`, function() {
        let r = timems2hour('2019-01-32T98:76:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:56:123+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:76:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:56:123'`, function() {
        let r = timems2hour('2019-21-02T98:76:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:56:123+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:76:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:56:123'`, function() {
        let r = timems2hour('2019-01-02T98:76:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:56:123+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:76:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:56:123'`, function() {
        let r = timems2hour('2019-21-32T12:76:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:56:123+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:76:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:56:123'`, function() {
        let r = timems2hour('2019-01-32T12:76:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:56:123+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:76:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:56:123'`, function() {
        let r = timems2hour('2019-21-02T12:76:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:56:123+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:76:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:56:123'`, function() {
        let r = timems2hour('2019-01-02T12:76:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56:123+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:34:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56:123'`, function() {
        let r = timems2hour('2019-21-32T98:34:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56:123+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:34:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56:123'`, function() {
        let r = timems2hour('2019-01-32T98:34:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56:123+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:34:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56:123'`, function() {
        let r = timems2hour('2019-21-02T98:34:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56:123+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:34:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56:123'`, function() {
        let r = timems2hour('2019-01-02T98:34:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56:123+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:34:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56:123'`, function() {
        let r = timems2hour('2019-21-32T12:34:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56:123+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:34:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56:123'`, function() {
        let r = timems2hour('2019-01-32T12:34:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56:123+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:34:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56:123'`, function() {
        let r = timems2hour('2019-21-02T12:34:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56:123+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:34:56:123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56:123'`, function() {
        let r = timems2hour('2019-01-02T12:34:56:123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76:65.123+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:76:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76:65.123'`, function() {
        let r = timems2hour('2019-21-32T98:76:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:65.123+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:76:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:65.123'`, function() {
        let r = timems2hour('2019-01-32T98:76:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:65.123+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:76:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:65.123'`, function() {
        let r = timems2hour('2019-21-02T98:76:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:65.123+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:76:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:65.123'`, function() {
        let r = timems2hour('2019-01-02T98:76:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:65.123+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:76:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:65.123'`, function() {
        let r = timems2hour('2019-21-32T12:76:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:65.123+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:76:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:65.123'`, function() {
        let r = timems2hour('2019-01-32T12:76:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:65.123+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:76:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:65.123'`, function() {
        let r = timems2hour('2019-21-02T12:76:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:65.123+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:76:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:65.123'`, function() {
        let r = timems2hour('2019-01-02T12:76:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:65.123+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:34:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:65.123'`, function() {
        let r = timems2hour('2019-21-32T98:34:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:65.123+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:34:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:65.123'`, function() {
        let r = timems2hour('2019-01-32T98:34:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:65.123+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:34:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:65.123'`, function() {
        let r = timems2hour('2019-21-02T98:34:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:65.123+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:34:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:65.123'`, function() {
        let r = timems2hour('2019-01-02T98:34:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:65.123+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:34:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:65.123'`, function() {
        let r = timems2hour('2019-21-32T12:34:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:65.123+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:34:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:65.123'`, function() {
        let r = timems2hour('2019-01-32T12:34:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:65.123+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:34:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:65.123'`, function() {
        let r = timems2hour('2019-21-02T12:34:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:65.123+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:34:65.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:65.123'`, function() {
        let r = timems2hour('2019-01-02T12:34:65.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76:56.123+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:76:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76:56.123'`, function() {
        let r = timems2hour('2019-21-32T98:76:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:56.123+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:76:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:56.123'`, function() {
        let r = timems2hour('2019-01-32T98:76:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:56.123+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:76:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:56.123'`, function() {
        let r = timems2hour('2019-21-02T98:76:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:56.123+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:76:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:56.123'`, function() {
        let r = timems2hour('2019-01-02T98:76:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:56.123+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:76:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:56.123'`, function() {
        let r = timems2hour('2019-21-32T12:76:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:56.123+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:76:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:56.123'`, function() {
        let r = timems2hour('2019-01-32T12:76:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:56.123+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:76:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:56.123'`, function() {
        let r = timems2hour('2019-21-02T12:76:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:56.123+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:76:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:56.123'`, function() {
        let r = timems2hour('2019-01-02T12:76:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56.123+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:34:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56.123'`, function() {
        let r = timems2hour('2019-21-32T98:34:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56.123+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:34:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56.123'`, function() {
        let r = timems2hour('2019-01-32T98:34:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56.123+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:34:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56.123'`, function() {
        let r = timems2hour('2019-21-02T98:34:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56.123+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:34:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56.123'`, function() {
        let r = timems2hour('2019-01-02T98:34:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56.123+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:34:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56.123'`, function() {
        let r = timems2hour('2019-21-32T12:34:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56.123+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:34:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56.123'`, function() {
        let r = timems2hour('2019-01-32T12:34:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56.123+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:34:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56.123'`, function() {
        let r = timems2hour('2019-21-02T12:34:56.123')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56.123+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:34:56.123+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '2019-01-02T12' when input '2019-01-02T12:34:56.123'`, function() {
        let r = timems2hour('2019-01-02T12:34:56.123')
        assert.strict.deepStrictEqual(r, '2019-01-02T12')
    })

    it(`should return '' when input '2019-21-32T98:76:65+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:76:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76:65'`, function() {
        let r = timems2hour('2019-21-32T98:76:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:65+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:76:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:65'`, function() {
        let r = timems2hour('2019-01-32T98:76:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:65+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:76:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:65'`, function() {
        let r = timems2hour('2019-21-02T98:76:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:65+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:76:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:65'`, function() {
        let r = timems2hour('2019-01-02T98:76:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:65+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:76:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:65'`, function() {
        let r = timems2hour('2019-21-32T12:76:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:65+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:76:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:65'`, function() {
        let r = timems2hour('2019-01-32T12:76:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:65+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:76:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:65'`, function() {
        let r = timems2hour('2019-21-02T12:76:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:65+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:76:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:65'`, function() {
        let r = timems2hour('2019-01-02T12:76:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:65+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:34:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:65'`, function() {
        let r = timems2hour('2019-21-32T98:34:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:65+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:34:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:65'`, function() {
        let r = timems2hour('2019-01-32T98:34:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:65+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:34:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:65'`, function() {
        let r = timems2hour('2019-21-02T98:34:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:65+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:34:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:65'`, function() {
        let r = timems2hour('2019-01-02T98:34:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:65+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:34:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:65'`, function() {
        let r = timems2hour('2019-21-32T12:34:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:65+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:34:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:65'`, function() {
        let r = timems2hour('2019-01-32T12:34:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:65+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:34:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:65'`, function() {
        let r = timems2hour('2019-21-02T12:34:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:65+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:34:65+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:65'`, function() {
        let r = timems2hour('2019-01-02T12:34:65')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76:56+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:76:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76:56'`, function() {
        let r = timems2hour('2019-21-32T98:76:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:56+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:76:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76:56'`, function() {
        let r = timems2hour('2019-01-32T98:76:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:56+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:76:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76:56'`, function() {
        let r = timems2hour('2019-21-02T98:76:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:56+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:76:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76:56'`, function() {
        let r = timems2hour('2019-01-02T98:76:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:56+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:76:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76:56'`, function() {
        let r = timems2hour('2019-21-32T12:76:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:56+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:76:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76:56'`, function() {
        let r = timems2hour('2019-01-32T12:76:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:56+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:76:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76:56'`, function() {
        let r = timems2hour('2019-21-02T12:76:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:56+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:76:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76:56'`, function() {
        let r = timems2hour('2019-01-02T12:76:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34:56'`, function() {
        let r = timems2hour('2019-21-32T98:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34:56'`, function() {
        let r = timems2hour('2019-01-32T98:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34:56'`, function() {
        let r = timems2hour('2019-21-02T98:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34:56'`, function() {
        let r = timems2hour('2019-01-02T98:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34:56'`, function() {
        let r = timems2hour('2019-21-32T12:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34:56'`, function() {
        let r = timems2hour('2019-01-32T12:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34:56'`, function() {
        let r = timems2hour('2019-21-02T12:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:34:56+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34:56'`, function() {
        let r = timems2hour('2019-01-02T12:34:56')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:76'`, function() {
        let r = timems2hour('2019-21-32T98:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:76'`, function() {
        let r = timems2hour('2019-01-32T98:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:76'`, function() {
        let r = timems2hour('2019-21-02T98:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:76'`, function() {
        let r = timems2hour('2019-01-02T98:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:76'`, function() {
        let r = timems2hour('2019-21-32T12:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:76'`, function() {
        let r = timems2hour('2019-01-32T12:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:76'`, function() {
        let r = timems2hour('2019-21-02T12:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:76+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:76'`, function() {
        let r = timems2hour('2019-01-02T12:76')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34+08:00'`, function() {
        let r = timems2hour('2019-21-32T98:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98:34'`, function() {
        let r = timems2hour('2019-21-32T98:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34+08:00'`, function() {
        let r = timems2hour('2019-01-32T98:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98:34'`, function() {
        let r = timems2hour('2019-01-32T98:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34+08:00'`, function() {
        let r = timems2hour('2019-21-02T98:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98:34'`, function() {
        let r = timems2hour('2019-21-02T98:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34+08:00'`, function() {
        let r = timems2hour('2019-01-02T98:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98:34'`, function() {
        let r = timems2hour('2019-01-02T98:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34+08:00'`, function() {
        let r = timems2hour('2019-21-32T12:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12:34'`, function() {
        let r = timems2hour('2019-21-32T12:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34+08:00'`, function() {
        let r = timems2hour('2019-01-32T12:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12:34'`, function() {
        let r = timems2hour('2019-01-32T12:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34+08:00'`, function() {
        let r = timems2hour('2019-21-02T12:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12:34'`, function() {
        let r = timems2hour('2019-21-02T12:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34+08:00'`, function() {
        let r = timems2hour('2019-01-02T12:34+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12:34'`, function() {
        let r = timems2hour('2019-01-02T12:34')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98+08:00'`, function() {
        let r = timems2hour('2019-21-32T98+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T98'`, function() {
        let r = timems2hour('2019-21-32T98')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98+08:00'`, function() {
        let r = timems2hour('2019-01-32T98+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T98'`, function() {
        let r = timems2hour('2019-01-32T98')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98+08:00'`, function() {
        let r = timems2hour('2019-21-02T98+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T98'`, function() {
        let r = timems2hour('2019-21-02T98')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98+08:00'`, function() {
        let r = timems2hour('2019-01-02T98+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T98'`, function() {
        let r = timems2hour('2019-01-02T98')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12+08:00'`, function() {
        let r = timems2hour('2019-21-32T12+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32T12'`, function() {
        let r = timems2hour('2019-21-32T12')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12+08:00'`, function() {
        let r = timems2hour('2019-01-32T12+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32T12'`, function() {
        let r = timems2hour('2019-01-32T12')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12+08:00'`, function() {
        let r = timems2hour('2019-21-02T12+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02T12'`, function() {
        let r = timems2hour('2019-21-02T12')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12+08:00'`, function() {
        let r = timems2hour('2019-01-02T12+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02T12'`, function() {
        let r = timems2hour('2019-01-02T12')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32+08:00'`, function() {
        let r = timems2hour('2019-21-32+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-32'`, function() {
        let r = timems2hour('2019-21-32')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32+08:00'`, function() {
        let r = timems2hour('2019-01-32+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-32'`, function() {
        let r = timems2hour('2019-01-32')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02+08:00'`, function() {
        let r = timems2hour('2019-21-02+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21-02'`, function() {
        let r = timems2hour('2019-21-02')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02+08:00'`, function() {
        let r = timems2hour('2019-01-02+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01-02'`, function() {
        let r = timems2hour('2019-01-02')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21+08:00'`, function() {
        let r = timems2hour('2019-21+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-21'`, function() {
        let r = timems2hour('2019-21')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01+08:00'`, function() {
        let r = timems2hour('2019-01+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019-01'`, function() {
        let r = timems2hour('2019-01')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019+08:00'`, function() {
        let r = timems2hour('2019+08:00')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2019'`, function() {
        let r = timems2hour('2019')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input new ArrayBuffer(1)`, function() {
        let ab = new ArrayBuffer(1)
        let r = timems2hour(ab)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input new Uint8Array(1)`, function() {
        let u8a = new Uint8Array(1)
        let r = timems2hour(u8a)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input function() {}`, function() {
        let r = timems2hour(function() {})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 0`, function() {
        let r = timems2hour(0)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 125`, function() {
        let r = timems2hour(125)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -125`, function() {
        let r = timems2hour(-125)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 1.25`, function() {
        let r = timems2hour(1.25)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 1.5`, function() {
        let r = timems2hour(1.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 2.5`, function() {
        let r = timems2hour(2.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -1.25`, function() {
        let r = timems2hour(-1.25)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -1.5`, function() {
        let r = timems2hour(-1.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input -2.5`, function() {
        let r = timems2hour(-2.5)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '0'`, function() {
        let r = timems2hour('0')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '125'`, function() {
        let r = timems2hour('125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-125'`, function() {
        let r = timems2hour('-125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.25'`, function() {
        let r = timems2hour('1')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1.5'`, function() {
        let r = timems2hour('1.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '2.5'`, function() {
        let r = timems2hour('2.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-1.25'`, function() {
        let r = timems2hour('-1.25')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-1.5'`, function() {
        let r = timems2hour('-1.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '-2.5'`, function() {
        let r = timems2hour('-2.5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '125abc'`, function() {
        let r = timems2hour('125abc')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc125'`, function() {
        let r = timems2hour('abc125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abC125'`, function() {
        let r = timems2hour('abC125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC125'`, function() {
        let r = timems2hour('ABC125')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc'`, function() {
        let r = timems2hour('abc')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC'`, function() {
        let r = timems2hour('ABC')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '中文'`, function() {
        let r = timems2hour('中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'abc中文'`, function() {
        let r = timems2hour('abc中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input 'ABC中文'`, function() {
        let r = timems2hour('ABC中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '1234中文'`, function() {
        let r = timems2hour('1234中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '12.34中文'`, function() {
        let r = timems2hour('12.34中文')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input '12a5'`, function() {
        let r = timems2hour('12a5')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = timems2hour('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input false`, function() {
        let r = timems2hour(false)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = timems2hour([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input [{}]`, function() {
        let r = timems2hour([{}])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input [{ a: 123 }]`, function() {
        let r = timems2hour([{ a: 123 }])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ['']`, function() {
        let r = timems2hour([''])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input ['abc']`, function() {
        let r = timems2hour(['abc'])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = timems2hour({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input { a: 123 }`, function() {
        let r = timems2hour({ a: 123 })
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input { a: 123, b: null, c: [45.67] }`, function() {
        let r = timems2hour({ a: 123, b: null, c: [45.67] })
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = timems2hour(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = timems2hour(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

})
