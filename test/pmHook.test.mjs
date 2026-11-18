import assert from 'assert'
import pmHook from '../src/pmHook.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { nonFunValues } from './tools/caseKit.mjs'


describe(`pmHook`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            //使用resolve
            let pm = function (v1, v2) {
                return new Promise(function(resolve, reject) {
                    ms.push(`resolve: v1=${v1}, v2=${v2}`)
                    resolve(`resolve: v1=${v1}, v2=${v2}`)
                })
            }

            //針對before修改輸入
            let pmr = pmHook(pm, (msg) => {
                // console.log('cb', msg)
                if (msg.mode === 'before') {
                    //arguments有兩個輸入故得分開改
                    msg.data[0] = '[modify input a]' + msg.data[0]
                    msg.data[1] = '[modify input b]' + msg.data[1]
                    return msg.data
                }
            })

            pmr('t1', 12.3)
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(function() {
                    resolve(ms)
                })

        })
    }
    // console.log('test1')
    // test1
    // cb { mode: 'before', data: [Arguments] { '0': 't1', '1': 12.3 } }
    // cb {
    //   mode: 'afterThen',
    //   data: 'resolve: v1=[modify input a]t1, v2=[modify input b]12.3'
    // }
    // t1 then resolve: v1=[modify input a]t1, v2=[modify input b]12.3
    // ["resolve: v1=[modify input a]t1, v2=[modify input b]12.3","t1 then: resolve: v1=[modify input a]t1, v2=[modify input b]12.3"]
    let r1 = '["resolve: v1=[modify input a]t1, v2=[modify input b]12.3","t1 then: resolve: v1=[modify input a]t1, v2=[modify input b]12.3"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            //使用resolve
            let pm = function (v1, v2) {
                return new Promise(function(resolve, reject) {
                    ms.push(`resolve: v1=${v1}, v2=${v2}`)
                    resolve(`resolve: v1=${v1}, v2=${v2}`)
                })
            }

            //針對afterThen修改輸出
            let pmr = pmHook(pm, (msg) => {
                // console.log('cb', msg)
                if (msg.mode === 'afterThen') {
                    //arguments有兩個輸入故得分開改
                    msg.data = '[modify output]' + msg.data
                    return msg.data
                }
            })

            pmr('t1', 12.3)
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(function() {
                    resolve(ms)
                })

        })
    }
    // console.log('test2')
    // test2
    // cb { mode: 'before', data: [Arguments] { '0': 't1', '1': 12.3 } }
    // cb { mode: 'afterThen', data: 'resolve: v1=t1, v2=12.3' }
    // t1 then [modify output]resolve: v1=t1, v2=12.3
    // ["resolve: v1=t1, v2=12.3","t1 then: [modify output]resolve: v1=t1, v2=12.3"]
    let r2 = '["resolve: v1=t1, v2=12.3","t1 then: [modify output]resolve: v1=t1, v2=12.3"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    async function test3() {
        return new Promise((resolve, reject) => {
            let ms = []

            //使用reject
            let pm = function (v1, v2) {
                return new Promise(function(resolve, reject) {
                    ms.push(`reject: v1=${v1}, v2=${v2}`)
                    reject(`reject: v1=${v1}, v2=${v2}`)
                })
            }

            //針對afterThen修改輸出, 但因使用reject故改不到
            let pmr = pmHook(pm, (msg) => {
                // console.log('cb', msg)
                if (msg.mode === 'afterThen') {
                    //arguments有兩個輸入故得分開改
                    msg.data = '[modify output]' + msg.data
                    return msg.data
                }
            })

            pmr('t1', 12.3)
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(function() {
                    resolve(ms)
                })

        })
    }
    // console.log('test3')
    // test3
    // cb { mode: 'before', data: [Arguments] { '0': 't1', '1': 12.3 } }
    // cb { mode: 'afterCatch', data: 'reject: v1=t1, v2=12.3' }
    // t1 catch reject: v1=t1, v2=12.3
    // ["reject: v1=t1, v2=12.3","t1 catch: reject: v1=t1, v2=12.3"]
    let r3 = '["reject: v1=t1, v2=12.3","t1 catch: reject: v1=t1, v2=12.3"]'
    it(`should return '${r3}' when run test3'`, async function() {
        let ms = await test3()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

    async function test4() {
        return new Promise((resolve, reject) => {
            let ms = []

            //使用reject
            let pm = function (v1, v2) {
                return new Promise(function(resolve, reject) {
                    ms.push(`reject: v1=${v1}, v2=${v2}`)
                    reject(`reject: v1=${v1}, v2=${v2}`)
                })
            }

            //針對afterCatch修改輸出
            let pmr = pmHook(pm, (msg) => {
                // console.log('cb', msg)
                if (msg.mode === 'afterCatch') {
                    //arguments有兩個輸入故得分開改
                    msg.data = '[modify output]' + msg.data
                    return msg.data
                }
            })

            pmr('t1', 12.3)
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(function() {
                    resolve(ms)
                })

        })
    }
    // console.log('test4')
    // test4
    // cb { mode: 'before', data: [Arguments] { '0': 't1', '1': 12.3 } }
    // cb { mode: 'afterCatch', data: 'reject: v1=t1, v2=12.3' }
    // t1 catch [modify output]reject: v1=t1, v2=12.3
    // ["reject: v1=t1, v2=12.3","t1 catch: [modify output]reject: v1=t1, v2=12.3"]
    let r4 = '["reject: v1=t1, v2=12.3","t1 catch: [modify output]reject: v1=t1, v2=12.3"]'
    it(`should return '${r4}' when run test4'`, async function() {
        let ms = await test4()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
    })

    async function test5() {
        return new Promise((resolve, reject) => {
            let ms = []

            //使用resolve, 此函數無輸入
            let pm = function () {
                return new Promise(function(resolve, reject) {
                    ms.push(`resolve`)
                    resolve(`resolve`)
                })
            }

            //針對afterThen修改輸出
            let pmr = pmHook(pm, (msg) => {
                // console.log('cb', msg)
                if (msg.mode === 'afterThen') {
                    //arguments有兩個輸入故得分開改
                    msg.data = '[modify output]' + msg.data
                    return msg.data
                }
            })

            pmr()
                .then(function(msg) {
                    // console.log('t1 then', msg)
                    ms.push('t1 then: ' + msg)
                })
                .catch(function(msg) {
                    // console.log('t1 catch', msg)
                    ms.push('t1 catch: ' + msg)
                })
                .finally(function() {
                    resolve(ms)
                })

        })
    }
    // console.log('test5')
    // test5
    // cb { mode: 'before', data: [Arguments] {} }
    // cb { mode: 'afterThen', data: 'resolve' }
    // t1 then [modify output]resolve
    // ["resolve","t1 then: [modify output]resolve"]
    let r5 = '["resolve","t1 then: [modify output]resolve"]'
    it(`should return '${r5}' when run test5'`, async function() {
        let ms = await test5()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r5)
    })

})


describe(`pmHook settle(R-PM-SETTLE-01)`, function() {

    it(`pmHook、pmHookReject: cb於任何階段拋錯皆以該錯誤reject, fun同步拋錯reject, 回傳一般值resolve, 必回傳Promise [規則1、6]`, function() {
        let { r } = runPmSettle('hookThrows')
        assert.strict.deepStrictEqual(r.out, {
            before: { s: 'reject', msg: 'cb before' },
            afterThen: { s: 'reject', msg: 'cb afterThen' },
            afterCatch: { s: 'reject', msg: 'cb afterCatch' },
            funSyncThrow: { s: 'reject', msg: 'fun sync' },
            funValue: { s: 'resolve', v: 123 },
            hookRejectCbThrow: { s: 'reject', msg: 'rej cb' },
        })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

})


describe(`pmHook 回傳型別與非函數(dspec §11 W-15甲①; 原R-PM-SETTLE-01規則12)`, function() {

    it(`回傳包裝函數, 呼叫後回傳Promise`, async function() {
        let f = pmHook(async (a) => a + 1)
        //JSDoc pmHook「@returns {Function} 回傳包裝函數，呼叫後回傳Promise」(不再有null)
        assert.strict.deepStrictEqual(typeof f, 'function')
        assert.strict.deepStrictEqual(await f(1), 2)
    })

    it(`fun非函數(12值,含isfun拋錯之已撤銷Proxy)時同步拋Error('invalid fun: must be a function'), 不回傳null、不回顯值 [W-15甲①]`, function() {
        //dspec §11 W-15甲①「建立物件或立即啟動之參數無效即同步拋錯、先於任何副作用(…pmHook／pmHookReject不再回null)」; V19格式、V20不回顯值
        for (let [k, v] of nonFunValues()) {
            let e = null
            let ret = 'not-called'
            try {
                ret = pmHook(v)
            }
            catch (err) {
                e = err
            }
            assert.strict.deepStrictEqual([k, e instanceof Error, e && e.message, ret], [k, true, 'invalid fun: must be a function', 'not-called'])
            //fun為必須參數: 即使cb有效亦同(不因cb而改變通道)
            assert.strict.throws(() => pmHook(v, () => {}), (err) => err instanceof Error && err.message === 'invalid fun: must be a function')
        }
    })

    it(`cb非函數(12值,含isfun拋錯之已撤銷Proxy)視為未給: 照常包裝與呼叫, 不拋錯 [K3, W-15甲①之cb為選填]`, async function() {
        //cb為選填之回調(opt類參數), 依K3非預期之輸入視為未給、改用預設(空回調)
        for (let [k, v] of nonFunValues()) {
            let f = pmHook(async (a) => a + 1, v)
            assert.strict.deepStrictEqual([k, typeof f, await f(1)], [k, 'function', 2])
        }
    })

})
