import drop from 'lodash/drop'
import genPm from './genPm.mjs'
import isarr from './isarr.mjs'
import isfun from './isfun.mjs'


/**
 * Promise的mapSeries，循序執行promise
 *
 * 若輸入rs為資料陣列則fn需將數據處理並回傳Promise，若輸入rs為Promise陣列則fn可不給，並循序執行各Promise。
 * 使用函數執行時，等同於pmMap使用函數執行且takeLimit=1，promise依序執行完畢才會調用下一個promise。
 * 先行產生promise時，等同於pmMap使用函數執行且takeLimit=0，或是等同於pmMap先行產生promise，各promise直接執行視各自執行時間結束。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmSeries.test.js Github}
 * @memberOf wsemi
 * @param {Array} rs 輸入資料陣列，若不給fn則rs需要為Promise陣列
 * @param {Function} fun 輸入循序執行值的呼叫函數
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 *
 * async function topAsync() {
 *
 *     async function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             //通過function調用產生promise, 各promise循序調用
 *             pmSeries([1, 2, 3, 4, 5], function (v, k) {
 *                 return new Promise(function(resolve, reject) {
 *                     let d = 400 - ((v ** 2) * 10 + 50)
 *                     console.log('call', v)
 *                     ms.push({ call: v })
 *                     setTimeout(function() {
 *                         console.log('resolve', v, 'd', d)
 *                         ms.push({ resolve: v, d })
 *                         resolve('#' + v)
 *                     }, d)
 *                 })
 *             })
 *                 .then(function(res) {
 *                     console.log('then', JSON.stringify(res))
 *                     ms.push({ res })
 *                     resolve(ms)
 *                 })
 *                 .catch(function(err) {
 *                     console.log('catch', JSON.stringify(err))
 *                     ms.push({ err })
 *                     resolve(ms)
 *                 })
 *
 *         })
 *
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // call 1
 *     // resolve 1 d 340
 *     // call 2
 *     // resolve 2 d 310
 *     // call 3
 *     // resolve 3 d 260
 *     // call 4
 *     // resolve 4 d 190
 *     // call 5
 *     // resolve 5 d 100
 *     // then ["#1","#2","#3","#4","#5"]
 *     // [{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"resolve":3,"d":260},{"call":4},{"resolve":4,"d":190},{"call":5},{"resolve":5,"d":100},{"res":["#1","#2","#3","#4","#5"]}]
 *
 *     async function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             //通過function調用產生promise, 各promise循序調用, 於3會觸發reject而跳出pmSeries
 *             pmSeries([1, 2, 3, 4, 5], function (v, k) {
 *                 return new Promise(function(resolve, reject) {
 *                     let d = 400 - ((v ** 2) * 10 + 50)
 *                     console.log('call', v)
 *                     ms.push({ call: v })
 *                     setTimeout(function() {
 *                         if (v === 3) {
 *                             console.log('reject', v, 'd', d)
 *                             ms.push({ reject: v, d })
 *                             reject('#' + v)
 *                         }
 *                         else {
 *                             console.log('resolve', v, 'd', d)
 *                             ms.push({ resolve: v, d })
 *                             resolve('#' + v)
 *                         }
 *                     }, d)
 *                 })
 *             })
 *                 .then(function(res) {
 *                     console.log('then', JSON.stringify(res))
 *                     ms.push({ res })
 *                     resolve(ms)
 *                 })
 *                 .catch(function(err) {
 *                     console.log('catch', JSON.stringify(err))
 *                     ms.push({ err })
 *                     resolve(ms)
 *                 })
 *
 *         })
 *
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // call 1
 *     // resolve 1 d 340
 *     // call 2
 *     // resolve 2 d 310
 *     // call 3
 *     // reject 3 d 260
 *     // catch "#3"
 *     // [{"call":1},{"resolve":1,"d":340},{"call":2},{"resolve":2,"d":310},{"call":3},{"reject":3,"d":260},{"err":"#3"}]
 *
 *     async function test3() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             //先產生promise, 因事先初始化故各promise會依照各自執行時間結束
 *             let rs = [1, 2, 3, 4, 5].map(function (v, k) {
 *                 return new Promise(function(resolve, reject) {
 *                     let d = 400 - ((v ** 2) * 10 + 50)
 *                     console.log('call', v)
 *                     ms.push({ call: v })
 *                     setTimeout(function() {
 *                         console.log('resolve', v, 'd', d)
 *                         ms.push({ resolve: v, d })
 *                         resolve('#' + v)
 *                     }, d)
 *                 })
 *             })
 *             pmSeries(rs, null)
 *                 .then(function(res) {
 *                     console.log('then', JSON.stringify(res))
 *                     ms.push({ res })
 *                     resolve(ms)
 *                 })
 *                 .catch(function(err) {
 *                     console.log('catch', JSON.stringify(err))
 *                     ms.push({ err })
 *                     resolve(ms)
 *                 })
 *
 *         })
 *
 *     }
 *     console.log('test3')
 *     let r3 = await test3()
 *     console.log(JSON.stringify(r3))
 *     // test3
 *     // call 1
 *     // call 2
 *     // call 3
 *     // call 4
 *     // call 5
 *     // resolve 5 d 100
 *     // resolve 4 d 190
 *     // resolve 3 d 260
 *     // resolve 2 d 310
 *     // resolve 1 d 340
 *     // then ["#1","#2","#3","#4","#5"]
 *     // [{"call":1},{"call":2},{"call":3},{"call":4},{"call":5},{"resolve":5,"d":100},{"resolve":4,"d":190},{"resolve":3,"d":260},{"resolve":2,"d":310},{"resolve":1,"d":340},{"res":["#1","#2","#3","#4","#5"]}]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function pmSeries(rs, fun) {

    //pm
    let pm = genPm()

    //check
    if (!isarr(rs)) {
        pm.reject('rs is not array')
        return pm
    }

    //default fun
    if (!isfun(fun)) {
        fun = function(v) {
            return v
        }
    }

    //ts
    let k = -1
    let ts = []
    rs.reduce(function(pmm, v) {
        return pmm.then(function(t) {
            ts.push(t)
            k += 1
            if (isfun(fun)) {
                return fun(v, k)
            }
            else {
                return v
            }
        })
    }, Promise.resolve())
        .then(function(t) {
            ts.push(t)
            ts = drop(ts)
            pm.resolve(ts)
        })
        .catch(function(err) {
            pm.reject(err)
        })

    return pm
}


export default pmSeries
