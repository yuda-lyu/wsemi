import drop from 'lodash/drop'
import genPm from './genPm.mjs'
import isarr from './isarr.mjs'
import isfun from './isfun.mjs'


/**
 * Promise的mapSeries
 * 若輸入rs為資料陣列則fn需將數據處理並回傳Promise，若輸入rs為Promise陣列則fn可不給，並循序執行各Promise
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmSeries.test.js Github}
 * @memberOf wsemi
 * @param {Array} rs 輸入資料陣列，若不給fn則rs需要為Promise陣列
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
    
    //default fn
    if (!isfun(fn)) {
        fn = function(v){
          return v
        }
    }

    //ts
    let ts = []
    rs.reduce(function(pmm, v) {
        return pmm.then(function(t) {
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
