import get from 'lodash/get'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import isnull from './isnull.mjs'
import isundefined from './isundefined.mjs'


/**
 * 掛勾非同步(Promise)函數，可監聽或修改Promise的輸出入訊號
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmHook.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fun 輸入非同步Promise函數
 * @param {Function} [cb=() => {}] 輸入回調函數，預設()={}，cb函數之輸入為監聽到的資訊物件，欄位有mode與data，mode可為'before'、'afterThen'、'afterCatch'字串，而data則代表非同步函數的輸入或輸出資訊。若想於cb函數修改回傳，則由cb函數的輸入修改完回傳即可。例如收到msg={mode:'before',data:'123'}，將msg.data='abc'，再return msg.data
 * @returns {Promise} 回傳為Promise，resolve為回傳成功結果，reject為回傳失敗訊息
 * @example
 *
 * async function topAsync() {
 *
 *     async function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             //使用resolve
 *             let pm = function (v1, v2) {
 *                 return new Promise(function(resolve, reject) {
 *                     ms.push(`resolve: v1=${v1}, v2=${v2}`)
 *                     resolve(`resolve: v1=${v1}, v2=${v2}`)
 *                 })
 *             }
 *
 *             //針對before修改輸入
 *             let pmr = pmHook(pm, (msg) => {
 *                 console.log('cb', msg)
 *                 if (msg.mode === 'before') {
 *                     //arguments有兩個輸入故得分開改
 *                     msg.data[0] = '[modify input a]' + msg.data[0]
 *                     msg.data[1] = '[modify input b]' + msg.data[1]
 *                     return msg.data
 *                 }
 *             })
 *
 *             pmr('t1', 12.3)
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(function() {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // cb { mode: 'before', data: [Arguments] { '0': 't1', '1': 12.3 } }
 *     // cb {
 *     //   mode: 'afterThen',
 *     //   data: 'resolve: v1=[modify input a]t1, v2=[modify input b]12.3'
 *     // }
 *     // t1 then resolve: v1=[modify input a]t1, v2=[modify input b]12.3
 *     // ["resolve: v1=[modify input a]t1, v2=[modify input b]12.3","t1 then: resolve: v1=[modify input a]t1, v2=[modify input b]12.3"]
 *
 *     async function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             //使用resolve
 *             let pm = function (v1, v2) {
 *                 return new Promise(function(resolve, reject) {
 *                     ms.push(`resolve: v1=${v1}, v2=${v2}`)
 *                     resolve(`resolve: v1=${v1}, v2=${v2}`)
 *                 })
 *             }
 *
 *             //針對afterThen修改輸出
 *             let pmr = pmHook(pm, (msg) => {
 *                 console.log('cb', msg)
 *                 if (msg.mode === 'afterThen') {
 *                     //arguments有兩個輸入故得分開改
 *                     msg.data = '[modify output]' + msg.data
 *                     return msg.data
 *                 }
 *             })
 *
 *             pmr('t1', 12.3)
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(function() {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // cb { mode: 'before', data: [Arguments] { '0': 't1', '1': 12.3 } }
 *     // cb { mode: 'afterThen', data: 'resolve: v1=t1, v2=12.3' }
 *     // t1 then [modify output]resolve: v1=t1, v2=12.3
 *     // ["resolve: v1=t1, v2=12.3","t1 then: [modify output]resolve: v1=t1, v2=12.3"]
 *
 *     async function test3() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             //使用reject
 *             let pm = function (v1, v2) {
 *                 return new Promise(function(resolve, reject) {
 *                     ms.push(`reject: v1=${v1}, v2=${v2}`)
 *                     reject(`reject: v1=${v1}, v2=${v2}`)
 *                 })
 *             }
 *
 *             //針對afterThen修改輸出, 但因使用reject故改不到
 *             let pmr = pmHook(pm, (msg) => {
 *                 console.log('cb', msg)
 *                 if (msg.mode === 'afterThen') {
 *                     //arguments有兩個輸入故得分開改
 *                     msg.data = '[modify output]' + msg.data
 *                     return msg.data
 *                 }
 *             })
 *
 *             pmr('t1', 12.3)
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(function() {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test3')
 *     let r3 = await test3()
 *     console.log(JSON.stringify(r3))
 *     // test3
 *     // cb { mode: 'before', data: [Arguments] { '0': 't1', '1': 12.3 } }
 *     // cb { mode: 'afterCatch', data: 'reject: v1=t1, v2=12.3' }
 *     // t1 catch reject: v1=t1, v2=12.3
 *     // ["reject: v1=t1, v2=12.3","t1 catch: reject: v1=t1, v2=12.3"]
 *
 *     async function test4() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             //使用reject
 *             let pm = function (v1, v2) {
 *                 return new Promise(function(resolve, reject) {
 *                     ms.push(`reject: v1=${v1}, v2=${v2}`)
 *                     reject(`reject: v1=${v1}, v2=${v2}`)
 *                 })
 *             }
 *
 *             //針對afterCatch修改輸出
 *             let pmr = pmHook(pm, (msg) => {
 *                 console.log('cb', msg)
 *                 if (msg.mode === 'afterCatch') {
 *                     //arguments有兩個輸入故得分開改
 *                     msg.data = '[modify output]' + msg.data
 *                     return msg.data
 *                 }
 *             })
 *
 *             pmr('t1', 12.3)
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(function() {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test4')
 *     let r4 = await test4()
 *     console.log(JSON.stringify(r4))
 *     // test4
 *     // cb { mode: 'before', data: [Arguments] { '0': 't1', '1': 12.3 } }
 *     // cb { mode: 'afterCatch', data: 'reject: v1=t1, v2=12.3' }
 *     // t1 catch [modify output]reject: v1=t1, v2=12.3
 *     // ["reject: v1=t1, v2=12.3","t1 catch: [modify output]reject: v1=t1, v2=12.3"]
 *
 *     async function test5() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             //使用resolve, 此函數無輸入
 *             let pm = function () {
 *                 return new Promise(function(resolve, reject) {
 *                     ms.push(`resolve`)
 *                     resolve(`resolve`)
 *                 })
 *             }
 *
 *             //針對afterThen修改輸出
 *             let pmr = pmHook(pm, (msg) => {
 *                 console.log('cb', msg)
 *                 if (msg.mode === 'afterThen') {
 *                     //arguments有兩個輸入故得分開改
 *                     msg.data = '[modify output]' + msg.data
 *                     return msg.data
 *                 }
 *             })
 *
 *             pmr()
 *                 .then(function(msg) {
 *                     console.log('t1 then', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch(function(msg) {
 *                     console.log('t1 catch', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(function() {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test5')
 *     let r5 = await test5()
 *     console.log(JSON.stringify(r5))
 *     // test5
 *     // cb { mode: 'before', data: [Arguments] {} }
 *     // cb { mode: 'afterThen', data: 'resolve' }
 *     // t1 then [modify output]resolve
 *     // ["resolve","t1 then: [modify output]resolve"]
 *
 * }
 * topAsync().catch(() => {})
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
