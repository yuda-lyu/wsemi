/**
 * 產生Promise物件，具備鏈式resolve與reject
 * 主要受jQuery Deferred概念啟發
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/genPm.test.js Github}
 * @memberOf wsemi
 * @returns {Object} 回傳Promise物件
 * @example
 *
 * async function topAsync() {
 *
 *     function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let fn = function(name) {
 *                 let pm = genPm()
 *                 setTimeout(function() {
 *                     ms.push('resolve: ' + name)
 *                     pm.resolve('resolve: ' + name)
 *                 }, 1)
 *                 return pm
 *             }
 *
 *             fn('abc')
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(() => {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // t1 then resolve: abc
 *     // ["resolve: abc","t1 then: resolve: abc"]
 *
 *     function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let fn = function(name) {
 *                 let pm = genPm()
 *                 setTimeout(function() {
 *                     ms.push('reject: ' + name)
 *                     pm.reject('reject: ' + name)
 *                 }, 1)
 *                 return pm
 *             }
 *
 *             fn('abc')
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(() => {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // t1 catch reject: abc
 *     // ["reject: abc","t1 catch: reject: abc"]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function genPm() {

    let resolve
    let reject
    let p = new Promise(function() {
        resolve = arguments[0]
        reject = arguments[1]
    })
    p.resolve = resolve
    p.reject = reject

    return p
}


export default genPm
