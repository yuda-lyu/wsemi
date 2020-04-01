import assert from 'assert'
import pmHook from '../src/pmHook.mjs'


describe(`pmHook`, function() {

    async function test() {
        let ms

        ms = []
        let pm1 = function (v) {
            return new Promise(function(resolve, reject) {
                resolve('resolve: ' + v)
            })
        }
        let pm1p = pmHook(pm1, (msg) => {
            //console.log('pm1p cb', msg)
            ms.push({
                cb: 'pm1p',
                ...msg,
            })
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
        //console.log(JSON.stringify(ms))
        assert.strict.deepEqual(JSON.stringify(ms), '[{"cb":"pm1p","mode":"before","data":"inp1"},{"cb":"pm1p","mode":"afterThen","data":"resolve: inp1"},"pm1p then: resolve: inp1"]')

        ms = []
        let pm2 = function (v) {
            return new Promise(function(resolve, reject) {
                reject('reject: ' + v)
            })
        }
        let pm2p = pmHook(pm2, (msg) => {
            //console.log('pm2p cb', msg)
            ms.push({
                cb: 'pm2p',
                ...msg,
            })
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
        assert.strict.deepEqual(JSON.stringify(ms), '[{"cb":"pm2p","mode":"before","data":"inp2"},{"cb":"pm2p","mode":"afterCatch","data":"reject: inp2"},"pm2p catch: reject: inp2"]')

        ms = []
        let pm3 = function (v) {
            return new Promise(function(resolve, reject) {
                reject('reject: ' + v)
            })
        }
        let pm3p = pmHook(pm3, (msg) => {
            //console.log('pm3p cb', msg)
            ms.push({
                cb: 'pm3p',
                ...msg,
            })
            if (msg.mode === 'before') {
                msg.data = '[modify input]' + msg.data
                return msg
            }
            if (msg.mode === 'afterCatch') {
                msg.data = '[modify catch]' + msg.data
                return msg
            }
        })
        await pm3p('inp3')
            .then(function(msg) {
                //console.log('pm3p then', msg)
                ms.push('pm3p then: ' + msg)
            })
            .catch(function(msg) {
                //console.log('pm3p catch', msg)
                ms.push('pm3p catch: ' + msg)
            })
        //console.log(JSON.stringify(ms))
        assert.strict.deepEqual(JSON.stringify(ms), '[{"cb":"pm3p","mode":"before","data":"inp3"},{"cb":"pm3p","mode":"afterCatch","data":"reject: [modify input]inp3"},"pm3p catch: [modify catch]reject: [modify input]inp3"]')

    }
    test()

})
