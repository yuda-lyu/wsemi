import each from 'lodash/each'
import size from 'lodash/size'
import values from 'lodash/values'
import genPm from './genPm.mjs'
import isarr from './isarr.mjs'
import isfun from './isfun.mjs'
import queue from './queue.mjs'


/**
 * Promise的map，可設定同時處理數量。
 * 若先行產生promise則takeLimit設定會無效，因已先行初始化啟動。
 * 等同於Bluebird的Promise.map，而concurrency為takeLimit。
 * 若輸入rs為資料陣列則fn需將數據處理並回傳Promise，若輸入rs為Promise陣列則fn可不給，並循序執行各Promise。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmMap.test.js Github}
 * @memberOf wsemi
 * @param {Array} rs 輸入資料陣列，若不給fn則rs需要為Promise陣列
 * @param {Function} fn 輸入循序執行值的呼叫函數
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 *
 * let takeLimit = 2
 *
 * setTimeout(function() {
 *
 *     //通過function調用產生promise, 可受takeLimit控管同時執行數量
 *     pmMap([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (v, k) {
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
 *         })
 *         .catch(function(err) {
 *             console.log('use function catch', err)
 *         })
 *
 * }, 1)
 *
 * setTimeout(function() {
 *
 *     //先產生promise, 因事先初始化故無法受takeLimit控管
 *     let rs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(v, k) {
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
 *         })
 *         .catch(function(err) {
 *             console.log('use promise catch', err)
 *         })
 *
 * }, 3000)
 *
 * setTimeout(function() {
 *
 *     //通過function調用產生promise, 使用takeLimit=0也就是無限制同時執行數量
 *     pmMap([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function (v, k) {
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
 *         })
 *         .catch(function(err) {
 *             console.log('use function catch', err)
 *         })
 *
 * }, 6000)
 *
 * // call 1
 * // call 2
 * // use function resolve 2
 * // call 3
 * // use function resolve 1
 * // call 4
 * // use function resolve 4
 * // call 5
 * // use function resolve 3
 * // call 6
 * // use function resolve 6
 * // call 7
 * // use function resolve 5
 * // call 8
 * // use function resolve 8
 * // call 9
 * // use function resolve 7
 * // call 10
 * // use function resolve 10
 * // use function resolve 9
 * // use function then ["#1","#2","#3","#4","#5","#6","#7","#8","#9","#10"]
 *
 * // call 1
 * // call 2
 * // call 3
 * // call 4
 * // call 5
 * // call 6
 * // call 7
 * // call 8
 * // call 9
 * // call 10
 * // use promise resolve 10
 * // use promise resolve 9
 * // use promise resolve 8
 * // use promise resolve 7
 * // use promise resolve 6
 * // use promise resolve 5
 * // use promise resolve 4
 * // use promise resolve 3
 * // use promise resolve 2
 * // use promise resolve 1
 * // use promise then ["#1","#2","#3","#4","#5","#6","#7","#8","#9","#10"]
 *
 * // call 1
 * // call 2
 * // call 3
 * // call 4
 * // call 5
 * // call 6
 * // call 7
 * // call 8
 * // call 9
 * // call 10
 * // use function resolve 10
 * // use function resolve 9
 * // use function resolve 8
 * // use function resolve 7
 * // use function resolve 6
 * // use function resolve 5
 * // use function resolve 4
 * // use function resolve 3
 * // use function resolve 2
 * // use function resolve 1
 * // use function then ["#1","#2","#3","#4","#5","#6","#7","#8","#9","#10"]
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
