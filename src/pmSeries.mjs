import drop from 'lodash/drop'
import genPm from './genPm.mjs'
import isarr from './isarr.mjs'
import isfun from './isfun.mjs'


/**
 * Promise的mapSeries，循序執行promise。
 * 若輸入rs為資料陣列則fn需將數據處理並回傳Promise，若輸入rs為Promise陣列則fn可不給，並循序執行各Promise。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmSeries.test.js Github}
 * @memberOf wsemi
 * @param {Array} rs 輸入資料陣列，若不給fn則rs需要為Promise陣列
 * @param {Function} fn 輸入循序執行值的呼叫函數
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 *
 * pmSeries([2, 3, 1], function(v, k) {
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(function() {
 *             console.log('use function resolve: ' + v)
 *             resolve('use function: ' + v + '(' + k + ')')
 *         }, 1)
 *     })
 * })
 *     .then(function(r) {
 *         console.log('use function then', r)
 *     })
 *     .catch(function(err) {
 *         console.log('use function catch', err)
 *     })
 *
 * let rs = [2, 3, 1].map(function(v, k) {
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(function() {
 *             console.log('use promise resolve: ' + v)
 *             resolve('use promise: ' + v + '(' + k + ')')
 *         }, 1)
 *     })
 * })
 * pmSeries(rs)
 *     .then(function(r) {
 *         console.log('use promise then', r)
 *     })
 *     .catch(function(err) {
 *         console.log('use promise catch', err)
 *     })
 *
 * // use promise resolve: 2
 * // use promise resolve: 3
 * // use promise resolve: 1
 * // use promise then [ 'use promise: 2(0)', 'use promise: 3(1)', 'use promise: 1(2)' ]
 * // use function resolve: 2
 * // use function resolve: 3
 * // use function resolve: 1
 * // use function then [ 'use function: 2(0)', 'use function: 3(1)', 'use function: 1(2)' ]
 *
 */
function pmSeries(rs, fn) {

    //pm
    let pm = genPm()

    //check
    if (!isarr(rs)) {
        pm.reject('rs is not array')
        return pm
    }

    //default fn
    if (!isfun(fn)) {
        fn = function(v) {
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
            if (isfun(fn)) {
                return fn(v, k)
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
