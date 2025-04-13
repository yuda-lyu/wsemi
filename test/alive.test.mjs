import assert from 'assert'
import alive from '../src/alive.mjs'


describe(`alive`, function() {

    function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let oAL = alive({ timeAlive: 1500 })
            // let t = Date.now()

            let a = { data: 123 }
            let b = { data: '34.56' }

            setTimeout(() => {
                // console.log(parseInt((Date.now() - t)) + 'ms', 'trigger a1')
                oAL.trigger('a', a)
            }, 500)

            setTimeout(() => {
                // console.log(parseInt((Date.now() - t)) + 'ms', 'trigger a2')
                oAL.trigger('a', a)
            }, 1900)

            setTimeout(() => {
                // console.log(parseInt((Date.now() - t)) + 'ms', 'trigger b1')
                oAL.trigger('b', b)
            }, 1000)

            setTimeout(() => {
                // console.log(parseInt((Date.now() - t)) + 'ms', 'trigger b2')
                oAL.trigger('b', b)
            }, 3000)

            oAL.on('message', function({ eventName, key, data, now }) {
                // console.log(parseInt((Date.now() - t)) + 'ms', { eventName, key, data, now })
                ms.push(eventName + '|' + key)
            })

            setTimeout(() => {
                resolve(ms)
            }, 5000)

        })
    }
    // console.log('test1')
    // test1
    // 503ms trigger a1
    // 508ms { eventName: 'enter', key: 'a', data: { data: 123 }, now: 1 }
    // 1001ms trigger b1
    // 1003ms { eventName: 'enter', key: 'b', data: { data: '34.56' }, now: 2 }
    // 1901ms trigger a2
    // 2523ms { eventName: 'leave', key: 'b', data: { data: '34.56' }, now: 1 }
    // 3002ms trigger b2
    // 3004ms { eventName: 'enter', key: 'b', data: { data: '34.56' }, now: 2 }
    // 3430ms { eventName: 'leave', key: 'a', data: { data: 123 }, now: 1 }
    // 4544ms { eventName: 'leave', key: 'b', data: { data: '34.56' }, now: 0 }
    // ["enter|a","enter|b","leave|b","enter|b","leave|a","leave|b"]
    let r1 = '["enter|a","enter|b","leave|b","enter|b","leave|a","leave|b"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

})
