import assert from 'assert'
import arrFilterByPnum from '../src/arrFilterByPnum.mjs'


describe(`arrFilterByPnum`, function() {

    it(`should return [0.5, 1, 1.1, 1.1, 2.2] when input ['abc', '-2.2', '-1.1', -1.1, -1, -0.5, 0, '0', 0.5, 1, 1.1, '1.1', '2.2', 'xyz']`, function() {
        let r = arrFilterByPnum(['abc', '-2.2', '-1.1', -1.1, -1, -0.5, 0, '0', 0.5, 1, 1.1, '1.1', '2.2', 'xyz'])
        let rr = [0.5, 1, 1.1, 1.1, 2.2]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0']`, function() {
        let r = arrFilterByPnum(['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0'])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrFilterByPnum('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrFilterByPnum([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrFilterByPnum({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrFilterByPnum(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrFilterByPnum(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
