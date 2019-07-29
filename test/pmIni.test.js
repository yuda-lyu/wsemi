import assert from 'assert'
import pmIni from '../src/pmIni.mjs'


describe(`pmIni`, function() {

    it(`should touch [then] when call pmIni`, function() {
        pmIni()
            .then(function() {
                assert.strict.deepEqual(1, 1)
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })
    })

})
