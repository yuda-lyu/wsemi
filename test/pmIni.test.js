import assert from 'assert'
import pmIni from '../src/pmIni.mjs'


describe(`pmIni`, function() {

    it(`should touch [then] when call pmIni`, function() {
        pmIni()
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function() {
                assert.strict.deepStrictEqual(1, 'can not touch catch')
            })
    })

})
