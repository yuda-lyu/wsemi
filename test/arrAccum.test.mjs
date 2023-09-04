import assert from 'assert'
import arrAccum from '../src/arrAccum.mjs'


describe(`arrAccum`, function () {

    it(`should return [1, 3, 6, 10] when input [1, 2, 3, 4]`, function () {
        let r = arrAccum([1, 2, 3, 4])
        let rr = [1, 3, 6, 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, 3, 6, '', 10] when input [1, 2, 3, null, 4]`, function () {
        let r = arrAccum([1, 2, 3, null, 4])
        let rr = [1, 3, 6, '', 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [1, 3, 6, '', 10] when input [1, 2, 3, '', 4]`, function () {
        let r = arrAccum([1, 2, 3, '', 4])
        let rr = [1, 3, 6, '', 10]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input 123.456`, function () {
        let r = arrAccum(123.456)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input '123.456'`, function () {
        let r = arrAccum('123.456')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function () {
        let r = arrAccum('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function () {
        let r = arrAccum([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function () {
        let r = arrAccum({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function () {
        let r = arrAccum(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function () {
        let r = arrAccum(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function () {
        let r = arrAccum(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
