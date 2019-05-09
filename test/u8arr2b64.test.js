import assert from 'assert'
import u8arr2b64 from '../src/u8arr2b64.mjs'


describe('u8arr2b64', function() {

    it("should return 'AQItAA==' when input new Uint8Array([1, 2.3, '45', 'abc'])", function() {
        let u8a = new Uint8Array([1, 2.3, '45', 'abc'])
        let r = u8arr2b64(u8a)
        let rr = 'AQItAA=='
        assert.strict.deepEqual(r, rr)
    })

    it("should return '' when input '1.25'", function() {
        let r = u8arr2b64('1.25')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it("should return '' when input 2.25", function() {
        let r = u8arr2b64(2.25)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it("should return '' when input ''", function() {
        let r = u8arr2b64('')
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it("should return '' when input []", function() {
        let r = u8arr2b64([])
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it("should return '' when input {}", function() {
        let r = u8arr2b64({})
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it("should return '' when input null", function() {
        let r = u8arr2b64(null)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

    it("should return '' when input undefined", function() {
        let r = u8arr2b64(undefined)
        let rr = ''
        assert.strict.deepEqual(r, rr)
    })

})
