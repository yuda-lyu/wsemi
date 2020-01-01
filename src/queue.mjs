import mitt from 'mitt'


/**
 * 佇列處理器，單生產者單消費者模式，核心使用迭代器，具有消息堵塞與可限定同時處理上限數量功能
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/queue.test.js Github}
 * @memberOf wsemi
 * @param {Number} [takeLimit=0] 輸入同時處理上限數量整數，預設0，代表無限制
 * @returns {Object} 回傳佇列處理器物件，包含事件on、push、get、cb。on為監聽事件，需自行監聽message事件，push為加入最新佇列消息，get為回傳當前最早佇列消息，cb為於message事件內回調使迭代器可取得下一個佇列消息
 * @example
 *
 * //queue, takeLimit=2
 * let q = queue(2)
 * let n = 0
 *
 * //message
 * q.on('message', function(qs) {
 *     console.log('message', qs)
 *
 *     //get
 *     let v = q.get()
 *     if (!v) {
 *         return
 *     }
 *     console.log('get', v)
 *
 *     setTimeout(function() {
 *         console.log('cb', v)
 *
 *         //cb
 *         q.cb()
 *
 *     }, 1000)
 *
 * })
 *
 * //queues push 1~5
 * setTimeout(function() {
 *     console.log('queues push 1~5')
 *     let t = setInterval(function() {
 *         n += 1
 *         q.push('$' + n)
 *         if (n === 5) {
 *             clearInterval(t)
 *         }
 *     }, 50)
 * }, 1)
 *
 * //queues push 6~10 by delay 1s
 * setTimeout(function() {
 *     console.log('queues push 6~10')
 *     let t = setInterval(function() {
 *         n += 1
 *         q.push('$' + n)
 *         if (n === 10) {
 *             clearInterval(t)
 *         }
 *     }, 50)
 * }, 1000)
 *
 * setTimeout(function() {
 *     console.log(JSON.stringify(ms))
 * }, 7000)
 *
 * // queues push 1~5
 * // message [ '$1' ]
 * // get $1
 * // message [ '$2' ]
 * // get $2
 * // queues push 6~10
 * // cb $1
 * // message [ '$3', '$4', '$5', '$6' ]
 * // get $3
 * // cb $2
 * // message [ '$4', '$5', '$6' ]
 * // get $4
 * // cb $3
 * // message [ '$5', '$6', '$7', '$8', '$9', '$10' ]
 * // get $5
 * // cb $4
 * // message [ '$6', '$7', '$8', '$9', '$10' ]
 * // get $6
 * // cb $5
 * // message [ '$7', '$8', '$9', '$10' ]
 * // get $7
 * // cb $6
 * // message [ '$8', '$9', '$10' ]
 * // get $8
 * // cb $7
 * // message [ '$9', '$10' ]
 * // get $9
 * // cb $8
 * // message [ '$10' ]
 * // get $10
 * // cb $9
 * // cb $10
 * // [["$1"],["$2"],["$3","$4","$5","$6"],["$4","$5","$6","$7"],["$5","$6","$7","$8","$9","$10"],["$6","$7","$8","$9","$10"],["$7","$8","$9","$10"],["$8","$9","$10"],["$9","$10"],["$10"]]
 *
 * // when run in q = queue(), takeLimit<=0
 * // queues push 1~5
 * // message [ '$1' ]
 * // get $1
 * // message [ '$2' ]
 * // get $2
 * // message [ '$3' ]
 * // get $3
 * // message [ '$4' ]
 * // get $4
 * // message [ '$5' ]
 * // get $5
 * // queues push 6~10
 * // message [ '$6' ]
 * // get $6
 * // cb $1
 * // message [ '$7' ]
 * // get $7
 * // cb $2
 * // cb $3
 * // message [ '$8' ]
 * // get $8
 * // cb $4
 * // message [ '$9' ]
 * // get $9
 * // cb $5
 * // message [ '$10' ]
 * // get $10
 * // cb $6
 * // cb $7
 * // cb $8
 * // cb $9
 * // cb $10
 * // [["$1"],["$2"],["$3"],["$4"],["$5"],["$6"],["$7"],["$8"],["$9"],["$10"]]
 *
 */
function queue(takeLimit = 0) {
    let takeNow = 0 //目前執行數量
    let qs = []

    //ev
    let ev = mitt()

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
        //console.log('push', qs)

        //emit
        if (takeLimit <= 0 || takeNow < takeLimit) {
            ev.emit('message', qs)
        }

    }

    //save
    ev.get = get
    ev.cb = cb
    ev.push = push

    return ev
}


export default queue
