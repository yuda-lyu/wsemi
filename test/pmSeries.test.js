import assert from 'assert'
import genPm from '../src/genPm.mjs'
import pmSeries from '../src/pmSeries.mjs'


describe(`pmSeries`, function() {

    it(`should then ['pmSeries: 2', 'pmSeries: 3', 'pmSeries: 1'] when call pmSeries`, async function() {
        let r = await pmSeries([2, 3, 1], function(v, k) {
            let pm = genPm()
            setTimeout(function() {
                pm.resolve('pmSeries: ' + v + '(' + k + ')')
            }, 1)
            return pm
        })
        assert.strict.deepEqual(r, ['pmSeries: 2(0)', 'pmSeries: 3(1)', 'pmSeries: 1(2)'])
    })

})
