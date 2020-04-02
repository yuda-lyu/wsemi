import genPm from './genPm.mjs'
import get from 'lodash/get'


/**
 * 將Promise函式的resolve與reject皆轉為resolve
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pm2resolve.test.js Github}
 * @memberOf wsemi
 * @returns {Promise} 回傳Promise，皆使用resolve回傳物件資料，物件欄位有state與msg，state可有success、error與cancelled。cancelled代表reject回傳{ reason: 'cancelled' }
 * @example
 *
 * function fun1(c) {
 *     return new Promise((resolve, reject) => {
 *         setTimeout(function() {
 *             resolve('fun1:' + c)
 *         }, 1)
 *     })
 * }
 * let fun1r = {
 *     state: 'success',
 *     msg: 'fun1:abc'
 * }
 * setTimeout(() => {
 *     pm2resolve(fun1)('abc')
 *         .then((msg) => {
 *             console.log(msg)
 *         })
 * }, 1)
 * // { state: 'success', msg: 'fun1:abc' }
 *
 * function fun2(c) {
 *     return new Promise((resolve, reject) => {
 *         setTimeout(function() {
 *             reject('fun2:' + c)
 *         }, 1)
 *     })
 * }
 * let fun2r = {
 *     state: 'error',
 *     msg: 'fun2:def'
 * }
 * setTimeout(() => {
 *     pm2resolve(fun2)('def')
 *         .then((msg) => {
 *             console.log(msg)
 *         })
 * }, 30)
 * // { state: 'error', msg: 'fun2:def' }
 *
 * function fun3(c) {
 *     return new Promise((resolve, reject) => {
 *         setTimeout(function() {
 *             reject({ reason: 'cancelled' })
 *         }, 1)
 *     })
 * }
 * let fun3r = {
 *     state: 'cancelled',
 *     msg: ''
 * }
 * setTimeout(() => {
 *     pm2resolve(fun3)('ghi')
 *         .then((msg) => {
 *             console.log(msg)
 *         })
 * }, 60)
 * // { state: 'cancelled', msg: '' }
 *
 */
function pm2resolve(fn) {
    return function() {
        let pm = genPm()
        fn.apply(this, arguments)
            .then(function(msg) {
                pm.resolve({
                    state: 'success',
                    msg,
                })
            })
            .catch(function(msg) {
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
        return pm
    }
}

export default pm2resolve
