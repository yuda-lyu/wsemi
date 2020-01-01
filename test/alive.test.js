import assert from 'assert'
import alive from '../src/alive.mjs'


describe(`alive`, function() {

    it(`should return '["enter|a","enter|b","leave|b","enter|b","leave|a","leave|b"]' when trigger a and b in four times`, function() {
        let oAL = alive(1500)

        let a = { data: 123 }
        let b = { data: '34.56' }
        let m = []

        setTimeout(() => {
            //console.log('trigger a1')
            oAL.trigger('a', a)
        }, 500)

        setTimeout(() => {
            //console.log('trigger a2')
            oAL.trigger('a', a)
        }, 2000)

        setTimeout(() => {
            //console.log('trigger b1')
            oAL.trigger('b', b)
        }, 1000)

        setTimeout(() => {
            //console.log('trigger b2')
            oAL.trigger('b', b)
        }, 3000)

        setTimeout(() => {
            //console.log(JSON.stringify(m))
            assert.strict.deepEqual(JSON.stringify(m), '["enter|a","enter|b","leave|b","enter|b","leave|a","leave|b"]')
        }, 5000)

        oAL.on('message', function({ eventName, key, data, now }) {
            //console.log({ eventName, key, data, now })
            m.push(eventName + '|' + key)
        })

    })

})
