import assert from 'assert'
import pmLast from '../src/pmLast.mjs'


describe(`pmLast`, function() {

    async function test() {
        return new Promise((resolve, reject) => {

            let ms = []

            let pm = function (name, t) {
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        resolve('resolve: ' + name)
                    }, t)
                })
            }

            let pmm = pmLast(pm)

            pmm('pm1', 150)
                .then(function(msg) {
                    //console.log('pm1 then', msg)
                    ms.push('pm1 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('pm1 catch', msg)
                    ms.push('pm1 catch: ' + 'reason ' + msg.reason)
                })
            pmm('pm2', 100)
                .then(function(msg) {
                    //console.log('pm2 then', msg)
                    ms.push('pm2 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('pm2 catch', msg)
                    ms.push('pm2 catch: ' + 'reason ' + msg.reason)
                })
            pmm('pm3', 50)
                .then(function(msg) {
                    //console.log('pm3 then', msg)
                    ms.push('pm3 then: ' + msg)
                })
                .catch(function(msg) {
                    //console.log('pm3 catch', msg)
                    ms.push('pm3 catch: ' + 'reason ' + msg.reason)
                })

            setTimeout(() => {
                pmm('pm4', 50)
                    .then((msg) => {
                        //console.log('pm4 then', msg)
                        ms.push('pm4 then: ' + msg)
                    })
                    .catch((msg) => {
                        //console.log('pm4 catch', msg)
                        ms.push('pm4 catch: ' + 'reason ' + msg.reason)
                    })
                    .finally(() => {
                        resolve(JSON.stringify(ms))
                    })
            }, 200)

        })
    }

    it(`should return '["pm3 then: resolve: pm3","pm2 catch: reason cancelled","pm1 catch: reason cancelled","pm4 then: resolve: pm4"]' when call func in 4 times`, function() {
        setTimeout(() => {
            test()
                .then((msg) => {
                    //console.log(msg)
                    assert.strict.deepEqual(msg, '["pm3 then: resolve: pm3","pm2 catch: reason cancelled","pm1 catch: reason cancelled","pm4 then: resolve: pm4"]')
                })
        }, 3000) //delay避開測試尖峰
    })

})
