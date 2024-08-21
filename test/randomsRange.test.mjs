import assert from 'assert'
import randomsRange from '../src/randomsRange.mjs'


describe(`randomsRange`, function() {

    let ck = (r, rs, re) => {
        let t = r >= rs
            ? r < re
            : false
        return t
    }

    it(`should return [ [0,1) ] when no input`, function() {
        let r = randomsRange()
        let rr = ck(r[0], 0, 1)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [ [0,1) ] when input 0, 1`, function() {
        let r = randomsRange(0, 1)
        let rr = ck(r[0], 0, 1)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [ [0,1), [0,1) ] when input 0, 1, 2`, function() {
        let r = randomsRange(0, 1, 2)
        let rr = ck(r[0], 0, 1) && ck(r[1], 0, 1)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [ [12.3,456.7) ] when input 12.3, 456.7`, function() {
        let r = randomsRange(12.3, 456.7)
        let rr = ck(r[0], 12.3, 456.7)
        assert.strict.deepStrictEqual(true, rr)
    })

    it(`should return [ [12.3,456.7), [12.3,456.7)] when input 12.3, 456.7, 2`, function() {
        let r = randomsRange(12.3, 456.7, 2)
        let rr = ck(r[0], 12.3, 456.7) && ck(r[1], 12.3, 456.7)
        assert.strict.deepStrictEqual(true, rr)
    })

})
