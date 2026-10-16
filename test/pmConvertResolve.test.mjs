import assert from 'assert'
import pmConvertResolve from '../src/pmConvertResolve.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'


describe(`pmConvertResolve`, function() {

    async function test1() {
        return new Promise((resolve, reject) => {
            let ms = []

            function fun1(c) {
                return new Promise((resolve, reject) => {
                    setTimeout(function() {
                        // console.log('resolve fun1: ' + c)
                        ms.push('resolve fun1: ' + c)
                        resolve('fun1: ' + c)
                    }, 1)
                })
            }

            pmConvertResolve(fun1)('abc')
                .then((msg) => {
                    // console.log('t1 then: ', msg)
                    ms.push({ mode: 't1 then', msg })
                })
                .catch((msg) => {
                    // console.log('t1 catch: ', msg)
                    ms.push({ mode: 't1 catch', msg })
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    // console.log('test1')
    // test1
    // resolve fun1: abc
    // t1 then:  { state: 'success', msg: 'fun1: abc' }
    // ["resolve fun1: abc",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc"}}]
    let r1 = '["resolve fun1: abc",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc"}}]'
    it(`should return '${r1}' when run test1'`, async function() {
        let ms = await test1()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
    })

    async function test2() {
        return new Promise((resolve, reject) => {
            let ms = []

            function fun1(c) {
                return new Promise((resolve, reject) => {
                    setTimeout(function() {
                        // console.log('reject fun1: ' + c)
                        ms.push('reject fun1: ' + c)
                        reject('fun1: ' + c)
                    }, 1)
                })
            }

            pmConvertResolve(fun1)('abc')
                .then((msg) => {
                    // console.log('t1 then: ', msg)
                    ms.push({ mode: 't1 then', msg })
                })
                .catch((msg) => {
                    // console.log('t1 catch: ', msg)
                    ms.push({ mode: 't1 catch', msg })
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    // console.log('test2')
    // test2
    // reject fun1: abc
    // { state: 'error', msg: 'fun1: abc' }
    // ["reject fun1: abc",{"mode":"t1 then","msg":{"state":"error","msg":"fun1: abc"}}]
    let r2 = '["reject fun1: abc",{"mode":"t1 then","msg":{"state":"error","msg":"fun1: abc"}}]'
    it(`should return '${r2}' when run test2'`, async function() {
        let ms = await test2()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r2)
    })

    async function test3() {
        return new Promise((resolve, reject) => {
            let ms = []

            function fun1(p1, p2) {
                return new Promise((resolve, reject) => {
                    setTimeout(function() {
                        // console.log('resolve fun1: ' + p1 + ', ' + p2)
                        ms.push('resolve fun1: ' + p1 + ', ' + p2)
                        resolve('fun1: ' + p1 + ', ' + p2)
                    }, 1)
                })
            }

            pmConvertResolve(fun1)('abc', 'def')
                .then((msg) => {
                    // console.log('t1 then: ', msg)
                    ms.push({ mode: 't1 then', msg })
                })
                .catch((msg) => {
                    // console.log('t1 catch: ', msg)
                    ms.push({ mode: 't1 catch', msg })
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    // console.log('test3')
    // test3
    // resolve fun1: abc, def
    // t1 then:  { state: 'success', msg: 'fun1: abc, def' }
    // ["resolve fun1: abc, def",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc, def"}}]
    let r3 = '["resolve fun1: abc, def",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc, def"}}]'
    it(`should return '${r1}' when run test3'`, async function() {
        let ms = await test3()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r3)
    })

    async function test4() {
        return new Promise((resolve, reject) => {
            let ms = []

            async function fun1(p1, p2) {
                ms.push('resolve fun1: ' + p1 + ', ' + p2)
                return 'fun1: ' + p1 + ', ' + p2
            }

            pmConvertResolve(fun1)('abc', 'def')
                .then((msg) => {
                    // console.log('t1 then: ', msg)
                    ms.push({ mode: 't1 then', msg })
                })
                .catch((msg) => {
                    // console.log('t1 catch: ', msg)
                    ms.push({ mode: 't1 catch', msg })
                })
                .finally(() => {
                    resolve(ms)
                })

        })
    }
    // console.log('test4')
    // test4
    // t1 then:  { state: 'success', msg: 'fun1: abc, def' }
    // ["resolve fun1: abc, def",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc, def"}}]
    let r4 = '["resolve fun1: abc, def",{"mode":"t1 then","msg":{"state":"success","msg":"fun1: abc, def"}}]'
    it(`should return '${r1}' when run test4'`, async function() {
        let ms = await test4()
        // console.log(JSON.stringify(ms))
        assert.strict.deepStrictEqual(JSON.stringify(ms), r4)
    })

})


describe(`pmConvertResolve settle(R-PM-SETTLE-01)`, function() {

    it(`pmConvertResolve: 拒絕值讀取reason即拋錯者resolve error且msg為原值, 無未處理之rejection [規則1、2、7]`, function() {
        let { r } = runPmSettle('convertRejectHostile')
        for (let k of ['revoked', 'reasonGetter', 'getTrap']) {
            assert.strict.deepStrictEqual(r.out[k], { s: 'resolve', state: 'error', same: true }, k)
        }
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`pmConvertResolve: 同步回傳任意值必回傳Promise並resolve, 非Promise者為success且msg為原值, 標籤為Promise而無可用then者為error [規則1、8]`, function() {
        let { r } = runPmSettle('convertSyncReturnHostile')
        for (let k of ['revoked', 'getTrap', 'tagGetter']) {
            assert.strict.deepStrictEqual(r.out[k], { syncThrow: false, s: 'resolve', state: 'success', same: true }, k)
        }
        for (let k of ['fakeTag', 'proxyPm']) {
            assert.strict.deepStrictEqual(r.out[k], { syncThrow: false, s: 'resolve', state: 'error', same: false }, k)
        }
        //永不呼叫回呼之可呼叫thenable: 依原生語意等待(不settle), 為文件所載之例外, 同pmHook
        assert.strict.deepStrictEqual(r.out.funcThen, { syncThrow: false, s: 'pending', state: null, same: false }, 'funcThen')
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

    it(`pmConvertResolve: 同步拋出null為error且msg為null [規則1]`, function() {
        let { r } = runPmSettle('convertThrowNull')
        assert.strict.deepStrictEqual(r.out, { s: 'resolve', state: 'error', msgIsNull: true })
    })

    it(`pmConvertResolve: 取消慣例與一般值不變(對照) [規則7]`, function() {
        let { r } = runPmSettle('convertControls')
        assert.strict.deepStrictEqual(r.out, {
            asyncCancelled: { state: 'cancelled', msg: '' },
            syncThrowCancelled: { state: 'error', same: true },
            asyncReject: { state: 'error', msg: 'x' },
            asyncResolve: { state: 'success', msg: 'v' },
            syncReturn: { state: 'success', msg: 'w' },
        })
    })

    it(`pmConvertResolve: 覆寫catch之子類別與稍後回呼之可呼叫thenable皆依其結果判定 [規則1、4]`, function() {
        let { r } = runPmSettle('convertSubclassAndCallable')
        assert.strict.deepStrictEqual(r.out, {
            resolved: { state: 'success', msg: 'ok' },
            rejected: { state: 'error', same: true },
            callable: { state: 'success', msg: 'V' },
        })
        assert.strict.deepStrictEqual(r.unhandled, [])
    })

})


describe(`pmConvertResolve 回傳型別與非函數(R-PM-SETTLE-01規則12)`, function() {

    it(`回傳包裝函數, 呼叫後回傳Promise [規則12]`, async function() {
        let f = pmConvertResolve(async (a) => a + 1)
        //R-PM-SETTLE-01 規則12: @returns之型別與實回相符(pmConvertResolve實回Function); JSDoc pmConvertResolve:17「@returns {Function} 回傳包裝函數，呼叫後回傳Promise」
        assert.strict.deepStrictEqual(typeof f, 'function')
        assert.strict.deepStrictEqual(await f(1), { state: 'success', msg: 2 })
    })

    it(`fn非函數(7值)時於本函數呼叫當下同步拋出Error('fn is not a function'), pm2resolve同 [規則12]`, async function() {
        let pm2resolve = (await import('../src/pm2resolve.mjs')).default
        for (let v of [undefined, null, 0, 'abc', {}, Promise.resolve(1), async function* () {}]) {
            //R-PM-SETTLE-01 規則12: pmConvertResolve建立時同步拋出(寫入JSDoc); JSDoc pmConvertResolve:17「fn非函數時於本函數呼叫當下同步拋出Error('fn is not a function')」
            assert.strict.throws(() => pmConvertResolve(v), (e) => e instanceof Error && e.message === 'fn is not a function')
            assert.strict.throws(() => pm2resolve(v), (e) => e instanceof Error && e.message === 'fn is not a function')
        }
    })

})
