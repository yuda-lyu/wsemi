import isfun from './isfun.mjs'
import pmHook from './pmHook.mjs'


/**
 * 掛勾非同步(Promise)函數，可監聽或修改Promise的reject輸出數據
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmHookReject.test.js Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入非同步Promise函數
 * @param {Function} [cb=() => {}] 輸入回調函數，預設()={}，cb函數之輸入為監聽reject到的資訊數據。若想於cb函數修改reject數據，則由cb函數的輸入修改完回傳即可。例如收到reject的msg為'aaa'，將msg='bbb'再return msg即可
 * @returns {Promise} 回傳為Promise，resolve為回傳成功結果，reject為回傳失敗訊息
 * @example
 *
 * async function test() {
 *     let ms
 *
 *     ms = []
 *     let pm1 = function (v1, v2) {
 *         return new Promise(function(resolve, reject) {
 *             reject(`reject: v1=${v1}, v2=${v2}`)
 *         })
 *     }
 *     let pm1p = pmHookReject(pm1, (msg) => {
 *         console.log('pm1p cb', msg)
 *         msg = '[modify catch]' + msg
 *         return msg
 *     })
 *     await pm1p('inp1-a', 'inp1-b')
 *         .then(function(msg) {
 *             console.log('pm1p then', msg)
 *             ms.push('pm1p then: ' + msg)
 *         })
 *         .catch(function(msg) {
 *             console.log('pm1p catch', msg)
 *             ms.push('pm1p catch: ' + msg)
 *         })
 *     console.log(JSON.stringify(ms))
 *     // pm1p cb reject: v1=inp1-a, v2=inp1-b
 *     // pm1p catch reject: v1=inp1-a, v2=inp1-b
 *     // ["pm1p catch: reject: v1=inp1-a, v2=inp1-b"]
 *
 * }
 * test()
 *
 */
function pmHookReject(fun, cb = () => {}) {

    //check
    if (!isfun(fun)) {
        return null
    }
    if (!isfun(cb)) {
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
