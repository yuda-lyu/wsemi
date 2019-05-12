import assert from 'assert'
import cfilesize from '../src/cfilesize.mjs'


describe('cfilesize', function() {

    it("should return '0.0 kb' when input 0", function() {
        let r = cfilesize(0)
        assert.strict.deepEqual(r, '0.0 kb')
    })

    it("should return '100.0 kb' when input 100", function() {
        let r = cfilesize(100)
        assert.strict.deepEqual(r, '100.0 kb')
    })

    it("should return '1000.0 kb' when input 1000", function() {
        let r = cfilesize(1000)
        assert.strict.deepEqual(r, '1000.0 kb')
    })

    it("should return '1.0 mb' when input 1024", function() {
        let r = cfilesize(1024)
        assert.strict.deepEqual(r, '1.0 mb')
    })

    it("should return '1.9 mb' when input 1900", function() {
        let r = cfilesize(1900)
        assert.strict.deepEqual(r, '1.9 mb')
    })

    it("should return '2.0 mb' when input 2000", function() {
        let r = cfilesize(2000)
        assert.strict.deepEqual(r, '2.0 mb')
    })

    it("should return '2.0 mb' when input 2048", function() {
        let r = cfilesize(2048)
        assert.strict.deepEqual(r, '2.0 mb')
    })

    it("should return '19.5 mb' when input 20000", function() {
        let r = cfilesize(20000)
        assert.strict.deepEqual(r, '19.5 mb')
    })

    it("should return '97.7 mb' when input 100000", function() {
        let r = cfilesize(100000)
        assert.strict.deepEqual(r, '97.7 mb')
    })

    it("should return '195.3 mb' when input 200000", function() {
        let r = cfilesize(200000)
        assert.strict.deepEqual(r, '195.3 mb')
    })

    it("should return '976.6 mb' when input 1000000", function() {
        let r = cfilesize(1000000)
        assert.strict.deepEqual(r, '976.6 mb')
    })

    it("should return '1.0 gb' when input 1048576", function() {
        let r = cfilesize(1048576)
        assert.strict.deepEqual(r, '1.0 gb')
    })

    it("should return '1.9 gb' when input 2000000", function() {
        let r = cfilesize(2000000)
        assert.strict.deepEqual(r, '1.9 gb')
    })

    it("should return '9.5 gb' when input 10000000", function() {
        let r = cfilesize(10000000)
        assert.strict.deepEqual(r, '9.5 gb')
    })

    it("should return '95.4 gb' when input 100000000", function() {
        let r = cfilesize(100000000)
        assert.strict.deepEqual(r, '95.4 gb')
    })

    it("should return '0.0 kb' when input '0'", function() {
        let r = cfilesize('0')
        assert.strict.deepEqual(r, '0.0 kb')
    })

    it("should return '100.0 kb' when input '100'", function() {
        let r = cfilesize('100')
        assert.strict.deepEqual(r, '100.0 kb')
    })

    it("should return '1000.0 kb' when input '1000'", function() {
        let r = cfilesize('1000')
        assert.strict.deepEqual(r, '1000.0 kb')
    })

    it("should return '1.0 mb' when input '1024'", function() {
        let r = cfilesize('1024')
        assert.strict.deepEqual(r, '1.0 mb')
    })

    it("should return '1.9 mb' when input '1900'", function() {
        let r = cfilesize('1900')
        assert.strict.deepEqual(r, '1.9 mb')
    })

    it("should return '2.0 mb' when input '2000'", function() {
        let r = cfilesize('2000')
        assert.strict.deepEqual(r, '2.0 mb')
    })

    it("should return '2.0 mb' when input '2048'", function() {
        let r = cfilesize('2048')
        assert.strict.deepEqual(r, '2.0 mb')
    })

    it("should return '19.5 mb' when input '20000'", function() {
        let r = cfilesize('20000')
        assert.strict.deepEqual(r, '19.5 mb')
    })

    it("should return '97.7 mb' when input '100000'", function() {
        let r = cfilesize('100000')
        assert.strict.deepEqual(r, '97.7 mb')
    })

    it("should return '195.3 mb' when input '200000'", function() {
        let r = cfilesize('200000')
        assert.strict.deepEqual(r, '195.3 mb')
    })

    it("should return '976.6 mb' when input '1000000'", function() {
        let r = cfilesize('1000000')
        assert.strict.deepEqual(r, '976.6 mb')
    })

    it("should return '1.0 gb' when input '1048576'", function() {
        let r = cfilesize('1048576')
        assert.strict.deepEqual(r, '1.0 gb')
    })

    it("should return '1.9 gb' when input '2000000'", function() {
        let r = cfilesize('2000000')
        assert.strict.deepEqual(r, '1.9 gb')
    })

    it("should return '9.5 gb' when input '10000000'", function() {
        let r = cfilesize('10000000')
        assert.strict.deepEqual(r, '9.5 gb')
    })

    it("should return '95.4 gb' when input '100000000'", function() {
        let r = cfilesize('100000000')
        assert.strict.deepEqual(r, '95.4 gb')
    })

    it("should return '' when input '100abc'", function() {
        let r = cfilesize('100abc')
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input ''", function() {
        let r = cfilesize('')
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input []", function() {
        let r = cfilesize([])
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input {}", function() {
        let r = cfilesize({})
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input null", function() {
        let r = cfilesize(null)
        assert.strict.deepEqual(r, '')
    })

    it("should return '' when input undefined", function() {
        let r = cfilesize(undefined)
        assert.strict.deepEqual(r, '')
    })

})
