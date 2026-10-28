import assert from 'assert'
import pmThrottle from '../src/pmThrottle.mjs'
import { runPmSettle } from './tools/pmSettleRun.mjs'
import { traceRec, useFakeClock } from './tools/timeKit.mjs'


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

    //以下為觀察回調(opt.onTrace)之案(R-TRACE-01): 時間為規格者以假時鐘推進
    //settled, 假時鐘推進完畢後取結果: 假時鐘不會自行前進, 若尚未完成則拋錯, 不直接await以免懸置(並使假時鐘無法restore)
    async function settled(p) {
        let done = false
        let pp = p.then((v) => {
            done = true
            return v
        }, (e) => {
            done = true
            throw e
        })
        pp.catch(() => {})
        await new Promise((resolve) => setImmediate(resolve)) //真實setImmediate讓出, 使已可進行之microtask全數執行
        if (!done) {
            throw new Error('not settled within the advanced fake time')
        }
        return pp
    }

    //runFake, 啟用假時鐘執行test(opt)並推進ms毫秒, 回傳其結果
    async function runFake(test, ms, opt) {
        let clock = useFakeClock()
        try {
            let p = test(opt)
            await clock.advance(ms)
            return await settled(p)
        }
        finally {
            clock.restore()
        }
    }

    //fmt, 事件轉為簡式字串: push1(任務序號)、cancel1、run3、done3(失敗者尾綴!)、start、stop
    let fmt = (e) => {
        if (e.type === 'done') {
            return `done${e.n}${e.ok ? '' : '!'}`
        }
        return e.n === undefined ? e.type : `${e.type}${e.n}`
    }

    //testA, 同test1之情境(t1~t3同時排入, 200ms後排入t4, 各任務持續150/100/50/50ms)
    function testA(opt) {
        return new Promise((resolve) => {
            let ms = []
            let pmt = pmThrottle(opt)
            let fun = (name, t) => new Promise((resolve) => setTimeout(() => resolve('resolve: ' + name + ', t: ' + t), t))
            let rec = (name) => [(msg) => ms.push(name + ' then: ' + msg), (msg) => ms.push(name + ' catch: ' + 'reason ' + msg.reason)]
            pmt(fun, 't1', 150).then(...rec('t1'))
            pmt(fun, 't2', 100).then(...rec('t2'))
            pmt(fun, 't3', 50).then(...rec('t3'))
            setTimeout(() => {
                pmt(fun, 't4', 50).then(...rec('t4')).finally(() => resolve(ms))
            }, 200)
        })
    }

    //testB, 任務執行中(100ms)時又排入兩個: 執行中者不被取消, 執行完畢後才從等待者中取最後者執行
    function testB(opt) {
        return new Promise((resolve) => {
            let ms = []
            let pmt = pmThrottle(opt)
            let fun = (name, t) => new Promise((resolve) => setTimeout(() => resolve(name), t))
            let rec = (name) => [(msg) => ms.push(name + ' then: ' + msg), (msg) => ms.push(name + ' catch: ' + 'reason ' + msg.reason)]
            pmt(fun, 'A', 100).then(...rec('A'))
            setTimeout(() => {
                pmt(fun, 'B', 100).then(...rec('B'))
            }, 50)
            setTimeout(() => {
                pmt(fun, 'C', 30).then(...rec('C')).finally(() => resolve(ms))
            }, 60)
        })
    }

    it(`should notify push, start, cancel, run, done and stop through onTrace in order`, async function() {
        //觀察回調: 同時排入多個時偵測啟動後只執行最後排入者(執行n=3), 其餘(n=1、2)先被取消; 執行完畢後佇列空而停止偵測, 之後排入時重新啟動偵測
        let tr = traceRec()
        let ms = await runFake(testA, 400, { onTrace: tr.on })
        assert.strict.deepStrictEqual(JSON.stringify(ms), r1)
        assert.strict.deepStrictEqual(tr.events.map(fmt), ['push1', 'start', 'push2', 'push3', 'cancel1', 'cancel2', 'run3', 'done3', 'stop', 'push4', 'start', 'run4', 'done4', 'stop'])
    })

    it(`should not cancel the running task and should pick the last waiting task after it finishes`, async function() {
        //觀察回調: A執行中(100ms)時排入B(50ms)、C(60ms)不影響A(A照常完成, 執行中不被取消), A完成後從等待者(B、C)中取最後者C執行並取消B
        let tr = traceRec()
        let ms = await runFake(testB, 600, { onTrace: tr.on })
        assert.strict.deepStrictEqual(JSON.stringify(ms), '["A then: A","B catch: reason cancelled","C then: C"]')
        assert.strict.deepStrictEqual(tr.events.map(fmt), ['push1', 'start', 'run1', 'push2', 'push3', 'done1', 'cancel2', 'run3', 'done3', 'stop'])
    })

    it(`should behave the same without onTrace, with a recording onTrace, and with a throwing, rejecting or invalid onTrace`, async function() {
        //R-TRACE-01 P3: 未傳觀察回調時之對外行為不變(參數可省略, 同舊版之pmThrottle()); P4: 回調之拋錯與回傳值不影響節流、不產生未處理之rejection; 以假時鐘使各次之時序相同
        let un = []
        let onUn = (v) => un.push(String(v))
        process.on('unhandledRejection', onUn)
        let rs = []
        try {
            let rec = traceRec()
            for (let opt of [undefined, { onTrace: rec.on }, {
                onTrace: () => {
                    throw new Error('trace boom')
                },
            }, { onTrace: () => Promise.reject(new Error('trace reject')) }, { onTrace: 'abc' }]) {
                rs.push([JSON.stringify(await runFake(testA, 400, opt)), JSON.stringify(await runFake(testB, 600, opt))])
            }
            await new Promise((resolve) => setImmediate(resolve))
            assert.strict.deepStrictEqual(rec.events.length > 0, true)
        }
        finally {
            process.removeListener('unhandledRejection', onUn)
        }
        let exp = [r1, '["A then: A","B catch: reason cancelled","C then: C"]']
        assert.strict.deepStrictEqual([rs, un], [[exp, exp, exp, exp, exp], []])
    })

    it(`should notify through onTrace with frozen events of primitive fields and no receiver`, async function() {
        //JSDoc opt.onTrace: 事件為凍結物件{ type, ... }, 欄位依type列舉且皆為原始值; 回調不帶接收者呼叫(R-TRACE-01 P4: 唯讀快照、最少欄位、不暴露內部可變狀態)
        let meta = []
        let tr = traceRec()
        let clock = useFakeClock()
        try {
            let pmt = pmThrottle({
                onTrace: function(e) {
                    meta.push([this, Object.isFrozen(e)])
                    tr.on(e)
                },
            })
            //前一個排入者被取消(n=1), 後一個執行但失敗(done之ok為false), 非函數不排入佇列(不通知push)
            let ps = [
                pmt(() => 'first'),
                pmt(() => new Promise((resolve, reject) => setTimeout(() => reject(new Error('boom')), 10))),
                pmt('notFun'),
            ].map((p) => p.then((v) => ['resolve', v], (e) => ['reject', e instanceof Error ? e.message : e]))
            await clock.advance(100)
            let rs = await settled(Promise.all(ps))
            assert.strict.deepStrictEqual(rs, [['reject', { reason: 'cancelled' }], ['reject', 'boom'], ['reject', 'fun is not a function']])
        }
        finally {
            clock.restore()
        }
        assert.strict.deepStrictEqual(tr.events.map(fmt), ['push1', 'start', 'push2', 'cancel1', 'run2', 'done2!', 'stop'])
        //各type之欄位固定(排序後)
        let keys = {}
        for (let e of tr.events) {
            keys[e.type] = Object.keys(e).sort().join(',')
        }
        assert.strict.deepStrictEqual(keys, { push: 'n,type', start: 'type', cancel: 'n,type', run: 'n,type', done: 'n,ok,type', stop: 'type' })
        //欄位皆為原始值(數字、字串、布林或null)
        assert.strict.deepStrictEqual(tr.events.every((e) => Object.values(e).every((v) => v === null || ['number', 'string', 'boolean'].includes(typeof v))), true)
        //事件為凍結物件, 回調不帶接收者(this為undefined)
        assert.strict.deepStrictEqual(meta.length > 0 && meta.every(([self, frozen]) => self === undefined && frozen), true)
    })

    it(`should reject a non-function task before queueing, so the queue never holds one and the detect timer never starts for it`, async function() {
        //JSDoc 「輸入非函數時不排入佇列，回傳之Promise以字串'fun is not a function'被reject」: 偵測(tick)只會取到已排入之函數任務, 故tick內不需處理非函數(不可達); 非函數呼叫後無任何事件(未push、未start偵測計時器), 任務序號亦不被佔用(其後第一個有效任務n=1)
        let clock = useFakeClock()
        try {
            let tr = traceRec()
            let pmt = pmThrottle({ onTrace: tr.on })
            let rs = []
            for (let v of [undefined, null, 0, 'abc', {}, [], Promise.resolve(1)]) {
                rs.push(await pmt(v).then(() => 'resolve', (e) => e))
            }
            assert.strict.deepStrictEqual(rs, Array(7).fill('fun is not a function'))
            await clock.advance(100)
            assert.strict.deepStrictEqual(tr.events, []) //非函數任務未入列, 偵測計時器未啟動
            //其後的有效任務照常排入與執行, 序號自1起
            let ps = pmt(() => 'good')
            await clock.advance(100)
            assert.strict.deepStrictEqual([await settled(ps), tr.events.map(fmt)], ['good', ['push1', 'start', 'run1', 'done1', 'stop']])
        }
        finally {
            clock.restore()
        }
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


describe(`pmThrottle 非函數任務(R-PM-SETTLE-01規則12)`, function() {

    let r = null
    before(function() {
        r = runPmSettle('nonFunThrottle').r
    })

    it(`非函數之任務(7值)回傳Promise並以字串'fun is not a function'被reject [規則12]`, function() {
        //R-PM-SETTLE-01 規則12: pmThrottle之任務非函數時不排入, 回傳之Promise以字串'fun is not a function' reject; JSDoc pmThrottle:16「輸入非函數時不排入佇列，回傳之Promise以字串'fun is not a function'被reject」
        let rj = { s: 'reject', v: 'fun is not a function' }
        assert.strict.deepStrictEqual(r.out.out, { undefined: rj, null: rj, zero: rj, str: rj, obj: rj, pm: rj, asyncGen: rj })
    })

    it(`非函數之任務不排入: 不取消已排入之任務, 後續任務照常, 不以console.log記錄 [規則12]`, function() {
        //R-PM-SETTLE-01 規則12「不排入」: 排入中之有效任務不因其後之非函數呼叫而被取消(pmThrottle只執行最後排入者); 其後之有效任務照常
        assert.strict.deepStrictEqual({ queued: r.out.queued, next: r.out.next }, { queued: { s: 'resolve', v: 'a' }, next: { s: 'resolve', v: 'good' } })
        //R-PM-SETTLE-01 規則12: 以reject回報, 原console.log('func is not a function')之約定不再適用
        assert.strict.deepStrictEqual(r.out.logged, 0)
    })

    it(`無未處理之rejection與未捕捉例外 [規則2]`, function() {
        //R-PM-SETTLE-01 規則2
        assert.strict.deepStrictEqual({ unhandled: r.unhandled, uncaught: r.uncaught }, { unhandled: [], uncaught: [] })
    })

})
