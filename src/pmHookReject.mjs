import isFunSafe from './_isFunSafe.mjs'
import pmHook from './pmHook.mjs'


/**
 * 掛勾非同步(Promise)函數，可監聽或修改Promise的reject輸出數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmHookReject.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入非同步Promise函數，必須參數，須為函數(async generator函數不算)；非函數時於本函數呼叫當下同步拋出Error('invalid fun: must be a function')，不回傳null
 * @param {Function} [cb=()=>{}] 輸入回調函數，預設()={}，非函數視為未給而改用預設，cb函數之輸入為監聽reject到的資訊數據。若想於cb函數修改reject數據，則由cb函數的輸入修改完回傳即可。例如收到reject的msg為'abc'，將msg='def'再return msg即可
 * @returns {Function} 回傳包裝函數，呼叫後回傳Promise，resolve為回傳成功結果，reject為回傳失敗訊息
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

    //check, fun為必須參數(建立包裝函數者), 無效即同步拋錯而不回傳null(同pmHook); cb為選填, 非函數視為未給(K3)
    if (!isFunSafe(fun)) {
        throw new Error('invalid fun: must be a function')
    }
    if (!isFunSafe(cb)) {
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
