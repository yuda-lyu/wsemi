import assert from 'assert'
import mapSeries from '../src/mapSeries.mjs'


describe(`mapSeries`, function() {

    it(`should then ['mapSeries: 2', 'mapSeries: 3', 'mapSeries: 1'] when call mapSeries`, function() {

        mapSeries([2, 3, 1], function(v) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve('mapSeries: ' + v)
                }, 1)
            })
        })
            .then(function(r) {
                assert.strict.deepEqual(r, ['mapSeries: 2', 'mapSeries: 3', 'mapSeries: 1'])
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })

    })

})
