import assert from 'assert'
import arraccum from '../src/arraccum.mjs'


describe('arraccum', function () {

    it('should return [1, 3, 6, 10] when input [1, 2, 3, 4]', function () {
        let r = arraccum([1, 2, 3, 4])
        let rr = [1, 3, 6, 10]
        assert.strict.deepEqual(r, rr)
    })

    it("should return [1, 3, 6, '', 10] when input [1, 2, 3, null, 4]", function () {
        let r = arraccum([1, 2, 3, null, 4])
        let rr = [1, 3, 6, '', 10]
        assert.strict.deepEqual(r, rr)
    })

    it("should return [1, 3, 6, '', 10] when input [1, 2, 3, '', 4]", function () {
        let r = arraccum([1, 2, 3, '', 4])
        let rr = [1, 3, 6, '', 10]
        assert.strict.deepEqual(r, rr)
    })

    it('should return [] when input 123.456', function () {
        let r = arraccum(123.456)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it("should return [] when input '123.456'", function () {
        let r = arraccum('123.456')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it("should return [] when input ''", function () {
        let r = arraccum('')
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it('should return [] when input []', function () {
        let r = arraccum([])
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it('should return [] when input {}', function () {
        let r = arraccum({})
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it('should return [] when input null', function () {
        let r = arraccum(null)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

    it('should return [] when input undefined', function () {
        let r = arraccum(undefined)
        let rr = []
        assert.strict.deepEqual(r, rr)
    })

})
