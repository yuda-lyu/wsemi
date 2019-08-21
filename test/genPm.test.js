import assert from 'assert'
import genPm from '../src/genPm.mjs'


describe('genPm', function() {

    let fn = function() {
        let pm = genPm()
        setTimeout(function() {
            pm.resolve()
        }, 1)
        return pm
    }
    it('should touch [then] when call fn', function() {
        fn()
            .then(function() {
                assert.strict.deepEqual(1, 1)
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })
    })

})
