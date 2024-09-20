import assert from 'assert'
import randomIntsRange from '../src/randomIntsRange.mjs'


describe(`randomIntsRange`, function() {

    let ckf = (r, rs, re) => {
        let t = r >= rs
            ? r <= re
            : false
        return t
    }

    it(`should return [0,100] when no input`, function() {
        let r = randomIntsRange()
        let rr = ckf(r[0], 0, 100)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [0,100] when input 0, 100`, function() {
        let r = randomIntsRange(0, 100)
        let rr = ckf(r[0], 0, 100)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [0,100] when input 0, 100, 2`, function() {
        let r = randomIntsRange(0, 100, 2)
        let rr = ckf(r[0], 0, 100) && ckf(r[1], 0, 100)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [123,4567] when input 123, 4567`, function() {
        let r = randomIntsRange(123, 4567)
        let rr = ckf(r[0], 123, 4567)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [123,4567] when input 123, 4567, 2`, function() {
        let r = randomIntsRange(123, 4567, 2)
        let rr = ckf(r[0], 123, 4567) && ckf(r[1], 123, 4567)
        assert.strict.deepStrictEqual(true, rr)
    })

})