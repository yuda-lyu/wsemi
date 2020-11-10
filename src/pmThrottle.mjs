import genPm from './genPm.mjs'
import genID from './genID.mjs'
import pm2resolve from './pm2resolve.mjs'
import isfun from './isfun.mjs'
import evem from './evem.mjs'


/**
 * 非同步函數進行防抖
 *
 * 通過new建構，呼叫時輸入不同之非同步函數，以及其輸入參數，會推入佇列後並循序等待執行
 *
 * 同時僅會執行一個佇列(非同步函數)，若前一個執行完畢，則直接呼叫最新(末)的佇列，前面的呼叫皆會自動轉為catch，回傳訊息為物件{reason:'cancelled'}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmThrottle.test.js Github}
 * @memberOf wsemi
 * @returns {Function} 回傳Function，輸入為非同步函數與其輸入，會推入佇列後並循序等待執行，回傳為Promise，resolve回傳成功結果而reject回傳失敗訊息
 * @example
 *
 * async function topAsync() {
 *
 *     async function test1() {
 *         return new Promise((resolve, reject) => {
 *
 *             let ms = []
 *             let pmt = pmThrottle()
 *
 *             let fun = function (name, t) {
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(() => {
 *                         console.log('resolve: ' + name + ', t: ' + t)
 *                         resolve('resolve: ' + name + ', t: ' + t)
 *                     }, t)
 *                 })
 *             }
 *
 *             pmt(fun, 't1', 150)
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmt(fun, 't2', 100)
 *                 .then(function(msg) {
 *                     console.log('t2 then', msg)
 *                     ms.push('t2 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t2 catch', msg)
 *                     ms.push('t2 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmt(fun, 't3', 50)
 *                 .then(function(msg) {
 *                     console.log('t3 then', msg)
 *                     ms.push('t3 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t3 catch', msg)
 *                     ms.push('t3 catch: ' + 'reason ' + msg.reason)
 *                 })
 *
 *             setTimeout(() => {
 *                 pmt(fun, 't4', 50)
 *                     .then((msg) => {
 *                         console.log('t4 then', msg)
 *                         ms.push('t4 then: ' + msg)
 *                     })
 *                     .catch((msg) => {
 *                         console.log('t4 catch', msg)
 *                         ms.push('t4 catch: ' + 'reason ' + msg.reason)
 *                     })
 *                     .finally(() => {
 *                         resolve(ms)
 *                     })
 *             }, 200)
 *
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // t1 catch { reason: 'cancelled' }
 *     // t2 catch { reason: 'cancelled' }
 *     // resolve: t3, t: 50
 *     // t3 then resolve: t3, t: 50
 *     // resolve: t4, t: 50
 *     // t4 then resolve: t4, t: 50
 *     // ["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: resolve: t3, t: 50","t4 then: resolve: t4, t: 50"]
 *
 *     async function test2() {
 *         return new Promise((resolve, reject) => {
 *
 *             let ms = []
 *             let pmt = pmThrottle()
 *
 *             let fun1 = function (name, t) {
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(() => {
 *                         console.log('fun1 resolve: ' + name + ', t: ' + t)
 *                         resolve('fun1 resolve: ' + name + ', t: ' + t)
 *                     }, t)
 *                 })
 *             }
 *
 *             let fun2 = function (name, t) {
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(() => {
 *                         console.log('fun2 resolve: ' + name + ', t: ' + t)
 *                         resolve('fun2 resolve: ' + name + ', t: ' + t)
 *                     }, t)
 *                 })
 *             }
 *
 *             //測試不同函數fun1與fun2
 *             pmt(fun1, 't1', 150)
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmt(fun2, 't2', 100)
 *                 .then(function(msg) {
 *                     console.log('t2 then', msg)
 *                     ms.push('t2 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t2 catch', msg)
 *                     ms.push('t2 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmt(fun2, 't3', 50)
 *                 .then(function(msg) {
 *                     console.log('t3 then', msg)
 *                     ms.push('t3 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t3 catch', msg)
 *                     ms.push('t3 catch: ' + 'reason ' + msg.reason)
 *                 })
 *
 *             setTimeout(() => {
 *                 pmt(fun1, 't4', 50)
 *                     .then((msg) => {
 *                         console.log('t4 then', msg)
 *                         ms.push('t4 then: ' + msg)
 *                     })
 *                     .catch((msg) => {
 *                         console.log('t4 catch', msg)
 *                         ms.push('t4 catch: ' + 'reason ' + msg.reason)
 *                     })
 *                     .finally(() => {
 *                         resolve(ms)
 *                     })
 *             }, 200)
 *
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // t1 catch { reason: 'cancelled' }
 *     // t2 catch { reason: 'cancelled' }
 *     // fun2 resolve: t3, t: 50
 *     // t3 then fun2 resolve: t3, t: 50
 *     // fun1 resolve: t4, t: 50
 *     // t4 then fun1 resolve: t4, t: 50
 *     // ["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: fun2 resolve: t3, t: 50","t4 then: fun1 resolve: t4, t: 50"]
 *
 *     async function test3() {
 *         return new Promise((resolve, reject) => {
 *
 *             let ms = []
 *             let pmt = pmThrottle()
 *
 *             let i = 0
 *             let fun = function () {
 *                 return new Promise(function(resolve, reject) {
 *                     setTimeout(() => {
 *                         i++
 *                         console.log('resolve: ' + i)
 *                         resolve('resolve: ' + i)
 *                     }, 100)
 *                 })
 *             }
 *
 *             //測試無輸入參數
 *             pmt(fun)
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmt(fun)
 *                 .then(function(msg) {
 *                     console.log('t2 then', msg)
 *                     ms.push('t2 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t2 catch', msg)
 *                     ms.push('t2 catch: ' + 'reason ' + msg.reason)
 *                 })
 *             pmt(fun)
 *                 .then(function(msg) {
 *                     console.log('t3 then', msg)
 *                     ms.push('t3 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t3 catch', msg)
 *                     ms.push('t3 catch: ' + 'reason ' + msg.reason)
 *                 })
 *
 *             setTimeout(() => {
 *                 pmt(fun)
 *                     .then((msg) => {
 *                         console.log('t4 then', msg)
 *                         ms.push('t4 then: ' + msg)
 *                     })
 *                     .catch((msg) => {
 *                         console.log('t4 catch', msg)
 *                         ms.push('t4 catch: ' + 'reason ' + msg.reason)
 *                     })
 *                     .finally(() => {
 *                         resolve(ms)
 *                     })
 *             }, 200)
 *
 *         })
 *     }
 *     console.log('test3')
 *     let r3 = await test3()
 *     console.log(JSON.stringify(r3))
 *     // test3
 *     // t1 catch { reason: 'cancelled' }
 *     // t2 catch { reason: 'cancelled' }
 *     // core: resolve: 1
 *     // t3 then resolve: 1
 *     // core: resolve: 2
 *     // t4 then resolve: 2
 *     // ["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: resolve: 1","t4 then: resolve: 2"]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function pmThrottle() {
    let ev = evem()
    let q = [] //queue
    let t = null //timer
    let running = false

    function detect() {
        if (t !== null) {
            return
        }
        t = setInterval(async() => {
            //console.log('q', q)

            //check
            if (running) {
                return
            }
            running = true

            //取最後的任務
            let m = q.pop()

            //先清空佇列, 若後續有添加進來就是之後再處理
            for (let i = 0; i < q.length; i++) {

                //id
                let id = q[i].id

                //res
                let res = {
                    state: 'cancelled',
                }

                //emit
                ev.emit(id, res)

            }
            q = []

            if (m) {
                let res

                //id
                let id = m.id

                //check
                if (isfun(m.func)) {

                    //func
                    res = await pm2resolve(m.func)(...m.input)

                }
                else {

                    //res
                    res = {
                        state: 'error',
                        msg: 'fun is not function',
                    }

                }

                //emit
                ev.emit(id, res)

            }

            //free
            running = false

            //clear
            if (!running && q.length === 0) {
                clearInterval(t)
                t = null
            }

        }, 10) //10ms偵測, 啟動後跑timer, 無佇列則會停止減耗
    }

    function run(func, ...input) {
        let pm = genPm()

        //check
        if (!isfun(func)) {
            console.log('func is not function')
            return
        }

        //id
        let id = genID()

        //push
        q.push({ id, func, input })

        //detect
        detect()

        //once
        ev.once(id, (res) => {
            //console.log('once', id, res)
            if (res.state === 'success') {
                pm.resolve(res.msg)
            }
            else if (res.state === 'cancelled') {
                pm.reject({ reason: 'cancelled' })
            }
            else {
                pm.reject(res.msg)
            }
        })

        return pm
    }

    return run
}


export default pmThrottle
