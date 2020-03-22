import isfun from './isfun.mjs'


/**
 * 監聽非同步(Promise)函數的輸出入訊號，使用Proxy進行非破壞性加殼攔截Promise輸出入事件
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmProxy.test.js Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入非同步Promise函數
 * @param {Function} [cb=() => {}] 輸入回調函數，預設()={}，函數會提供攔截資訊物件，欄位皆會mode，可有字串為'before'、'afterThen'、'afterCatch'、'afterFinally'，欄位data會提供非同步函數的輸入或輸出資訊，僅'afterFinally'不會提供資訊
 * @returns {Promise} 回傳為Promise，resolve為回傳成功結果，reject為回傳失敗訊息
 * @example
 *
 * async function test() {
 *
 *     let ms = []
 *
 *     let pm1 = function (v) {
 *         return new Promise(function(resolve, reject) {
 *             resolve('resolve: ' + v)
 *         })
 *     }
 *     let pm1p = pmProxy(pm1, (msg) => {
 *         console.log('pm1p cb', msg)
 *         msg = {
 *             cb: 'pm1p',
 *             ...msg,
 *         }
 *         ms.push(msg)
 *     })
 *     await pm1p('inp1')
 *         .then(function(msg) {
 *             console.log('pm1p then', msg)
 *             ms.push('pm1p then: ' + msg)
 *         })
 *         .catch(function(msg) {
 *             console.log('pm1p catch', msg)
 *             ms.push('pm1p catch: ' + msg)
 *         })
 *
 *     let pm2 = function (v) {
 *         return new Promise(function(resolve, reject) {
 *             reject('reject: ' + v)
 *         })
 *     }
 *     let pm2p = pmProxy(pm2, (msg) => {
 *         console.log('pm2p cb', msg)
 *         msg = {
 *             cb: 'pm2p',
 *             ...msg,
 *         }
 *         ms.push(msg)
 *     })
 *     await pm2p('inp2')
 *         .then(function(msg) {
 *             console.log('pm2p then', msg)
 *             ms.push('pm2p then: ' + msg)
 *         })
 *         .catch(function(msg) {
 *             console.log('pm2p catch', msg)
 *             ms.push('pm2p catch: ' + msg)
 *         })
 *
 *     console.log(JSON.stringify(ms))
 *
 * }
 * test()
 * // pm1p cb { mode: 'before', data: 'inp1' }
 * // pm1p cb { mode: 'afterThen', data: 'resolve: inp1' }
 * // pm1p then resolve: inp1
 * // pm1p cb { mode: 'afterFinally' }
 * // pm2p cb { mode: 'before', data: 'inp2' }
 * // pm2p cb { mode: 'afterCatch', data: 'reject: inp2' }
 * // pm2p catch reject: inp2
 * // pm2p cb { mode: 'afterFinally' }
 * // [{"cb":"pm1p","mode":"before","data":"inp1"},{"cb":"pm1p","mode":"afterThen","data":"resolve: inp1"},"pm1p then: resolve: inp1",{"cb":"pm1p","mode":"afterFinally"},{"cb":"pm2p","mode":"before","data":"inp2"},{"cb":"pm2p","mode":"afterCatch","data":"reject: inp2"},"pm2p catch: reject: inp2",{"cb":"pm2p","mode":"afterFinally"}]
 *
 */
function pmProxy(fun, cb = () => {}) {

    //check
    if (!isfun(cb)) {
        cb = () => {}
    }

    return function(input) {

        //cb
        cb({
            mode: 'before',
            data: input,
        })

        //pxy
        let pxy = new Proxy(fun(input), {
            get(target, prop, receiver) {
                //console.log('target=', target, ', prop=', prop, ', receiver=', receiver)
                let value = Reflect.get(...arguments)
                target
                    .then((output) => {
                        cb({
                            mode: 'afterThen',
                            data: output,
                        })
                    })
                    .catch((output) => {
                        cb({
                            mode: 'afterCatch',
                            data: output,
                        })
                    })
                    .finally(() => {
                        cb({
                            mode: 'afterFinally',
                        })
                    })
                return typeof value === 'function' ? value.bind(target) : value
            }
        })

        return pxy
    }
}


export default pmProxy
