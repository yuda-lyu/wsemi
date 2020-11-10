import assert from 'assert'
import pmIni from '../src/pmIni.mjs'


describe(`pmIni`, function() {

    it(`should touch [then] when call pmIni`, async function() {
        await pmIni()
        assert.strict.deepStrictEqual(1, 1)
    })

})
