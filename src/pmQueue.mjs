import get from 'lodash/get'
import genPm from './genPm.mjs'
import genID from './genID.mjs'
import pm2resolve from './pm2resolve.mjs'
import queue from './queue.mjs'
import isfun from './isfun.mjs'
import delay from './delay.mjs'


/**
 * 傳入initial初始值並循序執行Promise陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmQueue.test.js Github}
 * @memberOf wsemi
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @returns {Object} 回傳佇列處理器物件，包含事件on、push、get、cb、clear。on為監聽事件，需自行監聽message事件，push為加入最新佇列消息，get為回傳當前最早佇列消息，cb為於message事件內回調使迭代器可取得下一個佇列消息，clear為清空佇列
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
 */
function pmQueue(takeLimit = 0) {

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
            res = await pm2resolve(fun)(input)
        }

        //emit
        q.emit(id, res)

        //cb
        q.cb()

    })

    //run
    function run(fun, input) {

        //pm
        let pm = genPm()

        //id
        let id = genID()

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
            if (res.state === 'success') {
                pm.resolve(res.msg)
            }
            else {
                pm.reject(res.msg)
            }
        })

        return pm
    }

    //save
    q.run = run

    return q
}


export default pmQueue
