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
 * @returns {Object} 回傳佇列處理器物件，額外提供run函數，第1參數為非同步函數，第2參數之後(含第3,4,...)為欲輸入非同步函數之參數，多參數時每個用逗號區隔即可，回傳為Promise，resolve回傳成功結果而reject回傳失敗訊息
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
 * async function fun4() {
 *     return new Promise((resolve, reject) => {
 *
 *         let ms = []
 *
 *         let fpm = function (name, t) {
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(() => {
 *                     resolve('resolve: ' + name)
 *                 }, t)
 *             })
 *         }
 *         let q3 = pmQueue(null, true)
 *
 *         q3.run(fpm, 'pm1', 150)
 *             .then(function(msg) {
 *                 console.log('pm1 then', msg)
 *                 ms.push('pm1 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm1 catch', msg)
 *                 ms.push('pm1 catch: ' + 'reason ' + msg.reason)
 *             })
 *         q3.run(fpm, 'pm2', 100)
 *             .then(function(msg) {
 *                 console.log('pm2 then', msg)
 *                 ms.push('pm2 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm2 catch', msg)
 *                 ms.push('pm2 catch: ' + 'reason ' + msg.reason)
 *             })
 *         q3.run(fpm, 'pm3', 50)
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
 *             q3.run(fpm, 'pm4', 50)
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
 *     console.log('test q1')
 *     let ms1 = []
 *     let q1 = pmQueue(1)
 *     q1.run(fun1, 'inp1')
 *         .then(function(msg) {
 *             ms1.push('fun1 then ' + msg)
 *             console.log('fun1 then', msg)
 *         })
 *         .catch(function(msg) {
 *             ms1.push('fun1 catch ' + msg)
 *             console.log('fun1 catch', msg)
 *         })
 *     q1.run(fun2, 'inp2')
 *         .then(function(msg) {
 *             ms1.push('fun2 then ' + msg)
 *             console.log('fun2 then', msg)
 *         })
 *         .catch(function(msg) {
 *             ms1.push('fun2 catch ' + msg)
 *             console.log('fun2 catch', msg)
 *         })
 *     q1.run(fun3, 'inp3')
 *         .then(function(msg) {
 *             ms1.push('fun3 then ' + msg)
 *             console.log('fun3 then', msg)
 *         })
 *         .catch(function(msg) {
 *             ms1.push('fun3 catch ' + msg)
 *             console.log('fun3 catch', msg)
 *         })
 *     setTimeout(function() {
 *         console.log(JSON.stringify(ms1))
 *     }, 650)
 * }, 1)
 * // test q1
 * // call fun1
 * // fun1 then #inp1
 * // call fun2
 * // fun2 catch #inp2
 * // call fun3
 * // fun3 then #inp3
 * // ["fun1 then #inp1","fun2 catch #inp2","fun3 then #inp3"]
 *
 * setTimeout(function() {
 *     console.log('test q2')
 *     let ms2 = []
 *     let q2 = pmQueue(2)
 *     q2.run(fun1, 'inp1')
 *         .then(function(msg) {
 *             ms2.push('fun1 then ' + msg)
 *             console.log('fun1 then', msg)
 *         })
 *         .catch(function(msg) {
 *             ms2.push('fun1 catch ' + msg)
 *             console.log('fun1 catch', msg)
 *         })
 *     q2.run(fun2, 'inp2')
 *         .then(function(msg) {
 *             ms2.push('fun2 then ' + msg)
 *             console.log('fun2 then', msg)
 *         })
 *         .catch(function(msg) {
 *             ms2.push('fun2 catch ' + msg)
 *             console.log('fun2 catch', msg)
 *         })
 *     q2.run(fun3, 'inp3')
 *         .then(function(msg) {
 *             ms2.push('fun3 then ' + msg)
 *             console.log('fun3 then', msg)
 *         })
 *         .catch(function(msg) {
 *             ms2.push('fun3 catch ' + msg)
 *             console.log('fun3 catch', msg)
 *         })
 *     setTimeout(function() {
 *         console.log(JSON.stringify(ms2))
 *     }, 450)
 * }, 700)
 * // test q2
 * // call fun1
 * // call fun2
 * // fun2 catch #inp2
 * // call fun3
 * // fun1 then #inp1
 * // fun3 then #inp3
 * // ["fun2 catch #inp2","fun1 then #inp1","fun3 then #inp3"]
 *
 * setTimeout(function() {
 *     console.log('test q3')
 *     fun4()
 *         .then((ms3) => {
 *             console.log(JSON.stringify(ms3))
 *         })
 * }, 1400)
 * // test q3
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

    //save
    q.run = run

    return q
}


export default pmQueue
