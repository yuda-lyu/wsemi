import get from 'lodash/get'
import genPm from './genPm.mjs'
import ispm from './ispm.mjs'


/**
 * 將pmConvertResolve回傳結果轉回原本Promise的resolve與reject
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmInvResolve.test.mjs Github}
 * @memberOf wsemi
 * @param {Promise} pm 輸入pmConvertResolve所轉出的Promise，其皆使用resolve回傳物件資料
 * @returns {Promise} 回傳Promise，皆使用resolve回傳物件資料，物件欄位有state與msg，state可有success、error與cancelled。cancelled代表reject回傳{ reason: 'cancelled' }
 * @example
 *
 * async function test1() {
 *     let pmInp = genPm()
 *     pmInp.resolve({
 *         state: 'success',
 *         msg: 'abc',
 *     })
 *     let pmOut = pmInvResolve(pmInp)
 *     await pmOut
 *         .then((res) => {
 *             console.log('then', res)
 *             // then abc
 *         })
 *         .catch((res) => {
 *             console.log('catch', res)
 *         })
 * }
 * test1()
 *
 * async function test2() {
 *     let pmInp = genPm()
 *     pmInp.resolve({
 *         state: 'error',
 *         msg: 'abc',
 *     })
 *     let pmOut = pmInvResolve(pmInp)
 *     await pmOut
 *         .then((res) => {
 *             console.log('then', res)
 *         })
 *         .catch((res) => {
 *             console.log('catch', res)
 *             // catch abc
 *         })
 * }
 * test2()
 *
 * async function test3() {
 *     let pmInp = genPm()
 *     pmInp.resolve({
 *         state: 'cancelled',
 *         msg: 'abc',
 *     })
 *     let pmOut = pmInvResolve(pmInp)
 *     await pmOut
 *         .then((res) => {
 *             console.log('then', res)
 *         })
 *         .catch((res) => {
 *             console.log('catch', res)
 *             // catch { reason: 'cancelled' }
 *         })
 * }
 * test3()
 *
 */
function pmInvResolve(pm) {

    //check
    if (!ispm(pm)) {
        throw new Error(`pm is not a promise`)
    }

    let _pm = genPm()
    pm
        .then((r) => {
            let state = get(r, 'state', '')
            let msg = get(r, 'msg', {})
            if (state === 'success') {
                _pm.resolve(msg)
            }
            else if (state === 'cancelled') {
                _pm.reject({ reason: 'cancelled' })
            }
            else {
                _pm.reject(msg)
            }
        })
        .catch((err) => {
            _pm.reject(err)
        })
    return _pm
}

export default pmInvResolve
