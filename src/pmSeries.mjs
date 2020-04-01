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
 * setTimeout(function() {
 *
 *     //通過function調用產生promise, 各promise循序調用
 *     pmSeries([1, 2, 3, 4, 5], function (v, k) {
 *         console.log('call', v)
 *         return new Promise(function(resolve, reject) {
 *             setTimeout(function() {
 *                 console.log('use function resolve', v)
 *                 resolve('#' + v)
 *             }, 300 - v * 10)
 *         })
 *     })
 *         .then(function(res) {
 *             console.log('use function then', JSON.stringify(res))
 *             console.log('')
 *         })
 *         .catch(function(err) {
 *             console.log('use function catch', err)
 *         })
 *
 * }, 1)
 *
 * setTimeout(function() {
 *
 *     //先產生promise, 因事先初始化故各promise會依照各自執行時間結束
 *     let rs = [1, 2, 3, 4, 5].map(function(v, k) {
 *         console.log('call', v)
 *         return new Promise(function(resolve, reject) {
 *             setTimeout(function() {
 *                 console.log('use promise resolve', v)
 *                 resolve('#' + v)
 *             }, 300 - v * 10)
 *         })
 *     })
 *     pmSeries(rs, null)
 *         .then(function(res) {
 *             console.log('use promise then', JSON.stringify(res))
 *             console.log('')
 *         })
 *         .catch(function(err) {
 *             console.log('use promise catch', err)
 *         })
 *
 * }, 1500)
 *
 * // call 1
 * // use function resolve 1
 * // call 2
 * // use function resolve 2
 * // call 3
 * // use function resolve 3
 * // call 4
 * // use function resolve 4
 * // call 5
 * // use function resolve 5
 * // use function then ["#1","#2","#3","#4","#5"]
 *
 * // call 1
 * // call 2
 * // call 3
 * // call 4
 * // call 5
 * // use promise resolve 5
 * // use promise resolve 4
 * // use promise resolve 3
 * // use promise resolve 2
 * // use promise resolve 1
 * // use promise then ["#1","#2","#3","#4","#5"]
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
