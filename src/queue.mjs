import evem from './evem.mjs'
import isnint from './isnint.mjs'
import cint from './cint.mjs'


/**
 * 佇列處理器，單生產者單消費者模式，具有消息堵塞與可限定同時處理上限數量功能
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/queue.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @returns {Object} 回傳事件物件，可呼叫函數on、push、get、cb、clear。on為監聽事件，需自行監聽message事件，push為加入最新佇列消息，get為回傳當前最早佇列消息，cb為於message事件內回調使迭代器可取得下一個佇列消息，clear為清空佇列
 * @example
 *
 * async function topAsync() {
 *
 *     async function test(takeLimit, timeCallBack) {
 *         return new Promise((resolve, reject) => {
 *
 *             //queue
 *             let q = queue(takeLimit)
 *             let n = 0
 *             let ms = []
 *
 *             //message
 *             q.on('message', function(qs) {
 *                 console.log('message', JSON.stringify(qs))
 *
 *                 //ms
 *                 ms.push(JSON.parse(JSON.stringify(qs)))
 *
 *                 //get
 *                 let v = q.get()
 *                 if (!v) {
 *                     return
 *                 }
 *                 console.log('get', v)
 *
 *                 setTimeout(function() {
 *                     console.log('cb', v)
 *
 *                     //cb
 *                     q.cb()
 *
 *                     //resolve
 *                     if (v === '$10') {
 *                         resolve(ms)
 *                     }
 *
 *                 }, timeCallBack)
 *
 *             })
 *
 *             //queues push 1~5
 *             setTimeout(function() {
 *                 console.log('queues push 1~5')
 *                 let t = setInterval(function() {
 *                     n += 1
 *                     q.push('$' + n)
 *                     if (n === 5) {
 *                         clearInterval(t)
 *                     }
 *                 }, 50)
 *             }, 1)
 *
 *             //queues push 6~10 by delay 1s
 *             setTimeout(function() {
 *                 console.log('queues push 6~10')
 *                 let t = setInterval(function() {
 *                     n += 1
 *                     q.push('$' + n)
 *                     if (n === 10) {
 *                         clearInterval(t)
 *                     }
 *                 }, 50)
 *             }, 500)
 *
 *         })
 *     }
 *
 *     console.log('test1')
 *     let r1 = await test(2, 1000)
 *     console.log(JSON.stringify(r1))
 *     // queues push 1~5
 *     // message ["$1"]
 *     // get $1
 *     // message ["$2"]
 *     // get $2
 *     // queues push 6~10
 *     // cb $1
 *     // message ["$3","$4","$5","$6","$7","$8","$9","$10"]
 *     // get $3
 *     // cb $2
 *     // message ["$4","$5","$6","$7","$8","$9","$10"]
 *     // get $4
 *     // cb $3
 *     // message ["$5","$6","$7","$8","$9","$10"]
 *     // get $5
 *     // cb $4
 *     // message ["$6","$7","$8","$9","$10"]
 *     // get $6
 *     // cb $5
 *     // message ["$7","$8","$9","$10"]
 *     // get $7
 *     // cb $6
 *     // message ["$8","$9","$10"]
 *     // get $8
 *     // cb $7
 *     // message ["$9","$10"]
 *     // get $9
 *     // cb $8
 *     // message ["$10"]
 *     // get $10
 *     // cb $9
 *     // cb $10
 *     // [["$1"],["$2"],["$3","$4","$5","$6","$7","$8","$9","$10"],["$4","$5","$6","$7","$8","$9","$10"],["$5","$6","$7","$8","$9","$10"],["$6","$7","$8","$9","$10"],["$7","$8","$9","$10"],["$8","$9","$10"],["$9","$10"],["$10"]]
 *
 *     console.log('test2')
 *     let r2 = await test(0, 500) //takeLimit=0, timeCallBack=500ms
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // queues push 1~5
 *     // message ["$1"]
 *     // get $1
 *     // message ["$2"]
 *     // get $2
 *     // message ["$3"]
 *     // get $3
 *     // message ["$4"]
 *     // get $4
 *     // message ["$5"]
 *     // get $5
 *     // queues push 6~10
 *     // message ["$6"]
 *     // get $6
 *     // cb $1
 *     // message ["$7"]
 *     // get $7
 *     // cb $2
 *     // message ["$8"]
 *     // get $8
 *     // cb $3
 *     // message ["$9"]
 *     // get $9
 *     // cb $4
 *     // message ["$10"]
 *     // get $10
 *     // cb $5
 *     // cb $6
 *     // cb $7
 *     // cb $8
 *     // cb $9
 *     // cb $10
 *     // [["$1"],["$2"],["$3"],["$4"],["$5"],["$6"],["$7"],["$8"],["$9"],["$10"]]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function queue(takeLimit = 0) {
    let takeNow = 0 //目前執行數量
    let qs = []

    //check
    if (isnint(takeLimit)) {
        takeLimit = 0
    }
    takeLimit = cint(takeLimit)

    //ev
    let ev = evem()

    //get, like iterator
    function get() {
        if (qs.length > 0) {

            //add
            takeNow += 1

            //take first
            let r = qs.splice(0, 1)[0]

            return r
        }
        else {

            //null
            let r = null

            return r
        }
    }

    //cb
    function cb() {

        //minu
        takeNow -= 1
        if (takeNow < 0) {
            takeNow = 0
        }

        //emit
        if (qs.length > 0) {
            ev.emit('message', qs)
        }

    }

    //push
    function push(v) {

        //push
        qs.push(v)
        //console.log('push', v, qs)

        //emit
        if (takeLimit <= 0 || takeNow < takeLimit) {
            ev.emit('message', qs)
        }

    }

    //clear
    function clear() {
        takeNow = 0
        qs = []
    }

    //save
    ev.get = get
    ev.cb = cb
    ev.push = push
    ev.clear = clear

    return ev
}


export default queue
