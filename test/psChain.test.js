import assert from 'assert'
import psChain from '../src/psChain.mjs'


describe('psChain', function() {

    it(`should touch [then] when call psChain`, function() {
        psChain()
            .then(function() {
                assert.strict.deepEqual(1, 1)
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })
    })

})
