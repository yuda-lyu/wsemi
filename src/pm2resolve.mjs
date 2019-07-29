import genPm from './genPm.mjs'


/**
 * 將Promise函式的resolve與reject皆轉為resolve
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pm2resolve.test.js Github}
 * @memberOf wsemi
 * @returns {Promise} 回傳Promise
 * @example
 * function pmFun() {
 *     let pm = genPm()
 *     setTimeout(function() {
 *         let r = Math.random()
 *         if (r > 0.5) {
 *             pm.resolve(`r(${r}) > 0.5`)
 *         }
 *         else {
 *             pm.reject(`r(${r}) <= 0.5`)
 *         }
 *     }, 1)
 *     return pm
 * }
 *
 * let pmFunR = pm2resolve(pmFun)
 *
 * let n = 0
 * setInterval(function() {
 *     n += 1
 *     pmFun()
 *         .then(function(msg) {
 *             console.log('pmFun then', n, msg)
 *         })
 *         .catch(function(err) {
 *             console.log('pmFun catch', n, err)
 *         })
 *     pmFunR()
 *         .then(function(msg) {
 *             console.log('pmFunR then', n, msg)
 *         })
 *         .catch(function(err) {
 *             console.log('pmFunR catch', n, err)
 *         })
 * }, 1000)
 */
function pm2resolve(fn) {
    return function() {
        let pm = genPm()
        fn.apply(this, arguments)
            .then(function(msg) {
                pm.resolve({
                    state: 'success',
                    msg: msg
                })
            })
            .catch(function(err) {
                pm.resolve({
                    state: 'error',
                    msg: err
                })
            })
        return pm
    }
}

export default pm2resolve
