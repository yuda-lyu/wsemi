import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import ispm from './ispm.mjs'
import isbol from './isbol.mjs'
import pmSettleByState from './_pmSettleByState.mjs'


/**
 * 將pmConvertResolve回傳結果轉回原本Promise的resolve與reject
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmInvResolve.test.mjs Github}
 * @memberOf wsemi
 * @param {Promise} pm 輸入pmConvertResolve所轉出的Promise，其皆使用resolve回傳物件資料，物件欄位有state與msg；pm非Promise時同步拋出Error('pm is not a promise')
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Boolean} [opt.thenExtractData=false] 輸入是否於then提取data欄位值布林值，主要用於轉換axios取得之pm，預設false
 * @returns {Promise} 回傳Promise，state為success時resolve其msg，為cancelled時reject { reason: 'cancelled' }，其餘(含error、缺state或非結果物件)reject其msg；msg原樣傳遞(含undefined)；輸入之pm被reject時原樣reject其值
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

    //onS, 讀取結果之欄位可能拋錯(已撤銷之Proxy、會拋之getter), 拋錯即以該錯誤reject
    let onS = (r) => {
        try {

            //thenExtractData
            if (thenExtractData) {
                r = get(r, 'data')
            }

            //state, msg, msg原樣傳遞(含undefined), 同pmQueue、pmThrottle之res.msg
            let state = get(r, 'state', '')
            let msg = get(r, 'msg')

            //resolve, reject
            pmSettleByState(_pm, state, msg)

        }
        catch (err) {
            _pm.reject(err)
        }
    }

    //onR, 輸入之pm被reject時原樣reject
    let onR = (err) => {
        _pm.reject(err)
    }

    //只呼叫一次then並同時給成功與失敗回呼, 不依賴then回傳物件之catch(覆寫catch之子類別、then回傳非Promise之thenable), 掛載本身拋錯亦以該錯誤reject
    try {
        pm.then(onS, onR)
    }
    catch (err) {
        _pm.reject(err)
    }

    return _pm
}

export default pmInvResolve
