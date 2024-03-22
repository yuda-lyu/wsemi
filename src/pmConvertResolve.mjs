import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import ispm from './ispm.mjs'


/**
 * 將Promise函式的resolve與reject皆轉為resolve
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmConvertResolve.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fn 輸入函數，可支援async與sync函數
 * @returns {Promise} 回傳Promise，皆使用resolve回傳物件資料，物件欄位有state與msg，state可有success、error與cancelled。cancelled代表reject回傳{ reason: 'cancelled' }
 * @example
 *
 * async function topAsync() {
 *
 *     async function test1() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             function fun1(c) {
 *                 return new Promise((resolve, reject) => {
 *                     setTimeout(function() {
 *                         console.log('resolve fun1: ' + c)
 *                         ms.push('resolve fun1: ' + c)
 *                         resolve('fun1: ' + c)
 *                     }, 1)
 *                 })
 *             }
 *
 *             pmConvertResolve(fun1)('abc')
 *                 .then((msg) => {
 *                     console.log('t1 then: ', msg)
 *                     ms.push({ mode: 't1 then', msg })
 *                 })
 *                 .catch((msg) => {
 *                     console.log('t1 catch: ', msg)
 *                     ms.push({ mode: 't1 catch', msg })
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
 *     // resolve fun1: abc
 *     // t1 then:  { state: 'success', msg: 'fun1: abc' }
 *     // ["resolve fun1: abc",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc"}}]
 *
 *     async function test2() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             function fun1(c) {
 *                 return new Promise((resolve, reject) => {
 *                     setTimeout(function() {
 *                         console.log('reject fun1: ' + c)
 *                         ms.push('reject fun1: ' + c)
 *                         reject('fun1: ' + c)
 *                     }, 1)
 *                 })
 *             }
 *
 *             pmConvertResolve(fun1)('abc')
 *                 .then((msg) => {
 *                     console.log('t1 then: ', msg)
 *                     ms.push({ mode: 't1 then', msg })
 *                 })
 *                 .catch((msg) => {
 *                     console.log('t1 catch: ', msg)
 *                     ms.push({ mode: 't1 catch', msg })
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
 *     // reject fun1: abc
 *     // { state: 'error', msg: 'fun1: abc' }
 *     // ["reject fun1: abc",{"mode":"t1 then","msg":{"state":"error","msg":"fun1: abc"}}]
 *
 *     async function test3() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             function fun1(p1, p2) {
 *                 return new Promise((resolve, reject) => {
 *                     setTimeout(function() {
 *                         console.log('resolve fun1: ' + p1 + ', ' + p2)
 *                         ms.push('resolve fun1: ' + p1 + ', ' + p2)
 *                         resolve('fun1: ' + p1 + ', ' + p2)
 *                     }, 1)
 *                 })
 *             }
 *
 *             pmConvertResolve(fun1)('abc', 'def')
 *                 .then((msg) => {
 *                     console.log('t1 then: ', msg)
 *                     ms.push({ mode: 't1 then', msg })
 *                 })
 *                 .catch((msg) => {
 *                     console.log('t1 catch: ', msg)
 *                     ms.push({ mode: 't1 catch', msg })
 *                 })
 *                 .finally(() => {
 *                     resolve(ms)
 *                 })
 *
 *         })
 *     }
 *     console.log('test3')
 *     let r3 = await test3()
 *     console.log(JSON.stringify(r3))
 *     // test3
 *     // resolve fun1: abc, def
 *     // t1 then:  { state: 'success', msg: 'fun1: abc, def' }
 *     // ["resolve fun1: abc, def",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc, def"}}]
 *
 * }
 * topAsync().catch(() => {})
 *
 */
function pmConvertResolve(fn) {

    //check
    if (!isfun(fn)) {
        throw new Error(`fn is not a function`)
    }

    return function() {
        let pm = genPm()
        let ret = null
        let err = null
        try {
            ret = fn.apply(this, arguments)
        }
        catch (e) {
            err = e
        }
        if (err !== null) {
            pm.resolve({
                state: 'error',
                msg: err,
            })
        }
        else if (ispm(ret)) {
            ret
                .then((msg) => {
                    pm.resolve({
                        state: 'success',
                        msg,
                    })
                })
                .catch((msg) => {
                    if (get(msg, 'reason') === 'cancelled') {
                        pm.resolve({
                            state: 'cancelled',
                            msg: '',
                        })
                    }
                    else {
                        pm.resolve({
                            state: 'error',
                            msg,
                        })
                    }
                })
        }
        else {
            pm.resolve({
                state: 'success',
                msg: ret,
            })
        }
        return pm
    }
}


export default pmConvertResolve
