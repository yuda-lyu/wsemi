import assert from 'assert'
import psSeries from '../src/psSeries.mjs'


describe(`psSeries`, function() {

    let pm1 = function(v) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve('pm1' + v)
            }, 1)
        })
    }
    let pm2 = function(v) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve('pm2' + v)
            }, 1)
        })
    }
    let pm3 = function(v) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve('pm3' + v)
            }, 1)
        })
    }

    it(`should then 'pm3pm2pm1*' when call psSeries([pm1, pm2, pm3], '*')`, function() {
        psSeries([pm1, pm2, pm3], '*')
            .then(function(r) {
                assert.strict.deepEqual(r, 'pm3pm2pm1*')
            })
            .catch(function() {
                assert.strict.deepEqual(1, "can't touch catch")
            })
    })

})
