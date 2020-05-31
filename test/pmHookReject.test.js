import assert from 'assert'
import pmHookReject from '../src/pmHookReject.mjs'


describe(`pmHookReject`, function() {

    async function test() {
        let ms

        ms = []
        let pm1 = function (v) {
            return new Promise(function(resolve, reject) {
                reject('reject: ' + v)
            })
        }
        let pm1p = pmHookReject(pm1, (msg) => {
            //console.log('pm1p cb', msg)
            msg = '[modify catch]' + msg
            return msg
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
        assert.strict.deepEqual(JSON.stringify(ms), '["pm1p catch: [modify catch]reject: inp1"]')

    }
    test()

})
