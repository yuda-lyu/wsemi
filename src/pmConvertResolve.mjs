import get from 'lodash-es/get.js'
import genPm from './genPm.mjs'
import isfun from './isfun.mjs'
import ispm from './ispm.mjs'


/**
 * 將Promise函式的resolve與reject皆轉為resolve
 *
 * 回傳之Promise只會resolve且不產生未處理之rejection：fn同步拋錯(含拋出null)與其Promise被reject皆為error，掛載then或讀取拒絕值時拋錯者(如標籤為Promise卻無可用之then、已撤銷之Proxy、會拋錯之getter)亦為error。惟fn回傳永不settle之Promise或永不呼叫回呼之thenable時亦不settle，需逾時者以pmTimeout包裝
 *
 * 取消依拒絕值之形狀判定(其reason為'cancelled')，原拒絕值不保留，同步拋出之值不判取消。拒絕值來自外部(應用端、伺服器)而不屬wsemi之取消家族(pmQueue之takeLast、pmThrottle、pmInvResolve)時，勿以本函數分類，否則形似{ reason: 'cancelled' }之外部值會被改判為取消
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/pmConvertResolve.test.mjs Github}
 * @memberOf wsemi
 * @param {Function} fn 輸入函數，可支援async與sync函數
 * @returns {Promise} 回傳Promise，只會resolve物件資料，物件欄位有state與msg，state可有success、error與cancelled。success之msg為回傳值或resolve值，error之msg為拋出值或reject值(判定拋錯時為該錯誤)，cancelled代表reject回傳{ reason: 'cancelled' }，其msg為空字串
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
 *     async function test4() {
 *         return new Promise((resolve, reject) => {
 *             let ms = []
 *
 *             async function fun1(p1, p2) {
 *                 console.log('resolve fun1: ' + p1 + ', ' + p2)
 *                 return 'fun1: ' + p1 + ', ' + p2
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
 *     console.log('test4')
 *     let r4 = await test4()
 *     console.log(JSON.stringify(r4))
 *     // test4
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

        //call, 同步拋錯一律為error, 不以拋出值是否為null判定有無拋錯(拋出null亦為error), 同步拋出之值不判取消
        let ret
        try {
            ret = fn.apply(this, arguments)
        }
        catch (err) {
            pm.resolve({
                state: 'error',
                msg: err,
            })
            return pm
        }

        //onReject, 依拒絕值之形狀判取消, 讀取拋錯者(已撤銷之Proxy、會拋錯之getter或陷阱)視為一般錯誤且msg為原拒絕值, 使本回呼必不拋錯
        let onReject = (msg) => {
            let isCancelled = false
            try {
                isCancelled = get(msg, 'reason') === 'cancelled'
            }
            catch (err) {}
            if (isCancelled) {
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
        }

        //判定與掛載, 判定是否為Promise或掛載then時拋錯者(如標籤為Promise卻無可用之then)視為error且msg為該錯誤
        //只呼叫一次then並同時給成功與失敗回呼: 二回呼皆不拋錯, 不依賴then回傳物件之catch(覆寫catch之子類別、then回傳非Promise之thenable皆可正確判定)
        try {
            if (ispm(ret)) {
                ret.then((msg) => {
                    pm.resolve({
                        state: 'success',
                        msg,
                    })
                }, onReject)
            }
            else {
                pm.resolve({
                    state: 'success',
                    msg: ret,
                })
            }
        }
        catch (err) {
            pm.resolve({
                state: 'error',
                msg: err,
            })
        }

        return pm
    }
}


export default pmConvertResolve
