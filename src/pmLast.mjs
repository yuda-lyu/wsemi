import genPm from './genPm.mjs'
import genID from './genID.mjs'


/**
 * Promise的map，可設定同時處理數量。
 * 若輸入rs為資料陣列則fn需將數據處理並回傳Promise，若輸入rs為Promise陣列則fn可不給，並循序執行各Promise。
 * 若先行產生promise則takeLimit設定會無效，因promise已先行初始化啟動。
 * 等同於Bluebird的Promise.map，而concurrency為takeLimit。
 * 使用函數執行時，當takeLimit=1，等同於mapSeries，promise依序執行完畢才會調用下一個promise。
 * 使用函數執行時，當takeLimit=0，等同於先行產生promise的情形，各promise直接執行視各自執行時間結束。
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmLast.test.js Github}
 * @memberOf wsemi
 * @param {Array} rs 輸入資料陣列，若不給fn則rs需要為Promise陣列
 * @param {Function} fn 輸入循序執行值的呼叫函數
 * @param {Integer} [takeLimit=0] 輸入同時處理數量整數，預設0，代表無限制
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 *
 * let ms = []
 *
 * let pm = function (name, t) {
 *     return new Promise(function(resolve, reject) {
 *         setTimeout(() => {
 *             resolve('resolve: ' + name)
 *         }, t)
 *     })
 * }
 *
 * let pmm = pmLast(pm)
 *
 * pmm('pm1', 200)
 *     .then(function(msg) {
 *         console.log('pm1 then', msg)
 *         ms.push('pm1 then: ' + msg)
 *     })
 *     .catch(function(msg) {
 *         console.log('pm1 catch', msg)
 *         ms.push('pm1 catch: ' + 'reason ' + msg.reason)
 *     })
 * pmm('pm2', 150)
 *     .then(function(msg) {
 *         console.log('pm2 then', msg)
 *         ms.push('pm2 then: ' + msg)
 *     })
 *     .catch(function(msg) {
 *         console.log('pm2 catch', msg)
 *         ms.push('pm2 catch: ' + 'reason ' + msg.reason)
 *     })
 * pmm('pm3', 100)
 *     .then(function(msg) {
 *         console.log('pm3 then', msg)
 *         ms.push('pm3 then: ' + msg)
 *     })
 *     .catch(function(msg) {
 *         console.log('pm3 catch', msg)
 *         ms.push('pm3 catch: ' + 'reason ' + msg.reason)
 *     })
 *
 * setTimeout(() => {
 *     console.log(JSON.stringify(ms))
 * }, 250)
 * // pm3 then resolve: pm3
 * // pm2 catch { reason: 'cancelled' }
 * // pm1 catch { reason: 'cancelled' }
 * // ["pm3 then: resolve: pm3","pm2 catch: reason cancelled","pm1 catch: reason cancelled"]
 *
 */
function pmLast(pm) {

    //id
    let id = null

    function func() {

        //pmm
        let pmm = genPm()

        //id, 每次調用都變更id
        id = genID()

        //save id
        let tid = id

        //call
        pm(...arguments)
            .then((msg) => {
                if (tid === id) {
                    pmm.resolve(msg)
                }
                else {
                    pmm.reject({ reason: 'cancelled' })
                }
            })
            .catch((msg) => {
                if (tid === id) {
                    pmm.reject(msg)
                }
                else {
                    pmm.reject({ reason: 'cancelled' })
                }
            })

        return pmm
    }

    return func
}


export default pmLast
