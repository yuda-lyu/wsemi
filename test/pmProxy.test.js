import assert from 'assert'
import pmProxy from '../src/pmProxy.mjs'


describe(`pmProxy`, function() {

    async function test() {

        let ms = []

        let pm1 = function (v) {
            return new Promise(function(resolve, reject) {
                resolve('resolve: ' + v)
            })
        }
        let pm1p = pmProxy(pm1, (msg) => {
            //console.log('pm1p cb', msg)
            msg = {
                cb: 'pm1p',
                ...msg,
            }
            ms.push(msg)
        })
        await pm1p('inp1')
            .then(function(msg) {
                //console.log('pm1p then', msg)
                ms.push('pm1p then: ' + msg)
            })
            .catch(function(msg) {
                //console.log('pm1p catch', msg)
                ms.push('pm1p catch: ' + msg)
            })

        let pm2 = function (v) {
            return new Promise(function(resolve, reject) {
                reject('reject: ' + v)
            })
        }
        let pm2p = pmProxy(pm2, (msg) => {
            //console.log('pm2p cb', msg)
            msg = {
                cb: 'pm2p',
                ...msg,
            }
            ms.push(msg)
        })
        await pm2p('inp2')
            .then(function(msg) {
                //console.log('pm2p then', msg)
                ms.push('pm2p then: ' + msg)
            })
            .catch(function(msg) {
                //console.log('pm2p catch', msg)
                ms.push('pm2p catch: ' + msg)
            })

        //console.log(JSON.stringify(ms))
        assert.strict.deepEqual(JSON.stringify(ms), '[{"cb":"pm1p","mode":"before","data":"inp1"},{"cb":"pm1p","mode":"afterThen","data":"resolve: inp1"},"pm1p then: resolve: inp1",{"cb":"pm1p","mode":"afterFinally"},{"cb":"pm2p","mode":"before","data":"inp2"},{"cb":"pm2p","mode":"afterCatch","data":"reject: inp2"},"pm2p catch: reject: inp2",{"cb":"pm2p","mode":"afterFinally"}]')

    }
    test()

})
