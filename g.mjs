import queue from './src/queue.mjs'


//queue
let q = queue(2) //takeLimit=2
let n = 0
let ms = []

//message
q.on('message', function(qs) {
    console.log('message', qs)

    //ms
    ms.push(JSON.parse(JSON.stringify(qs)))

    //get
    let v = q.get()
    if (!v) {
        return
    }
    console.log('get', v)

    setTimeout(function() {
        console.log('cb', v)

        //cb
        q.cb()

    }, 1000)

})

//queues push 1~5
setTimeout(function() {
    console.log('queues push 1~5')
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
    console.log('queues push 6~10')
    let t = setInterval(function() {
        n += 1
        q.push('$' + n)
        if (n === 10) {
            clearInterval(t)
        }
    }, 50)
}, 1000)

setTimeout(function() {
    console.log(JSON.stringify(ms))
}, 7000)

// queues push 1~5
// message [ '$1' ]
// get $1
// message [ '$2' ]
// get $2
// queues push 6~10
// cb $1
// message [ '$3', '$4', '$5', '$6' ]
// get $3
// cb $2
// message [ '$4', '$5', '$6' ]
// get $4
// cb $3
// message [ '$5', '$6', '$7', '$8', '$9', '$10' ]
// get $5
// cb $4
// message [ '$6', '$7', '$8', '$9', '$10' ]
// get $6
// cb $5
// message [ '$7', '$8', '$9', '$10' ]
// get $7
// cb $6
// message [ '$8', '$9', '$10' ]
// get $8
// cb $7
// message [ '$9', '$10' ]
// get $9
// cb $8
// message [ '$10' ]
// get $10
// cb $9
// cb $10

// queues push 1~5
// message [ '$1' ]
// get $1
// message [ '$2' ]
// get $2
// message [ '$3' ]
// get $3
// message [ '$4' ]
// get $4
// message [ '$5' ]
// get $5
// queues push 6~10
// message [ '$6' ]
// get $6
// cb $1
// message [ '$7' ]
// get $7
// cb $2
// cb $3
// message [ '$8' ]
// get $8
// cb $4
// message [ '$9' ]
// get $9
// cb $5
// message [ '$10' ]
// get $10
// cb $6
// cb $7
// cb $8
// cb $9
// cb $10

// if q = queue(), takeLimit<=0
// queues push 1~5
// message [ '$1' ]
// get $1
// message [ '$2' ]
// get $2
// message [ '$3' ]
// get $3
// message [ '$4' ]
// get $4
// message [ '$5' ]
// get $5
// queues push 6~10
// message [ '$6' ]
// get $6
// cb $1
// message [ '$7' ]
// get $7
// cb $2
// cb $3
// message [ '$8' ]
// get $8
// cb $4
// message [ '$9' ]
// get $9
// cb $5
// message [ '$10' ]
// get $10
// cb $6
// cb $7
// cb $8
// cb $9
// cb $10
// [["$1"],["$2"],["$3"],["$4"],["$5"],["$6"],["$7"],["$8"],["$9"],["$10"]]
