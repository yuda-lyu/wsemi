import genPm from './genPm.mjs'
import genID from './genID.mjs'


/**
 * 高頻呼叫非同步函數時，僅受理最末一次的呼叫，前面的呼叫皆自動轉為catch，回傳訊息為物件{reason:'cancelled'}
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmLast.test.js Github}
 * @memberOf wsemi
 * @param {Function} pm 輸入非同步函數
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 *
 * async function test() {
 *     return new Promise((resolve, reject) => {
 *
 *         let ms = []
 *
 *         let pm = function (name, t) {
 *             return new Promise(function(resolve, reject) {
 *                 setTimeout(() => {
 *                     resolve('resolve: ' + name)
 *                 }, t)
 *             })
 *         }
 *
 *         let pmm = pmLast(pm)
 *
 *         pmm('pm1', 150)
 *             .then(function(msg) {
 *                 console.log('pm1 then', msg)
 *                 ms.push('pm1 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm1 catch', msg)
 *                 ms.push('pm1 catch: ' + 'reason ' + msg.reason)
 *             })
 *         pmm('pm2', 100)
 *             .then(function(msg) {
 *                 console.log('pm2 then', msg)
 *                 ms.push('pm2 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm2 catch', msg)
 *                 ms.push('pm2 catch: ' + 'reason ' + msg.reason)
 *             })
 *         pmm('pm3', 50)
 *             .then(function(msg) {
 *                 console.log('pm3 then', msg)
 *                 ms.push('pm3 then: ' + msg)
 *             })
 *             .catch(function(msg) {
 *                 console.log('pm3 catch', msg)
 *                 ms.push('pm3 catch: ' + 'reason ' + msg.reason)
 *             })
 *
 *         setTimeout(() => {
 *             pmm('pm4', 50)
 *                 .then((msg) => {
 *                     console.log('pm4 then', msg)
 *                     ms.push('pm4 then: ' + msg)
 *                 })
 *                 .catch((msg) => {
 *                     console.log('pm4 catch', msg)
 *                     ms.push('pm4 catch: ' + 'reason ' + msg.reason)
 *                 })
 *                 .finally(() => {
 *                     resolve(JSON.stringify(ms))
 *                 })
 *         }, 200)
 *
 *     })
 * }
 * test()
 *     .then((msg) => {
 *         console.log(msg)
 *     })
 * // pm3 then resolve: pm3
 * // pm2 catch { reason: 'cancelled' }
 * // pm1 catch { reason: 'cancelled' }
 * // pm4 then resolve: pm4
 * // ["pm3 then: resolve: pm3","pm2 catch: reason cancelled","pm1 catch: reason cancelled","pm4 then: resolve: pm4"]
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
