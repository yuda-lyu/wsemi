import assert from 'assert'
import queue from '../src/queue.mjs'


describe(`queue`, function() {

    async function test(takeLimit, timeCallBack) {
        return new Promise((resolve, reject) => {

            //queue
            let q = queue(takeLimit)
            let n = 0
            let ms = []

            //message
            q.on('message', function(qs) {
                //console.log('message', JSON.stringify(qs))

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

                    //resolve
                    if (v === '$10') {
                        resolve(JSON.stringify(ms))
                    }

                }, timeCallBack)

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
            }, 500)

        })
    }

    it(`should return '[["$1"],["$2"],["$3","$4","$5","$6","$7","$8","$9","$10"],["$4","$5","$6","$7","$8","$9","$10"],["$5","$6","$7","$8","$9","$10"],["$6","$7","$8","$9","$10"],["$7","$8","$9","$10"],["$8","$9","$10"],["$9","$10"],["$10"]]' when queue(2)`, function() {
        setTimeout(() => {
            test(2, 1000) //takeLimit=2, timeCallBack=1000ms
                .then((msg) => {
                    //console.log(msg)
                    assert.strict.deepStrictEqual(msg, '[["$1"],["$2"],["$3","$4","$5","$6","$7","$8","$9","$10"],["$4","$5","$6","$7","$8","$9","$10"],["$5","$6","$7","$8","$9","$10"],["$6","$7","$8","$9","$10"],["$7","$8","$9","$10"],["$8","$9","$10"],["$9","$10"],["$10"]]')
                })
        }, 3000) //delay避開測試尖峰
    })

    it(`should return '[["$1"],["$2"],["$3"],["$4"],["$5"],["$6"],["$7"],["$8"],["$9"],["$10"]]' when queue(0)`, function() {
        setTimeout(() => {
            test(0, 500) //takeLimit=0, timeCallBack=500ms
                .then((msg) => {
                    //console.log(msg)
                    assert.strict.deepStrictEqual(msg, '[["$1"],["$2"],["$3"],["$4"],["$5"],["$6"],["$7"],["$8"],["$9"],["$10"]]')
                })
        }, 6000) //delay避開測試尖峰
    })

})
