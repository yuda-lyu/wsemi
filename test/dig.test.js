import assert from 'assert'
import dig from '../src/dig.mjs'


describe(`dig`, function() {

    it(`should return '0' when input 0`, function() {
        let r = dig(0)
        assert.strict.deepEqual(r, '0')
    })

    it(`should return '0' when input 0.1`, function() {
        let r = dig(0.1)
        assert.strict.deepEqual(r, '0')
    })

    it(`should return '0.1' when input 0.1, 1`, function() {
        let r = dig(0.1, 1)
        assert.strict.deepEqual(r, '0.1')
    })

    it(`should return '0' when input -0.1`, function() {
        let r = dig(-0.1)
        assert.strict.deepEqual(r, '0')
    })

    it(`should return '-0.1' when input -0.1, 1`, function() {
        let r = dig(-0.1, 1)
        assert.strict.deepEqual(r, '-0.1')
    })

    it(`should return '0' when input 0.123456789`, function() {
        let r = dig(0.123456789)
        assert.strict.deepEqual(r, '0')
    })

    it(`should return '0.123' when input 0.123456789, 3`, function() {
        let r = dig(0.123456789, 3)
        assert.strict.deepEqual(r, '0.123')
    })

    it(`should return '0.1235' when input 0.123456789, 4`, function() {
        let r = dig(0.123456789, 4)
        assert.strict.deepEqual(r, '0.1235')
    })

    it(`should return '100' when input 100`, function() {
        let r = dig(100)
        assert.strict.deepEqual(r, '100')
    })

    it(`should return '1234567' when input 1234567`, function() {
        let r = dig(1234567)
        assert.strict.deepEqual(r, '1234567')
    })

    it(`should return '1234568' when input 1234567.89`, function() {
        let r = dig(1234567.89)
        assert.strict.deepEqual(r, '1234568')
    })

    it(`should return '1234567.9' when input 1234567.89, 1`, function() {
        let r = dig(1234567.89, 1)
        assert.strict.deepEqual(r, '1234567.9')
    })

    it(`should return '0' when input '0'`, function() {
        let r = dig('0')
        assert.strict.deepEqual(r, '0')
    })

    it(`should return '0' when input '0.1'`, function() {
        let r = dig('0.1')
        assert.strict.deepEqual(r, '0')
    })

    it(`should return '0.1' when input '0.1', 1`, function() {
        let r = dig('0.1', 1)
        assert.strict.deepEqual(r, '0.1')
    })

    it(`should return '0' when input '-0.1'`, function() {
        let r = dig('-0.1')
        assert.strict.deepEqual(r, '0')
    })

    it(`should return '-0.1' when input '-0.1', 1`, function() {
        let r = dig('-0.1', 1)
        assert.strict.deepEqual(r, '-0.1')
    })

    it(`should return '0' when input '0.123456789'`, function() {
        let r = dig('0.123456789')
        assert.strict.deepEqual(r, '0')
    })

    it(`should return '0.123' when input '0.123456789', 3`, function() {
        let r = dig('0.123456789', 3)
        assert.strict.deepEqual(r, '0.123')
    })

    it(`should return '0.1235' when input '0.123456789', 4`, function() {
        let r = dig('0.123456789', 4)
        assert.strict.deepEqual(r, '0.1235')
    })

    it(`should return '100' when input '100'`, function() {
        let r = dig('100')
        assert.strict.deepEqual(r, '100')
    })

    it(`should return '1234567' when input '1234567'`, function() {
        let r = dig('1234567')
        assert.strict.deepEqual(r, '1234567')
    })

    it(`should return '1234568' when input '1234567.89'`, function() {
        let r = dig('1234567.89')
        assert.strict.deepEqual(r, '1234568')
    })

    it(`should return '1234567.9' when input '1234567.89', 1`, function() {
        let r = dig('1234567.89', 1)
        assert.strict.deepEqual(r, '1234567.9')
    })

    it(`should return '' when input '100abc'`, function() {
        let r = dig('100abc')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input ''`, function() {
        let r = dig('')
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input []`, function() {
        let r = dig([])
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input {}`, function() {
        let r = dig({})
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input null`, function() {
        let r = dig(null)
        assert.strict.deepEqual(r, '')
    })

    it(`should return '' when input undefined`, function() {
        let r = dig(undefined)
        assert.strict.deepEqual(r, '')
    })

})
