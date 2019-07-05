import genPm from './genPm.mjs'
import isarr from './isarr.mjs'


/**
 * 傳入initial初始值並循序執行Promise陣列
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/psSeries.test.js Github}
 * @memberOf wsemi
 * @param {Array} pms 輸入Promise陣列
 * @param {*} initial 輸入循序執行Promise陣列的初始值
 * @returns {Promise} 回傳Promise，resolve為成功結果，reject為失敗結果
 * @example
 * let pm1 = function(v) {
 *     let pm = genPm()
 *     setTimeout(() => {
 *         console.log('pm1' + v)
 *         pm.resolve('pm1' + v)
 *     }, 100)
 *     return pm
 * }
 * let pm2 = function(v) {
 *     let pm = genPm()
 *     setTimeout(() => {
 *         console.log('pm2' + v)
 *         pm.resolve('pm2' + v)
 *     }, 150)
 *     return pm
 * }
 * let pm3 = function(v) {
 *     let pm = genPm()
 *     setTimeout(() => {
 *         console.log('pm3' + v)
 *         pm.resolve('pm3' + v)
 *     }, 50)
 *     return pm
 * }
 * psSeries([pm1, pm2, pm3], '*').then((r) => {
 *     console.log('psSeries: ', r)
 * })
 * // => pm1*
 * // => pm2pm1*
 * // => pm3pm2pm1*
 * // => psSeries: pm3pm2pm1*
 */
function psSeries(pms, initial = null) {
    if (!isarr(pms)) {
        let pm = genPm()
        pm.reject('pms is not array')
        return pm
    }
    return pms.reduce((pm, v) => {
        return pm.then(v)
    }, Promise.resolve(initial))
}


export default psSeries
