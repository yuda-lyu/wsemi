import assert from 'assert'
import random from '../src/random.mjs'


describe(`random`, function() {

    let ck = (r, rs, re) => {
        let t = r >= rs
            ? r < re
            : false
        return t
    }

    it(`should return [0,1) when no input`, function() {
        let r = random()
        let rr = ck(r, 0, 1)
        assert.strict.deepStrictEqual(true, rr)
    })

})
