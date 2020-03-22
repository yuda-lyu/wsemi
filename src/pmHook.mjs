import get from 'lodash/get'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'


/**
 * 掛勾非同步(Promise)函數，可監聽或修改Promise的輸出入訊號
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmHook.test.js Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入非同步Promise函數
 * @param {Function} [cb=() => {}] 輸入回調函數，預設()={}，cb函數之輸入為監聽到的資訊物件，欄位有mode與data，mode可為'before'、'afterThen'、'afterCatch'字串，而data則代表非同步函數的輸入或輸出資訊。若想於cb函數修改回傳，則由cb函數的輸入修改完回傳即可。例如收到msg={mode:'before',data:'123'}，將msg.data='abc'，再return msg
 * @returns {Promise} 回傳為Promise，resolve為回傳成功結果，reject為回傳失敗訊息
 * @example
 *
 * async function test() {
 *     let ms
 *
 *     ms = []
 *     let pm1 = function (v) {
 *         return new Promise(function(resolve, reject) {
 *             resolve('resolve: ' + v)
 *         })
 *     }
 *     let pm1p = pmHook(pm1, (msg) => {
 *         console.log('pm1p cb', msg)
 *         ms.push({
 *             cb: 'pm1p',
 *             ...msg,
 *         })
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
 *     console.log(JSON.stringify(ms))
 *     // pm1p cb { mode: 'before', data: 'inp1' }
 *     // pm1p cb { mode: 'afterThen', data: 'resolve: inp1' }
 *     // pm1p then resolve: inp1
 *     // [{"cb":"pm1p","mode":"before","data":"inp1"},{"cb":"pm1p","mode":"afterThen","data":"resolve: inp1"},"pm1p then: resolve: inp1"]
 *
 *     ms = []
 *     let pm2 = function (v) {
 *         return new Promise(function(resolve, reject) {
 *             reject('reject: ' + v)
 *         })
 *     }
 *     let pm2p = pmHook(pm2, (msg) => {
 *         console.log('pm2p cb', msg)
 *         ms.push({
 *             cb: 'pm2p',
 *             ...msg,
 *         })
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
 *     console.log(JSON.stringify(ms))
 *     // pm2p cb { mode: 'before', data: 'inp2' }
 *     // pm2p cb { mode: 'afterCatch', data: 'reject: inp2' }
 *     // pm2p catch reject: inp2
 *     // [{"cb":"pm2p","mode":"before","data":"inp2"},{"cb":"pm2p","mode":"afterCatch","data":"reject: inp2"},"pm2p catch: reject: inp2"]
 *
 *     ms = []
 *     let pm3 = function (v) {
 *         return new Promise(function(resolve, reject) {
 *             reject('reject: ' + v)
 *         })
 *     }
 *     let pm3p = pmHook(pm3, (msg) => {
 *         console.log('pm3p cb', msg)
 *         ms.push({
 *             cb: 'pm3p',
 *             ...msg,
 *         })
 *         if (msg.mode === 'before') {
 *             msg.data = '[modify input]' + msg.data
 *             return msg
 *         }
 *         if (msg.mode === 'afterCatch') {
 *             msg.data = '[modify catch]' + msg.data
 *             return msg
 *         }
 *     })
 *     await pm3p('inp3')
 *         .then(function(msg) {
 *             console.log('pm3p then', msg)
 *             ms.push('pm3p then: ' + msg)
 *         })
 *         .catch(function(msg) {
 *             console.log('pm3p catch', msg)
 *             ms.push('pm3p catch: ' + msg)
 *         })
 *     console.log(JSON.stringify(ms))
 *     // pm3p cb { mode: 'before', data: 'inp3' }
 *     // pm3p cb { mode: 'afterCatch', data: 'reject: [modify input]inp3' }
 *     // pm3p catch [modify catch]reject: [modify input]inp3
 *     // [{"cb":"pm3p","mode":"before","data":"inp3"},{"cb":"pm3p","mode":"afterCatch","data":"reject: [modify input]inp3"},"pm3p catch: [modify catch]reject: [modify input]inp3"]
 *
 */
function pmHook(fun, cb = () => {}) {

    //check
    if (!isfun(fun)) {
        return null
    }
    if (!isfun(cb)) {
        cb = () => {}
    }

    function getData(cbData, oriData) {
        let t = get(cbData, 'data', null)
        if (t !== null && t !== oriData) {
            oriData = t
        }
        return oriData
    }

    return function(input) {
        let r

        //pm
        let pm = genPm()

        //cb
        r = cb({
            mode: 'before',
            data: input,
        })
        input = getData(r, input)

        //call fun with input
        fun(input)
            .then((output) => {
                r = cb({
                    mode: 'afterThen',
                    data: output,
                })
                output = getData(r, output)
                pm.resolve(output)
            })
            .catch((output) => {
                r = cb({
                    mode: 'afterCatch',
                    data: output,
                })
                output = getData(r, output)
                pm.reject(output)
            })

        // //pxy
        // let pxy = new Proxy(fun(input), {
        //     get(target, prop, receiver) {
        //         //console.log('target=', target, ', prop=', prop, ', receiver=', receiver)
        //         let value = Reflect.get(...arguments)
        //         target
        //             .then((output) => {
        //                 cb({
        //                     mode: 'afterThen',
        //                     data: output,
        //                 })
        //             })
        //             .catch((output) => {
        //                 cb({
        //                     mode: 'afterCatch',
        //                     data: output,
        //                 })
        //             })
        //         return typeof value === 'function' ? value.bind(target) : value
        //     }
        // })

        return pm
    }
}


export default pmHook
