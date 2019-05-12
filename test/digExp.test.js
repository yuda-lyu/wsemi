import assert from 'assert'
import digExp from '../src/digExp.mjs'


describe('digExp', function() {

    it("should return '1e-7' when input 0.000000123456789", function() {
        let r = digExp(0.000000123456789)
        assert.strict.deepEqual(r, '1e-7')
    })

    it("should return '1.23e-7' when input 0.000000123456789, 2", function() {
        let r = digExp(0.000000123456789, 2)
        assert.strict.deepEqual(r, '1.23e-7')
    })

    it("should return '1.235e-7' when input 0.000000123456789, 3", function() {
        let r = digExp(0.000000123456789, 3)
        assert.strict.deepEqual(r, '1.235e-7')
    })

    it("should return '1e-7' when input '0.000000123456789'", function() {
        let r = digExp('0.000000123456789')
        assert.strict.deepEqual(r, '1e-7')
    })

    it("should return '1.23e-7' when input '0.000000123456789', 2", function() {
        let r = digExp('0.000000123456789', 2)
        assert.strict.deepEqual(r, '1.23e-7')
    })

    it("should return '1.235e-7' when input '0.000000123456789', 3", function() {
        let r = digExp('0.000000123456789', 3)
        assert.strict.deepEqual(r, '1.235e-7')
    })

    it("should return '0' when input 0", function() {
        let r = digExp(0)
        assert.strict.deepEqual(r, '0')
    })

    it("should return '0' when input 0.1", function() {
        let r = digExp(0.1)
        assert.strict.deepEqual(r, '0')
    })

    it("should return '0.1' when input 0.1, 1", function() {
        let r = digExp(0.1, 1)
        assert.strict.deepEqual(r, '0.1')
    })

    it("should return '0' when input -0.1", function() {
        let r = digExp(-0.1)
        assert.strict.deepEqual(r, '0')
    })

    it("should return '-0.1' when input -0.1, 1", function() {
        let r = digExp(-0.1, 1)
        assert.strict.deepEqual(r, '-0.1')
    })

    it("should return '0' when input 0.123456789", function() {
        let r = digExp(0.123456789)
        assert.strict.deepEqual(r, '0')
    })

    it("should return '0.123' when input 0.123456789, 3", function() {
        let r = digExp(0.123456789, 3)
        assert.strict.deepEqual(r, '0.123')
    })

    it("should return '0.1235' when input 0.123456789, 4", function() {
        let r = digExp(0.123456789, 4)
        assert.strict.deepEqual(r, '0.1235')
    })

    it("should return '100' when input 100", function() {
        let r = digExp(100)
        assert.strict.deepEqual(r, '100')
    })

    it("should return '1234567' when input 1234567", function() {
        let r = digExp(1234567)
        assert.strict.deepEqual(r, '1234567')
    })

    it("should return '1234568' when input 1234567.89", function() {
        let r = digExp(1234567.89)
        assert.strict.deepEqual(r, '1234568')
    })

    it("should return '1234567.9' when input 1234567.89, 1", function() {
        let r = digExp(1234567.89, 1)
        assert.strict.deepEqual(r, '1234567.9')
    })

    it("should return '0' when input '0'", function() {
        let r = digExp('0')
        assert.strict.deepEqual(r, '0')
    })

    it("should return '0' when input '0.1'", function() {
        let r = digExp('0.1')
        assert.strict.deepEqual(r, '0')
    })

    it("should return '0.1' when input '0.1', 1", function() {
        let r = digExp('0.1', 1)
        assert.strict.deepEqual(r, '0.1')
    })

    it("should return '0' when input '-0.1'", function() {
        let r = digExp('-0.1')
        assert.strict.deepEqual(r, '0')
    })

    it("should return '-0.1' when input '-0.1', 1", function() {
        let r = digExp('-0.1', 1)
        assert.strict.deepEqual(r, '-0.1')
    })

    it("should return '0' when input '0.123456789'", function() {
        let r = digExp('0.123456789')
        assert.strict.deepEqual(r, '0')
    })

    it("should return '0.123' when input '0.123456789', 3", function() {
        let r = digExp('0.123456789', 3)
        assert.strict.deepEqual(r, '0.123')
    })

    it("should return '0.1235' when input '0.123456789', 4", function() {
        let r = digExp('0.123456789', 4)
        assert.strict.deepEqual(r, '0.1235')
    })

    it("should return '100' when input '100'", function() {
        let r = digExp('100')
        assert.strict.deepEqual(r, '100')
    })

    it("should return '1234567' when input '1234567'", function() {
        let r = digExp('1234567')
        assert.strict.deepEqual(r, '1234567')
    })

    it("should return '1234568' when input '1234567.89'", function() {
        let r = digExp('1234567.89')
        assert.strict.deepEqual(r, '1234568')
    })

    it("should return '1234567.9' when input '1234567.89', 1", function() {
        let r = digExp('1234567.89', 1)
        assert.strict.deepEqual(r, '1234567.9')
    })

    it("should return '' when input '100abc'", function() {
        let r = digExp('100abc')
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input ''", function() {
        let r = digExp('')
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input []", function() {
        let r = digExp([])
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input {}", function() {
        let r = digExp({})
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input null", function() {
        let r = digExp(null)
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input undefined", function() {
        let r = digExp(undefined)
        assert.strict.deepEqual(r, '')
    })

})
