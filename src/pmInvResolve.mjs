import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import ispm from './ispm.mjs'
import isbol from './isbol.mjs'


/**
 * 將pmConvertResolve回傳結果轉回原本Promise的resolve與reject
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmInvResolve.test.mjs Github}
 * @memberOf wsemi
 * @param {Promise} pm 輸入pmConvertResolve所轉出的Promise，其皆使用resolve回傳物件資料
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.thenExtractData=false] 輸入是否於then提取data欄位值布林值，主要用於轉換axios取得之pm，預設false
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
 *             console.log('test1 then', res)
 *             // test1 then abc
 *         })
 *         .catch((res) => {
 *             console.log('test1 catch', res)
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
 *             console.log('test2 then', res)
 *         })
 *         .catch((res) => {
 *             console.log('test2 catch', res)
 *             // test2 catch abc
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
 *             console.log('test3 then', res)
 *         })
 *         .catch((res) => {
 *             console.log('test3 catch', res)
 *             // test3 catch { reason: 'cancelled' }
 *         })
 * }
 * test3()
 *
 * async function test4() {
 *     let pmInp = genPm()
 *     pmInp.resolve({
 *         data: {
 *             state: 'success',
 *             msg: 'abc',
 *         },
 *     })
 *     let pmOut = pmInvResolve(pmInp, { thenExtractData: true })
 *     await pmOut
 *         .then((res) => {
 *             console.log('test4 then', res)
 *             // test4 then abc
 *         })
 *         .catch((res) => {
 *             console.log('test4 catch', res)
 *         })
 * }
 * test4()
 *
 */
function pmInvResolve(pm, opt = {}) {

    //check
    if (!ispm(pm)) {
        throw new Error(`pm is not a promise`)
    }

    //thenExtractData
    let thenExtractData = get(opt, 'thenExtractData')
    if (!isbol(thenExtractData)) {
        thenExtractData = false
    }

    let _pm = genPm()
    pm
        .then((r) => {

            //thenExtractData
            if (thenExtractData) {
                r = get(r, 'data')
            }

            //state, msg
            let state = get(r, 'state', '')
            let msg = get(r, 'msg', {})

            //resolve, reject
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
