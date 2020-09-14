import assert from 'assert'
import pmHookReject from '../src/pmHookReject.mjs'


describe(`pmHookReject`, function() {

    async function test() {
        let ms

        ms = []
        let pm1 = function (v1, v2) {
            return new Promise(function(resolve, reject) {
                reject(`reject: v1=${v1}, v2=${v2}`)
            })
        }
        let pm1p = pmHookReject(pm1, (msg) => {
            //console.log('pm1p cb', msg)
            msg = '[modify catch]' + msg
            return msg
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
        // pm1p cb reject: v1=inp1-a, v2=inp1-b
        // pm1p catch reject: v1=inp1-a, v2=inp1-b
        // ["pm1p catch: reject: v1=inp1-a, v2=inp1-b"]
        assert.strict.deepStrictEqual(JSON.stringify(ms), '["pm1p catch: reject: v1=inp1-a, v2=inp1-b"]]')

    }
    test()

})
