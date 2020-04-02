import get from 'lodash/get'
import genPm from './genPm.mjs'
import genID from './genID.mjs'
import pm2resolve from './pm2resolve.mjs'
import queue from './queue.mjs'
import isfun from './isfun.mjs'
import delay from './delay.mjs'


/**
 * 通過佇列限制與呼叫非同步(Promise)函數
 *
 * 可限制同時運行的非同步函數數量(takeLimit>0)。
 * 可只取最後呼叫的非同步函數進行防抖功能(takeLast=true)，前面的呼叫皆自動轉為catch，回傳訊息為物件{reason:'cancelled'}。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmQueue.test.js Github}
 * @memberOf wsemi
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @param {Boolean} [takeLast=false] 輸入多次觸發時是否只取最後呼叫的非同步函數，預設false，搭配takeLimit=0進行非同步函數防抖
 * @returns {Object} 回傳佇列處理器物件，提供run與equip函數供呼叫。run函數的第1參數為非同步函數，第2參數之後(含第3,4,...)為欲輸入非同步函數之參數，多參數時每個用逗號區隔即可，回傳為Promise，resolve回傳成功結果而reject回傳失敗訊息。equip函數輸入為非同步函數，轉換後等待執行，執行時再傳入原本欲輸入非同步函數之參數，回傳為Promise，resolve回傳成功結果而reject回傳失敗訊息，為run的分拆版，非同步函數執行時才推入佇列。
 * @example
 *
 * async function fun1(v) {
 *     console.log('call fun1')
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(function() {
 *             resolve('#' + v)
 *         }, 300)
 *     })
 * }
 *
 * async function fun2(v) {
 *     console.log('call fun2')
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(function() {
 *             reject('#' + v)
 *         }, 200)
 *     })
 * }
 *
 * async function fun3(v) {
 *     console.log('call fun3')
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(function() {
 *             resolve('#' + v)
 *         }, 100)
 *     })
 * }
 *
 * async function testFun1() {
 *     return new Promise((resolve, reject) => {
 *         let ms = []
 *         let q = pmQueue(1) //同時處理1個
 *         q.run(fun1, 'inp1')
 *             .then(function(msg) {
 *                 ms.push('fun1 then ' + msg)
 *                 console.log('fun1 then', msg)
 *             })
 *             .catch(function(msg) {
 *                 ms.push('fun1 catch ' + msg)
 *                 console.log('fun1 catch', msg)
 *             })
 *         q.run(fun2, 'inp2')
 *             .then(function(msg) {
 *                 ms.push('fun2 then ' + msg)
 *                 console.log('fun2 then', msg)
 *             })
 *             .catch(function(msg) {
 *                 ms.push('fun2 catch ' + msg)
 *                 console.log('fun2 catch', msg)
 *             })
 *         q.run(fun3, 'inp3')
 *             .then(function(msg) {
 *                 ms.push('fun3 then ' + msg)
 *                 console.log('fun3 then', msg)
 *             })
 *             .catch(function(msg) {
 *                 ms.push('fun3 catch ' + msg)
 *                 console.log('fun3 catch', msg)
 *             })
 *         setTimeout(function() {
 *             resolve(ms)
 *         }, 650)
 *     })
 * }
 *
 * async function testFun2() {
 *     return new Promise((resolve, reject) => {
 *         let ms = []
 *         let q = pmQueue(2) //同時處理2個
 *         q.run(fun1, 'inp1')
 *             .then(function(msg) {
 *                 ms.push('fun1 then ' + msg)
 *                 console.log('fun1 then', msg)
 *             })
 *             .catch(function(msg) {
 *                 ms.push('fun1 catch ' + msg)
 *                 console.log('fun1 catch', msg)
 *             })
 *         q.run(fun2, 'inp2')
 *             .then(function(msg) {
 *                 ms.push('fun2 then ' + msg)
 *                 console.log('fun2 then', msg)
 *             })
 *             .catch(function(msg) {
 *                 ms.push('fun2 catch ' + msg)
 *                 console.log('fun2 catch', msg)
 *             })
 *         q.run(fun3, 'inp3')
 *             .then(function(msg) {
 *                 ms.push('fun3 then ' + msg)
 *                 console.log('fun3 then', msg)
 *             })
 *             .catch(function(msg) {
 *                 ms.push('fun3 catch ' + msg)
 *                 console.log('fun3 catch', msg)
 *             })
 *         setTimeout(function() {
 *             resolve(ms)
 *         }, 450)
 *     })
 * }
 *
 * async function testFun3() {
 *     return new Promise((resolve, reject) => {
 *         let ms = []
 *         let q = pmQueue(null, true) //同時處理全部, 但只拿最後執行者的結果
 *
 *         let fpm = function (name, t) {
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(() => {
 *                     resolve('resolve: ' + name)
 *                 }, t)
 *             })
 *         }
 *
 *         //用run直接推函數入佇列並直接執行
 *         q.run(fpm, 'pm1', 150)
 *             .then(function(msg) {
 *                 console.log('pm1 then', msg)
 *                 ms.push('pm1 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm1 catch', msg)
 *                 ms.push('pm1 catch: ' + 'reason ' + msg.reason)
 *             })
 *         q.run(fpm, 'pm2', 100)
 *             .then(function(msg) {
 *                 console.log('pm2 then', msg)
 *                 ms.push('pm2 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm2 catch', msg)
 *                 ms.push('pm2 catch: ' + 'reason ' + msg.reason)
 *             })
 *         q.run(fpm, 'pm3', 50)
 *             .then(function(msg) {
 *                 console.log('pm3 then', msg)
 *                 ms.push('pm3 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm3 catch', msg)
 *                 ms.push('pm3 catch: ' + 'reason ' + msg.reason)
 *             })
 *
 *         setTimeout(() => {
 *             q.run(fpm, 'pm4', 50)
 *                 .then((msg) => {
 *                     console.log('pm4 then', msg)
 *                     ms.push('pm4 then: ' + msg)
 *                 })
 *                 .catch((msg) => {
 *                     console.log('pm4 catch', msg)
 *                     ms.push('pm4 catch: ' + 'reason ' + msg.reason)
 *                 })
 *                 .finally(() => {
 *                     resolve(ms)
 *                 })
 *         }, 200)
 *
 *     })
 * }
 *
 * async function testFun4() {
 *     return new Promise((resolve, reject) => {
 *         let ms = []
 *         let q = pmQueue(null, true) //同時處理全部, 但只拿最後執行者的結果
 *
 *         let fpm = function (name, t) {
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(() => {
 *                     resolve('resolve: ' + name)
 *                 }, t)
 *             })
 *         }
 *
 *         //用equip事先轉換函數, 之後再依需求執行
 *         let fpm1 = q.equip(fpm)
 *         let fpm2 = q.equip(fpm)
 *         let fpm3 = q.equip(fpm)
 *         let fpm4 = q.equip(fpm)
 *
 *         fpm1('pm1', 150)
 *             .then(function(msg) {
 *                 console.log('pm1 then', msg)
 *                 ms.push('pm1 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm1 catch', msg)
 *                 ms.push('pm1 catch: ' + 'reason ' + msg.reason)
 *             })
 *         fpm2('pm2', 100)
 *             .then(function(msg) {
 *                 console.log('pm2 then', msg)
 *                 ms.push('pm2 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm2 catch', msg)
 *                 ms.push('pm2 catch: ' + 'reason ' + msg.reason)
 *             })
 *         fpm3('pm3', 50)
 *             .then(function(msg) {
 *                 console.log('pm3 then', msg)
 *                 ms.push('pm3 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm3 catch', msg)
 *                 ms.push('pm3 catch: ' + 'reason ' + msg.reason)
 *             })
 *
 *         setTimeout(() => {
 *             fpm4('pm4', 50)
 *                 .then((msg) => {
 *                     console.log('pm4 then', msg)
 *                     ms.push('pm4 then: ' + msg)
 *                 })
 *                 .catch((msg) => {
 *                     console.log('pm4 catch', msg)
 *                     ms.push('pm4 catch: ' + 'reason ' + msg.reason)
 *                 })
 *                 .finally(() => {
 *                     resolve(ms)
 *                 })
 *         }, 200)
 *
 *     })
 * }
 *
 * setTimeout(function() {
 *     console.log('testFun1')
 *     testFun1()
 *         .then((ms) => {
 *             console.log(JSON.stringify(ms))
 *         })
 * }, 1)
 * // testFun1
 * // call fun1
 * // fun1 then #inp1
 * // call fun2
 * // fun2 catch #inp2
 * // call fun3
 * // fun3 then #inp3
 * // ["fun1 then #inp1","fun2 catch #inp2","fun3 then #inp3"]
 *
 * setTimeout(function() {
 *     console.log('testFun2')
 *     testFun2()
 *         .then((ms) => {
 *             console.log(JSON.stringify(ms))
 *         })
 * }, 700)
 * // testFun2
 * // call fun1
 * // call fun2
 * // fun2 catch #inp2
 * // call fun3
 * // fun1 then #inp1
 * // fun3 then #inp3
 * // ["fun2 catch #inp2","fun1 then #inp1","fun3 then #inp3"]
 *
 * setTimeout(function() {
 *     console.log('testFun3')
 *     testFun3()
 *         .then((ms) => {
 *             console.log(JSON.stringify(ms))
 *         })
 * }, 1400)
 * // testFun3
 * // pm3 then resolve: pm3
 * // pm2 catch { reason: 'cancelled' }
 * // pm1 catch { reason: 'cancelled' }
 * // pm4 then resolve: pm4
 * // ["pm3 then: resolve: pm3","pm2 catch: reason cancelled","pm1 catch: reason cancelled","pm4 then: resolve: pm4"]
 *
 * setTimeout(function() {
 *     console.log('testFun4')
 *     testFun4()
 *         .then((ms) => {
 *             console.log(JSON.stringify(ms))
 *         })
 * }, 2100)
 * // testFun4
 * // pm3 then resolve: pm3
 * // pm2 catch { reason: 'cancelled' }
 * // pm1 catch { reason: 'cancelled' }
 * // pm4 then resolve: pm4
 * // ["pm3 then: resolve: pm3","pm2 catch: reason cancelled","pm1 catch: reason cancelled","pm4 then: resolve: pm4"]
 *
 */
function pmQueue(takeLimit = 0, takeLast = false) {
    let gid = null

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
                msg: 'fun is not function',
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

    //equip
    function equip(fun) {
        return function(...input) {
            return run(fun, ...input)
        }
    }

    //save
    q.run = run
    q.equip = equip

    return q
}


export default pmQueue
