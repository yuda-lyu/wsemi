import assert from 'assert'
import cfinancial from '../src/cfinancial.mjs'


describe('cfinancial', function() {

    it("should return '0' when input 0", function() {
        let r = cfinancial(0)
        assert.strict.deepEqual(r, '0')
    })

    it("should return '0' when input 0.1", function() {
        let r = cfinancial(0)
        assert.strict.deepEqual(r, '0')
    })

    it("should return '0.1' when input 0.1, 1", function() {
        let r = cfinancial(0.1, 1)
        assert.strict.deepEqual(r, '0.1')
    })

    it("should return '0' when input 0.123456789", function() {
        let r = cfinancial(0.123456789)
        assert.strict.deepEqual(r, '0')
    })

    it("should return '0.123' when input 0.123456789, 3", function() {
        let r = cfinancial(0.123456789, 3)
        assert.strict.deepEqual(r, '0.123')
    })

    it("should return '0.1235' when input 0.123456789, 4", function() {
        let r = cfinancial(0.123456789, 4)
        assert.strict.deepEqual(r, '0.1235')
    })

    it("should return '100' when input 100", function() {
        let r = cfinancial(100)
        assert.strict.deepEqual(r, '100')
    })

    it("should return '1,000' when input 1000", function() {
        let r = cfinancial(1000)
        assert.strict.deepEqual(r, '1,000')
    })

    it("should return '10,000' when input 10000", function() {
        let r = cfinancial(10000)
        assert.strict.deepEqual(r, '10,000')
    })

    it("should return '100,000' when input 100000", function() {
        let r = cfinancial(100000)
        assert.strict.deepEqual(r, '100,000')
    })

    it("should return '1,234,567' when input 1234567", function() {
        let r = cfinancial(1234567)
        assert.strict.deepEqual(r, '1,234,567')
    })

    it("should return '1,234,568' when input 1234567.89", function() {
        let r = cfinancial(1234567.89)
        assert.strict.deepEqual(r, '1,234,568')
    })

    it("should return '1,234,567.9' when input 1234567.89, 1", function() {
        let r = cfinancial(1234567.89, 1)
        assert.strict.deepEqual(r, '1,234,567.9')
    })

    it("should return '' when input '100abc'", function() {
        let r = cfinancial('100abc')
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input ''", function() {
        let r = cfinancial('')
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input []", function() {
        let r = cfinancial([])
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input {}", function() {
        let r = cfinancial({})
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input null", function() {
        let r = cfinancial(null)
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input undefined", function() {
        let r = cfinancial(undefined)
        assert.strict.deepEqual(r, '')
    })

})
