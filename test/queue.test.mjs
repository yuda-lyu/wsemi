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
                        resolve(ms)
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

    //console.log('test1')
    // queues push 1~5
    // message ["$1"]
    // get $1
    // message ["$2"]
    // get $2
    // queues push 6~10
    // cb $1
    // message ["$3","$4","$5","$6","$7","$8","$9","$10"]
    // get $3
    // cb $2
    // message ["$4","$5","$6","$7","$8","$9","$10"]
    // get $4
    // cb $3
    // message ["$5","$6","$7","$8","$9","$10"]
    // get $5
    // cb $4
    // message ["$6","$7","$8","$9","$10"]
    // get $6
    // cb $5
    // message ["$7","$8","$9","$10"]
    // get $7
    // cb $6
    // message ["$8","$9","$10"]
    // get $8
    // cb $7
    // message ["$9","$10"]
    // get $9
    // cb $8
    // message ["$10"]
    // get $10
    // cb $9
    // cb $10
    // [["$1"],["$2"],["$3","$4","$5","$6","$7","$8","$9","$10"],["$4","$5","$6","$7","$8","$9","$10"],["$5","$6","$7","$8","$9","$10"],["$6","$7","$8","$9","$10"],["$7","$8","$9","$10"],["$8","$9","$10"],["$9","$10"],["$10"]]
    let r1 = '[["$1"],["$2"],["$3","$4","$5","$6","$7","$8","$9","$10"],["$4","$5","$6","$7","$8","$9","$10"],["$5","$6","$7","$8","$9","$10"],["$6","$7","$8","$9","$10"],["$7","$8","$9","$10"],["$8","$9","$10"],["$9","$10"],["$10"]]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test(2, 1000) //takeLimit=2, timeCallBack=1000ms
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    //console.log('test2')
    // test2
    // queues push 1~5
    // message ["$1"]
    // get $1
    // message ["$2"]
    // get $2
    // message ["$3"]
    // get $3
    // message ["$4"]
    // get $4
    // message ["$5"]
    // get $5
    // queues push 6~10
    // message ["$6"]
    // get $6
    // cb $1
    // message ["$7"]
    // get $7
    // cb $2
    // message ["$8"]
    // get $8
    // cb $3
    // message ["$9"]
    // get $9
    // cb $4
    // message ["$10"]
    // get $10
    // cb $5
    // cb $6
    // cb $7
    // cb $8
    // cb $9
    // cb $10
    // [["$1"],["$2"],["$3"],["$4"],["$5"],["$6"],["$7"],["$8"],["$9"],["$10"]]
    let r2 = '[["$1"],["$2"],["$3"],["$4"],["$5"],["$6"],["$7"],["$8"],["$9"],["$10"]]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test(0, 500) //takeLimit=0, timeCallBack=500ms
        //console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

})
