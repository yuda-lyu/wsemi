import genPm from './genPm.mjs'
import isarr from './isarr.mjs'


/**
 * 傳入initial初始值並循序執行Promise陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmChain.test.js Github}
 * @memberOf wsemi
 * @param {Array} pms 輸入Promise陣列
 * @param {*} initial 輸入循序執行Promise陣列的初始值
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 *
 * async function topAsync() {
 *
 *     async function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let pm1 = function(v) {
 *                 return new Promise((resolve, reject) => {
 *                     setTimeout(() => {
 *                         console.log('resolve pm1' + v)
 *                         ms.push('resolve pm1' + v)
 *                         resolve('pm1' + v)
 *                     }, 100)
 *                 })
 *             }
 *             let pm2 = function(v) {
 *                 return new Promise((resolve, reject) => {
 *                     setTimeout(() => {
 *                         console.log('resolve pm2' + v)
 *                         ms.push('resolve pm2' + v)
 *                         resolve('pm2' + v)
 *                     }, 150)
 *                 })
 *             }
 *             let pm3 = function(v) {
 *                 return new Promise((resolve, reject) => {
 *                     setTimeout(() => {
 *                         console.log('resolve pm3' + v)
 *                         ms.push('resolve pm3' + v)
 *                         resolve('pm3' + v)
 *                     }, 50)
 *                 })
 *             }
 *
 *             pmChain([pm1, pm2, pm3], '*')
 *                 .then((msg) => {
 *                     console.log('t1 then: ', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch((msg) => {
 *                     console.log('t1 catch: ', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(() => {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test1')
 *     let r1 = await test1()
 *     console.log(JSON.stringify(r1))
 *     // test1
 *     // resolve pm1*
 *     // resolve pm2pm1*
 *     // resolve pm3pm2pm1*
 *     // t1 then:  pm3pm2pm1*
 *     // ["resolve pm1*","resolve pm2pm1*","resolve pm3pm2pm1*","t1 then: pm3pm2pm1*"]
 *
 *     async function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             let pm1 = function(v) {
 *                 return new Promise((resolve, reject) => {
 *                     setTimeout(() => {
 *                         console.log('resolve pm1' + v)
 *                         ms.push('resolve pm1' + v)
 *                         resolve('pm1' + v)
 *                     }, 100)
 *                 })
 *             }
 *             //pm2為reject
 *             let pm2 = function(v) {
 *                 return new Promise((resolve, reject) => {
 *                     setTimeout(() => {
 *                         console.log('reject pm2' + v)
 *                         ms.push('reject pm2' + v)
 *                         reject('pm2' + v)
 *                     }, 150)
 *                 })
 *             }
 *             let pm3 = function(v) {
 *                 return new Promise((resolve, reject) => {
 *                     setTimeout(() => {
 *                         console.log('resolve pm3' + v)
 *                         ms.push('resolve pm3' + v)
 *                         resolve('pm3' + v)
 *                     }, 50)
 *                 })
 *             }
 *
 *             pmChain([pm1, pm2, pm3], '*')
 *                 .then((msg) => {
 *                     console.log('t1 then: ', msg)
 *                     ms.push('t1 then: ' + msg)
 *                 })
 *                 .catch((msg) => {
 *                     console.log('t1 catch: ', msg)
 *                     ms.push('t1 catch: ' + msg)
 *                 })
 *                 .finally(() => {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test2')
 *     let r2 = await test2()
 *     console.log(JSON.stringify(r2))
 *     // test2
 *     // resolve pm1*
 *     // reject pm2pm1*
 *     // t1 catch:  pm2pm1*
 *     // ["resolve pm1*","reject pm2pm1*","t1 catch: pm2pm1*"]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function pmChain(pms, initial = null) {
    if (!isarr(pms)) {
        let pm = genPm()
        pm.reject('pms is not array')
        return pm
    }
    return pms.reduce((pm, v) => {
        return pm.then(v)
    }, Promise.resolve(initial))
}


export default pmChain
