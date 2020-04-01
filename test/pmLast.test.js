import assert from 'assert'
import pmLast from '../src/pmLast.mjs'


describe(`pmLast`, function() {

    let ms = []

    let pm = function (name, t) {
        return new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve('resolve: ' + name)
            }, t)
        })
    }

    let pmm = pmLast(pm)

    pmm('pm1', 200)
        .then(function(msg) {
            //console.log('pm1 then', msg)
            ms.push('pm1 then: ' + msg)
        })
        .catch(function(msg) {
            //console.log('pm1 catch', msg)
            ms.push('pm1 catch: ' + 'reason ' + msg.reason)
        })
    pmm('pm2', 150)
        .then(function(msg) {
            //console.log('pm2 then', msg)
            ms.push('pm2 then: ' + msg)
        })
        .catch(function(msg) {
            //console.log('pm2 catch', msg)
            ms.push('pm2 catch: ' + 'reason ' + msg.reason)
        })
    pmm('pm3', 100)
        .then(function(msg) {
            //console.log('pm3 then', msg)
            ms.push('pm3 then: ' + msg)
        })
        .catch(function(msg) {
            //console.log('pm3 catch', msg)
            ms.push('pm3 catch: ' + 'reason ' + msg.reason)
        })

    setTimeout(() => {
        //console.log(JSON.stringify(ms))
        assert.strict.deepEqual(JSON.stringify(ms), '["pm3 then: resolve: pm3","pm2 catch: reason cancelled","pm1 catch: reason cancelled"]')
    }, 250)

})
