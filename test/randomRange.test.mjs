import assert from 'assert'
import randomRange from '../src/randomRange.mjs'


describe(`randomRange`, function() {

    let ck = (r, rs, re) => {
        let t = r >= rs
            ? r < re
            : false
        return t
    }

    it(`should return [0,1) when no input`, function() {
        let r = randomRange()
        let rr = ck(r, 0, 1)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [0,1) when input 0, 1`, function() {
        let r = randomRange(0, 1)
        let rr = ck(r, 0, 1)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [12.3, 456.7) when input 12.3, 456.7`, function() {
        let r = randomRange(12.3, 456.7)
        let rr = ck(r, 12.3, 456.7)
        assert.strict.deepStrictEqual(true, rr)
    })

})
