import each from 'lodash/each'
import size from 'lodash/size'
import values from 'lodash/values'
import genPm from './genPm.mjs'
import isarr from './isarr.mjs'
import isfun from './isfun.mjs'
import queue from './queue.mjs'


/**
 * Promise的map，可設定同時處理數量
 *
 * 若輸入rs為資料陣列則fn需將數據處理並回傳Promise，若輸入rs為Promise陣列則fn可不給，並循序執行各Promise。
 * 若先行產生promise則takeLimit設定會無效，因promise已先行初始化啟動。
 * 等同於Bluebird的Promise.map，而concurrency為takeLimit。
 * 使用函數執行時，當takeLimit=1，等同於mapSeries，promise依序執行完畢才會調用下一個promise。
 * 使用函數執行時，當takeLimit=0，等同於先行產生promise的情形，各promise直接執行視各自執行時間結束。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmMap.test.js Github}
 * @memberOf wsemi
 * @param {Array} rs 輸入資料陣列，若不給fn則rs需要為Promise陣列
 * @param {Function} fn 輸入循序執行值的呼叫函數
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 *
 * let takeLimit
 *
 * setTimeout(function() {
 *
 *     //通過function調用產生promise, 可受takeLimit控管同時執行數量, takeLimit=2
 *     takeLimit = 2
 *     pmMap([1, 2, 3, 4, 5], function (v, k) {
 *         console.log('call', v)
 *         return new Promise(function(resolve, reject) {
 *             setTimeout(function() {
 *                 console.log('use function resolve', v)
 *                 resolve('#' + v)
 *             }, 300 - v * 10)
 *         })
 *     }, takeLimit)
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
 *     //通過function調用產生promise, takeLimit=1, 等同於mapSeries
 *     takeLimit = 1
 *     pmMap([1, 2, 3, 4, 5], function (v, k) {
 *         console.log('call', v)
 *         return new Promise(function(resolve, reject) {
 *             setTimeout(function() {
 *                 console.log('use function resolve', v)
 *                 resolve('#' + v)
 *             }, 300 - v * 10)
 *         })
 *     }, takeLimit)
 *         .then(function(res) {
 *             console.log('use function then', JSON.stringify(res))
 *             console.log('')
 *         })
 *         .catch(function(err) {
 *             console.log('use function catch', err)
 *         })
 *
 * }, 1500)
 *
 * setTimeout(function() {
 *
 *     //通過function調用產生promise, takeLimit=0, 無限制同時執行數量
 *     takeLimit = 0
 *     pmMap([1, 2, 3, 4, 5], function (v, k) {
 *         console.log('call', v)
 *         return new Promise(function(resolve, reject) {
 *             setTimeout(function() {
 *                 console.log('use function resolve', v)
 *                 resolve('#' + v)
 *             }, 300 - v * 10)
 *         })
 *     }, takeLimit)
 *         .then(function(res) {
 *             console.log('use function then', JSON.stringify(res))
 *             console.log('')
 *         })
 *         .catch(function(err) {
 *             console.log('use function catch', err)
 *         })
 *
 * }, 3000)
 *
 * setTimeout(function() {
 *
 *     //先產生promise, 因事先初始化故無法受takeLimit控管
 *     takeLimit = 2
 *     let rs = [1, 2, 3, 4, 5].map(function(v, k) {
 *         console.log('call', v)
 *         return new Promise(function(resolve, reject) {
 *             setTimeout(function() {
 *                 console.log('use promise resolve', v)
 *                 resolve('#' + v)
 *             }, 300 - v * 10)
 *         })
 *     })
 *     pmMap(rs, null, takeLimit)
 *         .then(function(res) {
 *             console.log('use promise then', JSON.stringify(res))
 *             console.log('')
 *         })
 *         .catch(function(err) {
 *             console.log('use promise catch', err)
 *         })
 *
 * }, 4500)
 *
 * // call 1
 * // call 2
 * // use function resolve 2
 * // call 3
 * // use function resolve 1
 * // call 4
 * // use function resolve 3
 * // call 5
 * // use function resolve 4
 * // use function resolve 5
 * // use function then ["#1","#2","#3","#4","#5"]
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
 * // use function resolve 5
 * // use function resolve 4
 * // use function resolve 3
 * // use function resolve 2
 * // use function resolve 1
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
function pmMap(rs, fn, takeLimit = 0) {
    let ts = {}
    let abort = false

    //pm
    let pm = genPm()

    //check
    if (!isarr(rs)) {
        pm.reject('rs is not array')
        return pm
    }

    //queue
    let q = queue(takeLimit)

    //message
    q.on('message', function(qs) {
        //console.log('message', JSON.stringify(qs))

        //check
        if (abort) {
            return
        }

        //get
        let v = q.get()
        //console.log('get', v)

        //pmm
        let pmm
        if (isfun(fn)) {
            pmm = fn(v.value, v.key)
        }
        else {
            pmm = v.value
        }

        //then and catch
        pmm
            .then((res) => {

                //save
                ts[v.key] = res

            })
            .catch((err) => {

                //abort
                abort = true

                //clear
                q.clear()

                //reject
                pm.reject(err)

            })
            .finally(() => {

                //cb
                q.cb()

                //end
                if (size(ts) === rs.length) {

                    //resolve
                    pm.resolve(values(ts))

                }

            })

    })

    //push, 因queue emit為即時觸發故push需放最後
    each(rs, (v, k) => {
        q.push({
            key: k,
            value: v,
        })
    })

    return pm
}


export default pmMap
