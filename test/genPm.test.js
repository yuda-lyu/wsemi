import assert from 'assert'
import genPm from '../src/genPm.mjs'


describe(`genPm`, function() {

    let fn = function() {
        let df = genPm()
        setTimeout(function() {
            df.resolve()
        }, 1)
        return df
    }
    it(`should touch [then] when call fn`, function() {
        fn()
            .then(function() {
                assert.strict.deepEqual(1, 1)
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })
    })

})
