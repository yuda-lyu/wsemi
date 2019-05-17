import assert from 'assert'
import waitFunction from '../src/waitFunction.mjs'


describe('waitFunction', function() {

    let i = 0
    let fn = function() {
        i++
        return i >= 2
    }
    it(`should touch [then] in 2 sec. when call waitFunction`, function() {
        waitFunction(fn)
            .then(function() {
                assert.strict.deepEqual(1, 1)
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })
    })

})
