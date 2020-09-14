import assert from 'assert'
import pmHook from '../src/pmHook.mjs'


describe(`pmHook`, function() {

    async function test() {
        let ms

        ms = []
        let pm1 = function (v1, v2) {
            return new Promise(function(resolve, reject) {
                resolve(`resolve: v1=${v1}, v2=${v2}`)
            })
        }
        let pm1p = pmHook(pm1, (msg) => {
            //console.log('pm1p cb', msg)
            ms.push({
                cb: 'pm1p',
                ...msg,
            })
        })
        await pm1p('inp1-a', 'inp1-b')
            .then(function(msg) {
                //console.log('pm1p then', msg)
                ms.push('pm1p then: ' + msg)
            })
            .catch(function(msg) {
                //console.log('pm1p catch', msg)
                ms.push('pm1p catch: ' + msg)
            })
        //console.log(JSON.stringify(ms))
        // pm1p cb { mode: 'before', data: [Arguments] { '0': 'inp1-a', '1': 'inp1-b' } }
        // pm1p cb { mode: 'afterThen', data: 'resolve: v1=inp1-a, v2=inp1-b' }
        // pm1p then resolve: v1=inp1-a, v2=inp1-b
        // [{"cb":"pm1p","mode":"before","data":{"0":"inp1-a","1":"inp1-b"}},{"cb":"pm1p","mode":"afterThen","data":"resolve: v1=inp1-a, v2=inp1-b"},"pm1p then: resolve: v1=inp1-a, v2=inp1-b"]
        assert.strict.deepStrictEqual(JSON.stringify(ms), '[{"cb":"pm1p","mode":"before","data":{"0":"inp1-a","1":"inp1-b"}},{"cb":"pm1p","mode":"afterThen","data":"resolve: v1=inp1-a, v2=inp1-b"},"pm1p then: resolve: v1=inp1-a, v2=inp1-b"]')

        ms = []
        let pm2 = function (v1, v2) {
            return new Promise(function(resolve, reject) {
                reject(`reject: v1=${v1}, v2=${v2}`)
            })
        }
        let pm2p = pmHook(pm2, (msg) => {
            //console.log('pm2p cb', msg)
            ms.push({
                cb: 'pm2p',
                ...msg,
            })
        })
        await pm2p('inp2-a', 'inp2-b')
            .then(function(msg) {
                //console.log('pm2p then', msg)
                ms.push('pm2p then: ' + msg)
            })
            .catch(function(msg) {
                //console.log('pm2p catch', msg)
                ms.push('pm2p catch: ' + msg)
            })
        //console.log(JSON.stringify(ms))
        // pm2p cb { mode: 'before', data: [Arguments] { '0': 'inp2-a', '1': 'inp2-b' } }
        // pm2p cb { mode: 'afterCatch', data: 'reject: v1=inp2-a, v2=inp2-b' }
        // pm2p catch reject: v1=inp2-a, v2=inp2-b
        // [{"cb":"pm2p","mode":"before","data":{"0":"inp2-a","1":"inp2-b"}},{"cb":"pm2p","mode":"afterCatch","data":"reject: v1=inp2-a, v2=inp2-b"},"pm2p catch: reject: v1=inp2-a, v2=inp2-b"]
        assert.strict.deepStrictEqual(JSON.stringify(ms), '[{"cb":"pm2p","mode":"before","data":{"0":"inp2-a","1":"inp2-b"}},{"cb":"pm2p","mode":"afterCatch","data":"reject: v1=inp2-a, v2=inp2-b"},"pm2p catch: reject: v1=inp2-a, v2=inp2-b"]')

        ms = []
        let pm3 = function (v1, v2) {
            return new Promise(function(resolve, reject) {
                reject(`reject: v1=${v1}, v2=${v2}`)
            })
        }
        let pm3p = pmHook(pm3, (msg) => {
            //console.log('pm3p cb', msg)
            ms.push({
                cb: 'pm3p',
                ...msg,
            })
            if (msg.mode === 'before') {
                //arguments有兩個輸入故得分開改
                msg.data[0] = '[modify input a]' + msg.data[0]
                msg.data[1] = '[modify input b]' + msg.data[1]
                return msg.data
            }
            if (msg.mode === 'afterCatch') {
                return '[modify catch]' + msg.data
            }
        })
        await pm3p('inp3-a', 'inp3-b')
            .then(function(msg) {
                //console.log('pm3p then', msg)
                ms.push('pm3p then: ' + msg)
            })
            .catch(function(msg) {
                //console.log('pm3p catch', msg)
                ms.push('pm3p catch: ' + msg)
            })
        //console.log(JSON.stringify(ms))
        // pm3p cb { mode: 'before', data: [Arguments] { '0': 'inp3-a', '1': 'inp3-b' } }
        // pm3p cb { mode: 'afterCatch', data: 'reject: v1=[modify input a]inp3-a, v2=[modify input b]inp3-b' }
        // pm3p catch [modify catch]reject: v1=[modify input a]inp3-a, v2=[modify input b]inp3-b
        // [{"cb":"pm3p","mode":"before","data":{"0":"[modify input a]inp3-a","1":"[modify input b]inp3-b"}},{"cb":"pm3p","mode":"afterCatch","data":"reject: v1=[modify input a]inp3-a, v2=[modify input b]inp3-b"},"pm3p catch: [modify catch]reject: v1=[modify input a]inp3-a, v2=[modify input b]inp3-b"]
        assert.strict.deepStrictEqual(JSON.stringify(ms), '[{"cb":"pm3p","mode":"before","data":{"0":"[modify input a]inp3-a","1":"[modify input b]inp3-b"}},{"cb":"pm3p","mode":"afterCatch","data":"reject: v1=[modify input a]inp3-a, v2=[modify input b]inp3-b"},"pm3p catch: [modify catch]reject: v1=[modify input a]inp3-a, v2=[modify input b]inp3-b"]')

    }
    test()

})
