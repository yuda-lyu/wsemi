import isfun from './isfun.mjs'
import pmHook from './pmHook.mjs'


/**
 * 掛勾非同步(Promise)函數，可監聽或修改Promise的reject輸出數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmHookReject.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入非同步Promise函數
 * @param {Function} [cb=()=>{}] 輸入回調函數，預設()={}，cb函數之輸入為監聽reject到的資訊數據。若想於cb函數修改reject數據，則由cb函數的輸入修改完回傳即可。例如收到reject的msg為'abc'，將msg='def'再return msg即可
 * @returns {Promise} 回傳為Promise，resolve為回傳成功結果，reject為回傳失敗訊息
 * @example
 *
 * async function topAsync() {
 *
 *     async function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let pm = function (v1, v2) {
 *                 return new Promise(function(resolve, reject) {
 *                     ms.push(`reject: v1=${v1}, v2=${v2}`)
 *                     reject(`reject: v1=${v1}, v2=${v2}`)
 *                 })
 *             }
 *
 *             let pmr = pmHookReject(pm, (msg) => {
 *                 console.log('cb: ' + msg)
 *                 msg = '[modify catch]' + msg
 *                 ms.push('cb: ' + msg)
 *                 return msg
 *             })
 *
 *             pmr('t1', 12.3)
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(function() {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // cb: reject: v1=t1, v2=12.3
 *     // t1 catch [modify catch]reject: v1=t1, v2=12.3
 *     // ["reject: v1=t1, v2=12.3","cb: [modify catch]reject: v1=t1, v2=12.3","t1 catch: [modify catch]reject: v1=t1, v2=12.3"]
 *
 *     async function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let pm = function () {
 *                 return new Promise(function(resolve, reject) {
 *                     ms.push(`reject`)
 *                     reject(`reject`)
 *                 })
 *             }
 *
 *             let pmr = pmHookReject(pm, (msg) => {
 *                 console.log('cb: ' + msg)
 *                 msg = '[modify catch]' + msg
 *                 ms.push('cb: ' + msg)
 *                 return msg
 *             })
 *
 *             pmr() //測試無輸入
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(function() {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // cb: reject
 *     // t1 catch [modify catch]reject
 *     // ["reject","cb: [modify catch]reject","t1 catch: [modify catch]reject"]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function pmHookReject(fun, cb = () => {}) {

    //check
    if (!isfun(fun)) {
        return null
    }
    if (!isfun(cb)) {
        cb = () => {}
    }

    //pmHook
    return pmHook(fun, (msg) => {
        if (msg.mode === 'afterCatch') {
            return cb(msg.data)
        }
    })
}


export default pmHookReject
