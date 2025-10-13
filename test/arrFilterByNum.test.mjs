import assert from 'assert'
import arrFilterByNum from '../src/arrFilterByNum.mjs'


describe(`arrFilterByNum`, function() {

    it(`should return [-2.2, -1.1, -1.1, -1, -0.5, 0, 0, 0.5, 1, 1.1, 1.1, 2.2] when input ['abc', '-2.2', '-1.1', -1.1, -1, -0.5, 0, '0', 0.5, 1, 1.1, '1.1', '2.2', 'xyz']`, function() {
        let r = arrFilterByNum(['abc', '-2.2', '-1.1', -1.1, -1, -0.5, 0, '0', 0.5, 1, 1.1, '1.1', '2.2', 'xyz'])
        let rr = [-2.2, -1.1, -1.1, -1, -0.5, 0, 0, 0.5, 1, 1.1, 1.1, 2.2]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [-2.2, -1.1, -1.1, -1, -0.5, 0, 0] when input ['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0']`, function() {
        let r = arrFilterByNum(['-2.2', '-1.1', -1.1, -1, -0.5, 0, '0'])
        let rr = [-2.2, -1.1, -1.1, -1, -0.5, 0, 0]
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input ''`, function() {
        let r = arrFilterByNum('')
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input []`, function() {
        let r = arrFilterByNum([])
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input {}`, function() {
        let r = arrFilterByNum({})
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input null`, function() {
        let r = arrFilterByNum(null)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input undefined`, function() {
        let r = arrFilterByNum(undefined)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return [] when input NaN`, function() {
        let r = arrFilterByNum(NaN)
        let rr = []
        assert.strict.deepStrictEqual(r, rr)
    })

})
