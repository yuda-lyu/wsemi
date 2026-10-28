import genPm from './genPm.mjs'
import genID from './genID.mjs'
import pm2resolve from './pm2resolve.mjs'
import pmSettleByState from './_pmSettleByState.mjs'
import isfun from './isfun.mjs'
import evem from './evem.mjs'
import getTrace from './getTrace.mjs'


/**
 * 非同步(Promise)函數進行節流
 *
 * 同時會執行多個佇列(非同步函數)，但若有一個佇列先執行完畢，則其他佇列皆會自動轉為catch，回傳訊息為物件{reason:'cancelled'}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmThrottle.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Function} [opt.onTrace=null] 輸入觀察回調函數，於內部事件發生當下同步呼叫，傳入一個凍結之事件物件{ type, ... }，供測試以事件(而非等待時間)同步與診斷；n為依呼叫順序由1起算之任務序號；type為'push'時為任務排入佇列(含n，輸入非函數時不排入故不通知)，'start'時為開始偵測(每20ms檢查一次是否有待處理之任務)，'cancel'時為任務n因有較後排入者而即將被取消(含n)，'run'時為即將執行該次偵測所取之最後排入任務(含n)，'done'時為被執行之任務已執行完畢而即將依結果resolve或reject其Promise(含n、ok為是否成功)，'stop'時為佇列已空而停止偵測；回調不帶接收者呼叫，其拋錯與回傳值皆忽略，不影響節流，預設null
 * @returns {Function} 回傳Function，輸入為非同步函數與其輸入，會推入佇列後並循序等待執行，回傳為Promise，resolve回傳成功結果而reject回傳失敗訊息；輸入非函數時不排入佇列，回傳之Promise以字串'fun is not a function'被reject(拒絕值同pmQueue)
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
function pmThrottle(opt = {}) {
    let ev = evem()
    let q = [] //queue
    let t = null //timer
    let running = false

    //trace, 觀察回調(opt.onTrace), 未給時為null; seq為任務序號, 僅於trace時計
    let trace = getTrace(opt)
    let seq = 0

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

                //cancel, 於emit(其後依結果settle該任務之Promise)之前通知
                if (trace) {
                    trace('cancel', { n: q[i].n })
                }

                //emit
                ev.emit(id, res)

            }
            q = []

            if (m) {

                //id
                let id = m.id

                //run
                if (trace) {
                    trace('run', { n: m.n })
                }

                //func, 非函數之任務於run()已拒絕而不入列, 故此處m.func必為函數
                let res = await pm2resolve(m.func)(...m.input)

                //done, 於emit(其後依結果settle該任務之Promise)之前通知
                if (trace) {
                    trace('done', { n: m.n, ok: res.state === 'success' })
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
                if (trace) {
                    trace('stop', {})
                }
            }

        }, 20) //20ms偵測, 啟動後跑timer, 無佇列則會停止減耗
        if (trace) {
            trace('start', {})
        }
    }

    function run(func, ...input) {
        let pm = genPm()

        //check, 非函數之任務不排入佇列, 回傳之Promise以字串reject(同pmQueue之拒絕值), 不回傳undefined(呼叫端.then會同步拋錯)
        if (!isfun(func)) {
            pm.reject('fun is not a function')
            return pm
        }

        //id
        let id = genID()

        //n, 任務序號
        let n = 0
        if (trace) {
            seq += 1
            n = seq
        }

        //push
        q.push({ id, func, input, n })
        if (trace) {
            trace('push', { n })
        }

        //detect
        detect()

        //once
        ev.once(id, (res) => {
            //console.log('once', id, res)
            pmSettleByState(pm, res.state, res.msg)
        })

        return pm
    }

    return run
}


export default pmThrottle
