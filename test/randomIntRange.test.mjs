import assert from 'assert'
import randomIntRange from '../src/randomIntRange.mjs'


describe(`randomIntRange`, function() {

    let ckf = (r, rs, re) => {
        let t = r >= rs
            ? r <= re
            : false
        return t
    }

    it(`should return [0,100] when no input`, function() {
        let r = randomIntRange()
        let rr = ckf(r, 0, 100)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [0,100] when input 0, 100`, function() {
        let r = randomIntRange(0, 100)
        let rr = ckf(r, 0, 100)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [123,4567] when input 123, 4567`, function() {
        let r = randomIntRange(123, 4567)
        let rr = ckf(r, 123, 4567)
        assert.strict.deepStrictEqual(true, rr)
    })

})
