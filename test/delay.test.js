import assert from 'assert'
import delay from '../src/delay.mjs'


describe(`delay`, function() {

    it(`should touch [then] in 2 sec. when call delay`, function() {
        delay(2000)
            .then(function() {
                assert.strict.deepStrictEqual(1, 1)
            })
            .catch(function() {
                assert.strict.deepStrictEqual(1, 'can not touch catch')
            })
    })

})
