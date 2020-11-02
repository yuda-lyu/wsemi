import PmQueue from './pmQueue.mjs'


/**
 * 封裝非同步函數進行防抖
 *
 * 多次呼叫不同之非同步函數時，僅接收最末一次的呼叫，前面的呼叫皆會自動轉為catch，回傳訊息為物件{reason:'cancelled'}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmLast.test.js Github}
 * @memberOf wsemi
 * @returns {Function} 回傳Function，為pmQueue的equip函數。equip輸入為非同步函數，轉換該非同步函數後並等待其執行，執行時再傳入原本欲輸入非同步函數之參數，回傳為Promise，resolve回傳成功結果而reject回傳失敗訊息，詳情可見pmQueue
 * @example
 *
 * async function test1() {
 *     return new Promise((resolve, reject) => {
 *
 *         let ms = []
 *
 *         let fun = function (name, t) {
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(() => {
 *                     resolve('[fun]resolve: ' + name)
 *                 }, t)
 *             })
 *         }
 *
 *         //用pml轉換非同步函數
 *         let pml = pmLast()
 *         let funp = pml(fun) //掛載單函數, 執行才推入佇列
 *
 *         funp('t1', 150)
 *             .then(function(msg) {
 *                 console.log('t1 then', msg)
 *                 ms.push('t1 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('t1 catch', msg)
 *                 ms.push('t1 catch: ' + 'reason ' + msg.reason)
 *             })
 *         funp('t2', 100)
 *             .then(function(msg) {
 *                 console.log('t2 then', msg)
 *                 ms.push('t2 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('t2 catch', msg)
 *                 ms.push('t2 catch: ' + 'reason ' + msg.reason)
 *             })
 *         funp('t3', 50)
 *             .then(function(msg) {
 *                 console.log('t3 then', msg)
 *                 ms.push('t3 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('t3 catch', msg)
 *                 ms.push('t3 catch: ' + 'reason ' + msg.reason)
 *             })
 *
 *         setTimeout(() => {
 *             funp('t4', 50)
 *                 .then((msg) => {
 *                     console.log('t4 then', msg)
 *                     ms.push('t4 then: ' + msg)
 *                 })
 *                 .catch((msg) => {
 *                     console.log('t4 catch', msg)
 *                     ms.push('t4 catch: ' + 'reason ' + msg.reason)
 *                 })
 *                 .finally(() => {
 *                     resolve(ms)
 *                 })
 *         }, 200)
 *
 *     })
 * }
 *
 * async function test2() {
 *     return new Promise((resolve, reject) => {
 *
 *         let ms = []
 *
 *         let fun1 = function (name, t) {
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(() => {
 *                     resolve('[fun1]resolve: ' + name)
 *                 }, t)
 *             })
 *         }
 *
 *         let fun2 = function (name, t) {
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(() => {
 *                     resolve('[fun2]resolve: ' + name)
 *                 }, t)
 *             })
 *         }
 *
 *         //用pml轉換非同步函數
 *         let pml = pmLast()
 *         let funp1 = pml(fun1) //掛載不同函數, 執行才推入佇列
 *         let funp2 = pml(fun2) //掛載不同函數, 執行才推入佇列
 *
 *         funp1('t1', 150)
 *             .then(function(msg) {
 *                 console.log('t1 then', msg)
 *                 ms.push('t1 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('t1 catch', msg)
 *                 ms.push('t1 catch: ' + 'reason ' + msg.reason)
 *             })
 *         funp2('t2', 100)
 *             .then(function(msg) {
 *                 console.log('t2 then', msg)
 *                 ms.push('t2 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('t2 catch', msg)
 *                 ms.push('t2 catch: ' + 'reason ' + msg.reason)
 *             })
 *         funp2('t3', 50)
 *             .then(function(msg) {
 *                 console.log('t3 then', msg)
 *                 ms.push('t3 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('t3 catch', msg)
 *                 ms.push('t3 catch: ' + 'reason ' + msg.reason)
 *             })
 *
 *         setTimeout(() => {
 *             funp1('t4', 50)
 *                 .then((msg) => {
 *                     console.log('t4 then', msg)
 *                     ms.push('t4 then: ' + msg)
 *                 })
 *                 .catch((msg) => {
 *                     console.log('t4 catch', msg)
 *                     ms.push('t4 catch: ' + 'reason ' + msg.reason)
 *                 })
 *                 .finally(() => {
 *                     resolve(ms)
 *                 })
 *         }, 200)
 *
 *     })
 * }
 *
 * setTimeout(() => {
 *     console.log('test1')
 *     test1()
 *         .then((ms) => {
 *             console.log(JSON.stringify(ms))
 *         })
 * }, 1)
 * // test1
 * // t3 then [fun]resolve: t3
 * // t2 catch { reason: 'cancelled' }
 * // t1 catch { reason: 'cancelled' }
 * // t4 then [fun]resolve: t4
 * // ["t3 then: [fun]resolve: t3","t2 catch: reason cancelled","t1 catch: reason cancelled","t4 then: [fun]resolve: t4"]
 *
 * setTimeout(() => {
 *     console.log('test2')
 *     test2()
 *         .then((ms) => {
 *             console.log(JSON.stringify(ms))
 *         })
 * }, 300)
 * // test2
 * // t3 then [fun2]resolve: t3
 * // t2 catch { reason: 'cancelled' }
 * // t1 catch { reason: 'cancelled' }
 * // t4 then [fun1]resolve: t4
 * // ["t3 then: [fun2]resolve: t3","t2 catch: reason cancelled","t1 catch: reason cancelled","t4 then: [fun1]resolve: t4"]
 *
 */
function pmLast() {
    return new PmQueue(null, true).equip
}


export default pmLast