import assert from 'assert'
import queue from '../src/queue.mjs'


describe(`queue`, function() {

    it(`should return '[["$1"],["$2"],["$3","$4","$5","$6"],["$4","$5","$6","$7"],["$5","$6","$7","$8","$9","$10"],["$6","$7","$8","$9","$10"],["$7","$8","$9","$10"],["$8","$9","$10"],["$9","$10"],["$10"]]' when run queue(2)`, function() {

        //queue
        let q = queue(2) //takeLimit=2
        let n = 0
        let ms = []

        //message
        q.on('message', function(qs) {
            //console.log('message', qs)

            //ms
            ms.push(JSON.parse(JSON.stringify(qs)))

            //get
            let v = q.get()
            if (!v) {
                return
            }
            //console.log('get', v)

            setTimeout(function() {
                //console.log('cb', v)

                //cb
                q.cb()

            }, 1000)

        })

        //queues push 1~5
        setTimeout(function() {
            //console.log('queues push 1~5')
            let t = setInterval(function() {
                n += 1
                q.push('$' + n)
                if (n === 5) {
                    clearInterval(t)
                }
            }, 50)
        }, 1)

        //queues push 6~10 by delay 1s
        setTimeout(function() {
            //console.log('queues push 6~10')
            let t = setInterval(function() {
                n += 1
                q.push('$' + n)
                if (n === 10) {
                    clearInterval(t)
                }
            }, 50)
        }, 1000)

        setTimeout(function() {
            //console.log(JSON.stringify(ms))
            assert.strict.deepEqual(JSON.stringify(ms), '[["$1"],["$2"],["$3","$4","$5","$6"],["$4","$5","$6","$7"],["$5","$6","$7","$8","$9","$10"],["$6","$7","$8","$9","$10"],["$7","$8","$9","$10"],["$8","$9","$10"],["$9","$10"],["$10"]]')
        }, 7000)

    })

})
