import get from 'lodash/get'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import isnull from './isnull.mjs'
import isundefined from './isundefined.mjs'


/**
 * 掛勾非同步(Promise)函數，可監聽或修改Promise的輸出入訊號
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmHook.test.js Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入非同步Promise函數
 * @param {Function} [cb=() => {}] 輸入回調函數，預設()={}，cb函數之輸入為監聽到的資訊物件，欄位有mode與data，mode可為'before'、'afterThen'、'afterCatch'字串，而data則代表非同步函數的輸入或輸出資訊。若想於cb函數修改回傳，則由cb函數的輸入修改完回傳即可。例如收到msg={mode:'before',data:'123'}，將msg.data='abc'，再return msg.data
 * @returns {Promise} 回傳為Promise，resolve為回傳成功結果，reject為回傳失敗訊息
 * @example
 * need test in browser
 *
 * async function test() {
 *     let ms
 *
 *     ms = []
 *     let pm1 = function (v1, v2) {
 *         return new Promise(function(resolve, reject) {
 *             resolve(`resolve: v1=${v1}, v2=${v2}`)
 *         })
 *     }
 *     let pm1p = pmHook(pm1, (msg) => {
 *         console.log('pm1p cb', msg)
 *         ms.push({
 *             cb: 'pm1p',
 *             ...msg,
 *         })
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
 *     // pm1p cb { mode: 'before', data: [Arguments] { '0': 'inp1-a', '1': 'inp1-b' } }
 *     // pm1p cb { mode: 'afterThen', data: 'resolve: v1=inp1-a, v2=inp1-b' }
 *     // pm1p then resolve: v1=inp1-a, v2=inp1-b
 *     // [{"cb":"pm1p","mode":"before","data":{"0":"inp1-a","1":"inp1-b"}},{"cb":"pm1p","mode":"afterThen","data":"resolve: v1=inp1-a, v2=inp1-b"},"pm1p then: resolve: v1=inp1-a, v2=inp1-b"]
 *
 *     ms = []
 *     let pm2 = function (v1, v2) {
 *         return new Promise(function(resolve, reject) {
 *             reject(`reject: v1=${v1}, v2=${v2}`)
 *         })
 *     }
 *     let pm2p = pmHook(pm2, (msg) => {
 *         console.log('pm2p cb', msg)
 *         ms.push({
 *             cb: 'pm2p',
 *             ...msg,
 *         })
 *     })
 *     await pm2p('inp2-a', 'inp2-b')
 *         .then(function(msg) {
 *             console.log('pm2p then', msg)
 *             ms.push('pm2p then: ' + msg)
 *         })
 *         .catch(function(msg) {
 *             console.log('pm2p catch', msg)
 *             ms.push('pm2p catch: ' + msg)
 *         })
 *     console.log(JSON.stringify(ms))
 *     // pm2p cb { mode: 'before', data: [Arguments] { '0': 'inp2-a', '1': 'inp2-b' } }
 *     // pm2p cb { mode: 'afterCatch', data: 'reject: v1=inp2-a, v2=inp2-b' }
 *     // pm2p catch reject: v1=inp2-a, v2=inp2-b
 *     // [{"cb":"pm2p","mode":"before","data":{"0":"inp2-a","1":"inp2-b"}},{"cb":"pm2p","mode":"afterCatch","data":"reject: v1=inp2-a, v2=inp2-b"},"pm2p catch: reject: v1=inp2-a, v2=inp2-b"]
 *
 *     ms = []
 *     let pm3 = function (v1, v2) {
 *         return new Promise(function(resolve, reject) {
 *             reject(`reject: v1=${v1}, v2=${v2}`)
 *         })
 *     }
 *     let pm3p = pmHook(pm3, (msg) => {
 *         console.log('pm3p cb', msg)
 *         ms.push({
 *             cb: 'pm3p',
 *             ...msg,
 *         })
 *         if (msg.mode === 'before') {
 *             //arguments有兩個輸入故得分開改
 *             msg.data[0] = '[modify input a]' + msg.data[0]
 *             msg.data[1] = '[modify input b]' + msg.data[1]
 *             return msg.data
 *         }
 *         if (msg.mode === 'afterCatch') {
 *             return '[modify catch]' + msg.data
 *         }
 *     })
 *     await pm3p('inp3-a', 'inp3-b')
 *         .then(function(msg) {
 *             console.log('pm3p then', msg)
 *             ms.push('pm3p then: ' + msg)
 *         })
 *         .catch(function(msg) {
 *             console.log('pm3p catch', msg)
 *             ms.push('pm3p catch: ' + msg)
 *         })
 *     console.log(JSON.stringify(ms))
 *     // pm3p cb { mode: 'before', data: [Arguments] { '0': 'inp3-a', '1': 'inp3-b' } }
 *     // pm3p cb { mode: 'afterCatch', data: 'reject: v1=[modify input a]inp3-a, v2=[modify input b]inp3-b' }
 *     // pm3p catch [modify catch]reject: v1=[modify input a]inp3-a, v2=[modify input b]inp3-b
 *     // [{"cb":"pm3p","mode":"before","data":{"0":"[modify input a]inp3-a","1":"[modify input b]inp3-b"}},{"cb":"pm3p","mode":"afterCatch","data":"reject: v1=[modify input a]inp3-a, v2=[modify input b]inp3-b"},"pm3p catch: [modify catch]reject: v1=[modify input a]inp3-a, v2=[modify input b]inp3-b"]
 *
 * }
 * test().catch(() => {})
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

    function getData(newData, oriData) {
        let r
        if (!isnull(newData) && !isundefined(newData)) {
            r = get(newData, 'data', null)
            if (r) {
                return r //若回傳是包成原始物件格式, 則取出data才回傳
            }
            return newData //若回傳是有效的新數據, 直接回傳
        }
        return oriData //若回傳為無效數據, 則回傳原始數據
    }

    return function() {
        let r

        //pm
        let pm = genPm()

        //callback before
        let input = cb({
            mode: 'before',
            data: arguments,
        })

        //check
        if (isnull(input) || isundefined(input)) {
            input = arguments
        }

        //call fun with input
        fun(...input)
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
