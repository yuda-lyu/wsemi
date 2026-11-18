import assert from 'assert'
import pmHookReject from '../src/pmHookReject.mjs'
import { nonFunValues } from './tools/caseKit.mjs'


describe(`pmHookReject`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            let pm = function (v1, v2) {
                return new Promise(function(resolve, reject) {
                    ms.push(`reject: v1=${v1}, v2=${v2}`)
                    reject(`reject: v1=${v1}, v2=${v2}`)
                })
            }

            let pmr = pmHookReject(pm, (msg) => {
                // console.log('cb: ' + msg)
                msg = '[modify catch]' + msg
                ms.push('cb: ' + msg)
                return msg
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
    // cb: reject: v1=t1, v2=12.3
    // t1 catch [modify catch]reject: v1=t1, v2=12.3
    // ["reject: v1=t1, v2=12.3","cb: [modify catch]reject: v1=t1, v2=12.3","t1 catch: [modify catch]reject: v1=t1, v2=12.3"]
    let r1 = '["reject: v1=t1, v2=12.3","cb: [modify catch]reject: v1=t1, v2=12.3","t1 catch: [modify catch]reject: v1=t1, v2=12.3"]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            let pm = function () {
                return new Promise(function(resolve, reject) {
                    ms.push(`reject`)
                    reject(`reject`)
                })
            }

            let pmr = pmHookReject(pm, (msg) => {
                // console.log('cb: ' + msg)
                msg = '[modify catch]' + msg
                ms.push('cb: ' + msg)
                return msg
            })

            pmr() //測試無輸入
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
    // cb: reject
    // t1 catch [modify catch]reject
    // ["reject","cb: [modify catch]reject","t1 catch: [modify catch]reject"]
    let r2 = '["reject","cb: [modify catch]reject","t1 catch: [modify catch]reject"]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

})


describe(`pmHookReject 回傳型別與非函數(dspec §11 W-15甲①; 原R-PM-SETTLE-01規則12)`, function() {

    it(`回傳包裝函數, 呼叫後回傳Promise`, async function() {
        let f = pmHookReject(async () => 'ok')
        //JSDoc pmHookReject「@returns {Function} 回傳包裝函數，呼叫後回傳Promise」(不再有null)
        assert.strict.deepStrictEqual(typeof f, 'function')
        assert.strict.deepStrictEqual(await f(), 'ok')
    })

    it(`fun非函數(12值,含isfun拋錯之已撤銷Proxy)時同步拋Error('invalid fun: must be a function'), 不回傳null、不回顯值 [W-15甲①]`, function() {
        //dspec §11 W-15甲①「建立物件或立即啟動之參數無效即同步拋錯、先於任何副作用(…pmHook／pmHookReject不再回null)」; V19格式、V20不回顯值
        for (let [k, v] of nonFunValues()) {
            let e = null
            let ret = 'not-called'
            try {
                ret = pmHookReject(v)
            }
            catch (err) {
                e = err
            }
            assert.strict.deepStrictEqual([k, e instanceof Error, e && e.message, ret], [k, true, 'invalid fun: must be a function', 'not-called'])
            //fun為必須參數: 即使cb有效亦同
            assert.strict.throws(() => pmHookReject(v, () => {}), (err) => err instanceof Error && err.message === 'invalid fun: must be a function')
        }
    })

    it(`cb非函數(12值,含isfun拋錯之已撤銷Proxy)視為未給: 照常包裝與呼叫, reject值原樣傳出 [K3]`, async function() {
        //cb為選填之回調(opt類參數), 依K3非預期之輸入視為未給、改用預設(空回調): 成功結果與reject值皆不被改動
        for (let [k, v] of nonFunValues()) {
            let f = pmHookReject(async () => 'ok', v)
            let g = pmHookReject(() => Promise.reject('bad'), v)
            let e = await g().then(() => 'resolved', (x) => x)
            assert.strict.deepStrictEqual([k, typeof f, await f(), e], [k, 'function', 'ok', 'bad'])
        }
    })

})
