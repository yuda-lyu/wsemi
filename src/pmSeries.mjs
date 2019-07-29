import drop from 'lodash/drop'
import genPm from './genPm.mjs'
import isarr from './isarr.mjs'
import isfun from './isfun.mjs'


/**
 * Promise的mapSeries
 * 若輸入rs為函數或Promise陣列，則使用循序執行函數或Promise方式，而v則為初始輸入參數。
 * 若輸入rs為其餘資料的陣列，則v為循序取值用並回傳Promise的函數。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmSeries.test.js Github}
 * @memberOf wsemi
 * @param {Array} rs 輸入資料陣列
 * @param {Function} fn 輸入循序執行值的呼叫函數
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 * pmSeries([2, 3, 1], function(v) {
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(function() {
 *             console.log('pmSeries: ' + v)
 *             resolve('pmSeries: ' + v)
 *         }, 1)
 *     })
 * })
 *     .then(function(r) {
 *         console.log(r)
 *     })
 * // => pmSeries: 2
 * // => pmSeries: 3
 * // => pmSeries: 1
 * // => ["pmSeries: 2", "pmSeries: 3", "pmSeries: 1"]
 */

function pmSeries(rs, fn) {

    //pm
    let pm = genPm()

    //check
    if (!isarr(rs)) {
        pm.reject('rs is not array')
        return pm
    }
    if (!isfun(fn)) {
        pm.reject('v is not Function')
        return pm
    }

    //ts
    let ts = []
    rs.reduce(function(pm, v) {
        return pm.then(function(t) {
            ts.push(t)
            return fn(v)
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
