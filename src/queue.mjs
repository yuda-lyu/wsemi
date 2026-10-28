import evem from './evem.mjs'
import evEmit from './evEmit.mjs'
import isnint from './isnint.mjs'
import cint from './cint.mjs'
import getTrace from './getTrace.mjs'


/**
 * 佇列處理器，單生產者單消費者模式，具有消息堵塞與可限定同時處理上限數量功能
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/queue.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；type為'push'時為消息加入佇列(含size為加入後之佇列長度)，'hold'時為push後因同時處理數量已達takeLimit而暫不派發message(含size為佇列長度，taking為目前處理中數量)，'message'時為即將派發message事件(含by為'push'或'cb'代表由何者觸發，size為派發當下之佇列長度)，'get'時為呼叫get(含hit為佇列是否有消息可取，size為取出後之佇列長度，taking為取出後之處理中數量)，'cb'時為呼叫cb(含size為佇列長度，taking為扣減後之處理中數量)，'clear'時為呼叫clear(含size與taking為清空前之佇列長度與處理中數量)；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響佇列，預設null
 * @returns {Object} 回傳事件物件，可呼叫函數on、push、get、cb、clear。on為監聽事件，需自行監聽message事件，message事件傳入派發當下佇列之快照(淺複製之陣列，各消息本身不複製)，監聽器修改該快照不影響佇列，其後佇列之push、get、clear亦不改變已傳出之快照，所有監聽器收到的是同一份快照，每次派發需複製一次佇列，成本與積壓數成正比，push為加入最新佇列消息，get為回傳當前最早佇列消息，cb為於message事件內回調使迭代器可取得下一個佇列消息，clear為清空佇列；get以陣列前端移出實作，積壓量大時每次get之成本與積壓數成正比。事件物件為原生EventEmitter(eventemitter3)。本模組於派發處以try攔截監聽器之同步拋錯，故其不會使行程崩潰，會改以error事件回報{ fun: 'listener', name, msg, args }，無error監聽者則console.error；惟依EventEmitter規範，同一次派發中先拋錯之監聽器會中止該次派發，其後之監聽器不再被呼叫。async監聽器之reject不被攔截(規範上emit不觀察監聽器回傳值)，須由監聽器自行處理，否則為unhandledRejection
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
function queue(takeLimit = 0, opt = {}) {
    let takeNow = 0 //目前執行數量
    let qs = []

    //check
    if (isnint(takeLimit)) {
        takeLimit = 0
    }
    takeLimit = cint(takeLimit)

    //trace, 觀察回調(opt.onTrace), 未給時為null
    let trace = getTrace(opt)

    //ev
    let ev = evem() //message監聽器通常為async, 其reject須由監聽器自行處理; 同步拋錯則由派發處以evEmit攔截

    //get, like iterator
    function get() {
        if (qs.length > 0) {

            //add
            takeNow += 1

            //take first
            let r = qs.splice(0, 1)[0]

            if (trace) {
                trace('get', { hit: true, size: qs.length, taking: takeNow })
            }

            return r
        }
        else {

            //null
            let r = null

            if (trace) {
                trace('get', { hit: false, size: 0, taking: takeNow })
            }

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

        if (trace) {
            trace('cb', { size: qs.length, taking: takeNow })
        }

        //emit
        if (qs.length > 0) {
            if (trace) {
                trace('message', { by: 'cb', size: qs.length })
            }
            evEmit(ev, 'message', [qs.slice()], { tag: 'queue' }) //傳快照而非內部qs
        }

    }

    //push
    function push(v) {

        //push
        qs.push(v)
        //console.log('push', v, qs)

        if (trace) {
            trace('push', { size: qs.length })
        }

        //emit
        if (takeLimit <= 0 || takeNow < takeLimit) {
            if (trace) {
                trace('message', { by: 'push', size: qs.length })
            }
            evEmit(ev, 'message', [qs.slice()], { tag: 'queue' }) //傳快照而非內部qs
        }
        else if (trace) {
            trace('hold', { size: qs.length, taking: takeNow })
        }

    }

    //clear
    function clear() {
        if (trace) {
            trace('clear', { size: qs.length, taking: takeNow })
        }
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
