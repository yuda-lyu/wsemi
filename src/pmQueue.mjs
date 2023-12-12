import get from 'lodash-es/get'
import isBoolean from 'lodash-es/isBoolean'
import genPm from './genPm.mjs'
import genID from './genID.mjs'
import pm2resolve from './pm2resolve.mjs'
import queue from './queue.mjs'
import isfun from './isfun.mjs'
import isp0int from './isp0int.mjs'
import cint from './cint.mjs'
import delay from './delay.mjs'


/**
 * 通過佇列限制與呼叫非同步(Promise)函數，可推入不同之非同步函數，將一併受限
 *
 * 通過new建構，呼叫時輸入不同之非同步函數，以及其輸入參數，會推入佇列後並循序等待執行
 *
 * 可限制同時運行的非同步函數總數量(takeLimit>0)，可只取最後呼叫的非同步函數進行防抖功能(takeLast=true)，代表前面的呼叫皆自動轉為catch，而其回傳訊息為物件{reason:'cancelled'}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmQueue.test.mjs Github}
 * @memberOf wsemi
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @param {Boolean} [takeLast=false] 輸入多次觸發時是否只取最後呼叫的非同步函數，預設false，搭配takeLimit=0進行非同步函數防抖
 * @returns {Function} 回傳Function，第1參數為非同步函數，第2參數之後為欲輸入非同步函數之參數。回傳為Promise，resolve回傳成功結果而reject回傳失敗訊息
 * @example
 *
 * async function topAsync() {
 *
 *     async function test1() {
 *         return new Promise((resolve, reject) => {
 *
 *             let ms = []
 *             let pmq = pmQueue(1) //同時處理1個
 *
 *             function fun1(v) {
 *                 console.log('call fun1')
 *                 ms.push('call fun1')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun1 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 300)
 *                 })
 *             }
 *
 *             function fun2(v) {
 *                 console.log('call fun2')
 *                 ms.push('call fun2')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun2 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 200)
 *                 })
 *             }
 *
 *             function fun3(v) {
 *                 console.log('call fun3')
 *                 ms.push('call fun3')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun3 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 100)
 *                 })
 *             }
 *
 *             pmq(fun1, 'inp1')
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmq(fun2, 'inp2')
 *                 .then(function(msg) {
 *                     console.log('t2 then', msg)
 *                     ms.push('t2 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t2 catch', msg)
 *                     ms.push('t2 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmq(fun3, 'inp3')
 *                 .then(function(msg) {
 *                     console.log('t3 then', msg)
 *                     ms.push('t3 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t3 catch', msg)
 *                     ms.push('t3 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 700)
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // call fun1
 *     // t1 then #inp1
 *     // call fun2
 *     // t2 then #inp2
 *     // call fun3
 *     // t3 then #inp3
 *     // ["call fun1","fun1 resolve: inp1","t1 then: #inp1","call fun2","fun2 resolve: inp2","t2 then: #inp2","call fun3","fun3 resolve: inp3","t3 then: #inp3"]
 *
 *     async function test2() {
 *         return new Promise((resolve, reject) => {
 *
 *             let ms = []
 *             let pmq = pmQueue(2) //同時處理2個
 *
 *             function fun1(v) {
 *                 console.log('call fun1')
 *                 ms.push('call fun1')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun1 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 300)
 *                 })
 *             }
 *
 *             function fun2(v) {
 *                 console.log('call fun2')
 *                 ms.push('call fun2')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun2 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 200)
 *                 })
 *             }
 *
 *             function fun3(v) {
 *                 console.log('call fun3')
 *                 ms.push('call fun3')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun3 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 100)
 *                 })
 *             }
 *
 *             pmq(fun1, 'inp1')
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmq(fun2, 'inp2')
 *                 .then(function(msg) {
 *                     console.log('t2 then', msg)
 *                     ms.push('t2 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t2 catch', msg)
 *                     ms.push('t2 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmq(fun3, 'inp3')
 *                 .then(function(msg) {
 *                     console.log('t3 then', msg)
 *                     ms.push('t3 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t3 catch', msg)
 *                     ms.push('t3 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 700)
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // call fun1
 *     // call fun2
 *     // t2 then #inp2
 *     // call fun3
 *     // t1 then #inp1
 *     // t3 then #inp3
 *     // ["call fun1","call fun2","fun2 resolve: inp2","t2 then: #inp2","call fun3","fun1 resolve: inp1","t1 then: #inp1","fun3 resolve: inp3","t3 then: #inp3"]
 *
 *     async function test3() {
 *         return new Promise((resolve, reject) => {
 *
 *             let ms = []
 *             let pmq = pmQueue(null) //同時處理全部
 *
 *             function fun1(v) {
 *                 console.log('call fun1')
 *                 ms.push('call fun1')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun1 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 300)
 *                 })
 *             }
 *
 *             function fun2(v) {
 *                 console.log('call fun2')
 *                 ms.push('call fun2')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun2 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 200)
 *                 })
 *             }
 *
 *             function fun3(v) {
 *                 console.log('call fun3')
 *                 ms.push('call fun3')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun3 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 100)
 *                 })
 *             }
 *
 *             pmq(fun1, 'inp1')
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmq(fun2, 'inp2')
 *                 .then(function(msg) {
 *                     console.log('t2 then', msg)
 *                     ms.push('t2 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t2 catch', msg)
 *                     ms.push('t2 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmq(fun3, 'inp3')
 *                 .then(function(msg) {
 *                     console.log('t3 then', msg)
 *                     ms.push('t3 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t3 catch', msg)
 *                     ms.push('t3 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 700)
 *         })
 *     }
 *     console.log('test3')
 *     let r3 = await test3()
 *     console.log(JSON.stringify(r3))
 *     // test3
 *     // call fun1
 *     // call fun2
 *     // call fun3
 *     // t3 then #inp3
 *     // t2 then #inp2
 *     // t1 then #inp1
 *     // ["call fun1","call fun2","call fun3","fun3 resolve: inp3","t3 then: #inp3","fun2 resolve: inp2","t2 then: #inp2","fun1 resolve: inp1","t1 then: #inp1"]
 *
 *     async function test4() {
 *         return new Promise((resolve, reject) => {
 *
 *             let ms = []
 *             let pmq = pmQueue(null, true) //同時處理全部, 但只拿最後執行者的結果
 *
 *             function fun1(v) {
 *                 console.log('call fun1')
 *                 ms.push('call fun1')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun1 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 300)
 *                 })
 *             }
 *
 *             function fun2(v) {
 *                 console.log('call fun2')
 *                 ms.push('call fun2')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun2 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 200)
 *                 })
 *             }
 *
 *             function fun3(v) {
 *                 console.log('call fun3')
 *                 ms.push('call fun3')
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(function() {
 *                         ms.push('fun3 resolve: ' + v)
 *                         resolve('#' + v)
 *                     }, 100)
 *                 })
 *             }
 *
 *             pmq(fun1, 'inp1')
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmq(fun2, 'inp2')
 *                 .then(function(msg) {
 *                     console.log('t2 then', msg)
 *                     ms.push('t2 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t2 catch', msg)
 *                     ms.push('t2 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmq(fun3, 'inp3')
 *                 .then(function(msg) {
 *                     console.log('t3 then', msg)
 *                     ms.push('t3 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t3 catch', msg)
 *                     ms.push('t3 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             setTimeout(function() {
 *                 resolve(ms)
 *             }, 700)
 *         })
 *     }
 *     console.log('test4')
 *     let r4 = await test4()
 *     console.log(JSON.stringify(r4))
 *     // test4
 *     // call fun1
 *     // call fun2
 *     // call fun3
 *     // t3 then #inp3
 *     // t2 catch { reason: 'cancelled' }
 *     // t1 catch { reason: 'cancelled' }
 *     // ["call fun1","call fun2","call fun3","fun3 resolve: inp3","t3 then: #inp3","fun2 resolve: inp2","t2 catch: reason cancelled","fun1 resolve: inp1","t1 catch: reason cancelled"]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function pmQueue(takeLimit = 0, takeLast = false) {

    function ClsPmQueue(takeLimit, takeLast) {
        let gid = null

        //takeLimit
        if (!isp0int(takeLimit)) {
            takeLimit = 0
        }
        takeLimit = cint(takeLimit)

        //takeLast
        if (!isBoolean(takeLast)) {
            takeLast = false
        }

        //queue
        let q = queue(takeLimit)

        //message
        q.on('message', async function(qs) {
        //console.log('message', qs)

            //get
            let v = q.get()
            if (!v) {
                return
            }

            //delay, 因emit與cb出去後外面promise會慢一點, 故執行前delay釋放同步調用, 使前一個佇列先完成promise
            await delay(1)

            //id
            let id = get(v, 'id')

            //fun
            let fun = get(v, 'fun')

            //input
            let input = get(v, 'input')

            //res
            let res
            if (!isfun(fun)) {
                res = {
                    state: 'error',
                    msg: 'fun is not a function',
                }
            }
            else {
                res = await pm2resolve(fun)(...input)
            }

            //emit
            q.emit(id, res)

            //cb
            q.cb()

        })

        //run
        function run(fun, ...input) {

            //pm
            let pm = genPm()

            //id
            let id = genID()

            //save gid
            gid = id

            //p
            let p = {
                id,
                fun,
                input,
            }

            //push
            q.push(p)

            //once
            q.once(id, (res) => {
            //console.log('once', id, res)
                if (takeLast) {
                    if (id === gid) {
                        if (res.state === 'success') {
                            pm.resolve(res.msg)
                        }
                        else {
                            pm.reject(res.msg)
                        }
                    }
                    else {
                        pm.reject({ reason: 'cancelled' })
                    }
                }
                else {
                    if (res.state === 'success') {
                        pm.resolve(res.msg)
                    }
                    else {
                        pm.reject(res.msg)
                    }
                }
            })

            return pm
        }

        return run
    }

    return new ClsPmQueue(takeLimit, takeLast)
}


export default pmQueue
