import assert from 'assert'
import pmThrottle from '../src/pmThrottle.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


describe(`pmThrottle`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmt = pmThrottle()

            let fun = function (name, t) {
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        // console.log('resolve: ' + name)
                        resolve('resolve: ' + name + ', t: ' + t)
                    }, t)
                })
            }

            pmt(fun, 't1', 150)
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmt(fun, 't2', 100)
                .then(function(msg) {
                    // console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmt(fun, 't3', 50)
                .then(function(msg) {
                    // console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })

            setTimeout(() => {
                pmt(fun, 't4', 50)
                    .then((msg) => {
                        // console.log('t4 then', msg)
                        ms.push('t4 then: ' + msg)
                    })
                    .catch((msg) => {
                        // console.log('t4 catch', msg)
                        ms.push('t4 catch: ' + 'reason ' + msg.reason)
                    })
                    .finally(() => {
                        resolve(ms)
                    })
            }, 200)

        })
    }
    // console.log('test1')
    // test1
    // t1 catch { reason: 'cancelled' }
    // t2 catch { reason: 'cancelled' }
    // resolve: t3, t: 50
    // t3 then resolve: t3, t: 50
    // resolve: t4, t: 50
    // t4 then resolve: t4, t: 50
    // ["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: resolve: t3, t: 50","t4 then: resolve: t4, t: 50"]
    let r1 = '["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: resolve: t3, t: 50","t4 then: resolve: t4, t: 50"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmt = pmThrottle()

            let fun1 = function (name, t) {
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        // console.log('fun1 resolve: ' + name + ', t: ' + t)
                        resolve('fun1 resolve: ' + name + ', t: ' + t)
                    }, t)
                })
            }

            let fun2 = function (name, t) {
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        // console.log('fun2 resolve: ' + name + ', t: ' + t)
                        resolve('fun2 resolve: ' + name + ', t: ' + t)
                    }, t)
                })
            }

            //測試不同函數fun1與fun2
            pmt(fun1, 't1', 150)
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmt(fun2, 't2', 100)
                .then(function(msg) {
                    // console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmt(fun2, 't3', 50)
                .then(function(msg) {
                    // console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })

            setTimeout(() => {
                pmt(fun1, 't4', 50)
                    .then((msg) => {
                        // console.log('t4 then', msg)
                        ms.push('t4 then: ' + msg)
                    })
                    .catch((msg) => {
                        // console.log('t4 catch', msg)
                        ms.push('t4 catch: ' + 'reason ' + msg.reason)
                    })
                    .finally(() => {
                        resolve(ms)
                    })
            }, 200)

        })
    }
    // console.log('test2')
    // test2
    // t1 catch { reason: 'cancelled' }
    // t2 catch { reason: 'cancelled' }
    // fun2 resolve: t3, t: 50
    // t3 then fun2 resolve: t3, t: 50
    // fun1 resolve: t4, t: 50
    // t4 then fun1 resolve: t4, t: 50
    // ["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: fun2 resolve: t3, t: 50","t4 then: fun1 resolve: t4, t: 50"]
    let r2 = '["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: fun2 resolve: t3, t: 50","t4 then: fun1 resolve: t4, t: 50"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    async function test3() {
        return new Promise((resolve, reject) => {

            let ms = []
            let pmt = pmThrottle()

            let i = 0
            let fun = function () {
                return new Promise(function(resolve, reject) {
                    setTimeout(() => {
                        i++
                        // console.log('resolve: ' + i)
                        resolve('resolve: ' + i)
                    }, 100)
                })
            }

            //測試無輸入參數
            pmt(fun)
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + 'reason ' + msg.reason)
                })
            pmt(fun)
                .then(function(msg) {
                    // console.log('t2 then', msg)
                    ms.push('t2 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t2 catch', msg)
                    ms.push('t2 catch: ' + 'reason ' + msg.reason)
                })
            pmt(fun)
                .then(function(msg) {
                    // console.log('t3 then', msg)
                    ms.push('t3 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t3 catch', msg)
                    ms.push('t3 catch: ' + 'reason ' + msg.reason)
                })

            setTimeout(() => {
                pmt(fun)
                    .then((msg) => {
                        // console.log('t4 then', msg)
                        ms.push('t4 then: ' + msg)
                    })
                    .catch((msg) => {
                        // console.log('t4 catch', msg)
                        ms.push('t4 catch: ' + 'reason ' + msg.reason)
                    })
                    .finally(() => {
                        resolve(ms)
                    })
            }, 200)

        })
    }
    // console.log('test3')
    // test3
    // t1 catch { reason: 'cancelled' }
    // t2 catch { reason: 'cancelled' }
    // core: resolve: 1
    // t3 then resolve: 1
    // core: resolve: 2
    // t4 then resolve: 2
    // ["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: resolve: 1","t4 then: resolve: 2"]
    let r3 = '["t1 catch: reason cancelled","t2 catch: reason cancelled","t3 then: resolve: 1","t4 then: resolve: 2"]'
    it(`should return '${r3}' when run test3'`, async function() {
        let ms = await test3()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

})


describe(`pmThrottle settle(R-PM-SETTLE-01)`, function() {

    it(`pmThrottle: 任務以惡意值拒絕時該呼叫reject原值, 之後之任務照常 [規則1、3]`, function() {
        let { r } = runPmSettle('throttleHostileThenGood')
        assert.strict.deepStrictEqual(r.out, { t1: { s: 'reject', same: true }, t2: { s: 'resolve', v: 'good' } })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`pmThrottle、pmInvResolve: 任務同步拋出null時reject null [規則1]`, function() {
        let { r } = runPmSettle('throwNullOthers')
        assert.strict.deepStrictEqual(r.out, { pmThrottle: { s: 'reject', isNull: true }, pmInvResolve: { s: 'reject', isNull: true } })
    })

    it(`exitThrottle: 任務失敗後計時器已釋放, 行程自然結束 [規則3、5]`, function() {
        //以是否被逾時終止判定(殘留之interval會使行程永不結束), 不以牆鐘門檻判定, 避免並行高負載誤判
        let { status, signal } = runPmSettle('exitThrottle', 'natural')
        assert.strict.deepStrictEqual({ status, signal }, { status: 0, signal: null })
    })

})
