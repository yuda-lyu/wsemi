import assert from 'assert'
import pmMap from '../src/pmMap.mjs'


describe(`pmMap`, function() {

    it(`should return '["#1","#2","#3","#4","#5","#6","#7","#8","#9","#10"]' when input [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2`, function() {
        let takeLimit = 2
        let rs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

        //pmMap
        pmMap(rs, function (v, k) {
            //console.log('call', v)
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    //console.log('resolve', v)
                    resolve('#' + v)
                }, 300)
            })
        }, takeLimit)
            .then(function(res) {
                //console.log('pmMap then', JSON.stringify(res))
                assert.strict.deepEqual(JSON.stringify(res), '["#1","#2","#3","#4","#5","#6","#7","#8","#9","#10"]')
            })
            .catch(function() {
                //console.log('pmMap catch', err)
            })

    })

})
