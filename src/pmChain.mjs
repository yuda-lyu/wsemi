import genPm from './genPm.mjs'
import pmReadItems from './_pmReadItems.mjs'


/**
 * 傳入initial初始值並循序執行Promise陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmChain.test.mjs Github}
 * @memberOf wsemi
 * @param {Array} pms 輸入函數陣列，各函數依序接收前一結果，回傳一般值或Promise(同Promise之then)；元素須為函數，傳入Promise(而非回傳Promise之函數)將被忽略，該Promise之reject亦不會被處理；元素於進入時即取值，呼叫後改動pms不影響執行，讀取元素拋錯時以該錯誤reject
 * @param {*} initial 輸入循序執行函數陣列的初始值
 * @returns {Promise} 回傳Promise，resolve回傳成功結果，reject回傳失敗結果
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

    //複製與建鏈皆於try內且於進入時完成, 其後只處理複本(呼叫後改動pms不影響執行), 讀取元素拋錯(元素getter拋錯、已撤銷Proxy等)即reject該錯誤(不同步拋出、不留下已建好之鏈)
    //複製由_pmReadItems(只接受真陣列Array.isArray, 以明確建立之普通陣列保留空洞, 不使用slice以免由使用端之Symbol.species決定內部容器); 以Symbol.toStringTag偽稱Array之物件視為非陣列
    try {
        let rd = pmReadItems(pms, true)
        if (rd === null) {
            let pm = genPm()
            pm.reject('pms is not an array')
            return pm
        }
        return rd.items.reduce((pm, v) => {
            return pm.then(v)
        }, Promise.resolve(initial))
    }
    catch (err) {
        let pm = genPm()
        pm.reject(err)
        return pm
    }

}


export default pmChain
