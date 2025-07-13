import assert from 'assert'
import genIDSeq from '../src/genIDSeq.mjs'


describe(`genIDSeq`, function() {

    it(`should length eq. 36 return true when no input`, function() {
        let r = genIDSeq()
        assert.strict.deepStrictEqual(r.length, 36)
    })

})
