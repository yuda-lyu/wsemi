import assert from 'assert'
import waitFun from '../src/waitFun.mjs'


describe(`waitFun`, function() {

    it(`should touch [then] in 2 sec. when call waitFun`, function() {
        let i = 0
        let fn = function() {
            i++
            return i >= 2
        }
        waitFun(fn)
            .then(function() {
                assert.strict.deepEqual(1, 1)
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })
    })

})
