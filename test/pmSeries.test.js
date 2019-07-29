import assert from 'assert'
import pmSeries from '../src/pmSeries.mjs'


describe(`pmSeries`, function() {

    it(`should then ['pmSeries: 2', 'pmSeries: 3', 'pmSeries: 1'] when call pmSeries`, function() {

        pmSeries([2, 3, 1], function(v) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve('pmSeries: ' + v)
                }, 1)
            })
        })
            .then(function(r) {
                assert.strict.deepEqual(r, ['pmSeries: 2', 'pmSeries: 3', 'pmSeries: 1'])
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })

    })

})
